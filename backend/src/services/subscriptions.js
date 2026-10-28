import mongoose from 'mongoose';
import { getEnv } from '../config/env.js';
import logger from '../config/logger.js';
import Payment from '../models/Payment.js';
import Subscription from '../models/Subscription.js';
import User from '../models/User.js';
import { badRequest, conflict, forbidden, unavailable } from '../utils/errors.js';
import { audit, SYSTEM } from './audit.js';
import { sendNoticeEmailSafe } from './mail.js';
import { isMercadoPagoConfigured, mp } from './mercadopago.js';
import { getPlan, resolveEffectivePlan } from './plans.js';
import { getSetting } from './settings.js';
import { notify } from './telegram.js';

/*
 * Ciclo de vida da assinatura:
 *   checkout → "pendente" (link de pagamento do Mercado Pago)
 *   Mercado Pago confirma (webhook + consulta à API) → "ativa"
 *   cobrança recusada → "ativa" + inadimplenteDesde (tolerância configurável)
 *   cancelada pelo usuário/MP → "cancelada" (acesso até o fim do período pago)
 *   pendente abandonada (48 h) → "expirada"
 *
 * Duas modalidades:
 *   recorrente — cobrança automática todo mês no cartão de crédito
 *                (preapproval do Mercado Pago, com ou sem conta MP);
 *   avulso     — o cliente paga 1 mês por vez (Pix, crédito ou débito) e o
 *                plano vale por 30 dias; pagamentos seguidos se somam.
 */

const STATUS_MAP = { authorized: 'ativa', paused: 'pausada', cancelled: 'cancelada', pending: 'pendente' };
const PLATFORMS = { android: 'checkoutAndroid', ios: 'checkoutIos', web: 'checkoutWeb' };
const DIA = 86400000;
/** Dias liberados por pagamento avulso. */
export const PERIODO_AVULSO_DIAS = 30;
const PENDENTES_MP = ['pending', 'in_process', 'authorized'];

/** Mensagens para o cliente a partir do status/status_detail do Mercado Pago. */
const DETALHES = {
  cc_rejected_insufficient_amount: 'Saldo ou limite insuficiente no cartão.',
  cc_rejected_bad_filled_security_code: 'Código de segurança (CVV) incorreto.',
  cc_rejected_bad_filled_date: 'Data de validade incorreta.',
  cc_rejected_bad_filled_card_number: 'Número do cartão incorreto.',
  cc_rejected_bad_filled_other: 'Confira os dados do cartão.',
  cc_rejected_call_for_authorize: 'O banco pediu autorização: ligue para o banco do cartão e tente de novo.',
  cc_rejected_card_disabled: 'Cartão bloqueado ou inativo. Ligue para o banco do cartão.',
  cc_rejected_duplicated_payment: 'Você já fez um pagamento igual há pouco. Confira antes de tentar de novo.',
  cc_rejected_high_risk: 'Pagamento recusado pela análise de segurança. Use outro cartão ou pague com Pix.',
  cc_rejected_max_attempts: 'Limite de tentativas atingido. Use outro cartão ou pague com Pix.',
  pending_contingency: 'Pagamento em análise. Avisaremos por e-mail assim que for confirmado.',
  pending_review_manual: 'Pagamento em análise. Avisaremos por e-mail assim que for confirmado.',
  pending_waiting_transfer: 'Aguardando o pagamento do Pix.',
  pending_waiting_payment: 'Aguardando o pagamento.',
};

export function paymentMessage(status, detail) {
  if (status === 'approved') return 'Pagamento aprovado!';
  if (DETALHES[detail]) return DETALHES[detail];
  if (status === 'rejected') return 'O pagamento foi recusado. Use outro cartão ou pague com Pix.';
  if (status === 'cancelled') return 'Pagamento cancelado ou expirado.';
  if (PENDENTES_MP.includes(status)) return 'Pagamento em processamento.';
  return 'Não foi possível concluir o pagamento.';
}

/** Se o checkout do Mercado Pago pode aparecer nesta plataforma (regras das lojas). */
export async function isCheckoutEnabled(plataforma) {
  if (!isMercadoPagoConfigured()) return false;
  const billing = await getSetting('billing');
  return Boolean(billing[PLATFORMS[plataforma] ?? 'checkoutWeb']);
}

/** O que a página de pagamento precisa saber (sem segredos: a Public Key é pública). */
export async function checkoutInfo(plataforma) {
  const billing = await getSetting('billing');
  return {
    enabled: await isCheckoutEnabled(plataforma),
    provider: 'mercadopago',
    plataforma,
    publicKey: getEnv().MP_PUBLIC_KEY ?? null,
    metodos: { recorrente: billing.pagamentoRecorrente !== false, avulso: billing.pagamentoAvulso !== false },
    diasAvulso: PERIODO_AVULSO_DIAS,
  };
}

