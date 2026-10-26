import PDFDocument from 'pdfkit';

/*
 * Relatório de auditoria em PDF (A4 paisagem): cabeçalho com filtros,
 * tabela com data, ator, ação, alvo e detalhes, e rodapé com páginas.
 * Os detalhes já vêm sem campos sensíveis (services/audit.js).
 */

const ACCENT = '#C2570C';
const INK = '#1C1C1E';
const MUTED = '#6B6B70';
const LINE = '#E3E3E6';

const COLS = [
  { key: 'quando', label: 'Data/hora', width: 92 },
  { key: 'ator', label: 'Quem', width: 110 },
  { key: 'acao', label: 'Ação', width: 170 },
  { key: 'alvo', label: 'Alvo', width: 150 },
  { key: 'detalhes', label: 'Detalhes', width: 240 },
];

const fmtDate = (d) =>
  new Date(d).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'short' });

function row(e) {
  const detalhes = e.detalhes ? JSON.stringify(e.detalhes) : '';
  return {
    quando: fmtDate(e.createdAt),
    ator: `${e.ator?.nome ?? e.ator?.id ?? '—'} (${e.ator?.tipo ?? ''})`,
    acao: e.acao ?? '',
    alvo: [e.alvo?.tipo, e.alvo?.id].filter(Boolean).join(' ') || '—',
    detalhes: (detalhes.length > 220 ? `${detalhes.slice(0, 220)}…` : detalhes) + (e.ip ? `  · IP ${e.ip}` : ''),
  };
}

export function auditPdf({ items, total, filtros, geradoPor, limite }) {
  const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 36, bufferPages: true, info: { Title: 'Auditoria — Obra Fácil', Author: 'Obra Fácil (R2M)' } });
  const left = doc.page.margins.left;
  const width = doc.page.width - left - doc.page.margins.right;

  // Cabeçalho
  doc.fillColor(ACCENT).font('Helvetica-Bold').fontSize(9).text('OBRA FÁCIL · PAINEL ADMINISTRATIVO', left, 36);
  doc.fillColor(INK).fontSize(18).text('Relatório de auditoria', left, 50);
  const filtrosTxt = [
    filtros.acao ? `ação: ${filtros.acao}*` : null,
    filtros.q ? `busca: "${filtros.q}"` : null,
    filtros.de ? `de ${filtros.de.toLocaleDateString('pt-BR', { timeZone: 'UTC' })}` : null,
    filtros.ate ? `até ${filtros.ate.toLocaleDateString('pt-BR', { timeZone: 'UTC' })}` : null,
  ].filter(Boolean);
  doc
    .font('Helvetica')
    .fontSize(9)
    .fillColor(MUTED)
    .text(
      `Gerado em ${fmtDate(new Date())} por ${geradoPor} · ${items.length} de ${total} registro(s)` +
        (total > limite ? ` (limite de ${limite} por arquivo — refine os filtros)` : '') +
        ` · Filtros: ${filtrosTxt.length ? filtrosTxt.join(', ') : 'nenhum'}`,
      left,
      74,
      { width },
    );

  let y = doc.y + 12;

  const header = () => {
    doc.rect(left, y, width, 18).fill('#F5F5F7');
    let x = left;
    doc.fillColor(MUTED).font('Helvetica-Bold').fontSize(8);
    for (const c of COLS) {
      doc.text(c.label.toUpperCase(), x + 4, y + 5, { width: c.width - 8 });
      x += c.width;
    }
    y += 22;
  };

  header();
  doc.font('Helvetica').fontSize(8);

  if (!items.length) {
    doc.fillColor(MUTED).text('Nenhum registro encontrado com esses filtros.', left, y + 6);
  }

  for (const e of items) {
    const r = row(e);
    const h = Math.max(...COLS.map((c) => doc.heightOfString(r[c.key], { width: c.width - 8 }))) + 8;
    if (y + h > doc.page.height - doc.page.margins.bottom - 20) {
      doc.addPage();
      y = doc.page.margins.top;
      header();
      doc.font('Helvetica').fontSize(8);
    }
    let x = left;
    for (const c of COLS) {
      doc.fillColor(c.key === 'acao' ? INK : c.key === 'detalhes' ? MUTED : INK).text(r[c.key], x + 4, y + 4, { width: c.width - 8 });
      x += c.width;
    }
    y += h;
    doc.moveTo(left, y).lineTo(left + width, y).lineWidth(0.5).strokeColor(LINE).stroke();
  }

  // Rodapé com numeração
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    const bottom = doc.page.height - doc.page.margins.bottom + 12;
    doc.page.margins.bottom = 0;
    doc
      .font('Helvetica')
      .fontSize(8)
      .fillColor(MUTED)
      .text(`Obra Fácil — Auditoria · página ${i + 1} de ${range.count} · documento confidencial`, left, bottom, { width, align: 'center' });
  }

  doc.end();
  return doc;
}
