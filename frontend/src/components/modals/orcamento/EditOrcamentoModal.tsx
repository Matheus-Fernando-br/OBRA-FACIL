import { Modal, View } from "react-native";
import { useEffect, useState } from "react";
import { OrcamentoForm } from "../../forms/OrcamentoForm";
import { getClients, updateBudget } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { Cliente, Orcamento } from "@/components/layout/interface";

interface Props {
  visible: boolean;
  budget: Orcamento | null;
  onClose(): void;
  onSuccess(): void;
}

export function EditOrcamentoModal({
  visible,
  budget,
  onClose,
  onSuccess,
}: Props) {
  const { token } = useAuth();
  const [clientsList, setClientsList] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");

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
    if (!budget) return;
    setLoading(true);
    try {
      await updateBudget(budget._id, formData, token!);
      onClose();
      onSuccess();
    } catch (error) {
      setFeedback("Erro ao atualizar Orçamento.");
    } finally {
      setLoading(false);
    }
  };

  if (!budget) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }}>
        <OrcamentoForm
          mode="edit"
          initialData={budget}
          onClose={onClose}
          onSave={handleSave}
          clientsList={clientsList}
          feedbackMessage={feedback}
        />
      </View>
    </Modal>
  );
}