async function assertCanBuy(user, planoId, plataforma, modalidade) {
  if (!(await isCheckoutEnabled(plataforma))) {
    throw forbidden('A assinatura não está disponível por aqui. Fale com o suporte para mudar de plano.', 'CHECKOUT_DISABLED');
  }
  const billing = await getSetting('billing');
  const chave = modalidade === 'avulso' ? 'pagamentoAvulso' : 'pagamentoRecorrente';
  if (billing[chave] === false) throw forbidden('Esta forma de pagamento está desativada no momento.', 'PAYMENT_METHOD_DISABLED');
  if (!user.email_verificado) throw forbidden('Confirme seu e-mail antes de assinar.', 'EMAIL_NOT_VERIFIED');

  const plan = await getPlan(planoId);
  if (!plan || plan.id !== planoId || plan.preco <= 0 || plan.disponivel === false) {
    throw badRequest('Plano indisponível.', 'PLAN_UNAVAILABLE');
  }
  return plan;
}

export function normalizePlatform(value) {
  const v = String(value ?? '').toLowerCase();
  return v in PLATFORMS ? v : 'web';
}

/** Traduz recusas do Mercado Pago ligadas ao pagador em mensagens claras. */
function payerError(err) {
  const msg = (err?.providerMessage ?? '').toLowerCase();
  if (msg.includes('test user') || msg.includes('live credentials')) {
    return badRequest(
      'O Mercado Pago está em modo de teste: nele, só uma conta de teste compradora (e-mail @testuser.com) pode pagar. Em produção, qualquer cliente paga normalmente.',
      'PAYER_ENVIRONMENT_MISMATCH',
    );
  }
  if (msg.includes('payer') || msg.includes('email')) {
    return badRequest('O Mercado Pago recusou o e-mail informado. Confira o e-mail da sua conta do Mercado Pago.', 'INVALID_PAYER');
  }
  return err;
}

/** Recusa do cartão na criação da cobrança automática. */
function cardError(err) {
  const mapped = payerError(err);
  if (mapped !== err) return mapped;
  if (err?.providerStatus && err.providerStatus < 500) {
    return badRequest(
      'O cartão não foi aceito para a cobrança automática. Confira os dados, use outro cartão de crédito ou pague com Pix.',
      'CARD_REJECTED',
    );
  }
  return err;
}

/**
 * Cobrança automática mensal.
 * - Com cardTokenId (formulário de cartão da página /assinar): o cliente
 *   paga com o próprio cartão de crédito, sem conta no Mercado Pago, e a
 *   assinatura já nasce autorizada.
 * - Sem cardTokenId: devolve o link do Mercado Pago (exige conta MP).
 * payerEmail: e-mail de quem paga. Padrão: e-mail da conta do app.
 */
export async function startCheckout(user, planoId, plataforma, { payerEmail = user.email, cardTokenId } = {}) {
  const plan = await assertCanBuy(user, planoId, plataforma, 'recorrente');

  const ativa = await Subscription.findOne({ userId: user._id, status: 'ativa', planoId, modalidade: { $ne: 'avulso' } });
  if (ativa) throw conflict(`Você já assina o plano ${plan.nome}.`, 'ALREADY_SUBSCRIBED');

  // Reaproveita um link pendente recente do mesmo plano (evita duplicar).
  const recente = !cardTokenId && await Subscription.findOne({
    userId: user._id,
    status: 'pendente',
    planoId,
    valor: plan.preco,
    payerEmail,
    createdAt: { $gt: new Date(Date.now() - 6 * 3600 * 1000) },
  });
  if (recente?.initPoint) return recente;

  const sub = await Subscription.create({
    userId: user._id,
    planoId,
    valor: plan.preco,
    payerEmail,
    plataforma,
    status: 'pendente',
  });

  const { PUBLIC_BASE_URL } = getEnv();
  try {
    const pre = await mp.createPreapproval(
      {
        reason: `Obra Fácil — Plano ${plan.nome}`,
        external_reference: String(sub._id),
        payer_email: payerEmail,
        back_url: `${PUBLIC_BASE_URL}/assinar/retorno`,
        ...(cardTokenId ? { card_token_id: cardTokenId, status: 'authorized' } : { status: 'pending' }),
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          transaction_amount: plan.preco,
          currency_id: 'BRL',
        },
      },
      `checkout-${sub._id}`,
    );
    sub.providerId = String(pre.id);
    sub.initPoint = cardTokenId ? undefined : pre.init_point;
    sub.providerStatus = pre.status;
    await sub.save();
  } catch (err) {
    sub.status = 'expirada';
    sub.observacao = `Falha ao criar no Mercado Pago${err?.providerMessage ? `: ${err.providerMessage.slice(0, 120)}` : ''}`;
    await sub.save();
    throw cardTokenId ? cardError(err) : payerError(err);
  }

  await audit({
    ator: { tipo: 'usuario', id: String(user._id) },
    acao: 'assinatura.checkout_iniciado',
    alvo: { tipo: 'assinatura', id: String(sub._id) },
    detalhes: { planoId, valor: plan.preco, plataforma, cartao: Boolean(cardTokenId) },
  });

  // Cartão aceito: confirma o estado no Mercado Pago e libera o plano na hora.
  if (cardTokenId) {
    await syncPreapproval(sub.providerId).catch((err) => logger.warn({ err: err.message }, 'Sincronização imediata falhou'));
    return Subscription.findById(sub._id);
  }
  return sub;
}

