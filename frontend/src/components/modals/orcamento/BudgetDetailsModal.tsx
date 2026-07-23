import { Modal, View } from "react-native";
import { useState, useEffect } from "react";
import { OrcamentoForm } from "@/components/forms/orcamentoForm";
import { Orcamento, Cliente } from "@/components/layout/interface";
import { getClients } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { PdfViewerModal } from "@/components/modals/PdfViewerModal";
import { generateBudgetPdf } from "@/utils/pdf/generateBudgetPdf";

interface Props {
  visible: boolean;
  budget: Orcamento | null;
  onClose(): void;
}

export function BudgetDetailsModal({ visible, budget, onClose }: Props) {
  const { token } = useAuth();
  const [clientsList, setClientsList] = useState<Cliente[]>([]);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfUri, setPdfUri] = useState<string | null>(null);
  const [showPdfViewer, setShowPdfViewer] = useState(false);

  useEffect(() => {
    if (visible && token) getClients(token).then(setClientsList);
  }, [visible, token]);

  const handleGeneratePdf = async () => {
    if (!budget) return;

    setPdfLoading(true);

    try {
      const uri = await generateBudgetPdf(budget);

      setPdfUri(uri);

      setShowPdfViewer(true);
    } catch (e) {
      console.log(e);

      alert("Erro ao gerar PDF.");
    } finally {
      setPdfLoading(false);
    }
  };

  if (!budget) return null;
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
    >
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)" }}>
        <OrcamentoForm
          mode="details"
          initialData={budget}
          onClose={onClose}
          clientsList={clientsList}
          loading={pdfLoading}
          onGeneratePdf={handleGeneratePdf}
        />
      <PdfViewerModal
        visible={showPdfViewer}
        onClose={() => setShowPdfViewer(false)}
        pdfUri={pdfUri}
        budgetTitle={budget.nome}
        />
        </View>
    </Modal>
  );
}
