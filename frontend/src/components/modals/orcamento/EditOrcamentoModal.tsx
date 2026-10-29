import { Modal, View } from "react-native";
import { useEffect, useRef, useState } from "react";
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
  const [clientsLoaded, setClientsLoaded] = useState(false);
  // Botão voltar do Android / Esc no site: o formulário confirma se há alterações.
  const closeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    async function loadClients() {
      try {
        if (!token) return;
        const data = await getClients(token);
        setClientsList(Array.isArray(data) ? data : []);
        setClientsLoaded(true);
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
    } catch (error: any) {
      console.log("ERRO AO ATUALIZAR ORÇAMENTO:", error?.response?.data || error);
      // Repassa o erro: antes ele era engolido e o formulário exibia
      // "Orçamento salvo com sucesso!" mesmo com falha na API.
      throw error;
    } finally {
      setLoading(false);
    }
  };

  if (!budget) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
      onRequestClose={() => (closeRef.current ? closeRef.current() : onClose())}
    >
      <View style={{ flex: 1 }}>
        <OrcamentoForm
          mode="edit"
          initialData={budget}
          onClose={onClose}
          onSave={handleSave}
          clientsList={clientsList}
          clientsLoaded={clientsLoaded}
          closeRef={closeRef}
          feedbackMessage={feedback}
        />
      </View>
    </Modal>
  );
}
