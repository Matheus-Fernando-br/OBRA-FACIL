/* ==========================================================
   PLANOS E LIMITES — fonte única de verdade do app
   ----------------------------------------------------------
   ✏️  Para mudar preços, limites ou textos, altere SOMENTE este
   arquivo. O backend também deve aplicar os mesmos limites
   (o app bloqueia na interface, mas a regra final é da API).

   💳  Pagamento: veja src/services/subscription.ts
   (procure por "TODO(pagamento)").
========================================================== */

export type PlanId = "gratuito" | "basico" | "profissional";

/** Recursos com limite de uso. */
export type LimitKey = "clientes" | "orcamentos" | "obras";

export interface PlanDefinition {
  id: PlanId;
  nome: string;
  descricao: string;
  /** Preço mensal em reais (0 = gratuito). */
  precoMensal: number;
  /** null = sem limite. */
  limites: Record<LimitKey, number | null>;
  recursos: string[];
  destaque?: boolean;
  /**
   * ID do produto de assinatura no Google Play Console
   * (Monetizar → Assinaturas). Preencher ao criar os produtos.
   */
  playProductId?: string;
}

export const PLANS: PlanDefinition[] = [
  {
    id: "gratuito",
    nome: "Gratuito",
    descricao: "Para conhecer o app e organizar os primeiros trabalhos.",
    precoMensal: 0,
    limites: { clientes: 10, orcamentos: 10, obras: 3 },
    recursos: [
      "Até 10 clientes",
      "Até 10 orçamentos ativos",
      "Até 3 obras ativas",
      "PDF de orçamentos e obras",
    ],
  },
  {
    id: "basico",
    nome: "Básico",
    descricao: "Para o profissional autônomo com rotina de obras.",
    precoMensal: 19.9,
    limites: { clientes: 50, orcamentos: 100, obras: 20 },
    recursos: [
      "Até 50 clientes",
      "Até 100 orçamentos ativos",
      "Até 20 obras ativas",
      "Relatórios e exportação para Excel",
    ],
    playProductId: "obrafacil_basico_mensal",
  },
  {
    id: "profissional",
    nome: "Profissional",
    descricao: "Sem limites, para quem toca várias obras ao mesmo tempo.",
    precoMensal: 39.9,
    limites: { clientes: null, orcamentos: null, obras: null },
    recursos: [
      "Clientes ilimitados",
      "Orçamentos ilimitados",
      "Obras ilimitadas",
      "Todos os relatórios e exportações",
    ],
    destaque: true,
    playProductId: "obrafacil_profissional_mensal",
  },
];

/** Plano de todo usuário novo (e o usado se a API não informar). */
export const DEFAULT_PLAN_ID: PlanId = "gratuito";

export const LIMIT_LABELS: Record<LimitKey, { singular: string; plural: string }> = {
  clientes: { singular: "cliente", plural: "clientes" },
  orcamentos: { singular: "orçamento ativo", plural: "orçamentos ativos" },
  obras: { singular: "obra ativa", plural: "obras ativas" },
};

export function getPlan(id?: string | null): PlanDefinition {
  return PLANS.find((p) => p.id === id) ?? PLANS.find((p) => p.id === DEFAULT_PLAN_ID)!;
}

export function formatPlanPrice(plan: PlanDefinition) {
  if (plan.precoMensal === 0) return "Grátis";
  return `${plan.precoMensal.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })}/mês`;
}

/** true se ainda é possível criar mais um item. */
export function isWithinLimit(plan: PlanDefinition, key: LimitKey, currentCount: number) {
  const limit = plan.limites[key];
  return limit === null || currentCount < limit;
}

/**
 * Como cada recurso é contado (mesma regra deve valer no backend):
 * - clientes: todos os clientes cadastrados
 * - orçamentos: orçamentos não arquivados
 * - obras: obras não arquivadas
 */
export function countForLimit(key: LimitKey, items: object[]) {
  if (key === "clientes") return items.length;
  return items.filter((item) => !(item as { arquivado?: boolean }).arquivado).length;
}