// ------------------------------------------------------------ pagamento avulso

/** Horário de Brasília no formato aceito pelo Mercado Pago (date_of_expiration). */
const brt = (ms) => new Date(ms - 3 * 3600000).toISOString().replace('Z', '-03:00');

function metodoDe(p, fallback) {
  if (p?.payment_method_id === 'pix') return 'pix';
  if (p?.payment_type_id === 'debit_card') return 'debit_card';
  if (p?.payment_type_id === 'credit_card') return 'credit_card';
  return fallback;
}

/**
 * Pagamento de 1 mês (Pix, cartão de crédito ou débito) com os dados do
 * formulário do Mercado Pago (Payment Brick). O valor vem sempre do plano
 * no servidor — o que o navegador manda como valor é ignorado.
 */
export async function startOneTimePayment(user, planoId, plataforma, formData) {
  const plan = await assertCanBuy(user, planoId, plataforma, 'avulso');
  const isPix = formData.payment_method_id === 'pix';
  if (!isPix && !formData.token) throw badRequest('Dados do cartão incompletos. Preencha o cartão de novo.', 'INVALID_CARD');

  const _id = new mongoose.Types.ObjectId();
  const pay = await Payment.create({
    _id,
    providerId: `pendente:${_id}`,
    userId: user._id,
    planoId,
    modalidade: 'avulso',
    metodo: isPix ? 'pix' : formData.payment_type_id === 'debit_card' ? 'debit_card' : 'credit_card',
    status: 'criando',
    valor: plan.preco,
    moeda: 'BRL',
    data: new Date(),
  });

  const [first, ...rest] = String(user.nome ?? '').trim().split(/\s+/);
  const ident = formData.payer?.identification;
  const body = {
    transaction_amount: plan.preco,
    description: `Obra Fácil — Plano ${plan.nome} (${PERIODO_AVULSO_DIAS} dias)`,
    external_reference: `pay_${pay._id}`,
    payment_method_id: formData.payment_method_id,
    payer: {
      email: formData.payer?.email ?? user.email,
      first_name: formData.payer?.first_name || first || undefined,
      last_name: formData.payer?.last_name || rest.join(' ') || undefined,
      ...(ident?.number ? { identification: { type: ident.type || 'CPF', number: String(ident.number).replace(/\D/g, '') } } : {}),
    },
    metadata: { pagamento_id: String(pay._id), plano_id: planoId },
    ...(isPix
      ? { date_of_expiration: brt(Date.now() + 30 * 60000) }
      : {
          token: formData.token,
          installments: 1,
          statement_descriptor: 'OBRAFACIL',
          ...(formData.issuer_id ? { issuer_id: String(formData.issuer_id) } : {}),
        }),
  };

  let p;
  try {
    p = await mp.createPayment(body, `pay-${pay._id}`);
  } catch (err) {
    pay.status = 'erro';
    pay.statusDetail = err?.providerMessage?.slice(0, 120);
    await pay.save();
    const mapped = payerError(err);
    if (mapped !== err) throw mapped;
    if (err?.providerStatus && err.providerStatus < 500) {
      throw badRequest('O Mercado Pago recusou os dados do pagamento. Confira e tente de novo.', 'PAYMENT_REJECTED');
    }
    throw err;
  }

  await audit({
    ator: { tipo: 'usuario', id: String(user._id) },
    acao: 'pagamento.iniciado',
    alvo: { tipo: 'pagamento', id: String(pay._id) },
    detalhes: { planoId, valor: plan.preco, metodo: pay.metodo, plataforma },
  });
  return applyProviderPayment(pay, p);
}

