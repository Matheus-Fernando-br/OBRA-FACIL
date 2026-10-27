import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import Subscription from '../models/Subscription.js';
import { getPlan, getPlans, getUsage, resolveEffectivePlan } from '../services/plans.js';
import {
  cancelSubscription,
  isCheckoutEnabled,
  normalizePlatform,
  startCheckout,
  syncPreapproval,
} from '../services/subscriptions.js';
import { isMercadoPagoConfigured } from '../services/mercadopago.js';
import { notFound } from '../utils/errors.js';
import { checkoutSchema } from '../validators/schemas.js';

/** Plataforma do cliente: cabeçalho X-Platform (android | ios | web). */
const platformOf = (req) => normalizePlatform(req.get('x-platform') ?? req.query.platform);

export const plansRouter = Router();

/** Público: planos, limites e se o checkout aparece nesta plataforma. */
plansRouter.get('/', async (req, res) => {
  const plataforma = platformOf(req);
  const plans = (await getPlans()).filter((p) => p.disponivel !== false || p.id === 'gratuito');
  res.json({
    plans,
    checkout: { enabled: await isCheckoutEnabled(plataforma), provider: 'mercadopago', plataforma },
  });
});

export const subscriptionRouter = Router();
subscriptionRouter.use(requireAuth);

const publicSub = (s) =>
  s && {
    _id: s._id,
    planoId: s.planoId,
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
  res.json({
    plano,
    origem,
    status: assinatura?.status ?? (origem === 'cortesia' ? 'cortesia' : 'gratuito'),
    renovaEm: assinatura?.status === 'ativa' ? assinatura.proximaCobrancaEm : null,
    acessoAte: assinatura?.status === 'cancelada' ? assinatura.acessoAte : (origem === 'cortesia' ? req.user.planoManual?.ate ?? null : null),
    assinatura: publicSub(assinatura),
    // O link de pagamento pendente é do próprio usuário (para continuar o pagamento).
    pendente: pendente && { ...publicSub(pendente), initPoint: pendente.initPoint },
    uso,
    checkout: { enabled: await isCheckoutEnabled(plataforma), plataforma },
  });
});

/**
 * Inicia a assinatura: devolve o link de pagamento do Mercado Pago.
 * O plano só muda depois que o Mercado Pago confirmar (webhook).
 */
subscriptionRouter.post('/checkout', validate(checkoutSchema), async (req, res) => {
  const sub = await startCheckout(req.user, req.body.planoId, platformOf(req), req.body.payerEmail ?? req.user.email);
  res.status(201).json({ initPoint: sub.initPoint, assinatura: publicSub(sub) });
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
  const sub = await Subscription.findOne({ userId: req.user._id, status: { $in: ['ativa', 'pausada'] } }).sort({ updatedAt: -1 });
  if (!sub) throw notFound('Você não tem assinatura ativa.');
  const result = await cancelSubscription(sub, 'usuario');
  res.json({ message: 'Assinatura cancelada. Não haverá novas cobranças.', assinatura: publicSub(result) });
});

// Compatibilidade: DELETE /subscription = cancelar.
subscriptionRouter.delete('/', async (req, res) => {
  const sub = await Subscription.findOne({ userId: req.user._id, status: { $in: ['ativa', 'pausada'] } }).sort({ updatedAt: -1 });
  if (!sub) throw notFound('Você não tem assinatura ativa.');
  const result = await cancelSubscription(sub, 'usuario');
  res.json({ message: 'Assinatura cancelada. Não haverá novas cobranças.', assinatura: publicSub(result) });
});
