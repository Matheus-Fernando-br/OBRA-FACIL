import { useState, useEffect, useRef } from "react";

import { View, Text, Pressable, ScrollView } from "react-native";
import { Picker } from "@react-native-picker/picker";

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

import { Cliente, Orcamento } from "@/components/layout/interface";
import { getBudgetByClient } from "@/services/api";
import { BudgetDetailsModal } from "@/components/modals/orcamento/BudgetDetailsModal";
import { EditOrcamentoModal } from "@/components/modals/orcamento/EditOrcamentoModal";
import { useAuth } from "@/contexts/AuthContext";

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
  const [descricao, setDescricao] = useState("");
  const [tipoPessoa, setTipoPessoa] = useState<"FISICA" | "JURIDICA" | "">("");
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [loadingOrcamentos, setLoadingOrcamentos] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Orcamento | null>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [editBudgetVisible, setEditBudgetVisible] = useState(false);
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

  async function loadOrcamentos() {
    try {
      if (!token || !initialData?._id) return;

      setLoadingOrcamentos(true);

      const data = await getBudgetByClient(initialData._id, token);

      setOrcamentos(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingOrcamentos(false);
    }
  }

  useEffect(() => {
    async function carregarOrcamentos() {
      if (!isReadOnly || !initialData?._id || !token) return;

      try {
        setLoadingOrcamentos(true);

        const data = await getBudgetByClient(initialData._id, token);

        setOrcamentos(data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoadingOrcamentos(false);
      }
    }

    carregarOrcamentos();
  }, [isReadOnly, initialData, token]);

  useEffect(() => {
    if (isReadOnly) {
      loadOrcamentos();
    }
  }, [isReadOnly, initialData, token]);

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

        <Pressable
          onPress={mode === "details" ? onEdit : irParaSalvar}
          style={globalStyles.rightAction}
        >
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

          <Text style={globalStyles.label}>
            Nome Completo:
            {!isReadOnly && <Text style={globalStyles.obrigatorio}>*</Text>}
          </Text>

          <AppInput
            placeholder="Informe o nome do cliente"
            value={nome}
            onChangeText={setNome}
            editable={!isReadOnly}
          />
          <View style={globalStyles.row}>
            <View style={globalStyles.column}>
              <Text style={globalStyles.label}>
                Tipo:
                {!isReadOnly && <Text style={globalStyles.obrigatorio}>*</Text>}
              </Text>
              <Picker
                selectedValue={tipoPessoa}
                placeholder={COLORS.placeholder}
                onValueChange={setTipoPessoa}
                style={[
                  globalStyles.picker,
                  isReadOnly && globalStyles.pickerReadOnly,
                ]}
              >
                <Picker.Item label={"Selecione o tipo de Pessoa"} value="" />
                <Picker.Item label="Pessoa Física" value="FISICA" />
                <Picker.Item label="Pessoa Jurídica" value="JURIDICA" />
              </Picker>
            </View>

            <View style={globalStyles.column}>
              <Text style={globalStyles.label}>
                CPF / CNPJ:
                {!isReadOnly && <Text style={globalStyles.obrigatorio}>*</Text>}
              </Text>

              <AppInput
                placeholder="Informe o CPF ou CNPJ"
                value={cpf}
                onChangeText={(text) => setCpf(documentMask(text))}
                editable={!isReadOnly}
              />
            </View>
          </View>

          <Text style={[globalStyles.subtitle, { marginTop: 20 }]}>
            Contato
          </Text>

          <View style={globalStyles.divider} />
          <View style={globalStyles.row}>
            <View style={globalStyles.column}>
              <Text style={globalStyles.label}>
                E-mail:
                {!isReadOnly && <Text style={globalStyles.obrigatorio}>*</Text>}
              </Text>

              <AppInput
                placeholder="cliente@email.com"
                value={email}
                onChangeText={(text) => setEmail(emailMask(text))}
                editable={!isReadOnly}
              />
            </View>
            <View style={globalStyles.column}>
              <Text style={globalStyles.label}>
                Telefone:
                {!isReadOnly && <Text style={globalStyles.obrigatorio}>*</Text>}
              </Text>

              <AppInput
                placeholder="(00) 00000-0000"
                value={telefone}
                onChangeText={(text) => setTelefone(phoneMask(text))}
                editable={!isReadOnly}
              />
            </View>
          </View>

          <Text style={globalStyles.subtitle}>Observação</Text>

          <View style={globalStyles.divider} />

          <Text style={globalStyles.label}>Descrição:</Text>

          <AppInput
            placeholder="Descreva o cliente..."
            value={descricao}
            onChangeText={setDescricao}
            editable={!isReadOnly}
            multiline
          />

          {isReadOnly && (
            <>
              <Text style={globalStyles.subtitle}>Orçamentos Associados</Text>
              <View style={globalStyles.divider} />
              {loadingOrcamentos ? (
                <Text>Carregando...</Text>
              ) : (
                orcamentos.map((orcamento) => (
                  <CardOrcamentoCliente
                    key={orcamento._id}
                    name={orcamento.nome}
                    value={orcamento.preco_com_bdi}
                    status={orcamento.status}
                    onClick={() => {
                      setSelectedBudget(orcamento);
                      setDetailsVisible(true);
                    }}
                  />
                ))
              )}
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
      <BudgetDetailsModal
        visible={detailsVisible}
        budget={selectedBudget}
        onClose={() => setDetailsVisible(false)}
        onEdit={() => {
          setDetailsVisible(false);

          setTimeout(() => {
            setEditBudgetVisible(true);
          }, 200);
        }}
      />
      <EditOrcamentoModal
        visible={editBudgetVisible}
        budget={selectedBudget}
        onClose={() => setEditBudgetVisible(false)}
        onSuccess={() => {
          setEditBudgetVisible(false);
          loadOrcamentos();
        }}
      />
    </View>
  );
}
