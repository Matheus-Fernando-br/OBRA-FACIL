import { Modal, View, Alert } from "react-native";
import { useState } from "react";

import { ObrasForm } from "@/components/forms/ObrasForms";

import { useAuth } from "@/contexts/AuthContext";

import { createWork } from "@/services/api";

import { Obra, Orcamento } from "@/components/layout/interface";

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

  async function handleCreate(data: any) {
    if (!budget) return;

    if (!token) return;

    try {
      setLoading(true);

      const categoriasDaObra = budget.categoria.map((categoria) => ({
        nome: categoria.nome,

        qt_dias_prevista: 0,

        qt_dias_real: 0,

        porcentagem_de_conclusao: 0,

        servicos: categoria.servicos.map((servico) => ({
          nome: servico.nome,

          descricao: servico.descricao,

          qt_dias_prevista: 0,

          qt_dias_real: 0,

          porcentagem_de_conclusao: 0,
        })),
      }));

      const work: Obra = {
        _id: "",

        orcamento: budget._id,

        responsavel: user!._id,

        categoria: categoriasDaObra,

        status: "NOPRAZO",

        data_inicio_prevista: new Date(data.data_inicio_prevista),

        data_fim_prevista: new Date(data.data_fim_prevista),

        porcentagem_de_conclusao: 0,
      };

      console.log("========= OBRA ENVIADA =========");
      console.log(JSON.stringify(work, null, 2));

      await createWork(work, token);

      Alert.alert("Sucesso", "Obra criada com sucesso!");

      onSuccess();

      onClose();
    } catch (error: any) {
      console.log("ERRO CREATE WORK");

      console.log(error.response?.status);

      console.log(error.response?.data);

      console.log(error.response);

      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  if (!budget) return null;

  return (
    <Modal visible={visible} animationType="slide">
      <View
        style={{
          flex: 1,
        }}
      >
        <ObrasForm
          budget={budget}
          loading={loading}
          onClose={onClose}
          onSave={handleCreate}
        />
      </View>
    </Modal>
  );
}
