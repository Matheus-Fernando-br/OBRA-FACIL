import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { getPlan, PlanDefinition, PlanId } from "@/config/plans";
import { EMPTY_SUBSCRIPTION, fetchSubscriptionState, SubscriptionState } from "@/services/subscription";

interface SubscriptionContextData extends SubscriptionState {
  plan: PlanDefinition;
  loading: boolean;
  /** O plano do usuário logado já foi confirmado pelo servidor. */
  ready: boolean;
  refresh(): Promise<void>;
}

const SubscriptionContext = createContext({} as SubscriptionContextData);

/** Plano atual do usuário logado (recarregado a cada login e ao abrir Planos). */
export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [state, setState] = useState<SubscriptionState>(EMPTY_SUBSCRIPTION);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    if (!token) {
      setState(EMPTY_SUBSCRIPTION);
      setReady(false);
      return;
    }
    setLoading(true);
    try {
      const next = await fetchSubscriptionState(token);
      setState(next);
      setReady(next.confirmado);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const plan = getPlan(state.planId as PlanId, state.plans);

  return (
    <SubscriptionContext.Provider value={{ ...state, plan, loading, ready, refresh }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  return useContext(SubscriptionContext);
}
