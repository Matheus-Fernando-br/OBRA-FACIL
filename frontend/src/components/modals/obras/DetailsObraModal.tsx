import { Modal, View } from "react-native";
import { useState, useEffect } from "react";
import { ObrasForm } from "@/components/forms/ObrasForms";
import { Obra, Orcamento, Cliente } from "@/components/layout/interface";
import { getClients } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { PdfViewerModal } from "@/components/modals/PdfViewerModal";
import { generateBudgetPdf } from "@/utils/pdf/generateBudgetPdf";

interface Props {
  visible: boolean;
  work: Obra | null;
  onClose(): void;
  onEdit(): void;
}

export function DetailsObraModal({ visible, work, onClose, onEdit }: Props) {
  const { token } = useAuth();
  const [clientsList, setClientsList] = useState<Cliente[]>([]);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    if (visible && token) getClients(token).then(setClientsList);
  }, [visible, token]);

  const handleGeneratePdf = async () => {
    if (!work) return;

    setPdfLoading(true);

    try {
      /*
      const uri = await generateBudgetPdf(work);

      setPdfUri(uri);

      setShowPdfViewer(true);*/
    } catch (e) {
      console.log(e);

      alert("Erro ao gerar PDF.");
    } finally {
      setPdfLoading(false);
    }
  };

  if (!work) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
    >
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)" }}>
        <ObrasForm
          mode="details"
          initialData={work}
          onClose={onClose}
          loading={pdfLoading}
          onEdit={onEdit}
        />
      </View>
    </Modal>
  );
}
