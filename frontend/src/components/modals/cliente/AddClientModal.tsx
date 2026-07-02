import { Modal, View, Text, Pressable } from "react-native";
import { useState } from "react";

import { COLORS, globalStyles } from "../../../styles/globalStyles";
import { AppInput } from "../../forms/AppInput";
import { AppButton } from "../../buttons/AppButton";
import { Ionicons } from "@expo/vector-icons";
import { documentMask, emailMask } from "@/components/forms/mask";

import { createClient } from "../../../services/api";

import { useAuth } from "@/contexts/AuthContext";

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function AddClientModal({ visible, onClose }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
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

      if (!name.trim()) {
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

      if (!cpf.trim()) {
        setFeedback("Informe o CPF/CNPJ do cliente");
        return;
      }

      setLoading(true);

      await createClient(
        {
          nome: name.trim(),
          email: email.trim(),
          CPF: cpf.trim(),
        },
        token,
      );

      setFeedback("Cliente cadastrado com sucesso!");

      setName("");
      setEmail("");
      setCpf("");
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (error: any) {
      console.log("ERRO AO CADASTRAR CLIENTE:", error?.response?.data);

      setFeedback(
        error?.response?.data?.message ?? "Erro ao cadastrar cliente.",
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
              <Text style={globalStyles.addTitle}>Novo cliente</Text>

              <Pressable onPress={onClose}>
                <Ionicons name="close" size={30} color={COLORS.text} />
              </Pressable>
            </View>

            <View style={globalStyles.divider} />

            <Text style={globalStyles.label}>Nome</Text>
            <AppInput
              placeholder="Informe o nome do cliente completo"
              value={name}
              onChangeText={setName}
            />

            <Text style={globalStyles.label}>E-mail</Text>
            <AppInput
              placeholder="Informe o e-mail do cliente a ser cadastrado"
              value={email}
              onChangeText={(text) => setEmail(emailMask(text))}
            />

            <Text style={globalStyles.label}>CPF / CNPJ</Text>
            <AppInput
              placeholder="Informe o CPF / CNPJ do cliente a ser cadastrado"
              value={cpf}
              onChangeText={(text) => setCpf(documentMask(text))}
            />

            <View style={globalStyles.divider} />
            {feedback !== "" && (
              <Text style={globalStyles.feedback}>{feedback}</Text>
            )}
            <AppButton
              title="Salvar cliente"
              loading={loading}
              onPress={handleSave}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
