import type { Cliente, Obra, Orcamento } from "@/components/layout/interface";
import { WORK_STATUS_LABEL } from "@/utils/status";
import {
  DEFAULT_PDF_OPTIONS,
  PdfIssuer,
  PdfOptions,
  STATUS_COLORS,
  date,
  esc,
  money,
  num,
  pill,
  renderDocument,
} from "./template";
import { createPdf, GeneratedPdf } from "./output";

interface WorkPdfArgs {
  work: Obra;
  budget?: Orcamento | null;
  client?: Cliente | null;
  issuer?: PdfIssuer;
  options?: PdfOptions;
}

function progressBar(value: number, color: string) {
  const pct = Math.min(100, Math.max(0, Math.round(value || 0)));
  return `<div class="bar"><div style="width:${pct}%;background:${color}"></div></div>`;
}

/** Relatório de acompanhamento da obra (andamento por etapa e serviço). */
export function buildWorkHtml({
  work,
  budget,
  client,
  issuer,
  options = DEFAULT_PDF_OPTIONS,
}: WorkPdfArgs) {
  const statusKey = (work.status || "NOPRAZO").toUpperCase();
  const statusColor = STATUS_COLORS[statusKey] ?? "#6C6C70";
  const progress = work.porcentagem_de_conclusao ?? 0;
  const endereco = budget?.endereco;
  const categorias = Array.isArray(work.categoria) ? work.categoria : [];

  const servicosTotal = categorias.reduce((n, c) => n + (c.servicos?.length ?? 0), 0);
  const servicosConcluidos = categorias.reduce(
    (n, c) => n + (c.servicos ?? []).filter((s) => s.concluido).length,
    0,
  );

  const stagesHtml = categorias.length
    ? categorias
        .map((cat, index) => {
          const pct = cat.porcentagem_de_conclusao ?? 0;
          return `
      <h2>${index + 1}. ${esc(cat.nome)} <span class="muted" style="font-weight:400">— ${Math.round(
        pct,
      )}% concluída</span></h2>
      ${progressBar(pct, pct >= 100 ? STATUS_COLORS.ENTREGUE : "#C2570C")}
      <table style="margin-top:8px">
        <thead>
          <tr>
            <th>Serviço</th>
            <th class="num" style="width:15%">Dias previstos</th>
            <th class="num" style="width:15%">Dias reais</th>
            <th style="width:16%">Situação</th>
          </tr>
        </thead>
        <tbody>
          ${(cat.servicos ?? [])
            .map((s) => {
              const late = s.concluido && (s.qt_dias_real ?? 0) > (s.qt_dias_prevista ?? 0);
              const situacao = s.concluido
                ? late
                  ? `<span style="color:${STATUS_COLORS.ATRASADO};font-weight:700">Concluído com atraso</span>`
                  : `<span style="color:${STATUS_COLORS.ENTREGUE};font-weight:700">Concluído</span>`
                : `<span class="muted">Em execução</span>`;
              return `
            <tr>
              <td>${esc(s.nome)}${s.descricao ? `<div class="desc">${esc(s.descricao)}</div>` : ""}</td>
              <td class="num">${num(s.qt_dias_prevista)}</td>
              <td class="num">${num(s.qt_dias_real)}</td>
              <td>${situacao}</td>
            </tr>`;
            })
            .join("")}
        </tbody>
      </table>`;
        })
        .join("")
    : `<p class="empty">Nenhuma etapa cadastrada.</p>`;

  const body = `
    <div class="kpis">
      <div class="kpi"><div class="label">Conclusão</div><div class="v">${Math.round(
        progress,
      )}%</div>${progressBar(progress, statusColor)}</div>
      <div class="kpi"><div class="label">Serviços concluídos</div><div class="v">${servicosConcluidos}/${servicosTotal}</div></div>
      <div class="kpi"><div class="label">Prazo (dias)</div><div class="v">${num(
        work.qt_dias_real,
      )} <span class="muted" style="font-size:11px">de ${num(work.qt_dias_prevista)} previstos</span></div></div>
    </div>

    <div class="grid">
      <div class="box">
        <div class="label">Cliente</div>
        <div class="value">${esc(client?.nome || "Não informado")}</div>
      </div>
      <div class="box">
        <div class="label">Local</div>
        <div class="value">${esc(
          [endereco?.rua, endereco?.numero].filter(Boolean).join(", ") || "Não informado",
        )}</div>
        <div class="muted">${esc(
          [endereco?.bairro, [endereco?.cidade, endereco?.estado].filter(Boolean).join("/")]
            .filter(Boolean)
            .join(" · "),
        )}</div>
      </div>
      <div class="box">
        <div class="label">Início previsto / real</div>
        <div class="value">${date(work.data_inicio_prevista)} <span class="muted">/ ${date(
          work.data_inicio_real,
        )}</span></div>
      </div>
      <div class="box">
        <div class="label">Término previsto / real</div>
        <div class="value">${date(work.data_fim_prevista)} <span class="muted">/ ${date(
          work.data_fim_real,
        )}</span></div>
      </div>
      ${
        budget && options.showValues
          ? `<div class="box"><div class="label">Valor do orçamento aprovado</div><div class="value">${money(
              budget.preco_com_bdi,
            )}</div></div>`
          : ""
      }
    </div>

    ${stagesHtml}`;

  return renderDocument({
    title: "Relatório de obra",
    subtitle: budget?.nome ?? "Obra",
    badge: pill(WORK_STATUS_LABEL[statusKey] ?? statusKey, statusKey),
    issuer,
    options,
    body,
    signatures: [
      issuer?.nome ? `${issuer.nome} — Responsável técnico` : "Responsável técnico",
      client?.nome ? `${client.nome} — Cliente` : "Cliente",
    ],
  });
}

export async function generateWorkPdf(args: WorkPdfArgs): Promise<GeneratedPdf> {
  return createPdf(buildWorkHtml(args), `Relatorio-obra ${args.budget?.nome ?? "obra"}`);
}