/** Aplica o estado de um pagamento avulso consultado no Mercado Pago. */
async function applyProviderPayment(pay, p) {
  const amount = Number(p.transaction_amount);
  const valido =
    String(p.external_reference) === `pay_${pay._id}` &&
    Number.isFinite(amount) &&
    Math.abs(amount - pay.valor) < 0.01 &&
    (p.currency_id ?? 'BRL') === 'BRL';

  const td = p.point_of_interaction?.transaction_data;
  pay.providerId = String(p.id);
  pay.paymentId = String(p.id);
  pay.statusDetail = p.status_detail;
  pay.metodo = metodoDe(p, pay.metodo);
  if (td?.qr_code) {
    pay.pix = {
      qrCode: td.qr_code,
      qrCodeBase64: td.qr_code_base64,
      ticketUrl: td.ticket_url,
      expiraEm: p.date_of_expiration ? new Date(p.date_of_expiration) : undefined,
    };
  }

  if (!valido) {
    if (pay.status !== 'suspeito') {
      pay.status = 'suspeito';
      await pay.save();
      await audit({ ator: SYSTEM, acao: 'pagamento.divergente', alvo: { tipo: 'pagamento', id: String(pay._id) }, detalhes: { amount, ref: p.external_reference } });
      notify('erro_webhook', `⚠️ Pagamento com dados divergentes: ${pay._id}`);
    }
    return pay;
  }

  pay.status = p.status;
  if (p.status === 'approved') pay.data = new Date(p.date_approved ?? Date.now());
  await pay.save();

  if (p.status === 'approved') await applyPaidPeriod(pay);
  else if (['refunded', 'charged_back'].includes(p.status) && pay.aplicadoEm) await revokePaidPeriod(pay);
  return pay;
}

/** Libera (ou soma) 30 dias do plano. Idempotente: cada pagamento vale uma vez. */
async function applyPaidPeriod(pay) {
  if (!pay.userId) return;
  const marcado = await Payment.findOneAndUpdate({ _id: pay._id, aplicadoEm: null }, { $set: { aplicadoEm: new Date() } }, { new: true });
  if (!marcado) return;
  pay.aplicadoEm = marcado.aplicadoEm;

  const now = new Date();
  let sub = await Subscription.findOne({
    userId: pay.userId,
    modalidade: 'avulso',
    planoId: pay.planoId,
    status: 'ativa',
    acessoAte: { $gt: now },
  });
  const nova = !sub;
  sub ??= new Subscription({ userId: pay.userId, planoId: pay.planoId, modalidade: 'avulso', status: 'ativa', valor: pay.valor, ativadaEm: now });
  const base = sub.acessoAte && sub.acessoAte > now ? sub.acessoAte : now;
  sub.acessoAte = new Date(base.getTime() + PERIODO_AVULSO_DIAS * DIA);
  sub.valor = pay.valor;
  sub.lembreteEnviadoEm = undefined;
  sub.ultimoPagamento = { id: pay.providerId, status: 'approved', valor: pay.valor, data: pay.data };
  await sub.save();
  await Payment.updateOne({ _id: pay._id }, { $set: { subscriptionId: sub._id } });
  pay.subscriptionId = sub._id;
  if (nova) await replaceOtherSubscriptions(sub);

  const user = await User.findById(pay.userId);
  const plan = await getPlan(pay.planoId);
  const ate = sub.acessoAte.toLocaleDateString('pt-BR');
  await audit({ ator: SYSTEM, acao: 'pagamento.aprovado', alvo: { tipo: 'pagamento', id: String(pay._id) }, detalhes: { planoId: pay.planoId, valor: pay.valor, metodo: pay.metodo, acessoAte: sub.acessoAte } });
  notify('assinatura_ativada', `✅ Pagamento aprovado (${pay.metodo}): plano ${plan.nome} (R$ ${pay.valor.toFixed(2)}) até ${ate}`);
  if (user) {
    sendNoticeEmailSafe(user, `Pagamento confirmado — Plano ${plan.nome}`, 'Pagamento confirmado', [
      `Olá, ${user.nome}! Recebemos seu pagamento e o plano ${plan.nome} está liberado até ${ate}.`,
      'Não há cobrança automática: alguns dias antes do vencimento enviaremos um lembrete para você renovar.',
    ]);
  }
  await resolveEffectivePlan(pay.userId);
}

