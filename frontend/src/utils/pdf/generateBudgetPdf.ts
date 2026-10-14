import type { Cliente, Orcamento } from "@/components/layout/interface";
import { BUDGET_STATUS_LABEL, getBudgetValidUntil } from "@/utils/status";
import {
  DEFAULT_PDF_OPTIONS,
  PdfIssuer,
  PdfOptions,
  date,
  esc,
  formatDocument,
  formatPhone,
  money,
  num,
  pill,
  renderDocument,
} from "./template";
import { createPdf, GeneratedPdf } from "./output";

interface BudgetPdfArgs {
  budget: Orcamento;
  /** Cliente completo (o orçamento pode trazer apenas o ID). */
  client?: Cliente | null;
  issuer?: PdfIssuer;
  options?: PdfOptions;
}

/** HTML do orçamento (exportado para testes e pré-visualização). */
export function buildBudgetHtml({
  budget,
  client,
  issuer,
  options = DEFAULT_PDF_OPTIONS,
}: BudgetPdfArgs) {
  const cliente =
    client ?? (typeof budget.cliente === "object" ? budget.cliente : null);

  const endereco = budget.endereco ?? ({} as Orcamento["endereco"]);
  const enderecoLinha1 = [endereco.rua, endereco.numero].filter(Boolean).join(", ");
  const enderecoLinha2 = [
    endereco.complemento,
    endereco.bairro,
    [endereco.cidade, endereco.estado].filter(Boolean).join("/"),
  ]
    .filter(Boolean)
    .join(" · ");

  const validUntil = getBudgetValidUntil(budget);
  const categorias = Array.isArray(budget.categoria) ? budget.categoria : [];

  const categoriesHtml = categorias.length
    ? categorias
        .map(
          (categoria, index) => `
      <h2>${index + 1}. ${esc(categoria.nome)}</h2>
      <table>
        <thead>
          <tr>
            <th style="width:4%">#</th>
            <th>Serviço</th>
            <th style="width:8%">Un.</th>
            <th class="num" style="width:10%">Qtd.</th>
            <th class="num" style="width:16%">Valor unit.</th>
            <th class="num" style="width:16%">Total</th>
          </tr>
        </thead>
        <tbody>
          ${(categoria.servicos ?? [])
            .map(
              (servico, sIndex) => `
            <tr>
              <td class="muted">${index + 1}.${sIndex + 1}</td>
              <td>${esc(servico.nome)}${
                servico.descricao ? `<div class="desc">${esc(servico.descricao)}</div>` : ""
              }</td>
              <td>${esc(servico.unidade)}</td>
              <td class="num">${num(servico.quantidade_unidade)}</td>
              <td class="num">${money(servico.preco_da_unidade)}</td>
              <td class="num">${money(servico.preco_total)}</td>
            </tr>`,
            )
            .join("")}
        </tbody>
      </table>
      <div class="subtotal">Subtotal da etapa: <strong>${money(
        categoria.preco_total_da_categoria,
      )}</strong></div>`,
        )
        .join("")
    : `<p class="empty">Nenhum serviço cadastrado.</p>`;

  const bdiValue = (budget.preco_com_bdi ?? 0) - (budget.preco ?? 0);

  const body = `
    <div class="grid">
      <div class="box">
        <div class="label">Cliente</div>
        <div class="value">${esc(cliente?.nome || "Não informado")}</div>
        <div class="muted">${[
          formatDocument(cliente ?? undefined),
          formatPhone(cliente?.telefone),
          cliente?.email,
        ]
          .filter(Boolean)
          .map(esc)
          .join(" · ")}</div>
      </div>
      <div class="box">
        <div class="label">Local da obra</div>
        <div class="value">${esc(enderecoLinha1 || "Não informado")}</div>
        <div class="muted">${esc(enderecoLinha2)}${
          endereco.CEP ? ` · CEP ${esc(endereco.CEP)}` : ""
        }</div>
      </div>
      <div class="box">
        <div class="label">Emissão</div>
        <div class="value">${date(budget.data_publicacao)}</div>
      </div>
      <div class="box">
        <div class="label">Validade da proposta</div>
        <div class="value">${
          validUntil ? `Até ${date(validUntil)}` : "—"
        } <span class="muted">(${num(budget.valido_durante)} dias)</span></div>
      </div>
    </div>

    ${
      budget.descricao
        ? `<div class="box" style="margin-bottom:6px"><div class="label">Descrição</div><div>${esc(
            budget.descricao,
          )}</div></div>`
        : ""
    }

    ${categoriesHtml}

    <div class="totals">
      <div class="row"><span>Custo direto</span><strong>${money(budget.preco)}</strong></div>
      <div class="row"><span>BDI (${num(budget.bdi)}%)</span><strong>${money(bdiValue)}</strong></div>
      <div class="row grand"><span>Valor total</span><span>${money(budget.preco_com_bdi)}</span></div>
    </div>

    <div class="notes">
      Valores em reais (R$). Proposta válida até ${
        validUntil ? date(validUntil) : "a data informada"
      }. BDI (Benefícios e Despesas Indiretas) aplicado sobre o custo direto.
    </div>`;

  const statusKey = (budget.status || "PENDENTE").toUpperCase();

  return renderDocument({
    title: "Orçamento",
    subtitle: budget.nome,
    badge: pill(BUDGET_STATUS_LABEL[statusKey] ?? statusKey, statusKey),
    issuer,
    options,
    body,
    signatures: [
      issuer?.nome ? `${issuer.nome} — Responsável técnico` : "Responsável técnico",
      cliente?.nome ? `${cliente.nome} — Cliente` : "Cliente",
    ],
  });
}

export async function generateBudgetPdf(args: BudgetPdfArgs): Promise<GeneratedPdf> {
  return createPdf(buildBudgetHtml(args), `Orcamento ${args.budget.nome}`);
}
