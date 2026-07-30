import { Modal, View, Text, Pressable, ScrollView } from "react-native";
import { useState, useRef } from "react";

import { COLORS, globalStyles } from "../../../styles/globalStyles";
import { AppInput } from "../../forms/AppInput";
import { AppButton } from "../../buttons/AppButton";
import { Ionicons } from "@expo/vector-icons";
import {
  documentMask,
  emailMask,
  phoneMask,
  onlyNumbers,
} from "@/components/forms/mask";

import { createClient } from "../../../services/api";

import { useAuth } from "@/contexts/AuthContext";

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function AddClientModal({ visible, onClose }: Props) {
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();
  const [feedback, setFeedback] = useState("");
  const documento = onlyNumbers(cpf);
  const telefoneLimpo = onlyNumbers(telefone);
  const scrollRef = useRef<ScrollView>(null);
  const salvarRef = useRef<View>(null);
  const irParaSalvar = () => {
    scrollRef.current?.scrollToEnd({
      animated: true,
    });
  };
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

      await createClient(
        {
          nome: nome.trim(),
          email: email.trim(),
          telefone: telefoneLimpo,
          CPF: documento.length === 11 ? documento : undefined,
          CNPJ: documento.length === 14 ? documento : undefined,
        },
        token,
      );

      setFeedback("Cliente cadastrado com sucesso!");

      setNome("");
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
        <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View style={globalStyles.addCard}>
              <View style={globalStyles.modalHeader}>
                <Pressable onPress={onClose} style={globalStyles.leftAction}>
                  <Ionicons name="arrow-back" size={25} color={COLORS.text} />
                </Pressable>

                <Text style={globalStyles.addTitle}>Novo cliente</Text>

                <Pressable
                  onPress={irParaSalvar}
                  style={globalStyles.rightAction}
                >
                  <Ionicons name="person-add" size={25} color={COLORS.title} />
                </Pressable>
              </View>

              <Text style={globalStyles.subtitle}>Informações Pessoais</Text>
              <View style={globalStyles.divider} />

              <Text style={globalStyles.label}>Nome</Text>
              <AppInput
                placeholder="Informe o nome do cliente completo"
                value={nome}
                onChangeText={setNome}
              />

              <Text style={globalStyles.label}>CPF / CNPJ</Text>
              <AppInput
                placeholder="Informe o CPF / CNPJ do cliente a ser cadastrado"
                value={cpf}
                onChangeText={(text) => setCpf(documentMask(text))}
              />

              <Text style={globalStyles.subtitle}>Contato</Text>
              <View style={globalStyles.divider} />

              <Text style={globalStyles.label}>E-mail</Text>
              <AppInput
                placeholder="Informe o e-mail do cliente a ser cadastrado"
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
              <View ref={salvarRef}>
                <AppButton
                  title="Salvar cliente"
                  loading={loading}
                  onPress={handleSave}
                  color={COLORS.primary}
                />
              </View>
            </View>
          </Pressable>
        </ScrollView>
      </Pressable>
    </Modal>
  );
}
