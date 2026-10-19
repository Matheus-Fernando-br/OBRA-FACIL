import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { DEFAULT_PLAN_ID, getPlan, PlanDefinition, PlanId } from "@/config/plans";
import { fetchCurrentPlanId } from "@/services/subscription";

interface SubscriptionContextData {
  planId: PlanId;
  plan: PlanDefinition;
  loading: boolean;
  refresh(): Promise<void>;
}

const SubscriptionContext = createContext({} as SubscriptionContextData);

/** Plano atual do usuário logado (recarregado a cada login). */
export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [planId, setPlanId] = useState<PlanId>(DEFAULT_PLAN_ID);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!token) {
      setPlanId(DEFAULT_PLAN_ID);
      return;
    }
    setLoading(true);
    try {
      setPlanId(await fetchCurrentPlanId(token));
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <SubscriptionContext.Provider value={{ planId, plan: getPlan(planId), loading, refresh }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  return useContext(SubscriptionContext);
}
