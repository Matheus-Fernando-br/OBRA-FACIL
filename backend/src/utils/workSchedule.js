/*
 * Cronograma da obra (mesma regra do app em frontend/src/utils/workSchedule.ts).
 * Cada serviço tem dia_inicio e dia_fim, contados a partir da data de início
 * prevista da obra (dia 1). Serviços podem ser simultâneos; a duração da obra
 * é o período geral, do primeiro dia ao último — não a soma das durações.
 *   Ex.: serviço 1 dias 2–4, serviço 2 dias 3–5, serviço 3 dia 6 → 5 dias (2 a 6).
 */
const DAY = 86400000;
const inteiro = (v) => (Number.isInteger(Number(v)) && Number(v) >= 1 ? Number(v) : null);

/** Duração de um serviço (dias corridos) ou null se o período não foi informado. */
export function duracaoServico(s) {
  const ini = inteiro(s?.dia_inicio);
  const fim = inteiro(s?.dia_fim);
  return ini && fim && fim >= ini ? fim - ini + 1 : null;
}

/** Período geral de uma lista de serviços: { inicio, fim, dias } ou null. */
export function periodo(servicos = []) {
  let inicio = Infinity;
  let fim = -Infinity;
  for (const s of servicos) {
    if (duracaoServico(s) === null) continue;
    inicio = Math.min(inicio, Number(s.dia_inicio));
    fim = Math.max(fim, Number(s.dia_fim));
  }
  return Number.isFinite(inicio) ? { inicio, fim, dias: fim - inicio + 1 } : null;
}

/** Aplica o cronograma na obra (documento Mongoose ou objeto simples). */
export function aplicarCronograma(obra) {
  const todos = [];
  for (const cat of obra.categoria ?? []) {
    for (const s of cat.servicos ?? []) {
      const d = duracaoServico(s);
      if (d !== null) s.qt_dias_prevista = d;
      todos.push(s);
    }
    const p = periodo(cat.servicos);
    if (p) cat.qt_dias_prevista = p.dias;
  }
  const geral = periodo(todos);
  if (geral) {
    obra.qt_dias_prevista = geral.dias;
    if (obra.data_inicio_prevista) {
      obra.data_fim_prevista = new Date(new Date(obra.data_inicio_prevista).getTime() + (geral.fim - 1) * DAY);
    }
  }
  return geral;
}
