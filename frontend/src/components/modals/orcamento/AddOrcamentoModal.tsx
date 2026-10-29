import { Modal, View  } from "react-native";
import { useState, useEffect, useRef } from "react";
import { OrcamentoForm } from "@/components/forms/OrcamentoForm";
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
      } catch (error) { setFeedback("Erro ao carregar clientes."); }
    }
    if (visible) loadClients();
  }, [visible, token]);

  const handleSave = async (formData: any) => {
    try {
      setLoading(true);
      setFeedback("");
  
      await createBudget(formData, token!);
  
      onClose();
    } catch (error: any) {
      console.log(
        "ERRO CREATE BUDGET:",
        error?.response?.data || error?.message || error
      );
  
      // MUITO IMPORTANTE:
      // repassa o erro para o OrcamentoForm
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
      onRequestClose={() => (closeRef.current ? closeRef.current() : onClose())}
    >
      <View style={{ flex: 1 }}>
        <OrcamentoForm mode="add" onClose={onClose} onSave={handleSave} clientsList={clientsList} clientsLoaded={clientsLoaded} closeRef={closeRef} feedbackMessage={feedback} />
      </View>
    </Modal>
  );
}
