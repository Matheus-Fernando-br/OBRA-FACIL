import type { Obra } from "@/components/layout/interface";
import { duracaoServico, periodo } from "@/utils/workSchedule";
import { esc, num } from "./template";

/*
 * EAP (Estrutura Analítica do Projeto) + cronograma visual da obra.
 * Árvore Obra → Etapas → Serviços e barras por serviço nos dias de execução
 * (serviços podem ser simultâneos; o prazo é o período geral, não a soma).
 */

const CORES = [
  { barra: "#2A76B8", fundo: "#E8F1FA" },
  { barra: "#178F86", fundo: "#E3F3F1" },
  { barra: "#DB8B2E", fundo: "#FDF1E2" },
  { barra: "#7A5BC4", fundo: "#F0ECFA" },
  { barra: "#C2570C", fundo: "#FDF0E6" },
  { barra: "#3E8E41", fundo: "#E8F4E9" },
];

export const EAP_CSS = `
  .eap h2.eap-title { border-left: none; padding-left: 0; font-size: 15px; margin: 0 0 2px; }
  .eap .eap-sub { color: #6C6C70; font-size: 10px; margin-bottom: 14px; }
  .eap h3 { font-size: 11.5px; margin: 14px 0 8px; }
  .eap .tree-root { display: table; margin: 0 auto; background: #18324D; color: #FFFFFF;
    font-weight: 700; font-size: 12px; padding: 9px 26px; border-radius: 8px; text-align: center; }
  .eap .tree-line { width: 1px; height: 12px; background: #B9C3CC; margin: 0 auto; }
  .eap .tree-stages { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center;
    border-top: 1px solid #B9C3CC; padding-top: 12px; }
  .eap .stage { flex: 1 1 30%; min-width: 150px; border: 1px solid #E5E5EA; border-radius: 10px;
    padding: 8px; page-break-inside: avoid; }
  .eap .stage-name { font-weight: 700; font-size: 11px; text-align: center; margin-bottom: 6px; }
  .eap .stage-dur { color: #6C6C70; font-size: 9px; text-align: center; margin-bottom: 6px; }
  .eap .node { border-radius: 8px; padding: 6px 8px; margin-top: 5px; text-align: center; }
  .eap .node b { display: block; font-size: 10.5px; color: #18324D; }
  .eap .node span { font-size: 9px; color: #5B6670; }
  .eap .gantt { width: 100%; border-collapse: collapse; table-layout: fixed; margin-top: 4px; }
  .eap .gantt td, .eap .gantt th { border-bottom: none; padding: 3px 0; background: none; }
  .eap .gantt th { font-size: 8.5px; color: #18324D; text-align: center; text-transform: none;
    letter-spacing: 0; border-left: 1px solid #EEF0F2; }
  .eap .gantt td.name { width: 30%; font-weight: 700; font-size: 10px; color: #18324D;
    padding-right: 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .eap .gantt td.track { position: relative; height: 22px; }
  .eap .gantt .grid { position: absolute; top: 0; bottom: 0; border-left: 1px solid #EEF0F2; }
  .eap .gantt .bar-s { position: absolute; top: 3px; height: 16px; border-radius: 5px; color: #FFFFFF;
    font-size: 8.5px; line-height: 16px; text-align: center; white-space: nowrap; overflow: hidden; }
  .eap .gantt tr.stage-row td { font-size: 9px; color: #6C6C70; text-transform: uppercase;
    letter-spacing: .5px; padding-top: 8px; }
  .eap .total { margin-top: 10px; text-align: center; font-size: 10.5px; color: #1C1C1E;
    border-top: 1.5px solid #18324D; padding-top: 6px; }
`;

const faixa = (ini: number, fim: number) => (ini === fim ? `Dia ${ini}` : `Dia ${ini} ao dia ${fim}`);
const execucao = (ini: number, fim: number) => (ini === fim ? `Execução: dia ${ini}` : `Execução: dias ${ini}–${fim}`);

