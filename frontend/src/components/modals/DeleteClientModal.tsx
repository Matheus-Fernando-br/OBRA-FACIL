import { Modal, View, Text, Alert } from "react-native";
import { useState } from "react";
import { COLORS } from "../../styles/globalStyles";
import { AppButton } from "../buttons/AppButton";

import { deleteClient } from "../../services/api";

import { useAuth } from "@/contexts/AuthContext";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  clientId: string;
  clientName: string;
}

export function DeleteClientModal({ visible, onClose, onSuccess ,clientId, clientName, }: Props) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  async function handleDelete() {
    try {
      setLoading(true);
      await deleteClient(clientId, token || "");

      Alert.alert(
        "Sucesso",
        "Cliente removido com sucesso!"
      );
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.log(error?.response?.data);

      Alert.alert(
        "Erro",
        error?.response?.data?.message ||
          "Erro ao remover cliente"
      );
    }
    finally{
      setLoading(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          padding: 20,
          backgroundColor: "rgba(0,0,0,0.7)",
        }}
      >
        <View
          style={{
            backgroundColor: COLORS.card,
            padding: 20,
            borderRadius: 12,
          }}
        >
          <Text
            style={{
              color: "#FFF",
              fontSize: 18,
              fontWeight: "bold",
              marginBottom: 10,
            }}
          >
            Excluir Cliente
          </Text>

          <Text
            style={{
              color: "#FFF",
              marginBottom: 20,
            }}
          >
            Deseja realmente excluir:
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

          <AppButton
            title="Excluir Cliente"
            loading={loading}
            onPress={handleDelete}
            color={COLORS.danger}
          />

          <AppButton
            title="Cancelar"
            onPress={onClose}
          />
        </View>
      </View>
    </Modal>
  );
}