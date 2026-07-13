import { Modal, View, Text, Pressable } from "react-native";
import { useState, useEffect } from "react";

import { globalStyles } from "../../../styles/globalStyles";
import { AppInput } from "../../forms/AppInput";
import { AppButton } from "../../buttons/AppButton";
import { Ionicons } from "@expo/vector-icons";

import { updateClient } from "../../../services/api";
import {
  documentMask,
  emailMask,
  phoneMask,
  onlyNumbers,
} from "@/components/forms/mask";
import { Cliente } from "@/components/layout/interface";
import { useAuth } from "@/contexts/AuthContext";
import { COLORS } from "../../../styles/globalStyles";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  client: Cliente | null;
}

export function EditClientModal({
  visible,
  onClose,
  onSuccess,
  client,
}: Props) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingClose, setLoadingClose] = useState(false);
  const { token } = useAuth();
  const [feedback, setFeedback] = useState("");
  const documento = onlyNumbers(cpf);
  const telefoneLimpo = onlyNumbers(telefone);

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

      if (!documento.trim()) {
        setFeedback("Informe o CPF/CNPJ do cliente");
        return;
      }

      if (documento.length !== 11 && documento.length !== 14) {
        setFeedback("O CPF deve conter 11 dígitos ou o CNPJ 14 dígitos.");
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
      if (!telefoneLimpo.trim()) {
        setFeedback("Informe o telefone do cliente");
        return;
      }

      if (telefoneLimpo.length < 10 || telefoneLimpo.length > 11) {
        setFeedback("O telefone deve conter 10 ou 11 dígitos.");
        return;
      }

      setLoading(true);

      if (!client) return;

      await updateClient(
        client._id,
        {
          nome: nome.trim(),
          email: email.trim(),
          telefone: telefoneLimpo,
          CPF: documento.length === 11 ? documento : undefined,
          CNPJ: documento.length === 14 ? documento : undefined,
        },
        token || "",
      );

      setFeedback("Cliente atualizado com sucesso!");

      setNome("");
      setEmail("");
      setCpf("");
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
      setCpf(documentMask(client.CPF || client.CNPJ || ""));
      setTelefone(phoneMask(client.telefone || ""));
    }
  }, [client]);

  async function handleClose() {
    setLoadingClose(true);
    setFeedback("Cancelando alterações...");
    setTimeout(() => {
      onClose();
      setLoadingClose(false);
      setFeedback("");
    }, 1500);
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
              <Pressable onPress={onClose} style={globalStyles.leftAction}>
                <Ionicons name="arrow-back" size={25} color={COLORS.text} />
              </Pressable>

              <Text style={globalStyles.addTitle}>Editar cliente</Text>

              <Pressable onPress={handleSave} style={globalStyles.rightAction}>
                <View style={globalStyles.saveTextStack}>
                  <Text style={globalStyles.saveText}>Atualizar</Text>
                  <Text style={globalStyles.saveText}>Cliente</Text>
                </View>
                <Ionicons name="download" size={20} color={COLORS.title} />
              </Pressable>
            </View>

            <Text style={globalStyles.subtitle}>Informações Pessoais</Text>
            <View style={globalStyles.divider} />

            <Text style={globalStyles.label}>Nome</Text>
            <AppInput placeholder="Nome" value={nome} onChangeText={setNome} />

            <Text style={globalStyles.label}>CPF / CNPJ</Text>
            <AppInput
              placeholder="CPF"
              value={cpf}
              onChangeText={(text) => setCpf(documentMask(text))}
            />

            <Text style={globalStyles.subtitle}>Contato</Text>
            <View style={globalStyles.divider} />

            <Text style={globalStyles.label}>E-mail</Text>
            <AppInput
              placeholder="cliente@email.com"
              value={email}
              onChangeText={(text) => setEmail(emailMask(text))}
            />

            <Text style={globalStyles.label}>Telefone</Text>
            <AppInput
              placeholder="Informe o Telefone do cliente a ser cadastrado"
              value={telefone}
              onChangeText={(text) => setTelefone(phoneMask(text))}
            />

            <View style={globalStyles.divider} />
            {feedback !== "" && (
              <Text style={globalStyles.feedback}>{feedback}</Text>
            )}
            <AppButton
              title="Salvar Alterações do cliente"
              loading={loading}
              onPress={handleSave}
              color={COLORS.primary}
            />

            <AppButton
              title="Cancelar alterações do cliente"
              onPress={handleClose}
              loading={loadingClose}
              color={COLORS.danger}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
