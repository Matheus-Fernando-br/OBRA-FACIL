import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { getPlan, PlanDefinition, PlanId } from "@/config/plans";
import { EMPTY_SUBSCRIPTION, fetchSubscriptionState, SubscriptionState } from "@/services/subscription";

interface SubscriptionContextData extends SubscriptionState {
  plan: PlanDefinition;
  loading: boolean;
  refresh(): Promise<void>;
}

const SubscriptionContext = createContext({} as SubscriptionContextData);

/** Plano atual do usuário logado (recarregado a cada login e ao abrir Planos). */
export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [state, setState] = useState<SubscriptionState>(EMPTY_SUBSCRIPTION);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!token) {
      setState(EMPTY_SUBSCRIPTION);
      return;
    }
    setLoading(true);
    try {
      setState(await fetchSubscriptionState(token));
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const plan = getPlan(state.planId as PlanId, state.plans);

  return (
    <SubscriptionContext.Provider value={{ ...state, plan, loading, refresh }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  return useContext(SubscriptionContext);
}
