import { useState } from "react";
import { Cliente, Obra, Orcamento } from "@/components/layout/interface";
import { useAuth } from "@/contexts/AuthContext";
import { PdfViewerModal } from "@/components/modals/PdfViewerModal";
import { getBudgetById, getClientById } from "@/services/api";
import { GeneratedPdf } from "@/utils/pdf/output";
import { generateWorkEapPdf, generateWorkPdf } from "@/utils/pdf/generateWorkPdf";
import { loadPdfOptions } from "@/utils/pdf/preferences";

/**
 * PDFs da obra (relatório completo ou só a EAP) + o modal "Documento pronto".
 * Usado nos detalhes e na edição da obra.
 */
export function useWorkPdf(work: Obra | null) {
  const { token, user } = useAuth();
  const [pdf, setPdf] = useState<GeneratedPdf | null>(null);
  const [title, setTitle] = useState("");
  const [visible, setVisible] = useState(false);

  async function generate(kind: "completo" | "eap") {
    if (!work || !token) return;
    const budget: Orcamento | null =
      typeof work.orcamento === "object" ? work.orcamento : await getBudgetById(work.orcamento, token);
    let client: Cliente | null = null;
    if (budget?.cliente) {
      client =
        typeof budget.cliente === "object"
          ? budget.cliente
          : await getClientById(budget.cliente, token).catch(() => null);
    }
    const args = { work, budget, client, issuer: user ?? undefined, options: await loadPdfOptions() };
    setPdf(kind === "eap" ? await generateWorkEapPdf(args) : await generateWorkPdf(args));
    setTitle(kind === "eap" ? "EAP e cronograma da obra" : "Relatório de acompanhamento da obra (com EAP)");
    setVisible(true);
  }

  const viewer = (
    <PdfViewerModal visible={visible} onClose={() => setVisible(false)} pdf={pdf} budgetTitle={title} />
  );

  return {
    generatePdf: () => generate("completo"),
    generateEapPdf: () => generate("eap"),
    viewer,
  };
}
