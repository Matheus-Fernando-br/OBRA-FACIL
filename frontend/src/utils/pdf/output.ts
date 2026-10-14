import { Platform } from "react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { File, Paths } from "expo-file-system";

/* ==========================================================
   SAÍDA DE DOCUMENTOS
   - Nativo: gera o PDF com expo-print e renomeia o arquivo para um
     nome legível (ex.: "Orcamento-Reforma-apto-301.pdf").
   - Web: printToFileAsync não gera arquivo (apenas chama
     window.print() da página atual); por isso o HTML é aberto numa
     janela própria, onde o usuário imprime ou salva como PDF.
========================================================== */

export interface GeneratedPdf {
  /** URI do arquivo no aparelho (vazio na web). */
  uri: string;
  fileName: string;
  html: string;
}

export function safeFileName(base: string, ext = "pdf") {
  const clean = base
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return `${clean || "documento"}.${ext}`;
}

export async function createPdf(html: string, baseName: string): Promise<GeneratedPdf> {
  const fileName = safeFileName(baseName);

  if (Platform.OS === "web") {
    return { uri: "", fileName, html };
  }

  const { uri } = await Print.printToFileAsync({ html });

  // Renomeia para um nome amigável (o padrão é um UUID).
  try {
    const target = new File(Paths.cache, fileName);
    if (target.exists) target.delete();
    const source = new File(uri);
    await source.move(target);
    return { uri: source.uri, fileName, html };
  } catch {
    return { uri, fileName, html };
  }
}

/** Abre a visualização/impressão do sistema (permite salvar como PDF). */
export async function printPdf(pdf: GeneratedPdf) {
  if (Platform.OS === "web") {
    openHtmlForPrint(pdf.html);
    return;
  }
  await Print.printAsync({ uri: pdf.uri });
}

/** Compartilha o arquivo (WhatsApp, e-mail, Drive, "Salvar em Arquivos"…). */
export async function sharePdf(pdf: GeneratedPdf) {
  if (Platform.OS === "web") {
    openHtmlForPrint(pdf.html);
    return;
  }

  if (!(await Sharing.isAvailableAsync())) {
    throw new Error("Compartilhamento indisponível neste dispositivo.");
  }

  await Sharing.shareAsync(pdf.uri, {
    mimeType: "application/pdf",
    UTI: "com.adobe.pdf",
    dialogTitle: pdf.fileName,
  });
}

function openHtmlForPrint(html: string) {
  const win = window.open("", "_blank");
  if (!win) {
    throw new Error("O navegador bloqueou a nova janela. Permita pop-ups para gerar o PDF.");
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 350);
}

/* ==========================================================
   CSV (abre no Excel / Planilhas)
========================================================== */

function csvCell(value: unknown) {
  const text = value === null || value === undefined ? "" : String(value);
  return /[";\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function buildCsv(headers: string[], rows: (string | number)[][]) {
  // ";" é o separador padrão do Excel em pt-BR; BOM garante acentuação.
  const lines = [headers, ...rows].map((r) => r.map(csvCell).join(";"));
  return "﻿" + lines.join("\r\n");
}

export async function shareCsv(csv: string, baseName: string) {
  const fileName = safeFileName(baseName, "csv");

  if (Platform.OS === "web") {
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return;
  }

  const file = new File(Paths.cache, fileName);
  if (file.exists) file.delete();
  file.create();
  file.write(csv);

  if (!(await Sharing.isAvailableAsync())) {
    throw new Error("Compartilhamento indisponível neste dispositivo.");
  }

  await Sharing.shareAsync(file.uri, {
    mimeType: "text/csv",
    UTI: "public.comma-separated-values-text",
    dialogTitle: fileName,
  });
}
