import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Notification } from "@/data/notifications";
import type { Obra, Orcamento } from "@/components/layout/interface";
import { getBudgets, getWork } from "@/services/api";
import { getBudgetDaysLeft, isWorkFinished } from "./status";
import { formatDate, toDate } from "./format";

/* ==========================================================
   ALERTAS REAIS (painel de notificações)
   Gerados a partir dos orçamentos e obras do usuário — substituem
   os dados fictícios que eram exibidos antes.
========================================================== */

export interface AlertPreferences {
  orcamentos: boolean;
  obras: boolean;
}

export const DEFAULT_ALERT_PREFS: AlertPreferences = { orcamentos: true, obras: true };

const PREFS_KEY = "@obra_facil_alert_prefs";
const STATE_KEY = "@obra_facil_alert_state";

interface AlertState {
  read: string[];
  dismissed: string[];
}

export async function loadAlertPrefs(): Promise<AlertPreferences> {
  try {
    const raw = await AsyncStorage.getItem(PREFS_KEY);
    return raw ? { ...DEFAULT_ALERT_PREFS, ...JSON.parse(raw) } : DEFAULT_ALERT_PREFS;
  } catch {
    return DEFAULT_ALERT_PREFS;
  }
}

export async function saveAlertPrefs(prefs: AlertPreferences) {
  await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(prefs)).catch(() => {});
}

async function loadState(): Promise<AlertState> {
  try {
    const raw = await AsyncStorage.getItem(STATE_KEY);
    return raw ? JSON.parse(raw) : { read: [], dismissed: [] };
  } catch {
    return { read: [], dismissed: [] };
  }
}

function workName(work: Obra, budgets: Record<string, Orcamento>) {
  const budget = typeof work.orcamento === "object" ? work.orcamento : budgets[work.orcamento];
  return budget?.nome ?? "Obra";
}

export function buildAlerts(
  budgets: Orcamento[],
  works: Obra[],
  prefs: AlertPreferences = DEFAULT_ALERT_PREFS,
): Omit<Notification, "read">[] {
  const alerts: Omit<Notification, "read">[] = [];
  const byId = budgets.reduce<Record<string, Orcamento>>((acc, b) => {
    acc[b._id] = b;
    return acc;
  }, {});

  if (prefs.orcamentos) {
    budgets
      .filter((b) => b.status === "PENDENTE" && !b.arquivado)
      .forEach((b) => {
        const days = getBudgetDaysLeft(b);
        if (days === null) return;
        if (days < 0) {
          alerts.push({
            id: `orc-vencido-${b._id}`,
            title: "Orçamento vencido",
            description: `${b.nome}: a validade terminou. Renove a proposta ou registre a decisão do cliente.`,
            date: "Hoje",
            hour: `há ${Math.abs(days)} dia${Math.abs(days) === 1 ? "" : "s"}`,
            route: "/orcamentos",
          });
        } else if (days <= 3) {
          alerts.push({
            id: `orc-vence-${b._id}-${days}`,
            title: days === 0 ? "Orçamento vence hoje" : `Orçamento vence em ${days} dia${days === 1 ? "" : "s"}`,
            description: `${b.nome}: faça o acompanhamento com o cliente.`,
            date: "Hoje",
            hour: "",
            route: "/orcamentos",
          });
        }
      });
  }

  if (prefs.obras) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    works
      .filter((w) => !w.arquivado && !isWorkFinished(w))
      .forEach((w) => {
        const name = workName(w, byId);
        if (w.status === "ATRASADO") {
          alerts.push({
            id: `obra-atrasada-${w._id}`,
            title: "Obra atrasada",
            description: `${name}: ${Math.round(w.porcentagem_de_conclusao ?? 0)}% concluída, término previsto em ${formatDate(w.data_fim_prevista)}.`,
            date: "Hoje",
            hour: "",
            route: "/obras",
          });
          return;
        }

        const end = toDate(w.data_fim_prevista);
        if (!end) return;
        end.setHours(0, 0, 0, 0);
        const days = Math.round((end.getTime() - today.getTime()) / 86_400_000);
        if (days >= 0 && days <= 7) {
          alerts.push({
            id: `obra-entrega-${w._id}`,
            title: "Entrega próxima",
            description: `${name}: término previsto em ${formatDate(w.data_fim_prevista)} (${Math.round(w.porcentagem_de_conclusao ?? 0)}% concluída).`,
            date: "Hoje",
            hour: days === 0 ? "hoje" : `em ${days} dia${days === 1 ? "" : "s"}`,
            route: "/obras",
          });
        }
      });
  }

  return alerts;
}

/** Carrega os alertas quando o painel é aberto e guarda lidas/removidas. */
export function useAlerts(token: string | null, active: boolean) {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState<AlertState>({ read: [], dismissed: [] });

  const persist = useCallback((next: AlertState) => {
    setState(next);
    AsyncStorage.setItem(STATE_KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!active || !token) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const [prefs, saved, budgets, works] = await Promise.all([
          loadAlertPrefs(),
          loadState(),
          getBudgets(token),
          getWork(token),
        ]);
        if (cancelled) return;

        const alerts = buildAlerts(
          Array.isArray(budgets) ? budgets : [],
          Array.isArray(works) ? works : (works?.obras ?? []),
          prefs,
        );
        const ids = new Set(alerts.map((a) => a.id));
        // Mantém só o estado de alertas que ainda existem.
        const pruned = {
          read: saved.read.filter((id) => ids.has(id)),
          dismissed: saved.dismissed.filter((id) => ids.has(id)),
        };
        setState(pruned);
        setItems(
          alerts
            .filter((a) => !pruned.dismissed.includes(a.id))
            .map((a) => ({ ...a, read: pruned.read.includes(a.id) })),
        );
      } catch (error) {
        console.log("ERRO AO CARREGAR ALERTAS:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [active, token]);

  const markRead = useCallback(
    (ids: string[]) => {
      setItems((old) => old.map((n) => (ids.includes(n.id) ? { ...n, read: true } : n)));
      persist({ ...state, read: Array.from(new Set([...state.read, ...ids])) });
    },
    [state, persist],
  );

  const dismiss = useCallback(
    (ids: string[]) => {
      setItems((old) => old.filter((n) => !ids.includes(n.id)));
      persist({ ...state, dismissed: Array.from(new Set([...state.dismissed, ...ids])) });
    },
    [state, persist],
  );

  return { items, loading, markRead, dismiss };
}