/** Estorno ou contestação depois de liberado: retira os dias pagos. */
async function revokePaidPeriod(pay) {
  const marcado = await Payment.findOneAndUpdate({ _id: pay._id, aplicadoEm: { $ne: null } }, { $set: { aplicadoEm: null } });
  if (!marcado) return;
  const sub = pay.subscriptionId && (await Subscription.findById(pay.subscriptionId));
  if (sub?.acessoAte) {
    sub.acessoAte = new Date(Math.max(Date.now(), sub.acessoAte.getTime() - PERIODO_AVULSO_DIAS * DIA));
    if (sub.acessoAte <= new Date()) sub.status = 'expirada';
    sub.observacao = `Pagamento ${pay.providerId} ${pay.status === 'charged_back' ? 'contestado' : 'estornado'}`;
    await sub.save();
  }
  await audit({ ator: SYSTEM, acao: 'pagamento.estornado', alvo: { tipo: 'pagamento', id: String(pay._id) }, detalhes: { status: pay.status } });
  notify('pagamento_recusado', `↩️ Pagamento ${pay.status === 'charged_back' ? 'contestado' : 'estornado'}: ${pay.providerId}`);
  if (pay.userId) await resolveEffectivePlan(pay.userId);
}

/** Consulta de novo no Mercado Pago um pagamento avulso ainda pendente. */
export async function refreshOneTimePayment(pay) {
  if (!PENDENTES_MP.includes(pay.status) || pay.providerId.startsWith('pendente:') || !isMercadoPagoConfigured()) return pay;
  const p = await mp.getPayment(pay.providerId);
  return applyProviderPayment(pay, p);
}

async function cancelAtProvider(sub) {
  if (!sub.providerId) return;
  try {
    await mp.cancelPreapproval(sub.providerId);
  } catch (err) {
    logger.error({ err: err.message, sub: String(sub._id) }, 'Falha ao cancelar no Mercado Pago');
    throw err;
  }
}

/**
 * Sincroniza uma assinatura com o estado real no Mercado Pago.
 * Seguro para chamadas repetidas (webhooks duplicados não causam efeito).
 */
export async function syncPreapproval(preapprovalId) {
  const pre = await mp.getPreapproval(preapprovalId);
  const id = String(pre.id ?? preapprovalId);

  let sub = await Subscription.findOne({ providerId: id });
  if (!sub && mongoose.isValidObjectId(pre.external_reference)) {
    sub = await Subscription.findById(pre.external_reference);
    if (sub && sub.providerId && sub.providerId !== id) sub = null;
  }
  if (!sub) {
    logger.warn({ preapprovalId: id }, 'Assinatura desconhecida no webhook — ignorada');
    return { resultado: 'ignorado' };
  }

  // Conferências antifraude: referência, valor e moeda devem bater com o que criamos.
  const amount = Number(pre.auto_recurring?.transaction_amount);
  const currency = pre.auto_recurring?.currency_id;
  const suspicious =
    String(pre.external_reference) !== String(sub._id) ||
    !Number.isFinite(amount) ||
    Math.abs(amount - sub.valor) > 0.009 ||
    (currency && currency !== 'BRL');

  sub.providerId ??= id;
  sub.providerStatus = pre.status;
  sub.sincronizadaEm = new Date();
  if (pre.next_payment_date) sub.proximaCobrancaEm = new Date(pre.next_payment_date);

  if (suspicious) {
    if (sub.status !== 'suspeita') {
      sub.status = 'suspeita';
      sub.observacao = `Dados divergentes do Mercado Pago (valor ${amount} ${currency ?? ''}, ref ${pre.external_reference})`;
      await sub.save();
      await audit({ ator: SYSTEM, acao: 'assinatura.divergente', alvo: { tipo: 'assinatura', id: String(sub._id) }, detalhes: { amount, currency } });
      notify('erro_webhook', `⚠️ Assinatura com dados divergentes: ${sub._id}`);
    }
    await resolveEffectivePlan(sub.userId);
    return { resultado: 'suspeita' };
  }

  const anterior = sub.status;
  const novo = STATUS_MAP[pre.status] ?? anterior;

  if (novo === 'ativa' && anterior !== 'ativa') {
    sub.status = 'ativa';
    sub.ativadaEm ??= new Date();
    sub.acessoAte = undefined;
    await sub.save();
    await replaceOtherSubscriptions(sub);
    await onActivated(sub);
  } else if (novo === 'cancelada' && anterior !== 'cancelada') {
    sub.status = 'cancelada';
    sub.canceladaEm = new Date();
    sub.canceladaPor ??= 'mercadopago';
    const pago = !sub.inadimplenteDesde && sub.proximaCobrancaEm && sub.proximaCobrancaEm > new Date();
    sub.acessoAte = pago ? sub.proximaCobrancaEm : new Date();
    await sub.save();
    if (anterior === 'ativa') await onCancelled(sub);
  } else if (novo !== anterior && ['pausada', 'pendente'].includes(novo) && anterior !== 'expirada') {
    sub.status = novo;
    await sub.save();
  } else {
    await sub.save();
  }

  await resolveEffectivePlan(sub.userId);
  return { resultado: 'sincronizado', status: sub.status };
}

