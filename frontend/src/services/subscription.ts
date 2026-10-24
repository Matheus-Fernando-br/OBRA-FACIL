import { Linking } from "react-native";
import { DEFAULT_PLAN_ID, LimitKey, PLANS, PlanDefinition, PlanId, plansFromServer } from "@/config/plans";
import { cancelSubscription, getMySubscription, getPlans, startCheckout, syncSubscription } from "./api";

/* ==========================================================
   ASSINATURA (Mercado Pago, via backend)
   ----------------------------------------------------------
   - O plano efetivo vem sempre do servidor (GET /subscription/me).
   - O checkout só aparece se o servidor liberar para a plataforma
     (painel → Planos e cobrança). No Android começa desligado:
     a Google Play exige o faturamento dela para vender assinaturas
     dentro do app. A assinatura fica disponível na página web
     /assinar do backend.
   - O plano só muda quando o Mercado Pago confirma o pagamento
     (webhook validado no servidor). O app nunca altera o plano.
========================================================== */

export type SubscriptionStatus = "gratuito" | "cortesia" | "pendente" | "ativa" | "pausada" | "cancelada" | "expirada" | "suspeita";

export interface SubscriptionState {
  plans: PlanDefinition[];
  planId: PlanId;
  origem: "gratuito" | "assinatura" | "cortesia";
  status: SubscriptionStatus;
  renovaEm: string | null;
  acessoAte: string | null;
  inadimplente: boolean;
  pendente: boolean;
  uso: Partial<Record<LimitKey, number>>;
  checkoutEnabled: boolean;
}

export const EMPTY_SUBSCRIPTION: SubscriptionState = {
  plans: PLANS,
  planId: DEFAULT_PLAN_ID,
  origem: "gratuito",
  status: "gratuito",
  renovaEm: null,
  acessoAte: null,
  inadimplente: false,
  pendente: false,
  uso: {},
  checkoutEnabled: false,
};

const VALID_IDS = new Set<string>(PLANS.map((p) => p.id));

/** Planos (servidor ou reserva local) + situação da assinatura do usuário. */
export async function fetchSubscriptionState(token: string): Promise<SubscriptionState> {
  const [plansRes, meRes] = await Promise.allSettled([getPlans(), getMySubscription(token)]);
  const serverPlans = plansRes.status === "fulfilled" ? plansFromServer(plansRes.value?.plans) : null;
  const me = meRes.status === "fulfilled" ? meRes.value : null;
  const planId = VALID_IDS.has(me?.plano?.id) ? (me.plano.id as PlanId) : DEFAULT_PLAN_ID;

  return {
    plans: serverPlans ?? PLANS,
    planId,
    origem: me?.origem ?? "gratuito",
    status: me?.status ?? "gratuito",
    renovaEm: me?.renovaEm ?? null,
    acessoAte: me?.acessoAte ?? null,
    inadimplente: Boolean(me?.assinatura?.inadimplente),
    pendente: Boolean(me?.pendente),
    uso: me?.uso ?? {},
    checkoutEnabled: Boolean(me?.checkout?.enabled ?? (plansRes.status === "fulfilled" && plansRes.value?.checkout?.enabled)),
  };
}

/** Abre o pagamento do Mercado Pago no navegador. */
export async function openCheckout(planId: PlanId, token: string) {
  const { initPoint } = await startCheckout(planId, token);
  if (!initPoint) throw new Error("Não foi possível abrir o pagamento.");
  await Linking.openURL(initPoint);
}

export async function refreshFromProvider(token: string) {
  return syncSubscription(token);
}

export async function cancelCurrentSubscription(token: string) {
  return cancelSubscription(token);
}
