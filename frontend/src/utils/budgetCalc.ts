/*
 * Cálculo do orçamento — mesma regra do servidor
 * (backend/src/utils/budgetCalc.js). Em centavos inteiros, para não
 * acumular erros de ponto flutuante (ex.: 3 × 0,10 = 0,30 exatos).
 *
 *   item     = quantidade × valor unitário (arredondado ao centavo)
 *   etapa    = soma dos itens
 *   subtotal = soma das etapas
 *   BDI      = subtotal × BDI% (sem BDI = 0)
 *   total    = subtotal + BDI
 */
export const toCents = (v: unknown) => Math.round((Number(v) || 0) * 100);
export const fromCents = (c: number) => c / 100;

interface ServicoCalc {
  quantidade_unidade?: number | null;
  preco_da_unidade?: number | null;
}
interface EtapaCalc {
  servicos?: ServicoCalc[];
}

export interface BudgetTotals {
  /** Total de cada serviço, por etapa (em reais). */
  itens: number[][];
  /** Subtotal de cada etapa (em reais). */
  etapas: number[];
  subtotal: number;
  valorBdi: number;
  total: number;
}

export function calcularOrcamento(categorias: EtapaCalc[], bdi?: number | null): BudgetTotals {
  let subtotalCents = 0;
  const itens: number[][] = [];
  const etapas: number[] = [];
  for (const c of categorias) {
    let etapaCents = 0;
    const linha: number[] = [];
    for (const s of c.servicos ?? []) {
      const itemCents = Math.round((Number(s.quantidade_unidade) || 0) * toCents(s.preco_da_unidade));
      etapaCents += itemCents;
      linha.push(fromCents(itemCents));
    }
    itens.push(linha);
    etapas.push(fromCents(etapaCents));
    subtotalCents += etapaCents;
  }
  const pct = Number(bdi) > 0 ? Number(bdi) : 0;
  const bdiCents = Math.round((subtotalCents * pct) / 100);
  return {
    itens,
    etapas,
    subtotal: fromCents(subtotalCents),
    valorBdi: fromCents(bdiCents),
    total: fromCents(subtotalCents + bdiCents),
  };
}

export const formatBRL = (v: number) => (Number(v) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/** Opções de validade (dias após a emissão). */
export const VALIDADE_OPCOES = [1, 3, 5, 7, 10, 14];

const DAY = 86400000;

/** Data de validade = emissão + N dias. */
export function validadeDe(emissao: Date, dias: number) {
  return new Date(emissao.getTime() + dias * DAY);
}

/** Dias entre a emissão e a data escolhida (datas de calendário). */
export function diasAte(emissao: Date, data: Date) {
  const a = Date.UTC(emissao.getFullYear(), emissao.getMonth(), emissao.getDate());
  const b = Date.UTC(data.getFullYear(), data.getMonth(), data.getDate());
  return Math.round((b - a) / DAY);
}

/** "dd/mm/aaaa" → Date (meio-dia, para não virar o dia por fuso). */
export function parseDataBR(texto: string): Date | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(texto.trim());
  if (!m) return null;
  const [, d, mo, y] = m.map(Number);
  const data = new Date(y, mo - 1, d, 12);
  return data.getDate() === d && data.getMonth() === mo - 1 ? data : null;
}

export function dataMask(texto: string) {
  const d = texto.replace(/\D/g, "").slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
}