/** Seção HTML da EAP e do cronograma. */
export function buildEapSection(work: Obra, nomeObra: string) {
  const categorias = Array.isArray(work.categoria) ? work.categoria : [];
  const todos = categorias.flatMap((c) => c.servicos ?? []);
  const geral = periodo(todos);
  let corIdx = 0;

  const tree = categorias
    .map((cat) => {
      const p = periodo(cat.servicos ?? []);
      const nodes = (cat.servicos ?? [])
        .map((s) => {
          const cor = CORES[corIdx++ % CORES.length];
          const d = duracaoServico(s);
          const info = d !== null ? execucao(Number(s.dia_inicio), Number(s.dia_fim)) : `${num(s.qt_dias_prevista)} dia(s) previsto(s)`;
          return `<div class="node" style="background:${cor.fundo}"><b>${esc(s.nome)}</b><span>${info}</span></div>`;
        })
        .join("");
      return `<div class="stage"><div class="stage-name">${esc(cat.nome)}</div>${
        p ? `<div class="stage-dur">${p.dias} ${p.dias === 1 ? "dia" : "dias"} · ${faixa(p.inicio, p.fim).toLowerCase()}</div>` : ""
      }${nodes || `<div class="stage-dur">Sem serviços</div>`}</div>`;
    })
    .join("");

  let gantt = `<p class="empty">Cronograma não informado nesta obra (cadastre o dia de início e de término de cada serviço).</p>`;
  if (geral) {
    // Eixo do dia 1 até o último dia; muitas colunas → rótulo a cada N dias.
    const ultimo = geral.fim;
    const passo = ultimo <= 15 ? 1 : ultimo <= 31 ? 2 : ultimo <= 62 ? 5 : Math.ceil(ultimo / 12);
    const largura = 100 / ultimo;
    const dias = Array.from({ length: ultimo }, (_, i) => i + 1);
    const header = dias
      .map((d) => `<th>${d === 1 || d % passo === 0 ? `Dia ${d}` : ""}</th>`)
      .join("");
    const grade = dias.map((d) => `<div class="grid" style="left:${(d - 1) * largura}%"></div>`).join("");
    corIdx = 0;
    const linhas = categorias
      .map((cat) => {
        const rows = (cat.servicos ?? [])
          .map((s) => {
            const cor = CORES[corIdx++ % CORES.length];
            if (duracaoServico(s) === null) return "";
            const ini = Number(s.dia_inicio);
            const fim = Number(s.dia_fim);
            return `<tr><td class="name">${esc(s.nome)}</td><td class="track" colspan="${ultimo}">${grade}<div class="bar-s" style="left:${
              (ini - 1) * largura
            }%;width:${(fim - ini + 1) * largura}%;background:${cor.barra}">${faixa(ini, fim)}</div></td></tr>`;
          })
          .join("");
        return rows ? `<tr class="stage-row"><td colspan="${ultimo + 1}">${esc(cat.nome)}</td></tr>${rows}` : "";
      })
      .join("");
    gantt = `<div class="gantt-wrap"><table class="gantt"><thead><tr><th style="width:30%;border-left:none"></th>${header}</tr></thead><tbody>${linhas}</tbody></table></div>
      <div class="total">Prazo total: do dia ${geral.inicio} ao dia ${geral.fim} (${geral.dias} ${
        geral.dias === 1 ? "dia corrido" : "dias corridos"
      } no cronograma)</div>`;
  }

  return `<style>${EAP_CSS}</style><div class="eap">
    <h2 class="eap-title">EAP e cronograma da obra</h2>
    <div class="eap-sub">Estrutura dos serviços e períodos de execução (dias relativos ao início da obra)</div>
    <h3>Estrutura Analítica do Projeto (EAP)</h3>
    <div class="tree-root">${esc(nomeObra)}</div>
    <div class="tree-line"></div>
    <div class="tree-stages">${tree || `<p class="empty">Nenhuma etapa cadastrada.</p>`}</div>
    <h3>Cronograma visual</h3>
    <div class="eap-sub" style="margin-bottom:4px">Os serviços podem ocorrer em paralelo; as durações não são somadas.</div>
    ${gantt}
  </div>`;
}
