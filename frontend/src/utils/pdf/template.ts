/* ==========================================================
   TEMPLATE DOS DOCUMENTOS PDF
   HTML/CSS compartilhado por orçamento, relatório de obra e
   relatórios gerais. Todo texto vindo do usuário passa por esc().
========================================================== */

export interface PdfIssuer {
  nome?: string;
  email?: string;
  CPF?: string;
  CNPJ?: string;
}

export interface PdfOptions {
  /** Exibe a marca Obra Fácil no cabeçalho. */
  showLogo: boolean;
  /** Inclui linhas de assinatura no final. */
  signature: boolean;
  /** Exibe valores monetários (relatórios gerais). */
  showValues: boolean;
}

export const DEFAULT_PDF_OPTIONS: PdfOptions = {
  showLogo: true,
  signature: true,
  showValues: true,
};

const ACCENT = "#C2570C";

export function esc(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function money(value?: number | null) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function date(value?: Date | string | null) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("pt-BR");
}

export function num(value?: number | null) {
  return Number(value || 0).toLocaleString("pt-BR", { maximumFractionDigits: 3 });
}

export function formatDocument(issuer?: PdfIssuer) {
  const cpf = issuer?.CPF?.replace(/\D/g, "");
  const cnpj = issuer?.CNPJ?.replace(/\D/g, "");
  if (cnpj && cnpj.length === 14) {
    return `CNPJ ${cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5")}`;
  }
  if (cpf && cpf.length === 11) {
    return `CPF ${cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4")}`;
  }
  return "";
}

export function formatPhone(value?: string) {
  const n = (value || "").replace(/\D/g, "");
  if (n.length === 11) return n.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
  if (n.length === 10) return n.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
  return value || "";
}

const CSS = `
  @page { size: A4; margin: 18mm 16mm 18mm 16mm; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: -apple-system, "SF Pro Text", "Helvetica Neue", Roboto, Arial, sans-serif;
    font-size: 11px;
    line-height: 1.45;
    color: #1C1C1E;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .doc-header { display: flex; justify-content: space-between; align-items: flex-start;
    padding-bottom: 14px; border-bottom: 2px solid ${ACCENT}; margin-bottom: 18px; }
  .brand { font-size: 18px; font-weight: 800; letter-spacing: -0.3px; }
  .brand span { color: ${ACCENT}; }
  .issuer { font-size: 10px; color: #6C6C70; margin-top: 4px; }
  .doc-title { text-align: right; }
  .doc-title h1 { margin: 0; font-size: 17px; letter-spacing: -0.2px; }
  .doc-title .sub { color: #6C6C70; font-size: 10px; margin-top: 3px; }
  .pill { display: inline-block; padding: 2px 9px; border-radius: 999px; font-size: 10px;
    font-weight: 700; margin-top: 6px; }
  .grid { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 16px; }
  .box { flex: 1 1 45%; border: 1px solid #E5E5EA; border-radius: 10px; padding: 10px 12px; }
  .label { text-transform: uppercase; letter-spacing: 0.6px; font-size: 8.5px; font-weight: 700;
    color: #8E8E93; margin-bottom: 3px; }
  .value { font-size: 11.5px; font-weight: 600; }
  .muted { color: #6C6C70; font-weight: 400; }
  h2 { font-size: 12.5px; margin: 18px 0 6px; padding-left: 8px; border-left: 3px solid ${ACCENT}; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 6px; page-break-inside: auto; }
  tr { page-break-inside: avoid; }
  th { text-align: left; font-size: 8.5px; text-transform: uppercase; letter-spacing: 0.5px;
    color: #6C6C70; background: #F2F2F7; padding: 6px 8px; border-bottom: 1px solid #E5E5EA; }
  td { padding: 6px 8px; border-bottom: 1px solid #F0F0F3; vertical-align: top; }
  td.num, th.num { text-align: right; white-space: nowrap; font-variant-numeric: tabular-nums; }
  .desc { color: #6C6C70; font-size: 9.5px; }
  .subtotal { text-align: right; font-size: 10.5px; color: #3A3A3C; margin-bottom: 4px; }
  .totals { margin-top: 18px; margin-left: auto; width: 55%; border: 1px solid #E5E5EA;
    border-radius: 10px; overflow: hidden; page-break-inside: avoid; }
  .totals .row { display: flex; justify-content: space-between; padding: 8px 12px;
    border-bottom: 1px solid #F0F0F3; }
  .totals .grand { background: ${ACCENT}; color: #FFFFFF; font-size: 13.5px; font-weight: 800;
    border-bottom: none; }
  .bar { height: 7px; background: #EEEEF3; border-radius: 999px; overflow: hidden; }
  .bar > div { height: 100%; border-radius: 999px; }
  .kpis { display: flex; gap: 10px; margin-bottom: 14px; }
  .kpi { flex: 1; border: 1px solid #E5E5EA; border-radius: 10px; padding: 10px 12px; }
  .kpi .v { font-size: 16px; font-weight: 800; font-variant-numeric: tabular-nums; }
  .notes { margin-top: 16px; font-size: 9.5px; color: #6C6C70; page-break-inside: avoid; }
  .signatures { display: flex; gap: 40px; margin-top: 54px; page-break-inside: avoid; }
  .signatures div { flex: 1; border-top: 1px solid #3A3A3C; padding-top: 6px; text-align: center;
    font-size: 10px; }
  .footer { margin-top: 26px; padding-top: 8px; border-top: 1px solid #E5E5EA; color: #8E8E93;
    font-size: 8.5px; display: flex; justify-content: space-between; }
  .empty { color: #8E8E93; font-style: italic; padding: 8px 0; }
`;