/** Ao ativar um plano novo, encerra as outras assinaturas do usuário (troca de plano). */
async function replaceOtherSubscriptions(sub) {
  const outras = await Subscription.find({
    userId: sub.userId,
    _id: { $ne: sub._id },
    status: { $in: ['ativa', 'pendente', 'pausada'] },
  });
  for (const o of outras) {
    try {
      await cancelAtProvider(o);
    } catch {
      o.observacao = 'Cancelamento no Mercado Pago pendente — verificar no painel';
    }
    o.status = o.status === 'pendente' ? 'expirada' : 'cancelada';
    o.canceladaEm = new Date();
    o.canceladaPor = 'troca_de_plano';
    o.acessoAte = new Date();
    await o.save();
  }
}

async function onActivated(sub) {
  const user = await User.findById(sub.userId);
  const plan = await getPlan(sub.planoId);
  await audit({ ator: SYSTEM, acao: 'assinatura.ativada', alvo: { tipo: 'assinatura', id: String(sub._id) }, detalhes: { planoId: sub.planoId, valor: sub.valor } });
  notify('assinatura_ativada', `✅ Assinatura ativada: plano ${plan.nome} (R$ ${sub.valor.toFixed(2)})`);
  if (user) {
    sendNoticeEmailSafe(user, `Plano ${plan.nome} ativado — Obra Fácil`, `Plano ${plan.nome} ativado`, [
      `Olá, ${user.nome}! Recebemos a confirmação do Mercado Pago e seu plano ${plan.nome} já está ativo.`,
      'A cobrança é mensal e você pode cancelar quando quiser pelo app ou pela página de assinatura.',
    ]);
  }
}

async function onCancelled(sub) {
  const user = await User.findById(sub.userId);
  const plan = await getPlan(sub.planoId);
  await audit({ ator: SYSTEM, acao: 'assinatura.cancelada', alvo: { tipo: 'assinatura', id: String(sub._id) }, detalhes: { por: sub.canceladaPor, acessoAte: sub.acessoAte } });
  notify('assinatura_cancelada', `Assinatura cancelada: plano ${plan.nome} (${sub.canceladaPor})`);
  if (user) {
    const ate = sub.acessoAte > new Date() ? ` Você continua com o plano até ${sub.acessoAte.toLocaleDateString('pt-BR')}.` : '';
    sendNoticeEmailSafe(user, 'Assinatura cancelada — Obra Fácil', 'Assinatura cancelada', [
      `Olá, ${user.nome}. Sua assinatura do plano ${plan.nome} foi cancelada e não haverá novas cobranças.${ate}`,
      'Seus dados continuam salvos. Depois disso, valem os limites do plano Gratuito.',
    ]);
  }
}

/** Cobrança recorrente (authorized_payment): registra e atualiza inadimplência. */
export async function handleAuthorizedPayment(authorizedPaymentId) {
  const ap = await mp.getAuthorizedPayment(authorizedPaymentId);
  const sub = await Subscription.findOne({ providerId: String(ap.preapproval_id) });
  if (!sub) return { resultado: 'ignorado' };

  const paymentStatus = ap.payment?.status ?? ap.status;
  const data = new Date(ap.debit_date ?? ap.date_created ?? Date.now());

  await Payment.updateOne(
    { provider: 'mercadopago', providerId: String(ap.id) },
    {
      $set: {
        userId: sub.userId,
        subscriptionId: sub._id,
        planoId: sub.planoId,
        paymentId: ap.payment?.id ? String(ap.payment.id) : undefined,
        status: paymentStatus,
        valor: Number(ap.transaction_amount ?? sub.valor),
        moeda: ap.currency_id ?? 'BRL',
        data,
      },
    },
    { upsert: true },
  );

  // Ignora eventos antigos que cheguem fora de ordem.
  const ultimo = sub.ultimoPagamento?.data;
  if (!ultimo || data >= ultimo) {
    sub.ultimoPagamento = { id: String(ap.id), status: paymentStatus, valor: Number(ap.transaction_amount ?? sub.valor), data };
    if (paymentStatus === 'approved') {
      sub.inadimplenteDesde = undefined;
    } else if (['rejected', 'recycling', 'cancelled'].includes(paymentStatus) || ap.status === 'recycling') {
      if (!sub.inadimplenteDesde) {
        sub.inadimplenteDesde = new Date();
        const user = await User.findById(sub.userId);
        notify('pagamento_recusado', `❌ Cobrança recusada (plano ${sub.planoId}, R$ ${sub.valor.toFixed(2)})`);
        if (user) {
          sendNoticeEmailSafe(user, 'Problema na cobrança — Obra Fácil', 'Não conseguimos cobrar sua assinatura', [
            `Olá, ${user.nome}. O Mercado Pago não conseguiu cobrar a mensalidade do seu plano.`,
            'Confira o cartão cadastrado no Mercado Pago. Vamos tentar de novo nos próximos dias; se não der certo, sua conta volta para o plano Gratuito (seus dados continuam salvos).',
          ]);
        }
      }
    }
    await sub.save();
  }

  if (ap.preapproval_id) await syncPreapproval(String(ap.preapproval_id));
  else await resolveEffectivePlan(sub.userId);
  return { resultado: 'sincronizado' };
}

