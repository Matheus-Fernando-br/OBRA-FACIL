import { Modal, View, Text } from "react-native";
import { useState } from "react";

import { COLORS, globalStyles } from "@/styles/globalStyles";

import { useAuth } from "@/contexts/AuthContext";

import { deleteWork } from "@/services/api";

import { AppButton } from "@/components/buttons/AppButton";

interface Props {
  visible: boolean;
  WorkId: string;
  WorkName: string;
  onClose(): void;
  onSuccess(): void;
}

export function DeleteObraModal({
  visible,
  WorkId,
  WorkName,
  onClose,
  onSuccess,
}: Props) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");

  async function handleDelete() {
    try {
      setFeedback("");
      if (!token) return;
      setLoading(true);

      await deleteWork(WorkId, token);

      setFeedback("Serviço Deletado com sucesso!");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.log("ERRO AO DELETAR SERVIÇO:", error?.response?.data);

      setFeedback(error?.response?.data?.message ?? "Erro ao deletar Serviço.");

      setTimeout(() => {
        setFeedback("");
      }, 5000);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,.6)",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View
          style={{
            width: "90%",
            backgroundColor: COLORS.white,
            borderRadius: 20,
            padding: 25,
          }}
        >
          <Text
            style={{
              fontSize: 22,
              fontWeight: "700",
              marginBottom: 15,
              textAlign: "center",
            }}
          >
            Excluir Serviço
          </Text>

          <Text
            style={{
              fontSize: 16,
              color: COLORS.placeholder,
              textAlign: "center",
              marginBottom: 25,
              lineHeight: 24,
            }}
          >
            Tem certeza que deseja excluir o Serviço{" "}
            <Text
              style={{
                fontWeight: "700",
                color: COLORS.text,
              }}
            >
              {WorkName}
            </Text>
            ?{"\n\n"}
            Essa ação não poderá ser desfeita.
          </Text>

          {feedback !== "" && (
            <Text style={globalStyles.feedback}>{feedback}</Text>
          )}

          <AppButton
            title="Excluir Serviço"
            loading={loading}
            onPress={handleDelete}
            color={COLORS.primary}
          />

          <View
            style={{
              height: 10,
            }}
          />

          <AppButton title="Cancelar" onPress={onClose} color={COLORS.danger} />
        </View>
      </View>
    </Modal>
  );
}
