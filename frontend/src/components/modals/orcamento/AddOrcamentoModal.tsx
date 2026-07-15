import { Modal, View } from "react-native";
import { useState, useEffect } from "react";
import { OrcamentoForm } from "@/components/forms/orcamentoForm";
import { getClients, createBudget } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { Cliente } from "@/components/layout/interface";

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function AddOrcamentoModal({ visible, onClose }: Props) {
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
      } catch (error) { setFeedback("Erro ao carregar clientes."); }
    }
    if (visible) loadClients();
  }, [visible, token]);

  const handleSave = async (formData: any) => {
    setLoading(true);
    try {
      await createBudget(formData, token!);
      onClose();
    } catch (error) { setFeedback("Erro ao salvar."); }
    finally { setLoading(false); }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }}>
        <OrcamentoForm mode="add" onClose={onClose} onSave={handleSave} clientsList={clientsList} feedbackMessage={feedback} loading={loading} />
      </View>
    </Modal>
  );
}
