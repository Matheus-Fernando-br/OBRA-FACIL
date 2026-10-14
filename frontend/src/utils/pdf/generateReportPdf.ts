import type { Cliente, Obra, Orcamento } from "@/components/layout/interface";
import {
  BUDGET_STATUS_LABEL,
  WORK_STATUS_LABEL,
  getClientName,
  isWorkFinished,
} from "@/utils/status";
import {
  DEFAULT_PDF_OPTIONS,
  PdfIssuer,
  PdfOptions,
  date,
  esc,
  formatDocument,
  formatPhone,
  money,
  pill,
  renderDocument,
} from "./template";
import { buildCsv, createPdf, GeneratedPdf } from "./output";

/* ==========================================================
   RELATÓRIOS GERAIS E EXPORTAÇÕES (tela Relatórios)
========================================================== */

export interface ReportData {
  clients: Cliente[];
  budgets: Orcamento[];
  works: Obra[];
}

export type ReportKind = "geral" | "clientes" | "orcamentos" | "obras";

function indexClients(clients: Cliente[]) {
  return clients.reduce<Record<string, Cliente>>((acc, c) => {
    acc[c._id] = c;
    return acc;
  }, {});
}

function indexBudgets(budgets: Orcamento[]) {
  return budgets.reduce<Record<string, Orcamento>>((acc, b) => {
    acc[b._id] = b;
    return acc;
  }, {});
}

function workBudget(work: Obra, byId: Record<string, Orcamento>) {
  return typeof work.orcamento === "object" ? work.orcamento : byId[work.orcamento];
}

function clientsTable(data: ReportData) {
  const counts: Record<string, number> = {};
  data.budgets.forEach((b) => {
    const id = typeof b.cliente === "object" ? b.cliente?._id : b.cliente;
    if (id) counts[id] = (counts[id] || 0) + 1;
  });

  if (!data.clients.length) return `<p class="empty">Nenhum cliente cadastrado.</p>`;

  return `<table>
    <thead><tr><th>Cliente</th><th>Documento</th><th>Contato</th><th class="num">Orçamentos</th></tr></thead>
    <tbody>${data.clients
      .slice()
      .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"))
      .map(
        (c) => `<tr>
          <td><strong>${esc(c.nome)}</strong></td>
          <td>${esc(formatDocument(c) || "—")}</td>
          <td>${esc(formatPhone(c.telefone))}<div class="desc">${esc(c.email)}</div></td>
          <td class="num">${counts[c._id] ?? 0}</td>
        </tr>`,
      )
      .join("")}</tbody></table>`;
}

function budgetsTable(data: ReportData, options: PdfOptions) {
  if (!data.budgets.length) return `<p class="empty">Nenhum orçamento cadastrado.</p>`;
  const byClient = indexClients(data.clients);

  return `<table>
    <thead><tr><th>Orçamento</th><th>Cliente</th><th>Emissão</th><th>Status</th>${
      options.showValues ? `<th class="num">Valor</th>` : ""
    }</tr></thead>
    <tbody>${data.budgets
      .slice()
      .sort(
        (a, b) =>
          new Date(b.data_publicacao).getTime() - new Date(a.data_publicacao).getTime(),
      )
      .map((b) => {
        const key = (b.status || "PENDENTE").toUpperCase();
        return `<tr>
          <td><strong>${esc(b.nome)}</strong>${b.arquivado ? `<div class="desc">Arquivado</div>` : ""}</td>
          <td>${esc(getClientName(b.cliente, byClient))}</td>
          <td>${date(b.data_publicacao)}</td>
          <td>${pill(BUDGET_STATUS_LABEL[key] ?? key, key)}</td>
          ${options.showValues ? `<td class="num">${money(b.preco_com_bdi)}</td>` : ""}
        </tr>`;
      })
      .join("")}</tbody></table>`;
}

function worksTable(data: ReportData) {
  if (!data.works.length) return `<p class="empty">Nenhuma obra cadastrada.</p>`;
  const byClient = indexClients(data.clients);
  const byBudget = indexBudgets(data.budgets);

  return `<table>
    <thead><tr><th>Obra</th><th>Cliente</th><th>Término previsto</th><th>Status</th><th class="num">Conclusão</th></tr></thead>
    <tbody>${data.works
      .map((w) => {
        const b = workBudget(w, byBudget);
        const key = (w.status || "NOPRAZO").toUpperCase();
        return `<tr>
          <td><strong>${esc(b?.nome ?? "Obra")}</strong>${w.arquivado ? `<div class="desc">Arquivada</div>` : ""}</td>
          <td>${esc(b ? getClientName(b.cliente, byClient) : "—")}</td>
          <td>${date(w.data_fim_prevista)}</td>
          <td>${pill(WORK_STATUS_LABEL[key] ?? key, key)}</td>
          <td class="num">${Math.round(w.porcentagem_de_conclusao ?? 0)}%</td>
        </tr>`;
      })
      .join("")}</tbody></table>`;
}

