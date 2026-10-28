import { useTheme } from "@/contexts/ThemeContext";
import { Modal, View, Text } from "react-native";

import { useState } from "react";


import { useAuth } from "@/contexts/AuthContext";

import { deleteBudget } from "@/services/api";

import { AppButton } from "@/components/buttons/AppButton";

interface Props {
  visible: boolean;
  budgetId: string;
  budgetName: string;
  onClose(): void;
  onSuccess(): void;
}

export function DeleteOrcamentoModal({
  visible,
  budgetId,
  budgetName,
  onClose,
  onSuccess,
}: Props) {
  const { styles, theme } = useTheme();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");

  async function handleDelete() {
    try {
      setFeedback("");
      if (!token) return;
      setLoading(true);

      await deleteBudget(budgetId, token);

      setFeedback("Serviço Deletado com sucesso!");

      onSuccess();
      onClose();
    } catch (error: any) {
      console.log("ERRO AO DELETAR ORÇAMENTO:", error?.response?.data);

      setFeedback(
        error?.response?.data?.message ?? "Erro ao deletar Orçamento.",
      );

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
          backgroundColor: theme.backgroundDestaque,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View
          style={{
            width: "90%",
            backgroundColor: theme.white,
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
            Excluir orçamento
          </Text>

          <Text
            style={{
              fontSize: 16,
              color: theme.placeholder,
              textAlign: "center",
              marginBottom: 25,
              lineHeight: 24,
            }}
          >
            Tem certeza que deseja excluir o orçamento{" "}
            <Text
              style={{
                fontWeight: "700",
                color: theme.text,
              }}
            >
              {budgetName}
            </Text>
            ?{"\n\n"}
            Essa ação não poderá ser desfeita.
          </Text>

          {feedback !== "" && (
            <Text style={styles.feedback}>{feedback}</Text>
          )}

          <AppButton
            title="Excluir Orçamento"
            loading={loading}
            onPress={handleDelete}
            color={theme.danger}
          />

          <View
            style={{
              height: 10,
            }}
          />

          <AppButton variant="secondary" title="Cancelar" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}
