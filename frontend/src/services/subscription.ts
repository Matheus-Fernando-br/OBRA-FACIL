import { DEFAULT_PLAN_ID, PLANS, PlanId } from "@/config/plans";
import { getMySubscription } from "./api";

/* ==========================================================
   ASSINATURA — ponto único de integração com pagamento
   ----------------------------------------------------------
   Hoje: todo usuário fica no plano Gratuito, a menos que a API
   (GET /subscription/me) informe outro plano.

   TODO(pagamento) — quando a API de pagamento existir:
   1. Google Play exige o Google Play Billing para assinaturas
      digitais vendidas no app Android. Use react-native-iap ou
      RevenueCat (exigem build de desenvolvimento; não rodam no
      Expo Go). Os IDs de produto ficam em config/plans.ts
      (playProductId).
   2. Em requestPlanChange(): abrir a compra da loja, enviar o
      comprovante (purchaseToken) ao backend para validação e
      só então atualizar o plano.
   3. Ajustar parsePlanId() ao formato real de /subscription/me.
========================================================== */

export class PlanChangeUnavailableError extends Error {
  constructor() {
    super(
      "A assinatura pelo app estará disponível em breve. Fale com o suporte para mudar de plano.",
    );
    this.name = "PlanChangeUnavailableError";
  }
}

const VALID_IDS = new Set(PLANS.map((p) => p.id));

/** Aceita formatos comuns de resposta: { plano: { id } }, { planoId }, { plano: "basico" }. */
function parsePlanId(data: any): PlanId | null {
  const raw =
    data?.plano?.id ?? data?.plano?.nome ?? data?.planoId ?? data?.plano ?? data?.plan;
  if (typeof raw !== "string") return null;
  const id = raw
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") as PlanId;
  return VALID_IDS.has(id) ? id : null;
}

/** Plano atual do usuário (Gratuito se a API não responder ou não informar). */
export async function fetchCurrentPlanId(token: string): Promise<PlanId> {
  try {
    const data = await getMySubscription(token);
    return parsePlanId(data) ?? DEFAULT_PLAN_ID;
  } catch {
    return DEFAULT_PLAN_ID;
  }
}

/**
 * Troca de plano. TODO(pagamento): implementar a compra (ver topo).
 * Enquanto isso, informa que a assinatura está em breve.
 */
export async function requestPlanChange(_planId: PlanId, _token: string): Promise<void> {
  throw new PlanChangeUnavailableError();
}
