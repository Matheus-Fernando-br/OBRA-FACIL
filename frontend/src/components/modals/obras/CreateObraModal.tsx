import { Modal, View } from "react-native";
import { useState } from "react";

import { ObrasForm } from "@/components/forms/ObrasForms";

import { useAuth } from "@/contexts/AuthContext";

import { createWork } from "@/services/api";

import { Cliente, Orcamento } from "@/components/layout/interface";

interface Props {
  visible: boolean;
  budget: Orcamento | null;
  onClose(): void;
  onSuccess(): void;
}

export function CreateObraModal({
  visible,
  budget,
  onClose,
  onSuccess,
}: Props) {
  const { token, user } = useAuth();

  const [loading, setLoading] = useState(false);

  // Erros são lançados para o ObrasForm exibir a mensagem no formulário
  // (Alert.alert não aparece na versão web).
  const handleSave = async (formData: any) => {
    if (!budget) throw new Error("Nenhum orçamento selecionado.");
    if (!token || !user?._id) throw new Error("Sessão expirada. Entre novamente.");
    if (!formData.data_inicio_prevista) throw new Error("Informe a data de início.");
    if (!formData.data_fim_prevista) throw new Error("Informe a data de término.");

    try {
      setLoading(true);

      await createWork(
        { ...formData, orcamento: budget._id, responsavel: user._id } as any,
        token,
      );

      onSuccess();
      onClose();
    } catch (error: any) {
      console.log("ERRO AO CRIAR OBRA:", error?.response?.data || error);
      throw new Error(error?.response?.data?.message ?? "Não foi possível criar a obra.");
    } finally {
      setLoading(false);
    }
  };

  if (!budget) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <View
        style={{
          flex: 1,
        }}
      >
        <ObrasForm
          mode="add"
          budget={budget}
          loading={loading}
          onClose={onClose}
          onSave={handleSave}
        />
      </View>
    </Modal>
  );
}
