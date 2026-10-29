import { Modal, View } from "react-native";
import { useState, useEffect } from "react";
import { ObrasForm } from "../../forms/ObrasForms";
import { getClients, updateWork } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { Cliente, Obra } from "@/components/layout/interface";
import { useWorkPdf } from "./useWorkPdf";

interface Props {
  visible: boolean;
  work: Obra | null;
  onClose(): void;
  onSuccess(): void;
}

export function EditObraModal({ visible, work, onClose, onSuccess }: Props) {
  const { token } = useAuth();
  const [clientsList, setClientsList] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  // PDFs da versão salva da obra (salve antes para incluir as alterações).
  const { generatePdf, generateEapPdf, viewer } = useWorkPdf(work);

  useEffect(() => {
    async function loadClients() {
      try {
        if (!token) return;
        const data = await getClients(token);
        setClientsList(data);
      } catch (error) {
        setFeedback("Erro ao carregar clientes.");
      }
    }
    if (visible) loadClients();
  }, [visible, token]);

  const handleSave = async (formData: any) => {
    if (!work) return;
    setLoading(true);
    try {
      await updateWork(work._id, formData, token!);
      onClose();
      onSuccess();
    } catch (error: any) {
      console.log("ERRO AO ATUALIZAR OBRA:", error?.response?.data || error);
      setFeedback(error?.response?.data?.message ?? "Erro ao atualizar a obra.");
    } finally {
      setLoading(false);
    }
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
          mode="edit"
          initialData={work}
          onClose={onClose}
          onSave={handleSave}
          feedbackMessage={feedback}
          loading={loading}
          onGeneratePdf={generatePdf}
          onGenerateEapPdf={generateEapPdf}
        />
        {viewer}
      </View>
    </Modal>
  );
}
