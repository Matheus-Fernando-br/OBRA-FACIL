import { DEFAULT_PLANS, DEFAULT_PLAN_ID, LIMIT_KEYS } from '../config/plans.js';
import Client from '../models/Client.js';
import Obra from '../models/Obra.js';
import Orcamento from '../models/Orcamento.js';
import Produto from '../models/Produto.js';
import Subscription from '../models/Subscription.js';
import User from '../models/User.js';
import { forbidden } from '../utils/errors.js';
import { getSetting } from './settings.js';

/** Planos com as alterações feitas no painel (preço, limites, textos, ativo). */
export async function getPlans() {
  const overrides = await getSetting('plans');
  return DEFAULT_PLANS.map((plan) => {
    const o = overrides?.[plan.id] ?? {};
    return {
      ...plan,
      ...(o.nome ? { nome: o.nome } : {}),
      ...(o.descricao ? { descricao: o.descricao } : {}),
      ...(typeof o.preco === 'number' ? { preco: o.preco } : {}),
      ...(typeof o.destaque === 'boolean' ? { destaque: o.destaque } : {}),
      disponivel: o.disponivel !== false,
      limites: { ...plan.limites, ...(o.limites ?? {}) },
    };
  });
}

export async function getPlan(id) {
  const plans = await getPlans();
  return plans.find((p) => p.id === id) ?? plans.find((p) => p.id === DEFAULT_PLAN_ID);
}

const COUNTERS = {
  clientes: (userId) => Client.countDocuments({ responsavel: userId }),
  orcamentos: (userId) => Orcamento.countDocuments({ responsavel: userId, arquivado: { $ne: true } }),
  obras: (userId) => Obra.countDocuments({ responsavel: userId, arquivado: { $ne: true } }),
  produtos: (userId) => Produto.countDocuments({ responsavel: userId }),
};

export async function getUsage(userId) {
  const entries = await Promise.all(LIMIT_KEYS.map(async (k) => [k, await COUNTERS[k](userId)]));
  return Object.fromEntries(entries);
}

const LABELS = { clientes: 'clientes', orcamentos: 'orçamentos ativos', obras: 'obras ativas', produtos: 'itens no catálogo' };

/**
 * Bloqueia a criação quando o plano atingiu o limite. Responde 403 com
 * code PLAN_LIMIT (o app mostra o convite para mudar de plano).
 * Observação: duas criações simultâneas podem passar 1 item do limite.
 */
export async function assertWithinLimit(user, key) {
  const plan = await getPlan(user.planoAtual || DEFAULT_PLAN_ID);
  const limit = plan.limites[key];
  if (limit == null) return;
  const used = await COUNTERS[key](user._id);
  if (used >= limit) {
    throw forbidden(
      `Você atingiu o limite de ${limit} ${LABELS[key]} do plano ${plan.nome}. Mude de plano para continuar.`,
      'PLAN_LIMIT',
      { limite: limit, uso: used, recurso: key, plano: plan.id },
    );
  }
}

/**
 * Calcula o plano efetivo: cortesia do painel > assinatura ativa (ou
 * cancelada ainda dentro do período pago / inadimplente dentro da tolerância)
 * > Gratuito. Atualiza o cache em users.planoAtual.
 */
export async function resolveEffectivePlan(userId) {
  const user = await User.findById(userId);
  if (!user) return null;
  const now = new Date();
  const billing = await getSetting('billing');
  const tolerancia = (billing.diasTolerancia ?? 7) * 86400000;

  let planoId = DEFAULT_PLAN_ID;
  let origem = 'gratuito';
  let assinatura = null;

  const subs = await Subscription.find({ userId, status: { $in: ['ativa', 'cancelada', 'pausada'] } })
    .sort({ updatedAt: -1 })
    .lean();

  for (const s of subs) {
    const valida =
      (s.status === 'ativa' && (!s.inadimplenteDesde || now - s.inadimplenteDesde < tolerancia)) ||
      (s.status === 'cancelada' && s.acessoAte && s.acessoAte > now);
    if (valida) {
      planoId = s.planoId;
      origem = 'assinatura';
      assinatura = s;
      break;
    }
  }

  const manual = user.planoManual;
  if (manual?.planoId && (!manual.ate || manual.ate > now)) {
    planoId = manual.planoId;
    origem = 'cortesia';
  }

  if (user.planoAtual !== planoId) {
    user.planoAtual = planoId;
    await user.save();
  }
  return { planoId, origem, assinatura };
}
