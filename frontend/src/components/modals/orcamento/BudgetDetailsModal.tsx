import { Modal, View } from "react-native";
import { useState, useEffect } from "react";
import { OrcamentoForm } from "@/components/forms/OrcamentoForm";
import { Orcamento, Cliente } from "@/components/layout/interface";
import { getClients } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { PdfViewerModal } from "@/components/modals/PdfViewerModal";
import { generateBudgetPdf } from "@/utils/pdf/generateBudgetPdf";
import { loadPdfOptions } from "@/utils/pdf/preferences";
import { GeneratedPdf } from "@/utils/pdf/output";

interface Props {
  visible: boolean;
  budget: Orcamento | null;
  onClose(): void;
  onEdit(): void;
  onClientDetails?: (client: Cliente) => void;
  onClientEdit?: (client: Cliente) => void;
}

export function BudgetDetailsModal({
  visible,
  budget,
  onClose,
  onEdit,
  onClientDetails,
}: Props) {
  const { token, user } = useAuth();
  const [clientsList, setClientsList] = useState<Cliente[]>([]);
  const [pdf, setPdf] = useState<GeneratedPdf | null>(null);
  const [showPdfViewer, setShowPdfViewer] = useState(false);

  useEffect(() => {
    if (visible && token) {
      getClients(token)
        .then((data) => setClientsList(Array.isArray(data) ? data : []))
        .catch((e) => console.log("ERRO AO CARREGAR CLIENTES:", e));
    }
  }, [visible, token]);

  /** Gera o PDF; lança erro para o formulário exibir a mensagem. */
  const handleGeneratePdf = async () => {
    if (!budget) return;

    const clientId =
      typeof budget.cliente === "object" ? budget.cliente?._id : budget.cliente;
    const client =
      clientsList.find((c) => c._id === clientId) ??
      (typeof budget.cliente === "object" ? budget.cliente : null);

    const generated = await generateBudgetPdf({
      budget,
      client,
      issuer: user ?? undefined,
      options: await loadPdfOptions(),
    });

    setPdf(generated);
    setShowPdfViewer(true);
  };

  if (!budget) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={{ flex: 1 }}>
        <OrcamentoForm
          mode="details"
          initialData={budget}
          onClose={onClose}
          clientsList={clientsList}
          onGeneratePdf={handleGeneratePdf}
          onEdit={onEdit}
          onClientDetails={onClientDetails}
        />
        <PdfViewerModal
          visible={showPdfViewer}
          onClose={() => setShowPdfViewer(false)}
          pdf={pdf}
          budgetTitle={budget.nome}
        />
      </View>
    </Modal>
  );
}
