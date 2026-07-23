import { Modal, View } from "react-native";
import { useState, useEffect } from "react";
import { ObrasForm } from "../../forms/ObrasForms";
import { getClients, updateWork } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { Cliente, Obra } from "@/components/layout/interface";

interface Props {
  visible: boolean;
  work: Obra | null;
  onClose(): void;
  onSuccess(): void;
}

export function EditObraModal({
  visible,
  work,
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
    if (!work) return;
    setLoading(true);
    try {
      await updateWork(work._id, formData, token!);
      onClose();
      onSuccess();
    } catch (error) {
      setFeedback("Erro ao atualizar Orçamento.");
    } finally {
      setLoading(false);
    }
  };

  if (!work) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }}>
        <ObrasForm
          mode="edit"
          initialData={work}
          work={work}
          onClose={onClose}
          onSave={handleSave}
          clientsList={clientsList}
          feedbackMessage={feedback}
          loading={loading}
        />
      </View>
    </Modal>
  );
}
