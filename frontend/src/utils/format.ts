/* ==========================================================
   FORMATAÇÃO COMPARTILHADA (moeda, datas, nomes)
========================================================== */

export function formatCurrency(value?: number | null, digits = 2) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

/** R$ 1,2 mil · R$ 3,4 mi — para indicadores compactos. */
export function formatCompactCurrency(value?: number | null) {
  const n = Number(value || 0);
  const abs = Math.abs(n);

  if (abs >= 1_000_000) {
    return `R$ ${(n / 1_000_000).toLocaleString("pt-BR", {
      maximumFractionDigits: 1,
    })} mi`;
  }

  if (abs >= 10_000) {
    return `R$ ${(n / 1_000).toLocaleString("pt-BR", {
      maximumFractionDigits: 1,
    })} mil`;
  }

  return formatCurrency(n, 0);
}

export function toDate(value?: Date | string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(value?: Date | string | null, fallback = "—") {
  const date = toDate(value);
  return date ? date.toLocaleDateString("pt-BR") : fallback;
}

export function formatLongToday() {
  const text = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function getInitials(name?: string) {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function firstName(name?: string) {
  return (name || "").trim().split(/\s+/)[0] || "";
}

/** Converte texto digitado ("2,5") em número (ou 0). */
export function parseDecimal(text: string) {
  const normalized = sanitizeDecimalInput(text).replace(",", ".");
  const n = Number(normalized);
  return Number.isFinite(n) ? n : 0;
}

/** Mantém só dígitos e uma vírgula decimal enquanto o usuário digita. */
export function sanitizeDecimalInput(text: string) {
  const cleaned = text.replace(/[^\d,.]/g, "").replace(/\./g, ",");
  const [int, ...rest] = cleaned.split(",");
  return rest.length ? `${int},${rest.join("").slice(0, 3)}` : int;
}

export function formatDecimalInput(value?: number | null) {
  const n = Number(value || 0);
  if (!n) return "";
  return String(n).replace(".", ",");
}
