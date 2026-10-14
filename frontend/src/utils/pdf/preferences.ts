import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DEFAULT_PDF_OPTIONS, PdfOptions } from "./template";

/* Preferências dos documentos (tela Relatórios), salvas no aparelho. */

const STORAGE_KEY = "@obra_facil_pdf_options";

export async function loadPdfOptions(): Promise<PdfOptions> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PDF_OPTIONS;
    return { ...DEFAULT_PDF_OPTIONS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PDF_OPTIONS;
  }
}

export function usePdfOptions() {
  const [options, setOptions] = useState<PdfOptions>(DEFAULT_PDF_OPTIONS);

  useEffect(() => {
    loadPdfOptions().then(setOptions);
  }, []);

  const update = useCallback((patch: Partial<PdfOptions>) => {
    setOptions((prev) => {
      const next = { ...prev, ...patch };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  return { options, update };
}
