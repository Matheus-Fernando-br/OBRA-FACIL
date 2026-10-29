/*
 * Cálculo oficial do orçamento (o app usa a mesma regra em
 * frontend/src/utils/budgetCalc.ts). Tudo em centavos inteiros para
 * evitar erros de arredondamento do ponto flutuante.
 *
 *   item       = quantidade × valor unitário (arredondado ao centavo)
 *   etapa      = soma dos itens
 *   subtotal   = soma das etapas
 *   BDI        = subtotal × BDI% (sem BDI informado = 0)
 *   total      = subtotal + BDI
 */
export const toCents = (v) => Math.round((Number(v) || 0) * 100);

export function calcularOrcamento(categorias = [], bdi) {
  let subtotalCents = 0;
  const etapas = categorias.map((c) => {
    let etapaCents = 0;
    const servicos = (c.servicos ?? []).map((s) => {
      const itemCents = Math.round((Number(s.quantidade_unidade) || 0) * toCents(s.preco_da_unidade));
      etapaCents += itemCents;
      return itemCents;
    });
    subtotalCents += etapaCents;
    return { servicos, etapaCents };
  });
  const bdiPct = Number(bdi) > 0 ? Number(bdi) : 0;
  const bdiCents = Math.round((subtotalCents * bdiPct) / 100);
  return { etapas, subtotalCents, bdiCents, totalCents: subtotalCents + bdiCents };
}
