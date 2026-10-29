import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";

/**
 * Anúncios só para quem está no plano Gratuito (logado e com o plano já
 * confirmado pelo servidor — assim quem assina nunca vê um anúncio piscar).
 */
export function useShowAds() {
  const { token } = useAuth();
  const { ready, planId } = useSubscription();
  return Boolean(token && ready && planId === "gratuito");
}
