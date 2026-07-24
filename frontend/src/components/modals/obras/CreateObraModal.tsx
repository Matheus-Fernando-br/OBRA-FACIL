import { Modal, View, Alert } from "react-native";
import { useState, useEffect } from "react";

import { ObrasForm } from "@/components/forms/ObrasForms";

import { useAuth } from "@/contexts/AuthContext";

import { createWork, getClients } from "@/services/api";

import { Obra, Orcamento, Cliente } from "@/components/layout/interface";

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

  const [clientsList, setClientsList] = useState<Cliente[]>([]);

  useEffect(() => {
    if (visible && token) {
      getClients(token).then(setClientsList);
    }
  }, [visible, token]);

  const handleSave = async (formData: any) => {
    console.log("HANDLE SAVE CHAMADO");
    console.log(formData);
    try {
      if (!budget) {
        Alert.alert("Erro", "Nenhum orçamento selecionado.");
        return;
      }

      if (!token) {
        Alert.alert("Erro", "Usuário não autenticado.");
        return;
      }

      if (!user?._id) {
        Alert.alert("Erro", "Responsável não encontrado.");
        return;
      }

      if (!formData.data_inicio_prevista) {
        Alert.alert("Atenção", "Informe a data de início.");
        return;
      }

      if (!formData.data_fim_prevista) {
        Alert.alert("Atenção", "Informe a data de término.");
        return;
      }

      setLoading(true);

      const work = {
        ...formData,
        orcamento: budget._id,
        responsavel: user._id,
      };

      console.log("========== CREATE WORK ==========");
      console.log(JSON.stringify(work, null, 2));

      const response = await createWork(work as any, token);

      console.log("========== RESPOSTA ==========");
      console.log(response);

      Alert.alert("Sucesso", "Obra criada com sucesso!");

      onSuccess();

      onClose();
    } catch (error: any) {
      console.log("========== ERRO ==========");

      console.log(error.response?.status);

      console.log(error.response?.data);

      console.log(error);

      Alert.alert(
        "Erro",
        error.response?.data?.error ?? "Não foi possível criar a obra.",
      );
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
          clientsList={clientsList}
          loading={loading}
          onClose={onClose}
          onSave={handleSave}
        />
      </View>
    </Modal>
  );
}
