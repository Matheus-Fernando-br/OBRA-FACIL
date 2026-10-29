/*
 * Cronograma da obra — mesma regra do servidor (backend/src/utils/workSchedule.js).
 * Cada serviço tem dia_inicio e dia_fim, contados a partir da data de início
 * prevista da obra (dia 1). Serviços podem ser simultâneos; a duração é o
 * período geral (do primeiro ao último dia), não a soma das durações.
 * Obras antigas sem cronograma continuam usando a soma dos dias previstos.
 */
export interface ServicoCronograma {
  dia_inicio?: number | null;
  dia_fim?: number | null;
  qt_dias_prevista?: number | null;
  qt_dias_real?: number | null;
}

const inteiro = (v: unknown) => (Number.isInteger(Number(v)) && Number(v) >= 1 ? Number(v) : null);

export function duracaoServico(s: ServicoCronograma): number | null {
  const ini = inteiro(s.dia_inicio);
  const fim = inteiro(s.dia_fim);
  return ini && fim && fim >= ini ? fim - ini + 1 : null;
}

export function temCronograma(servicos: ServicoCronograma[]) {
  return servicos.some((s) => duracaoServico(s) !== null);
}

/** Período geral { inicio, fim, dias } dos serviços com cronograma, ou null. */
export function periodo(servicos: ServicoCronograma[]) {
  let inicio = Infinity;
  let fim = -Infinity;
  for (const s of servicos) {
    if (duracaoServico(s) === null) continue;
    inicio = Math.min(inicio, Number(s.dia_inicio));
    fim = Math.max(fim, Number(s.dia_fim));
  }
  return Number.isFinite(inicio) ? { inicio, fim, dias: fim - inicio + 1 } : null;
}

/** Dias previstos: período geral (com cronograma) ou soma (obras antigas). */
export function diasPrevistos(servicos: ServicoCronograma[]) {
  const p = periodo(servicos);
  if (p) return p.dias;
  return servicos.reduce((sum, s) => sum + (Number(s.qt_dias_prevista) || 0), 0);
}

/**
 * Dias reais: com cronograma, cada serviço começa no dia previsto e dura os
 * dias reais informados; vale o período do primeiro início ao último término.
 * Sem cronograma, soma dos dias reais (obras antigas).
 */
export function diasReais(servicos: ServicoCronograma[]) {
  const p = periodo(servicos);
  if (!p) return servicos.reduce((sum, s) => sum + (Number(s.qt_dias_real) || 0), 0);
  let ultimo = 0;
  for (const s of servicos) {
    const real = Number(s.qt_dias_real) || 0;
    if (duracaoServico(s) === null || real <= 0) continue;
    ultimo = Math.max(ultimo, Number(s.dia_inicio) + real - 1);
  }
  return ultimo ? ultimo - p.inicio + 1 : 0;
}

/** Erro de validação do período de um serviço, ou "". */
export function erroPeriodo(s: ServicoCronograma) {
  if (s.dia_inicio == null && s.dia_fim == null) return "Informe o dia de início e o de término.";
  if (!inteiro(s.dia_inicio) || !inteiro(s.dia_fim)) return "Use dias inteiros a partir do dia 1.";
  if (Number(s.dia_fim) < Number(s.dia_inicio)) return "O dia de término não pode ser antes do início.";
  if (Number(s.dia_fim) > 3650) return "Cronograma muito longo.";
  return "";
}
