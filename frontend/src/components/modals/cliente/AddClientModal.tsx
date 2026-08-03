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
import { ClientForm } from "@/components/forms/ClienteForms";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddClientModal({ visible, onClose, onSuccess }: Props) {
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
      onSuccess?.();
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
      <View
        style={{
          flex: 1,
        }}
      >
        <ClientForm
          mode="add"
          onClose={onClose}
          onSuccess={onSuccess}
          onSave={async (data) => {
            if (!token) return;

            await createClient(data, token);
          }}
        />
      </View>
    </Modal>
  );
}
