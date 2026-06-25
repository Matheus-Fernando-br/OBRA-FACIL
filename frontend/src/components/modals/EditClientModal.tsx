import { Modal, View, Text, Pressable, Alert } from "react-native";
import { useState, useEffect } from "react";

import { globalStyles } from "../../styles/globalStyles";
import { AppInput } from "../forms/AppInput";
import { AppButton } from "../buttons/AppButton";
import { Ionicons } from "@expo/vector-icons";

import { updateClient } from "../../services/api";

import { useAuth } from "@/contexts/AuthContext";
import { COLORS } from "../../styles/globalStyles";

interface Props {
    visible: boolean;
    onClose: () => void;
  
    client: {
      _id: string;
      nome: string;
      email: string;
      CPF: string;
    } | null;
  }

export function EditClientModal({ visible, onClose, client }: Props) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [CPF, setCPF] = useState("");
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  async function handleSave() {
    try {
      if (!nome.trim()) {
        Alert.alert("Erro", "Informe o nome do cliente");
        return;
      }

      if (!email.trim()) {
        Alert.alert("Erro", "Informe o e-mail do cliente");
        return;
      }

      setLoading(true);

      if (!client) return;

      await updateClient(
        client._id,
        {
          nome,
          email,
          CPF,
        },
        token || ""
      );

      Alert.alert("Sucesso", "Cliente atualizado com sucesso!");

      setNome("");
      setEmail("");
      setCPF("");

      onClose();
    } catch (error: any) {
      console.log("ERRO CLIENTE:", error?.response?.data || error);

      Alert.alert(
        "Erro",
        error?.response?.data?.message || "Erro ao atualizar cliente"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (client) {
      setNome(client.nome);
      setEmail(client.email);
      setCPF(client.CPF || "");
    }
  }, [client]);

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
              <Text style={globalStyles.addTitle}>Editar cliente</Text>

              <Pressable onPress={onClose}>
                <Ionicons name="close" size={30} color="#FFF" />
              </Pressable>
            </View>

            <View style={globalStyles.divider} />

            <Text style={globalStyles.label}>Nome</Text>
            <AppInput
              placeholder="Nome"
              value={nome}
              onChangeText={setNome}
            />

            <Text style={globalStyles.label}>E-mail</Text>
            <AppInput
              placeholder="cliente@email.com"
              value={email}
              onChangeText={setEmail}
            />

            <Text style={globalStyles.label}>CPF</Text>
            <AppInput
              placeholder="CPF"
              value={CPF}
              onChangeText={setCPF}
            />

            <View style={globalStyles.divider} />

            <AppButton
              title={loading ? "Salvando..." : "Salvar Alterações do cliente"}
              onPress={handleSave}
            />

            <AppButton
              title="Cancelar alterações do cliente"
              onPress={onClose}
                color={COLORS.danger}
            />

          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}