/** Webhook "payment": pagamento avulso nosso (pay_<id>) ou cobrança de assinatura. */
export async function handlePayment(paymentId) {
  const p = await mp.getPayment(paymentId);
  const ref = String(p?.external_reference ?? '');
  if (ref.startsWith('pay_')) {
    const id = ref.slice(4);
    const pay = mongoose.isValidObjectId(id) ? await Payment.findById(id) : null;
    if (!pay || (!pay.providerId.startsWith('pendente:') && pay.providerId !== String(p.id))) return { resultado: 'ignorado' };
    await applyProviderPayment(pay, p);
    return { resultado: 'sincronizado', status: pay.status };
  }
  const preapprovalId = p?.metadata?.preapproval_id ?? p?.point_of_interaction?.transaction_data?.subscription_id;
  if (!preapprovalId) return { resultado: 'ignorado' };
  return syncPreapproval(String(preapprovalId));
}

/** Cancelamento pedido pelo usuário ou pelo painel. */
export async function cancelSubscription(sub, canceladaPor) {
  if (!['ativa', 'pausada', 'pendente'].includes(sub.status)) {
    throw conflict('Esta assinatura já está encerrada.', 'NOT_CANCELLABLE');
  }
  if (sub.modalidade === 'avulso') {
    const ate = sub.acessoAte ? ` O plano vale até ${sub.acessoAte.toLocaleDateString('pt-BR')}.` : '';
    throw conflict(`Pagamento mês a mês não tem cobrança automática para cancelar.${ate}`, 'NOT_CANCELLABLE');
  }
  if (!isMercadoPagoConfigured() && sub.providerId) throw unavailable('Pagamentos indisponíveis no momento.');
  await cancelAtProvider(sub);

  const anterior = sub.status;
  sub.status = anterior === 'pendente' ? 'expirada' : 'cancelada';
  sub.canceladaEm = new Date();
  sub.canceladaPor = canceladaPor;
  const pago = !sub.inadimplenteDesde && sub.proximaCobrancaEm && sub.proximaCobrancaEm > new Date();
  sub.acessoAte = pago ? sub.proximaCobrancaEm : new Date();
  await sub.save();
  if (anterior === 'ativa') await onCancelled(sub);
  await resolveEffectivePlan(sub.userId);
  return sub;
}

/** Exclusão de conta: encerra cobranças e desvincula os registros financeiros. */
export async function detachUserSubscriptions(userId) {
  const subs = await Subscription.find({ userId });
  for (const s of subs) {
    if (['ativa', 'pausada', 'pendente'].includes(s.status) && s.providerId) {
      try {
        await cancelAtProvider(s);
      } catch {
        s.observacao = 'Conta excluída — cancelar manualmente no Mercado Pago';
        await audit({ ator: SYSTEM, acao: 'assinatura.cancelamento_pendente', alvo: { tipo: 'assinatura', id: String(s._id) } });
      }
    }
    if (['ativa', 'pausada'].includes(s.status)) s.status = 'cancelada';
    if (s.status === 'pendente') s.status = 'expirada';
    s.canceladaPor ??= 'exclusao_de_conta';
    s.canceladaEm ??= new Date();
    s.payerEmail = undefined;
    s.userId = undefined;
    await s.save();
  }
  // Registros financeiros ficam (obrigação fiscal), sem vínculo com a pessoa.
  await Payment.updateMany({ userId }, { $unset: { userId: 1 } });
}

/**
 * Rotina periódica: expira pendentes abandonadas, re-sincroniza assinaturas
 * (caso um webhook tenha se perdido) e aplica fim de tolerância/período.
 */
