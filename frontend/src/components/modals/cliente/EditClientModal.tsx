import { Modal, View, Text, Pressable, ScrollView } from "react-native";
import { useState, useEffect, useRef } from "react";

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
import { ClientForm } from "@/components/forms/ClienteForms";

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

      if (!client) return;

      await updateClient(
        client._id,
        {
          _id: client._id,
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
      <View
        style={{
          flex: 1,
        }}
      >
        <ClientForm
          mode="edit"
          initialData={client}
          onClose={onClose}
          onSuccess={onSuccess}
          onSave={async (data) => {
            if (!token || !client) return;

            await updateClient(
              client._id,
              {
                _id: client._id,
                ...data,
              },
              token,
            );
          }}
        />
      </View>
    </Modal>
  );
}
