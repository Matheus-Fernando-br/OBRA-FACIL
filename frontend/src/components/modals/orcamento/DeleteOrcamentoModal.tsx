import { Modal, View, Text, Alert } from "react-native";

import { useState } from "react";

import { COLORS, globalStyles } from "@/styles/globalStyles";

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
  const { token } = useAuth();

  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    try {
      if (!token) return;

      setLoading(true);

      await deleteBudget(budgetId, token);

      Alert.alert("Sucesso", "Orçamento excluído com sucesso.");

      onSuccess();

      onClose();
    } catch (error: any) {
      Alert.alert(
        "Erro",
        error?.response?.data?.message ?? "Erro ao excluir orçamento.",
      );
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
            Excluir orçamento
          </Text>

          <Text
            style={{
              fontSize: 16,
              color: "#64748B",
              textAlign: "center",
              marginBottom: 25,
              lineHeight: 24,
            }}
          >
            Tem certeza que deseja excluir o orçamento{" "}
            <Text
              style={{
                fontWeight: "700",
                color: COLORS.text,
              }}
            >
              {budgetName}
            </Text>
            ?{"\n\n"}
            Essa ação não poderá ser desfeita.
          </Text>

          <AppButton
            title="Excluir Orçamento"
            loading={loading}
            onPress={handleDelete}
          />

          <View
            style={{
              height: 10,
            }}
          />

          <AppButton title="Cancelar" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}
