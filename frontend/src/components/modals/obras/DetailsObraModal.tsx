import { Modal, View } from "react-native";
import { useState } from "react";
import { ObrasForm } from "@/components/forms/ObrasForms";
import { Obra, Orcamento, Cliente } from "@/components/layout/interface";
import { getBudgetById, getClientById } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { PdfViewerModal } from "@/components/modals/PdfViewerModal";
import { generateWorkPdf } from "@/utils/pdf/generateWorkPdf";
import { loadPdfOptions } from "@/utils/pdf/preferences";
import { GeneratedPdf } from "@/utils/pdf/output";

interface Props {
  visible: boolean;
  work: Obra | null;
  onClose(): void;
  onEdit(): void;
}

export function DetailsObraModal({ visible, work, onClose, onEdit }: Props) {
  const { token, user } = useAuth();
  const [pdf, setPdf] = useState<GeneratedPdf | null>(null);
  const [showPdfViewer, setShowPdfViewer] = useState(false);

  /** Relatório de acompanhamento da obra (antes desativado). */
  const handleGeneratePdf = async () => {
    if (!work || !token) return;

    const budget: Orcamento | null =
      typeof work.orcamento === "object"
        ? work.orcamento
        : await getBudgetById(work.orcamento, token);

    let client: Cliente | null = null;
    if (budget?.cliente) {
      client =
        typeof budget.cliente === "object"
          ? budget.cliente
          : await getClientById(budget.cliente, token).catch(() => null);
    }

    const generated = await generateWorkPdf({
      work,
      budget,
      client,
      issuer: user ?? undefined,
      options: await loadPdfOptions(),
    });

    setPdf(generated);
    setShowPdfViewer(true);
  };

  if (!work) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={{ flex: 1 }}>
        <ObrasForm
          mode="details"
          initialData={work}
          onClose={onClose}
          onEdit={onEdit}
          onGeneratePdf={handleGeneratePdf}
        />
        <PdfViewerModal
          visible={showPdfViewer}
          onClose={() => setShowPdfViewer(false)}
          pdf={pdf}
          budgetTitle="Relatório de acompanhamento da obra"
        />
      </View>
    </Modal>
  );
}
