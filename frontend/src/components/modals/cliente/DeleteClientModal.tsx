import { useTheme } from "@/contexts/ThemeContext";
import { Modal, View, Text, Pressable } from "react-native";
import { useState } from "react";
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
  const { styles, theme } = useTheme();
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
          <View style={styles.addCard}>
            <View style={styles.modalHeader}>
            <Pressable onPress={onClose} style={styles.leftAction}>
                <Ionicons name="chevron-back" size={26} color={theme.primary} />
              </Pressable>

              <Text style={styles.addTitle}>Excluir Cliente</Text>

              <Pressable onPress={handleDelete} style={styles.rightAction}>
                <View style={styles.saveTextStack}>
                  <Text style={styles.saveText}>Excluir</Text>
                  <Text style={styles.saveText}>Cliente</Text>
                </View>
                <Ionicons name="person-remove" size={20} color={theme.title} />
              </Pressable>

            </View>

            <View style={styles.divider} />

            <Text style={styles.label}>
              Deseja realmente excluir o cliente:
            </Text>

            <Text
              style={{
                color: theme.danger,
                fontWeight: "bold",
                marginBottom: 20,
              }}
            >
              {clientName}
            </Text>
            <View style={styles.divider} />
            {feedback !== "" && (
              <Text style={styles.feedback}>{feedback}</Text>
            )}

            <AppButton
              title="Excluir Cliente"
              loading={loading}
              onPress={handleDelete}
              color={theme.danger}
            />

            <AppButton variant="secondary" title="Cancelar" onPress={onClose} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
