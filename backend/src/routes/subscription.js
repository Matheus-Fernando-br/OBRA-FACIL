import { Router } from 'express';
import mongoose from 'mongoose';
import { requireAuth } from '../middlewares/auth.js';
import { paymentLimiter } from '../middlewares/rateLimits.js';
import { validate } from '../middlewares/validate.js';
import Payment from '../models/Payment.js';
import Subscription from '../models/Subscription.js';
import { getPlan, getPlans, getUsage, resolveEffectivePlan } from '../services/plans.js';
import {
  cancelSubscription,
  checkoutInfo,
  normalizePlatform,
  paymentMessage,
  refreshOneTimePayment,
  startCheckout,
  startOneTimePayment,
  syncPreapproval,
} from '../services/subscriptions.js';
import { isMercadoPagoConfigured } from '../services/mercadopago.js';
import { notFound } from '../utils/errors.js';
import { checkoutSchema, oneTimePaymentSchema } from '../validators/schemas.js';

/** Plataforma do cliente: cabeçalho X-Platform (android | ios | web). */
const platformOf = (req) => normalizePlatform(req.get('x-platform') ?? req.query.platform);

export const plansRouter = Router();

/** Público: planos, limites e se o checkout aparece nesta plataforma. */
plansRouter.get('/', async (req, res) => {
  const plataforma = platformOf(req);
  const plans = (await getPlans()).filter((p) => p.disponivel !== false || p.id === 'gratuito');
  res.json({ plans, checkout: await checkoutInfo(plataforma) });
});

export const subscriptionRouter = Router();
subscriptionRouter.use(requireAuth);

const publicSub = (s) =>
  s && {
    _id: s._id,
    planoId: s.planoId,
    modalidade: s.modalidade ?? 'recorrente',
    status: s.status,
    valor: s.valor,
    proximaCobrancaEm: s.proximaCobrancaEm,
    acessoAte: s.acessoAte,
    inadimplente: Boolean(s.inadimplenteDesde),
    ativadaEm: s.ativadaEm,
    canceladaEm: s.canceladaEm,
    createdAt: s.createdAt,
  };

/**
 * Plano atual e uso. Formato lido pelo app:
 * { plano: { id, nome, ... }, origem, status, assinatura, uso, checkout }
 */
subscriptionRouter.get('/me', async (req, res) => {
  const { planoId, origem, assinatura } = await resolveEffectivePlan(req.user._id);
  const [plano, uso, pendente] = await Promise.all([
    getPlan(planoId),
    getUsage(req.user._id),
    Subscription.findOne({ userId: req.user._id, status: 'pendente' }).sort({ createdAt: -1 }).lean(),
  ]);
  const plataforma = platformOf(req);
  const avulso = assinatura?.modalidade === 'avulso';
  const comFim = assinatura?.status === 'cancelada' || avulso;
  res.json({
    plano,
    origem,
    status: assinatura?.status ?? (origem === 'cortesia' ? 'cortesia' : 'gratuito'),
    modalidade: assinatura ? (assinatura.modalidade ?? 'recorrente') : null,
    renovaEm: assinatura?.status === 'ativa' && !avulso ? assinatura.proximaCobrancaEm : null,
    acessoAte: comFim ? assinatura.acessoAte : (origem === 'cortesia' ? req.user.planoManual?.ate ?? null : null),
    assinatura: publicSub(assinatura),
    // O link de pagamento pendente é do próprio usuário (para continuar o pagamento).
    pendente: pendente && { ...publicSub(pendente), initPoint: pendente.initPoint },
    uso,
    checkout: await checkoutInfo(plataforma),
  });
});

/**
 * Cobrança automática mensal no cartão de crédito.
 * Com cardTokenId (formulário da página /assinar) o cartão é do próprio
 * cliente, sem conta no Mercado Pago; sem ele, devolve o link do Mercado Pago.
 * O plano só muda com o estado confirmado na API do Mercado Pago.
 */
