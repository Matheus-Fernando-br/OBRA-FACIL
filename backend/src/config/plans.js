/*
 * Planos padrão. O painel administrativo pode sobrescrever preço, limites e
 * descrição (coleção "settings", chave "plans"); veja services/plans.js.
 *
 * Limite null = ilimitado. Orçamentos e obras arquivados não contam.
 * Mantenha em sincronia com frontend/src/config/plans.ts (usado como
 * reserva quando o app está sem conexão).
 */
export const LIMIT_KEYS = ['clientes', 'orcamentos', 'obras', 'produtos'];

export const DEFAULT_PLANS = [
  {
    id: 'gratuito',
    nome: 'Gratuito',
    preco: 0,
    descricao: 'Para conhecer o app e organizar os primeiros trabalhos.',
    destaque: false,
    limites: { clientes: 10, orcamentos: 10, obras: 3, produtos: 30 },
  },
  {
    id: 'basico',
    nome: 'Básico',
    preco: 19.9,
    descricao: 'Para quem atende vários clientes por mês.',
    destaque: false,
    limites: { clientes: 50, orcamentos: 100, obras: 20, produtos: 300 },
  },
  {
    id: 'profissional',
    nome: 'Profissional',
    preco: 39.9,
    descricao: 'Sem limites para empresas e equipes em crescimento.',
    destaque: true,
    limites: { clientes: null, orcamentos: null, obras: null, produtos: null },
  },
];

export const DEFAULT_PLAN_ID = 'gratuito';
export const PLAN_IDS = DEFAULT_PLANS.map((p) => p.id);
