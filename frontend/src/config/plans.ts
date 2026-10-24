/* ==========================================================
   PLANOS E LIMITES
   ----------------------------------------------------------
   ✏️  Preços, limites e textos são definidos no SERVIDOR e podem
   ser alterados no painel administrativo (/admin → Planos).
   O app busca os planos em GET /plans; os valores abaixo são só
   a reserva para quando o app estiver sem conexão
   (mantenha em sincronia com backend/src/config/plans.js).

   💳  Pagamento (Mercado Pago): src/services/subscription.ts.
========================================================== */

export type PlanId = "gratuito" | "basico" | "profissional";

/** Recursos com limite de uso. */
export type LimitKey = "clientes" | "orcamentos" | "obras" | "produtos";

export const LIMIT_LABELS: Record<LimitKey, { singular: string; plural: string }> = {
  clientes: { singular: "cliente", plural: "clientes" },
  orcamentos: { singular: "orçamento ativo", plural: "orçamentos ativos" },
  obras: { singular: "obra ativa", plural: "obras ativas" },
  produtos: { singular: "item no catálogo", plural: "itens no catálogo" },
};

const UNLIMITED_TEXT: Record<LimitKey, string> = {
  clientes: "Clientes ilimitados",
  orcamentos: "Orçamentos ilimitados",
  obras: "Obras ilimitadas",
  produtos: "Catálogo ilimitado",
};

/** Textos dos recursos gerados a partir dos limites (ex.: "Até 10 clientes"). */
export function describeLimits(limites: Record<LimitKey, number | null>) {
  const items = (Object.keys(LIMIT_LABELS) as LimitKey[]).map((key) => {
    const limit = limites[key];
    if (limit == null) return UNLIMITED_TEXT[key];
    return `Até ${limit} ${limit === 1 ? LIMIT_LABELS[key].singular : LIMIT_LABELS[key].plural}`;
  });
  return [...items, "PDF de orçamentos e relatórios"];
}

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
  /** false = não aceita novas assinaturas (definido no painel). */
  disponivel?: boolean;
}

export const PLANS: PlanDefinition[] = [
  {
    id: "gratuito",
    nome: "Gratuito",
    descricao: "Para conhecer o app e organizar os primeiros trabalhos.",
    precoMensal: 0,
    limites: { clientes: 10, orcamentos: 10, obras: 3, produtos: 30 },
    recursos: [],
  },
  {
    id: "basico",
    nome: "Básico",
    descricao: "Para quem atende vários clientes por mês.",
    precoMensal: 19.9,
    limites: { clientes: 50, orcamentos: 100, obras: 20, produtos: 300 },
    recursos: [],
  },
  {
    id: "profissional",
    nome: "Profissional",
    descricao: "Sem limites para empresas e equipes em crescimento.",
    precoMensal: 39.9,
    limites: { clientes: null, orcamentos: null, obras: null, produtos: null },
    recursos: [],
    destaque: true,
  },
].map((plan) => ({ ...plan, recursos: describeLimits(plan.limites as PlanDefinition["limites"]) })) as PlanDefinition[];

/** Plano de todo usuário novo (e o usado se a API não informar). */
export const DEFAULT_PLAN_ID: PlanId = "gratuito";

/** Converte a resposta de GET /plans no formato usado pelas telas. */
export function plansFromServer(list: any[]): PlanDefinition[] | null {
  if (!Array.isArray(list) || !list.length) return null;
  const plans = list
    .filter((p) => PLANS.some((local) => local.id === p?.id))
    .map((p) => {
      const local = PLANS.find((l) => l.id === p.id)!;
      const limites = { ...local.limites, ...(p.limites ?? {}) } as PlanDefinition["limites"];
      return {
        id: p.id as PlanId,
        nome: String(p.nome ?? local.nome),
        descricao: String(p.descricao ?? local.descricao),
        precoMensal: typeof p.preco === "number" ? p.preco : local.precoMensal,
        limites,
        recursos: describeLimits(limites),
        destaque: Boolean(p.destaque),
        disponivel: p.disponivel !== false,
      };
    });
  return plans.length ? plans : null;
}

/** Plano pelo id, procurando na lista atual (servidor) ou na reserva local. */
export function getPlan(id?: string | null, plans: PlanDefinition[] = PLANS): PlanDefinition {
  return (
    plans.find((p) => p.id === id) ??
    PLANS.find((p) => p.id === id) ??
    PLANS.find((p) => p.id === DEFAULT_PLAN_ID)!
  );
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
 * Como cada recurso é contado (mesma regra do backend):
 * - clientes: todos os clientes cadastrados
 * - orçamentos: orçamentos não arquivados
 * - obras: obras não arquivadas
 */
export function countForLimit(key: LimitKey, items: object[]) {
  if (key === "clientes") return items.length;
  return items.filter((item) => !(item as { arquivado?: boolean }).arquivado).length;
}