subscriptionRouter.post('/checkout', paymentLimiter, validate(checkoutSchema), async (req, res) => {
  const sub = await startCheckout(req.user, req.body.planoId, platformOf(req), {
    payerEmail: req.body.payerEmail ?? req.user.email,
    cardTokenId: req.body.cardTokenId,
  });
  const { planoId } = await resolveEffectivePlan(req.user._id);
  res.status(201).json({ initPoint: sub.initPoint ?? null, assinatura: publicSub(sub), plano: await getPlan(planoId) });
});

const publicPayment = (p) => ({
  _id: p._id,
  planoId: p.planoId,
  modalidade: p.modalidade,
  metodo: p.metodo,
  status: p.status,
  statusDetail: p.statusDetail,
  mensagem: paymentMessage(p.status, p.statusDetail),
  valor: p.valor,
  data: p.data,
  pix: p.pix?.qrCode ? { qrCode: p.pix.qrCode, qrCodeBase64: p.pix.qrCodeBase64, ticketUrl: p.pix.ticketUrl, expiraEm: p.pix.expiraEm } : null,
});

/** Pagamento de 1 mês: Pix (devolve o QR Code), cartão de crédito ou débito. */
subscriptionRouter.post('/pay', paymentLimiter, validate(oneTimePaymentSchema), async (req, res) => {
  const pay = await startOneTimePayment(req.user, req.body.planoId, platformOf(req), req.body.formData);
  const { planoId } = await resolveEffectivePlan(req.user._id);
  res.status(201).json({ pagamento: publicPayment(pay), plano: await getPlan(planoId) });
});

/** Acompanhamento de um pagamento (a página consulta enquanto o Pix não é pago). */
subscriptionRouter.get('/payment/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw notFound('Pagamento não encontrado.');
  let pay = await Payment.findOne({ _id: req.params.id, userId: req.user._id });
  if (!pay) throw notFound('Pagamento não encontrado.');
  pay = await refreshOneTimePayment(pay).catch(() => pay);
  const { planoId } = await resolveEffectivePlan(req.user._id);
  res.json({ pagamento: publicPayment(pay), plano: await getPlan(planoId) });
});

/** Atualiza a partir do Mercado Pago (ex.: usuário voltou do pagamento). */
subscriptionRouter.post('/sync', async (req, res) => {
  if (isMercadoPagoConfigured()) {
    const subs = await Subscription.find({
      userId: req.user._id,
      status: { $in: ['pendente', 'ativa', 'pausada'] },
      providerId: { $exists: true },
    }).limit(5);
    for (const s of subs) await syncPreapproval(s.providerId);
  }
  const { planoId } = await resolveEffectivePlan(req.user._id);
  res.json({ plano: await getPlan(planoId) });
});

subscriptionRouter.post('/cancel', async (req, res) => {
  const sub = await Subscription.findOne({ userId: req.user._id, status: { $in: ['ativa', 'pausada'] }, modalidade: { $ne: 'avulso' } }).sort({ updatedAt: -1 });
  if (!sub) throw notFound('Você não tem cobrança automática ativa para cancelar.');
  const result = await cancelSubscription(sub, 'usuario');
  res.json({ message: 'Assinatura cancelada. Não haverá novas cobranças.', assinatura: publicSub(result) });
});

// Compatibilidade: DELETE /subscription = cancelar.
subscriptionRouter.delete('/', async (req, res) => {
  const sub = await Subscription.findOne({ userId: req.user._id, status: { $in: ['ativa', 'pausada'] }, modalidade: { $ne: 'avulso' } }).sort({ updatedAt: -1 });
  if (!sub) throw notFound('Você não tem cobrança automática ativa para cancelar.');
  const result = await cancelSubscription(sub, 'usuario');
  res.json({ message: 'Assinatura cancelada. Não haverá novas cobranças.', assinatura: publicSub(result) });
});
