import { useState } from "react";
import { Modal } from "react-native";

import { ObrasForm } from "../../forms/ObrasForms";

import { Cliente, Obra, Orcamento } from "@/components/layout/interface";

import { updateWork } from "@/services/api";

import { useAuth } from "@/contexts/AuthContext";

interface Props {
  visible: boolean;
  work: Obra | null;
  budget: Orcamento |null;
  clientsList: Cliente[];
  onClose(): void;
  onSuccess(): void;
}

export function EditObraModal({visible, work, budget, clientsList, onClose, onSuccess}: Props) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);

  if (!work || !budget) return null;

  async function handleSave(data: any) {
    try {
      if (!token) return;

      setLoading(true);

      await updateWork(
        token,
        work._id,
        data,
      );
      onClose();
      onSuccess();
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <ObrasForm
        mode="edit"
        budget={budget}
        work={work}
        clientsList={clientsList}
        loading={loading}
        onClose={onClose}
        onSave={handleSave}
      />
    </Modal>
  );
}