export const STATUS_COLORS: Record<string, string> = {
  APROVADO: "#13876F",
  PENDENTE: "#C98208",
  RECUSADO: "#D43C5C",
  CANCELADO: "#6C6C70",
  NOPRAZO: "#0A72D6",
  ADIANTADO: "#13876F",
  ATRASADO: "#D43C5C",
  ENTREGUE: "#13876F",
};

export function pill(label: string, key: string) {
  const color = STATUS_COLORS[key] ?? "#6C6C70";
  return `<span class="pill" style="background:${color}1F;color:${color}">${esc(label)}</span>`;
}

interface ShellArgs {
  title: string;
  subtitle?: string;
  badge?: string;
  issuer?: PdfIssuer;
  options: PdfOptions;
  body: string;
  signatures?: [string, string];
}

/** Monta o documento completo: cabeçalho, corpo, assinaturas e rodapé. */
export function renderDocument({
  title,
  subtitle,
  badge,
  issuer,
  options,
  body,
  signatures,
}: ShellArgs) {
  const issuerDoc = formatDocument(issuer);
  const issuerLine = [issuer?.nome, issuerDoc, issuer?.email].filter(Boolean).map(esc).join(" · ");
  const now = new Date();
  const stamp = `${now.toLocaleDateString("pt-BR")} às ${now.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(title)}</title>
<style>${CSS}</style>
</head>
<body>
  <div class="doc-header">
    <div>
      ${options.showLogo ? `<div class="brand">Obra <span>Fácil</span></div>` : ""}
      ${issuerLine ? `<div class="issuer">${issuerLine}</div>` : ""}
    </div>
    <div class="doc-title">
      <h1>${esc(title)}</h1>
      ${subtitle ? `<div class="sub">${esc(subtitle)}</div>` : ""}
      ${badge ?? ""}
    </div>
  </div>

  ${body}

  ${
    options.signature && signatures
      ? `<div class="signatures"><div>${esc(signatures[0])}</div><div>${esc(signatures[1])}</div></div>`
      : ""
  }

  <div class="footer">
    <span>Documento gerado pelo Obra Fácil em ${stamp}</span>
    <span>${issuer?.nome ? esc(issuer.nome) : ""}</span>
  </div>
</body>
</html>`;
}
