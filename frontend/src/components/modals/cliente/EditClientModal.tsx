import { Modal, View, Text, Pressable } from "react-native";
import { useState, useEffect } from "react";

import { globalStyles } from "../../../styles/globalStyles";
import { AppInput } from "../../forms/AppInput";
import { AppButton } from "../../buttons/AppButton";
import { Ionicons } from "@expo/vector-icons";

import { updateClient } from "../../../services/api";
import { documentMask, emailMask } from "@/components/forms/mask";

import { useAuth } from "@/contexts/AuthContext";
import { COLORS } from "../../../styles/globalStyles";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  client: {
    _id: string;
    nome: string;
    email: string;
    CPF: string;
  } | null;
}

export function EditClientModal({
  visible,
  onClose,
  onSuccess,
  client,
}: Props) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [CPF, setCPF] = useState("");
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();
  const [feedback, setFeedback] = useState("");

  async function handleSave() {
    try {
      setFeedback("");

      if (!token) {
        setFeedback("Sessão expirada. Faça login novamente.");
        return;
      }

      if (!nome.trim()) {
        setFeedback("Informe o nome do cliente");
        return;
      }

      if (!email.trim()) {
        setFeedback("Informe o e-mail do cliente");
        return;
      }

      if (!email.includes("@")) {
        setFeedback("Informe um e-mail válido.");
        return;
      }

      if (!CPF.trim()) {
        setFeedback("Informe o CPF/CNPJ do cliente");
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
        token || "",
      );

      setFeedback("Cliente atualizado com sucesso!");

      setNome("");
      setEmail("");
      setCPF("");
      onSuccess?.();
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (error: any) {
      console.log("ERRO AO ATUALIZAR CLIENTE:", error?.response?.data || error);

      setFeedback(
        error?.response?.data?.message || "Erro ao atualizar cliente",
      );

      setTimeout(() => {
        setFeedback("");
      }, 5000);
    } finally {
      setLoading(false);
      setTimeout(() => {
        setFeedback("");
      }, 5000);
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
            <AppInput placeholder="Nome" value={nome} onChangeText={setNome} />

            <Text style={globalStyles.label}>E-mail</Text>
            <AppInput
              placeholder="cliente@email.com"
              value={email}
              onChangeText={(text) => setEmail(emailMask(text))}
            />

            <Text style={globalStyles.label}>CPF</Text>
            <AppInput
              placeholder="CPF"
              value={CPF}
              onChangeText={(text) => setCPF(documentMask(text))}
            />

            <View style={globalStyles.divider} />
            {feedback !== "" && (
              <Text style={globalStyles.feedback}>{feedback}</Text>
            )}
            <AppButton
              title="Salvar Alterações do cliente"
              loading={loading}
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
