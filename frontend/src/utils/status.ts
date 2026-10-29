import { Ionicons } from "@expo/vector-icons";
import type { ThemeColors } from "@/styles/globalStyles";
import type { Obra, Orcamento } from "@/components/layout/interface";
import { toDate } from "./format";

/* ==========================================================
   STATUS — rótulos, cores e ícones em um único lugar.
   Cor nunca aparece sozinha: sempre acompanha rótulo e ícone.
========================================================== */

type IconName = keyof typeof Ionicons.glyphMap;

export interface StatusMeta {
  label: string;
  color: string;
  icon: IconName;
}

export function getBudgetStatusMeta(
  status: string | undefined,
  theme: ThemeColors,
): StatusMeta {
  switch ((status || "").toUpperCase()) {
    case "APROVADO":
      return { label: "Aprovado", color: theme.success, icon: "checkmark-circle" };
    case "RECUSADO":
      return { label: "Recusado", color: theme.danger, icon: "close-circle" };
    case "CANCELADO":
      return { label: "Cancelado", color: theme.textSecondary, icon: "remove-circle" };
    default:
      return { label: "Pendente", color: theme.warning, icon: "time" };
  }
}

export function getWorkStatusMeta(
  status: string | undefined,
  theme: ThemeColors,
): StatusMeta {
  switch ((status || "").toUpperCase()) {
    case "ADIANTADO":
      return { label: "Adiantada", color: theme.success, icon: "trending-up" };
    case "ATRASADO":
      return { label: "Atrasada", color: theme.danger, icon: "alert-circle" };
    case "ENTREGUE":
      return { label: "Entregue", color: theme.success, icon: "flag" };
    case "CANCELADO":
      return { label: "Cancelada", color: theme.textSecondary, icon: "remove-circle" };
    default:
      return { label: "No prazo", color: theme.info, icon: "time" };
  }
}

/** Texto do status para documentos (sem depender do tema). */
export const BUDGET_STATUS_LABEL: Record<string, string> = {
  PENDENTE: "Pendente",
  APROVADO: "Aprovado",
  RECUSADO: "Recusado",
  CANCELADO: "Cancelado",
};

export const WORK_STATUS_LABEL: Record<string, string> = {
  NOPRAZO: "No prazo",
  ATRASADO: "Atrasada",
  ADIANTADO: "Adiantada",
  ENTREGUE: "Entregue",
  CANCELADO: "Cancelada",
};

export function getBudgetValidUntil(budget: Orcamento) {
  const explicit = toDate(budget.data_validade);
  if (explicit) return explicit;

  const published = toDate(budget.data_publicacao);
  if (!published || !budget.valido_durante) return null;

  const end = new Date(published);
  // Mesma regra do formulário e do servidor: emissão + N dias.
  end.setDate(end.getDate() + budget.valido_durante);
  return end;
}

/** Dias até o vencimento (negativo = vencido). Null se sem validade. */
export function getBudgetDaysLeft(budget: Orcamento) {
  const end = getBudgetValidUntil(budget);
  if (!end) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const last = new Date(end);
  last.setHours(0, 0, 0, 0);

  return Math.round((last.getTime() - today.getTime()) / 86_400_000);
}

export function isBudgetExpired(budget: Orcamento) {
  const days = getBudgetDaysLeft(budget);
  return budget.status === "PENDENTE" && days !== null && days < 0;
}

/** Obra concluída: todos os serviços finalizados ou status terminal. */
export function isWorkFinished(work: Obra) {
  const status = (work.status || "").toUpperCase();
  return (
    status === "ENTREGUE" ||
    status === "CANCELADO" ||
    (work.porcentagem_de_conclusao ?? 0) >= 100
  );
}

export function getClientName(
  cliente: Orcamento["cliente"] | undefined,
  clientsById?: Record<string, { nome: string }>,
) {
  if (!cliente) return "Cliente não informado";
  if (typeof cliente === "object") return cliente.nome || "Cliente sem nome";
  return clientsById?.[cliente]?.nome ?? "Cliente não encontrado";
}