function summary(data: ReportData, options: PdfOptions) {
  const approved = data.budgets.filter((b) => b.status === "APROVADO");
  const pending = data.budgets.filter((b) => b.status === "PENDENTE");
  const rejected = data.budgets.filter((b) => b.status === "RECUSADO");
  const decided = approved.length + rejected.length;
  const active = data.works.filter((w) => !w.arquivado && !isWorkFinished(w));
  const late = active.filter((w) => w.status === "ATRASADO");
  const approvedValue = approved.reduce((s, b) => s + (b.preco_com_bdi ?? 0), 0);

  return `<div class="kpis">
      <div class="kpi"><div class="label">Clientes</div><div class="v">${data.clients.length}</div></div>
      <div class="kpi"><div class="label">Orçamentos</div><div class="v">${data.budgets.length}</div>
        <div class="muted">${approved.length} aprovados · ${pending.length} pendentes · ${rejected.length} recusados</div></div>
      <div class="kpi"><div class="label">Obras em andamento</div><div class="v">${active.length}</div>
        <div class="muted">${late.length} atrasada${late.length === 1 ? "" : "s"}</div></div>
    </div>
    <div class="kpis">
      ${
        options.showValues
          ? `<div class="kpi"><div class="label">Receita aprovada</div><div class="v">${money(approvedValue)}</div></div>`
          : ""
      }
      <div class="kpi"><div class="label">Taxa de aprovação</div><div class="v">${
        decided ? `${Math.round((approved.length / decided) * 100)}%` : "—"
      }</div><div class="muted">entre orçamentos decididos</div></div>
    </div>`;
}

const TITLES: Record<ReportKind, string> = {
  geral: "Relatório geral",
  clientes: "Relatório de clientes",
  orcamentos: "Relatório de orçamentos",
  obras: "Relatório de obras",
};

export function buildReportHtml(
  kind: ReportKind,
  data: ReportData,
  issuer?: PdfIssuer,
  options: PdfOptions = DEFAULT_PDF_OPTIONS,
) {
  let body = "";

  if (kind === "geral") {
    body = `${summary(data, options)}
      <h2>Obras</h2>${worksTable(data)}
      <h2>Orçamentos</h2>${budgetsTable(data, options)}
      <h2>Clientes</h2>${clientsTable(data)}`;
  } else if (kind === "clientes") {
    body = clientsTable(data);
  } else if (kind === "orcamentos") {
    body = budgetsTable(data, options);
  } else {
    body = worksTable(data);
  }

  return renderDocument({
    title: TITLES[kind],
    subtitle: `Posição em ${new Date().toLocaleDateString("pt-BR")}`,
    issuer,
    options,
    body,
  });
}

export async function generateReportPdf(
  kind: ReportKind,
  data: ReportData,
  issuer?: PdfIssuer,
  options?: PdfOptions,
): Promise<GeneratedPdf> {
  return createPdf(buildReportHtml(kind, data, issuer, options), TITLES[kind]);
}

/** Planilha CSV equivalente ao relatório (abre no Excel). */
export function buildReportCsv(kind: ReportKind, data: ReportData, options: PdfOptions) {
  const byClient = indexClients(data.clients);
  const byBudget = indexBudgets(data.budgets);
  const brl = (v?: number) => Number(v || 0).toFixed(2).replace(".", ",");

  if (kind === "clientes") {
    return buildCsv(
      ["Nome", "Tipo", "CPF/CNPJ", "E-mail", "Telefone"],
      data.clients.map((c) => [c.nome, c.tipo ?? "", c.CPF || c.CNPJ || "", c.email, c.telefone]),
    );
  }

  if (kind === "obras") {
    return buildCsv(
      ["Obra", "Cliente", "Status", "Conclusão (%)", "Início previsto", "Término previsto", "Arquivada"],
      data.works.map((w) => {
        const b = workBudget(w, byBudget);
        return [
          b?.nome ?? "Obra",
          b ? getClientName(b.cliente, byClient) : "",
          WORK_STATUS_LABEL[w.status] ?? w.status,
          Math.round(w.porcentagem_de_conclusao ?? 0),
          date(w.data_inicio_prevista),
          date(w.data_fim_prevista),
          w.arquivado ? "Sim" : "Não",
        ];
      }),
    );
  }

  // orçamentos (também usado no relatório geral)
  const headers = ["Orçamento", "Cliente", "Status", "Emissão", "Validade (dias)", "Cidade/UF"];
  if (options.showValues) headers.push("Custo direto (R$)", "BDI (%)", "Total (R$)");

  return buildCsv(
    headers,
    data.budgets.map((b) => {
      const row: (string | number)[] = [
        b.nome,
        getClientName(b.cliente, byClient),
        BUDGET_STATUS_LABEL[b.status] ?? b.status,
        date(b.data_publicacao),
        b.valido_durante ?? "",
        [b.endereco?.cidade, b.endereco?.estado].filter(Boolean).join("/"),
      ];
      if (options.showValues) row.push(brl(b.preco), String(b.bdi ?? ""), brl(b.preco_com_bdi));
      return row;
    }),
  );
}