export async function reconcileSubscriptions({ limit = 200 } = {}) {
  const resumo = { expiradas: 0, sincronizadas: 0, erros: 0, planos: 0, vencidas: 0, lembretes: 0, pagamentos: 0 };
  const now = new Date();
  const limite48h = new Date(Date.now() - 48 * 3600 * 1000);

  const pendentes = await Subscription.find({ status: 'pendente', createdAt: { $lt: limite48h } }).limit(limit);
  for (const s of pendentes) {
    try {
      if (isMercadoPagoConfigured() && s.providerId) {
        const pre = await mp.getPreapproval(s.providerId);
        if (pre.status === 'authorized') {
          await syncPreapproval(s.providerId);
          resumo.sincronizadas++;
          continue;
        }
        await mp.cancelPreapproval(s.providerId).catch(() => {});
      }
      s.status = 'expirada';
      await s.save();
      resumo.expiradas++;
    } catch {
      resumo.erros++;
    }
  }

  if (isMercadoPagoConfigured()) {
    const vivas = await Subscription.find({ status: { $in: ['ativa', 'pausada'] }, providerId: { $exists: true } })
      .sort({ sincronizadaEm: 1 })
      .limit(limit);
    for (const s of vivas) {
      try {
        await syncPreapproval(s.providerId);
        resumo.sincronizadas++;
      } catch {
        resumo.erros++;
      }
    }
  }

  // Pagamentos avulsos pendentes (Pix gerado e webhook perdido).
  const pagamentos = await Payment.find({
    modalidade: 'avulso',
    status: { $in: PENDENTES_MP },
    providerId: { $not: /^pendente:/ },
    createdAt: { $gt: new Date(now - 7 * DIA) },
  }).limit(limit);
  for (const pay of pagamentos) {
    try {
      await refreshOneTimePayment(pay);
      resumo.pagamentos++;
    } catch {
      resumo.erros++;
    }
  }

  // Pagamento mês a mês: lembrete 3 dias antes de vencer.
  const vencendo = await Subscription.find({
    modalidade: 'avulso',
    status: 'ativa',
    acessoAte: { $gt: now, $lte: new Date(now.getTime() + 3 * DIA) },
    lembreteEnviadoEm: null,
    userId: { $ne: null },
  }).limit(limit);
  const { PUBLIC_BASE_URL } = getEnv();
  for (const s of vencendo) {
    const [user, plan] = await Promise.all([User.findById(s.userId), getPlan(s.planoId)]);
    if (user) {
      sendNoticeEmailSafe(user, `Seu plano ${plan.nome} vence em ${s.acessoAte.toLocaleDateString('pt-BR')}`, 'Hora de renovar', [
        `Olá, ${user.nome}! Seu plano ${plan.nome} do Obra Fácil vale até ${s.acessoAte.toLocaleDateString('pt-BR')}.`,
        `Para continuar sem interrupção, pague mais um mês (Pix ou cartão) em ${PUBLIC_BASE_URL}/assinar — os dias se somam ao que você ainda tem.`,
        'Se preferir, escolha a cobrança automática no cartão de crédito e não precisa lembrar todo mês.',
      ]);
    }
    s.lembreteEnviadoEm = now;
    await s.save();
    resumo.lembretes++;
  }

  // Pagamento mês a mês vencido.
  const vencidas = await Subscription.find({ modalidade: 'avulso', status: 'ativa', acessoAte: { $lte: now } }).limit(limit);
  for (const s of vencidas) {
    s.status = 'expirada';
    await s.save();
    resumo.vencidas++;
    const user = s.userId && (await User.findById(s.userId));
    if (user) {
      const plan = await getPlan(s.planoId);
      sendNoticeEmailSafe(user, `Seu plano ${plan.nome} venceu — Obra Fácil`, 'Plano vencido', [
        `Olá, ${user.nome}. O período pago do plano ${plan.nome} terminou e sua conta voltou ao plano Gratuito. Seus dados continuam salvos.`,
        `Para voltar ao plano, pague mais um mês em ${PUBLIC_BASE_URL}/assinar.`,
      ]);
    }
  }

  // Recalcula planos de quem pode ter perdido o acesso (fim do período ou da tolerância).
  const userIds = await Subscription.distinct('userId', {
    userId: { $ne: null },
    $or: [
      { status: 'cancelada', acessoAte: { $lt: now } },
      { status: 'ativa', inadimplenteDesde: { $ne: null } },
      { _id: { $in: vencidas.map((s) => s._id) } },
    ],
  });
  const cortesias = await User.distinct('_id', { 'planoManual.ate': { $lt: new Date() }, planoAtual: { $ne: 'gratuito' } });
  for (const id of new Set([...userIds, ...cortesias].map(String))) {
    await resolveEffectivePlan(id);
    resumo.planos++;
  }
  return resumo;
}
