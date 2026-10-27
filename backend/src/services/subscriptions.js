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
 */

const STATUS_MAP = { authorized: 'ativa', paused: 'pausada', cancelled: 'cancelada', pending: 'pendente' };
const PLATFORMS = { android: 'checkoutAndroid', ios: 'checkoutIos', web: 'checkoutWeb' };

/** Se o checkout do Mercado Pago pode aparecer nesta plataforma (regras das lojas). */
export async function isCheckoutEnabled(plataforma) {
  if (!isMercadoPagoConfigured()) return false;
  const billing = await getSetting('billing');
  return Boolean(billing[PLATFORMS[plataforma] ?? 'checkoutWeb']);
}

export function normalizePlatform(value) {
  const v = String(value ?? '').toLowerCase();
  return v in PLATFORMS ? v : 'web';
}

/** Traduz recusas do Mercado Pago ligadas ao pagador em mensagens claras. */
function payerError(err) {
  const msg = (err?.providerMessage ?? '').toLowerCase();
  if (msg.includes('test user')) {
    return badRequest(
      'Este e-mail não pode pagar com a conta atual do Mercado Pago: em modo de teste, use o e-mail do usuário comprador de teste; em produção, uma conta real.',
      'PAYER_ENVIRONMENT_MISMATCH',
    );
  }
  if (msg.includes('payer') || msg.includes('email')) {
    return badRequest('O Mercado Pago recusou o e-mail informado. Confira o e-mail da sua conta do Mercado Pago.', 'INVALID_PAYER');
  }
  return err;
}

/**
 * payerEmail: e-mail da conta do Mercado Pago de quem vai pagar (pode ser
 * diferente do e-mail do app). Padrão: e-mail da conta do app.
 */
export async function startCheckout(user, planoId, plataforma, payerEmail = user.email) {
  if (!(await isCheckoutEnabled(plataforma))) {
    throw forbidden('A assinatura não está disponível por aqui. Fale com o suporte para mudar de plano.', 'CHECKOUT_DISABLED');
  }
  if (!user.email_verificado) throw forbidden('Confirme seu e-mail antes de assinar.', 'EMAIL_NOT_VERIFIED');

  const plan = await getPlan(planoId);
  if (!plan || plan.id !== planoId || plan.preco <= 0 || plan.disponivel === false) {
    throw badRequest('Plano indisponível.', 'PLAN_UNAVAILABLE');
  }

  const ativa = await Subscription.findOne({ userId: user._id, status: 'ativa', planoId });
  if (ativa) throw conflict(`Você já assina o plano ${plan.nome}.`, 'ALREADY_SUBSCRIBED');

  // Reaproveita um link pendente recente do mesmo plano (evita duplicar).
  const recente = await Subscription.findOne({
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
        status: 'pending',
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
    sub.initPoint = pre.init_point;
    sub.providerStatus = pre.status;
    await sub.save();
  } catch (err) {
    sub.status = 'expirada';
    sub.observacao = `Falha ao criar no Mercado Pago${err?.providerMessage ? `: ${err.providerMessage.slice(0, 120)}` : ''}`;
    await sub.save();
    throw payerError(err);
  }

  await audit({
    ator: { tipo: 'usuario', id: String(user._id) },
    acao: 'assinatura.checkout_iniciado',
    alvo: { tipo: 'assinatura', id: String(sub._id) },
    detalhes: { planoId, valor: plan.preco, plataforma },
  });
  return sub;
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

/** Pagamento avulso: só interessa se pertencer a uma assinatura. */
export async function handlePayment(paymentId) {
  const p = await mp.getPayment(paymentId);
  const preapprovalId = p?.metadata?.preapproval_id ?? p?.point_of_interaction?.transaction_data?.subscription_id;
  if (!preapprovalId) return { resultado: 'ignorado' };
  return syncPreapproval(String(preapprovalId));
}

/** Cancelamento pedido pelo usuário ou pelo painel. */
export async function cancelSubscription(sub, canceladaPor) {
  if (!['ativa', 'pausada', 'pendente'].includes(sub.status)) {
    throw conflict('Esta assinatura já está encerrada.', 'NOT_CANCELLABLE');
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
  const resumo = { expiradas: 0, sincronizadas: 0, erros: 0, planos: 0 };
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

  // Recalcula planos de quem pode ter perdido o acesso (fim do período ou da tolerância).
  const userIds = await Subscription.distinct('userId', {
    userId: { $ne: null },
    $or: [{ status: 'cancelada', acessoAte: { $lt: new Date() } }, { status: 'ativa', inadimplenteDesde: { $ne: null } }],
  });
  const cortesias = await User.distinct('_id', { 'planoManual.ate': { $lt: new Date() }, planoAtual: { $ne: 'gratuito' } });
  for (const id of new Set([...userIds, ...cortesias].map(String))) {
    await resolveEffectivePlan(id);
    resumo.planos++;
  }
  return resumo;
}
