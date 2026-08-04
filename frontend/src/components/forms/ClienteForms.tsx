import { useState, useEffect, useRef } from "react";

import { View, Text, Pressable, ScrollView } from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { COLORS, globalStyles } from "@/styles/globalStyles";
import { CardOrcamentoCliente } from "@/components/cards/orcamento/CardOrcamentoCliente";
import { AppInput } from "@/components/forms/AppInput";
import { AppButton } from "@/components/buttons/AppButton";

import {
  documentMask,
  emailMask,
  phoneMask,
  onlyNumbers,
} from "@/components/forms/mask";

import { Cliente } from "@/components/layout/interface";
import { useAuth } from "@/contexts/AuthContext";
import { EditClientModal } from "../modals/cliente/EditClientModal";

export interface ClientFormData {
  nome: string;
  email: string;
  telefone: string;
  CPF?: string;
  CNPJ?: string;
}

interface ClientFormProps {
  mode: "add" | "edit" | "details";
  initialData?: Cliente | null;
  onClose: () => void;
  onSave?: (data: ClientFormData) => Promise<void>;
  onSuccess?: () => void;
  onEdit?: () => void;
}

export function ClientForm({
  mode,
  initialData,
  onClose,
  onSave,
  onSuccess,
  onEdit,
}: ClientFormProps) {
  const { token } = useAuth();

  const isReadOnly = mode === "details";

  // ===========================
  // STATES
  // ===========================

  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");

  const [feedback, setFeedback] = useState("");

  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [loadingClose, setLoadingClose] = useState(false);

  const documento = onlyNumbers(cpf);
  const telefoneLimpo = onlyNumbers(telefone);

  // ===========================
  // SCROLL
  // ===========================

  const scrollRef = useRef<ScrollView>(null);

  const salvarRef = useRef<View>(null);

  function irParaSalvar() {
    scrollRef.current?.scrollToEnd({
      animated: true,
    });
  }

  // ===========================
  // PREENCHER DADOS
  // ===========================

  useEffect(() => {
    if (!initialData) {
      limparFormulario();
      return;
    }

    setNome(initialData.nome);

    setEmail(initialData.email);

    setTelefone(phoneMask(initialData.telefone || ""));

    setCpf(documentMask(initialData.CPF || initialData.CNPJ || ""));
  }, [initialData]);

  // ===========================
  // HELPERS
  // ===========================

  function limparFormulario() {
    setNome("");
    setCpf("");
    setEmail("");
    setTelefone("");
  }

  function limparFeedback() {
    setTimeout(() => {
      setFeedback("");
    }, 5000);
  }

  // ===========================
  // VALIDAÇÃO
  // ===========================

  function validateForm(): boolean {
    setFeedback("");

    if (!token) {
      setFeedback("Sessão expirada. Faça login novamente.");
      return false;
    }

    if (!nome.trim()) {
      setFeedback("Informe o nome do cliente.");
      return false;
    }

    if (!documento.trim()) {
      setFeedback("Informe o CPF/CNPJ do cliente.");
      return false;
    }

    if (documento.length !== 11 && documento.length !== 14) {
      setFeedback("O CPF deve conter 11 dígitos ou o CNPJ 14 dígitos.");
      return false;
    }

    if (!email.trim()) {
      setFeedback("Informe o e-mail.");
      return false;
    }

    if (!email.includes("@")) {
      setFeedback("Informe um e-mail válido.");
      return false;
    }

    if (!telefoneLimpo.trim()) {
      setFeedback("Informe o telefone.");
      return false;
    }

    if (telefoneLimpo.length < 10 || telefoneLimpo.length > 11) {
      setFeedback("O telefone deve conter 10 ou 11 dígitos.");
      return false;
    }

    return true;
  }
  // ===========================
  // SUBMIT
  // ===========================

  async function handleSubmit() {
    try {
      if (isReadOnly) {
        return onClose();
      }

      if (loadingSubmit) return;

      if (!validateForm()) return;

      setLoadingSubmit(true);

      const clientData: ClientFormData = {
        nome: nome.trim(),
        email: email.trim(),
        telefone: telefoneLimpo,
        CPF: documento.length === 11 ? documento : undefined,
        CNPJ: documento.length === 14 ? documento : undefined,
      };

      await onSave?.(clientData);

      setFeedback(
        mode === "add"
          ? "Cliente cadastrado com sucesso!"
          : "Cliente atualizado com sucesso!",
      );

      onSuccess?.();

      setTimeout(() => {
        limparFormulario();
        onClose();
      }, 1200);
    } catch (error: any) {
      console.log("ERRO AO SALVAR CLIENTE:", error?.response?.data || error);

      setFeedback(
        error?.response?.data?.message ||
          (mode === "add"
            ? "Erro ao cadastrar cliente."
            : "Erro ao atualizar cliente."),
      );

      limparFeedback();
    } finally {
      setLoadingSubmit(false);
    }
  }

  // ===========================
  // FECHAR
  // ===========================

  async function handleClose() {
    if (loadingSubmit) return;

    setLoadingClose(true);

    setFeedback(
      mode === "add"
        ? "Cancelando cadastro..."
        : mode === "edit"
          ? "Cancelando alterações..."
          : "Fechando...",
    );

    setTimeout(() => {
      onClose();

      setLoadingClose(false);

      setFeedback("");
    }, 1200);
  }

  // ===========================
  // RENDER
  // ===========================

  return (
    <View style={globalStyles.container}>
      <View style={globalStyles.modalHeader}>
        <Pressable
          onPress={onClose}
          style={globalStyles.leftAction}
          disabled={loadingSubmit}
        >
          <Ionicons name="arrow-back" size={25} color={COLORS.text} />
        </Pressable>

        <Text style={globalStyles.addTitle}>
          {mode === "add"
            ? "Novo Cliente"
            : mode === "edit"
              ? "Editar Cliente"
              : "Detalhes do Cliente"}
        </Text>

        <Pressable onPress={mode === "details" ? onEdit : irParaSalvar} style={globalStyles.rightAction}>
        <Text style={globalStyles.saveText}>
            {mode === "details" ? "Editar" : "Salvar"}
          </Text>
          <Ionicons
            name={
              mode === "add"
                ? "person-add"
                : mode === "edit"
                  ? "download"
                  : "pencil-sharp"
            }
            size={25}
            color={COLORS.title}
          />
        </Pressable>
      </View>

      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false}>
        <View style={globalStyles.addCard}>
          <Text style={globalStyles.subtitle}>Informações Pessoais</Text>

          <View style={globalStyles.divider} />

          <Text style={globalStyles.label}>Nome</Text>

          <AppInput
            placeholder="Informe o nome do cliente"
            value={nome}
            onChangeText={setNome}
            editable={!isReadOnly}
          />

          <Text style={globalStyles.label}>CPF / CNPJ</Text>

          <AppInput
            placeholder="Informe o CPF ou CNPJ"
            value={cpf}
            onChangeText={(text) => setCpf(documentMask(text))}
            editable={!isReadOnly}
          />

          <Text style={[globalStyles.subtitle, { marginTop: 20 }]}>
            Contato
          </Text>

          <View style={globalStyles.divider} />
          <View style={globalStyles.row}>
            <View style={globalStyles.column}>
              <Text style={globalStyles.label}>E-mail</Text>

              <AppInput
                placeholder="cliente@email.com"
                value={email}
                onChangeText={(text) => setEmail(emailMask(text))}
                editable={!isReadOnly}
              />
            </View>
            <View style={globalStyles.column}>
              <Text style={globalStyles.label}>Telefone</Text>

              <AppInput
                placeholder="(00) 00000-0000"
                value={telefone}
                onChangeText={(text) => setTelefone(phoneMask(text))}
                editable={!isReadOnly}
              />
            </View>
          </View>
          {isReadOnly && (
            <>
              <Text style={globalStyles.subtitle}>Orçamentos Associados</Text>
              <View style={globalStyles.divider} />
              <CardOrcamentoCliente
                name="Teste"
                value={1000}
                status="Aprovado"
                onClick={onClose}
              />
              <View style={globalStyles.divider} />
            </>
          )}
          {feedback !== "" && (
            <Text style={globalStyles.feedback}>{feedback}</Text>
          )}

          <View ref={salvarRef}>
            {!isReadOnly && (
              <AppButton
                title={mode === "add" ? "Salvar Cliente" : "Salvar Alterações"}
                onPress={handleSubmit}
                loading={loadingSubmit}
                color={COLORS.primary}
              />
            )}
          </View>
          {!isReadOnly && (
            <AppButton
              title={
                mode === "add" ? "Cancelar Cadastro" : "Cancelar Alterações"
              }
              onPress={handleClose}
              loading={loadingClose}
              color={COLORS.danger}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}
