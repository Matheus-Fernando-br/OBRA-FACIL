import { Modal, View, Text, Pressable } from "react-native";
import { useState } from "react";
import { COLORS, globalStyles } from "../../../styles/globalStyles";
import { AppButton } from "../../buttons/AppButton";
import { Ionicons } from "@expo/vector-icons";
import { deleteClient } from "../../../services/api";

import { useAuth } from "@/contexts/AuthContext";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  clientId: string;
  clientName: string;
}

export function DeleteClientModal({
  visible,
  onClose,
  onSuccess,
  clientId,
  clientName,
}: Props) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");

  async function handleDelete() {
    try {
      setFeedback("");
      if (!token) {
        setFeedback("Sessão expirada. Faça login novamente.");
        return;
      }

      setLoading(true);

      await deleteClient(clientId, token);

      setFeedback("Cliente removido com sucesso!");

      onSuccess?.();
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (error: any) {
      console.log("ERRO AO REMOVER CLIENTE:", error?.response?.data);

      setFeedback(error?.response?.data?.message ?? "Erro ao remover cliente.");

      setTimeout(() => {
        setFeedback("");
      }, 5000);
    } finally {
      setLoading(false);
      setFeedback("");
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <Pressable
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.6)",
          justifyContent: "flex-end",
        }}
        onPress={onClose}
      >
        <Pressable onPress={(e) => e.stopPropagation()}>
          <View style={globalStyles.addCard}>
            <View style={globalStyles.modalHeader}>
              <Text style={globalStyles.addTitle}>Excluir Cliente</Text>

              <Pressable onPress={onClose}>
                <Ionicons name="close" size={30} color="#FFF" />
              </Pressable>
            </View>

            <View style={globalStyles.divider} />

            <Text style={globalStyles.label}>
              Deseja realmente excluir o cliente:
            </Text>

            <Text
              style={{
                color: COLORS.danger,
                fontWeight: "bold",
                marginBottom: 20,
              }}
            >
              {clientName}
            </Text>
            <View style={globalStyles.divider} />
            {feedback !== "" && (
              <Text style={globalStyles.feedback}>{feedback}</Text>
            )}

            <AppButton
              title="Excluir Cliente"
              loading={loading}
              onPress={handleDelete}
              color={COLORS.danger}
            />

            <AppButton title="Cancelar" onPress={onClose} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
