import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Modal,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useTheme } from "@/contexts/ThemeContext";
import { AppInput } from "@/components/forms/AppInput";
import { AppCurrencyInput } from "./AppCurrencyInput";
import { AppButton } from "@/components/buttons/AppButton";
import { ClientCardSelect } from "@/components/cards/cliente/ClientCardSelect";
import * as Linking from "expo-linking";
import { cepMask } from "./mask";
import { parseDecimal, sanitizeDecimalInput, formatDecimalInput } from "@/utils/format";
import { useAuth } from "@/contexts/AuthContext";
import {
  Cliente,
  Servico,
  Categoria,
  Orcamento,
} from "@/components/layout/interface";
import { getClientById } from "@/services/api";

interface ServicoForm extends Servico {
  id: number;
  /** Texto digitado da quantidade (permite "12,5"). */
  quantidade_texto?: string;
}

/* Opções de validade da proposta (dias). */
const VALIDADE_OPCOES = [5, 7, 10, 15, 20, 30, 45, 60, 90];

interface CategoriaForm extends Categoria {
  id: number;
  servicos: ServicoForm[];
}

interface OrcamentoFormProps {
  mode: "add" | "edit" | "details";
  initialData?: Orcamento | null;
  onClose: () => void;
  onSave?: (data: any) => Promise<void>;
  onGeneratePdf?: () => Promise<void> | void;
  clientsList: Cliente[];
  feedbackMessage?: string;
  onSuccess?: () => void;
  onEdit?: () => void;
  onClientDetails?: (client: Cliente) => void;
}

export function OrcamentoForm({
  mode,
  initialData,
  onClose,
  onSave,
  onGeneratePdf,
  clientsList,
  feedbackMessage,
  onSuccess,
  onEdit,
  onClientDetails,
}: OrcamentoFormProps) {
  const { styles, theme } = useTheme();
  const insets = useSafeAreaInsets();

  const { token, user } = useAuth();
  const isReadOnly = mode === "details";
  const isAdd = mode === "add";
  const isLocked =
    !isAdd &&
    (initialData?.status === "APROVADO" ||
      initialData?.status === "RECUSADO" ||
      initialData?.arquivado === true);
  const canEdit = !isReadOnly && !isLocked;
  const [enderecoExpandido, setEnderecoExpandido] = useState(isAdd);
  const [nome, setNome] = useState(initialData?.nome || "");
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [status, setStatus] = useState(initialData?.status || "PENDENTE");
  const [descricao, setDescricao] = useState(initialData?.descricao || "");
  const [clientModalVisible, setClientModalVisible] = useState(false);
  const [loadingClient, setLoadingClient] = useState(mode !== "add");

  const [selectedClient, setSelectedClient] = useState(() => {
    if (!initialData?.cliente) return "";

    return typeof initialData.cliente === "string"
      ? initialData.cliente
      : initialData.cliente._id;
  });

  const [selectedClientData, setSelectedClientData] = useState<Cliente | null>(
    () => {
      if (!initialData?.cliente) return null;

      return typeof initialData.cliente === "string"
        ? null
        : initialData.cliente;
    },
  );

  useEffect(() => {
    if (!initialData?.cliente) {
      setSelectedClient("");
      setSelectedClientData(null);
      return;
    }

    const clientId =
      typeof initialData.cliente === "string"
        ? initialData.cliente
        : initialData.cliente._id;

    setSelectedClient(clientId);

    if (typeof initialData.cliente !== "string") {
      setSelectedClientData(initialData.cliente);
    }
  }, [initialData]);

  useEffect(() => {
    if (!selectedClient || !token) {
      setSelectedClientData(null);
      setLoadingClient(false);
      return;
    }

    async function loadSelectedClient() {
      try {
        if (!token) return;
        setLoadingClient(true);

        const client = await getClientById(selectedClient, token);

        setSelectedClientData(client);
      } catch (error: any) {
        console.log(
          "ERRO AO CARREGAR CLIENTE:",
          error?.response?.data || error?.message || error,
        );

        setSelectedClientData(null);
      } finally {
        setLoadingClient(false);
      }
    }

    loadSelectedClient();
  }, [selectedClient, token, mode]);

  const [validade, setValidade] = useState<number>(
    initialData?.valido_durante || 0,
  );
  const [cep, setCep] = useState(initialData?.endereco.CEP || "");
  const [estado, setEstado] = useState(initialData?.endereco.estado || "");
  const [cidade, setCidade] = useState(initialData?.endereco.cidade || "");
  const [bairro, setBairro] = useState(initialData?.endereco.bairro || "");
  const [logradouro, setLogradouro] = useState(initialData?.endereco.rua || "");
  const [numero, setNumero] = useState(initialData?.endereco.numero || "");
  const [complemento, setComplemento] = useState(
    initialData?.endereco.complemento || "",
  );
  const [categorias, setCategorias] = useState<CategoriaForm[]>(
    initialData?.categoria.map((cat) => ({
      ...cat,
      id: Date.now() + Math.random(),
      servicos: cat.servicos.map((serv) => ({
        ...serv,
        id: Date.now() + Math.random(),
      })),
    })) || [
      {
        id: Date.now(),
        nome: "",
        preco_total_da_categoria: 0,
        servicos: [
          {
            id: Date.now() + 1,
            nome: "",
            descricao: "",
            unidade: "",
            quantidade_unidade: 0,
            preco_da_unidade: 0,
            preco_total: 0,
          },
        ],
      },
    ],
  );
  const [bdi, setBdi] = useState(
    initialData?.bdi !== undefined && initialData?.bdi !== null
      ? String(initialData.bdi).replace(".", ",")
      : "",
  );
  const [pdfLoading, setPdfLoading] = useState(false);

  const validadeOpcoes = Array.from(
    new Set([...VALIDADE_OPCOES, ...(validade > 0 ? [validade] : [])]),
  ).sort((a, b) => a - b);
  const [feedback, setFeedback] = useState("");
  const [feedbackSinapi, setFeedbackSinapi] = useState("");
  const dataPublicacao = initialData
    ? new Date(initialData.data_publicacao)
    : new Date();
  const dataValidade =
    validade > 0
      ? new Date(
          dataPublicacao.getTime() + (validade - 1) * 24 * 60 * 60 * 1000,
        )
      : null;

  function addCategoria() {
    setCategorias((prev) => [
      ...prev,
      {
        id: Date.now(),
        nome: "",
        preco_total_da_categoria: 0,
        servicos: [
          {
            id: Date.now() + 1,
            nome: "",
            descricao: "",
            unidade: "",
            quantidade_unidade: 0,
            preco_da_unidade: 0,
            preco_total: 0,
          },
        ],
      },
    ]);
  }

  function updateCategoria(id: number, field: keyof CategoriaForm, value: any) {
    setCategorias((prev) =>
      prev.map((categoria) =>
        categoria.id === id ? { ...categoria, [field]: value } : categoria,
      ),
    );
  }

  function addServico(categoriaId: number) {
    setCategorias((prev) =>
      prev.map((categoria) =>
        categoria.id === categoriaId
          ? {
              ...categoria,
              servicos: [
                ...categoria.servicos,
                {
                  id: Date.now(),
                  nome: "",
                  descricao: "",
                  unidade: "",
                  quantidade_unidade: 0,
                  preco_da_unidade: 0,
                  preco_total: 0,
                },
              ],
            }
          : categoria,
      ),
    );
  }

  function updateServico(
    categoriaId: number,
    servicoId: number,
    field: keyof ServicoForm,
    value: string | number,
  ) {
    setCategorias((prev) =>
      prev.map((categoria) => {
        if (categoria.id !== categoriaId) return categoria;
        const servicos = categoria.servicos.map((servico) => {
          if (servico.id !== servicoId) return servico;
          const novoServico = { ...servico, [field]: value };
          novoServico.preco_total =
            Number(novoServico.quantidade_unidade) *
            Number(novoServico.preco_da_unidade);
          return novoServico;
        });
        return {
          ...categoria,
          servicos,
          preco_total_da_categoria: servicos.reduce(
            (acc, s) => acc + s.preco_total,
            0,
          ),
        };
      }),
    );
  }

  function updateQuantidade(categoriaId: number, servicoId: number, text: string) {
    const texto = sanitizeDecimalInput(text);
    setCategorias((prev) =>
      prev.map((categoria) => {
        if (categoria.id !== categoriaId) return categoria;
        const servicos = categoria.servicos.map((servico) => {
          if (servico.id !== servicoId) return servico;
          const quantidade = parseDecimal(texto);
          return {
            ...servico,
            quantidade_texto: texto,
            quantidade_unidade: quantidade,
            preco_total: quantidade * Number(servico.preco_da_unidade),
          };
        });
        return {
          ...categoria,
          servicos,
          preco_total_da_categoria: servicos.reduce((acc, s) => acc + s.preco_total, 0),
        };
      }),
    );
  }

  function removeCategoria(categoriaId: number) {
    setCategorias((prev) =>
      prev.length > 1 ? prev.filter((c) => c.id !== categoriaId) : prev,
    );
  }

  function removeServico(categoriaId: number, servicoId: number) {
    setCategorias((prev) =>
      prev.map((categoria) => {
        if (categoria.id !== categoriaId || categoria.servicos.length <= 1) {
          return categoria;
        }
        const servicos = categoria.servicos.filter((s) => s.id !== servicoId);
        return {
          ...categoria,
          servicos,
          preco_total_da_categoria: servicos.reduce((acc, s) => acc + s.preco_total, 0),
        };
      }),
    );
  }

  const custoObraCalculado = categorias.reduce(
    (acc, categoria) => acc + categoria.preco_total_da_categoria,
    0,
  );
  const bdiNumero = parseDecimal(bdi);
  const custoTotalComBDI = custoObraCalculado + custoObraCalculado * (bdiNumero / 100);

  async function buscarCep(cepDigitado: string) {
    const cepLimpo = cepDigitado.replace(/\D/g, "");
    if (cepLimpo.length !== 8) return;
    try {
      const response = await fetch(
        `https://viacep.com.br/ws/${cepLimpo}/json/`,
      );
      const data = await response.json();
      setEstado(data.uf || "");
      setCidade(data.localidade || "");
      setBairro(data.bairro || "");
      setLogradouro(data.logradouro || "");
    } catch {
      console.log("Erro CEP");
    }
  }

  function zerarCampos() {
    setNome("");
    setStatus("PENDENTE");
    setDescricao("");
    setSelectedClient("");
    setValidade(0);
    setCep("");
    setEstado("");
  }

  async function handleSubmit() {
    try {
      setFeedback("");

      // Detalhes: o botão principal gera o PDF — inclusive para
      // orçamentos aprovados, recusados ou arquivados.
      if (isReadOnly) {
        return handleGeneratePdf();
      }

      if (isLocked) {
        setFeedback("Este orçamento não pode mais ser alterado.");
        return;
      }

      if (!token || !user) {
        setFeedback("Sessão expirada.");
        return;
      }

      if (!nome.trim()) {
        setFeedback("Informe o nome do orçamento.");
        return;
      }

      if (!selectedClient) {
        setFeedback("Selecione um cliente.");
        return;
      }

      if (!isAdd && !status) {
        setFeedback("Selecione o status do orçamento.");
        return;
      }

      if (!dataPublicacao) {
        setFeedback("Informe a data de publicação.");
        return;
      }

      if (!validade) {
        setFeedback("Informe a validade do orçamento.");
        return;
      }

      if (!cep.trim()) {
        setFeedback("Informe o CEP.");
        return;
      }

      if (!estado) {
        setFeedback("Selecione o estado.");
        return;
      }

      if (!cidade.trim()) {
        setFeedback("Informe a cidade.");
        return;
      }

      if (!bairro.trim()) {
        setFeedback("Informe o bairro.");
        return;
      }

      if (!logradouro.trim()) {
        setFeedback("Informe o logradouro.");
        return;
      }

      for (let i = 0; i < categorias.length; i++) {
        const categoria = categorias[i];

        if (!categoria.nome.trim()) {
          setFeedback(`Informe o nome da categoria ${i + 1}.`);
          return;
        }

        for (let j = 0; j < categoria.servicos.length; j++) {
          const servico = categoria.servicos[j];

          if (!servico.nome.trim()) {
            setFeedback(
              `Informe o nome do serviço ${j + 1} da categoria ${i + 1}.`,
            );
            return;
          }

          if (!servico.unidade) {
            setFeedback(
              `Selecione a unidade do serviço ${j + 1} da categoria ${i + 1}.`,
            );
            return;
          }

          if (!(servico.quantidade_unidade > 0)) {
            setFeedback(
              `Informe uma quantidade válida para o serviço ${j + 1} da categoria ${i + 1}.`,
            );
            return;
          }

          if (servico.preco_da_unidade <= 0) {
            setFeedback(
              `Informe um valor unitário válido para o serviço ${j + 1} da categoria ${i + 1}.`,
            );
            return;
          }
        }
      }

      if (!bdi.trim()) {
        setFeedback("Informe o BDI (use 0 se não houver).");
        return;
      }

      setLoadingSubmit(true);

      const budgetData = {
        nome,
        endereco: {
          CEP: cep,
          estado,
          cidade,
          bairro,
          rua: logradouro,
          numero,
          complemento,
        },
        descricao,
        cliente: selectedClient,
        responsavel: user!._id,
        categoria: categorias.map((cat) => ({
          nome: cat.nome,
          preco_total_da_categoria: cat.preco_total_da_categoria,
          servicos: cat.servicos.map((s) => ({
            nome: s.nome,
            descricao: s.descricao,
            unidade: s.unidade,
            quantidade_unidade: s.quantidade_unidade,
            preco_da_unidade: s.preco_da_unidade,
            preco_total: s.preco_total,
          })),
        })),
        status,
        preco: custoObraCalculado,
        bdi: bdiNumero,
        preco_com_bdi: custoTotalComBDI,
        data_publicacao: dataPublicacao,
        valido_durante: validade,
        data_validade: dataValidade!,
      };
      if (onSave) {
        await onSave(budgetData);
      }

      setFeedback("Orçamento salvo com sucesso!");

      zerarCampos();
      onSuccess?.();

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error: any) {
      console.log(
        "ERRO AO SALVAR ORÇAMENTO:",
        error?.response?.data || error?.message || error,
      );

      const mensagem =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Erro ao salvar orçamento";

      setFeedback(mensagem);
    } finally {
      setLoadingSubmit(false);

      setTimeout(() => {
        setFeedback("");
      }, 5000);
    }
  }

  async function handleGeneratePdf() {
    if (!onGeneratePdf || pdfLoading) return;
    setFeedback("");
    setPdfLoading(true);
    try {
      await onGeneratePdf();
    } catch (error: any) {
      console.log("ERRO AO GERAR PDF:", error);
      setFeedback(error?.message ? `Erro ao gerar PDF: ${error.message}` : "Erro ao gerar PDF.");
    } finally {
      setPdfLoading(false);
    }
  }

  // Página oficial do SINAPI (Caixa): sempre aponta para as tabelas vigentes.
  const handleOpenSinapiLink = async () => {
    const url =
      "https://www.caixa.gov.br/poder-publico/modernizacao-gestao/sinapi/Paginas/default.aspx";
    try {
      setFeedbackSinapi("");
      await Linking.openURL(url);
    } catch {
      setFeedbackSinapi("Não foi possível abrir o site da Caixa.");
    }
  };

  const scrollRef = useRef<ScrollView>(null);

  // Mensagens de validação ficam no fim do formulário: leva o usuário até elas.
  useEffect(() => {
    if (feedback) scrollRef.current?.scrollToEnd({ animated: true });
  }, [feedback]);

  function handleClose() {
    setFeedback("");
    onClose();
  }

  return (
    <View style={[styles.formScreen, { paddingTop: insets.top }]}>
      <View style={styles.modalHeader}>
        <Pressable onPress={onClose} style={styles.leftAction}>
          <Ionicons name="chevron-back" size={26} color={theme.primary} />
        </Pressable>
        <Text style={styles.addTitle}>
          {mode === "add"
            ? "Novo Orçamento"
            : mode === "edit"
              ? "Editar Orçamento"
              : "Detalhes"}
        </Text>

        {mode === "details" ? (
          <View style={styles.right}>
            {!isLocked && (
              <Pressable
                onPress={onEdit}
                style={[styles.rightAction, { backgroundColor: "transparent", paddingHorizontal: 6 }]}
                accessibilityLabel="Editar orçamento"
              >
                <Text style={styles.saveText}>Editar</Text>
              </Pressable>
            )}
            <Pressable
              onPress={handleGeneratePdf}
              disabled={pdfLoading}
              style={styles.rightAction}
              accessibilityLabel="Gerar PDF"
            >
              {pdfLoading ? (
                <ActivityIndicator size="small" color={theme.primary} />
              ) : (
                <Ionicons name="document-text-outline" size={16} color={theme.primary} />
              )}
              <Text style={styles.saveText}>PDF</Text>
            </Pressable>
          </View>
        ) : !isLocked ? (
          <Pressable
            onPress={handleSubmit}
            disabled={loadingSubmit}
            style={styles.rightAction}
            accessibilityLabel="Salvar orçamento"
          >
            {loadingSubmit ? (
              <ActivityIndicator size="small" color={theme.primary} />
            ) : (
              <Ionicons name="checkmark" size={16} color={theme.primary} />
            )}
            <Text style={styles.saveText}>Salvar</Text>
          </Pressable>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>
      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>Cliente</Text>

        <View style={styles.divider} />

        {loadingClient ? (
          <View
            style={[
              styles.clientCard,
              {
                justifyContent: "center",
                alignItems: "center",
                minHeight: 90,
                gap: 20,
              },
            ]}
          >
            <ActivityIndicator size="large" color={theme.primary} />

            <Text style={styles.subtitle}>Carregando cliente...</Text>
          </View>
        ) : (
          <ClientCardSelect
            name={selectedClientData?.nome || "Selecionar Cliente"}
            phone={selectedClientData?.telefone || ""}
            onClick={() => {
              if (mode === "details") {
                if (selectedClientData) {
                  onClientDetails?.(selectedClientData);
                }
              } else {
                setClientModalVisible(true);
              }
            }}
            icon={mode === "details" ? "eye" : "chevron-down"}
          />
        )}
        <Text style={styles.subtitle}>Informações Gerais</Text>
        <View style={styles.divider} />
        <View style={styles.card}>
          <Text style={styles.label}>
            Nome do orçamento:
            {!isReadOnly && <Text style={styles.obrigatorio}>*</Text>}
          </Text>
          <AppInput
            placeholder="Nome do orçamento"
            value={nome}
            onChangeText={setNome}
            editable={canEdit}
          />

          <Text style={styles.label}>Descrição:</Text>

          <AppInput
            placeholder="Descrição"
            value={descricao}
            onChangeText={setDescricao}
            editable={canEdit}
            multiline
            numberOfLines={3}
          />

          {!isAdd && (
            <>
              <Text style={styles.label}>Status de Orçamento:</Text>
              <Picker
                selectedValue={status}
                onValueChange={(itemValue) => setStatus(itemValue)}
                style={[styles.picker, !canEdit && styles.pickerReadOnly]}
                enabled={canEdit}
              >
                <Picker.Item label="Selecione o status" value="" />
                <Picker.Item label="PENDENTE" value="PENDENTE" />
                <Picker.Item label="APROVADO" value="APROVADO" />
                <Picker.Item label="RECUSADO" value="RECUSADO" />
              </Picker>
            </>
          )}
          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Data de Publicação:</Text>
              <AppInput
                value={dataPublicacao.toLocaleDateString("pt-BR")}
                editable={false}
              />
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>
                Validade:
                {!isReadOnly && <Text style={styles.obrigatorio}>*</Text>}
              </Text>
              <Picker
                selectedValue={validade}
                onValueChange={(v) => setValidade(Number(v))}
                style={[styles.picker, isReadOnly && styles.pickerReadOnly]}
                enabled={canEdit}
              >
                <Picker.Item label="Selecione" value={0} />
                {validadeOpcoes.map((dias) => (
                  <Picker.Item key={dias} label={`${dias} dias`} value={dias} />
                ))}
              </Picker>
            </View>
          </View>
          <Text style={styles.label}>Válido até dia:</Text>
          <AppInput
            value={
              dataValidade
                ? dataValidade.toLocaleDateString("pt-BR")
                : "Selecione a validade acima"
            }
            editable={false}
          />
        </View>
        {/* ENDEREÇO RESUMIDO */}
        {!isAdd && (
          <View style={styles.card}>
            <Text style={styles.label}>Endereço:</Text>

            <Pressable
              onPress={() => setEnderecoExpandido((prev) => !prev)}
              style={{
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <View style={{ flex: 1 }}>
                <AppInput
                  value={`${logradouro || ""}${numero ? `, ${numero}` : ""}${
                    cidade ? ` - ${cidade}` : ""
                  }${estado ? `/${estado}` : ""}`}
                  editable={false}
                  pointerEvents="none"
                />
              </View>

              <Ionicons
                name={enderecoExpandido ? "chevron-up" : "chevron-down"}
                size={22}
                color={theme.primary}
                style={{ marginLeft: 8 }}
              />
            </Pressable>
          </View>
        )}

        {/* ENDEREÇO COMPLETO*/}
        {(isAdd || enderecoExpandido) && (
          <>
            <Text style={styles.subtitle}>Endereço:</Text>
            <View style={styles.divider} />
            <View style={styles.card}>
              <View style={styles.row}>
                <View style={styles.column}>
                  <Text style={styles.label}>
                    CEP:
                    {!isReadOnly && <Text style={styles.obrigatorio}>*</Text>}
                  </Text>
                  <AppInput
                    placeholder="CEP"
                    value={cep}
                    onChangeText={(t) => {
                      const maskedCep = cepMask(t);

                      setCep(maskedCep);

                      if (maskedCep.replace(/\D/g, "").length === 8) {
                        buscarCep(maskedCep);
                      }
                    }}
                    editable={canEdit}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.column}>
                  <View style={styles.column}>
                    <Text style={styles.label}>
                      Estado:
                      {!isReadOnly && <Text style={styles.obrigatorio}>*</Text>}
                    </Text>

                    <Picker
                      selectedValue={estado}
                      onValueChange={(value) => setEstado(value)}
                      style={[
                        styles.picker,
                        isReadOnly && styles.pickerReadOnly,
                      ]}
                      enabled={canEdit}
                    >
                      <Picker.Item label="Selecione o Estado" value="" />
                      <Picker.Item label="AC - Acre" value="AC" />
                      <Picker.Item label="AL - Alagoas" value="AL" />
                      <Picker.Item label="AP - Amapá" value="AP" />
                      <Picker.Item label="AM - Amazonas" value="AM" />
                      <Picker.Item label="BA - Bahia" value="BA" />
                      <Picker.Item label="CE - Ceará" value="CE" />
                      <Picker.Item label="DF - Distrito Federal" value="DF" />
                      <Picker.Item label="ES - Espírito Santo" value="ES" />
                      <Picker.Item label="GO - Goiás" value="GO" />
                      <Picker.Item label="MA - Maranhão" value="MA" />
                      <Picker.Item label="MT - Mato Grosso" value="MT" />
                      <Picker.Item label="MS - Mato Grosso do Sul" value="MS" />
                      <Picker.Item label="MG - Minas Gerais" value="MG" />
                      <Picker.Item label="PA - Pará" value="PA" />
                      <Picker.Item label="PB - Paraíba" value="PB" />
                      <Picker.Item label="PR - Paraná" value="PR" />
                      <Picker.Item label="PE - Pernambuco" value="PE" />
                      <Picker.Item label="PI - Piauí" value="PI" />
                      <Picker.Item label="RJ - Rio de Janeiro" value="RJ" />
                      <Picker.Item
                        label="RN - Rio Grande do Norte"
                        value="RN"
                      />
                      <Picker.Item label="RS - Rio Grande do Sul" value="RS" />
                      <Picker.Item label="RO - Rondônia" value="RO" />
                      <Picker.Item label="RR - Roraima" value="RR" />
                      <Picker.Item label="SC - Santa Catarina" value="SC" />
                      <Picker.Item label="SP - São Paulo" value="SP" />
                      <Picker.Item label="SE - Sergipe" value="SE" />
                      <Picker.Item label="TO - Tocantins" value="TO" />
                    </Picker>
                  </View>
                </View>
              </View>
              <View style={styles.row}>
                <View style={styles.column}>
                  <Text style={styles.label}>
                    Cidade:
                    {!isReadOnly && <Text style={styles.obrigatorio}>*</Text>}
                  </Text>

                  <AppInput
                    placeholder="Cidade"
                    value={cidade}
                    onChangeText={setCidade}
                    editable={canEdit}
                  />
                </View>
                <View style={styles.column}>
                  <Text style={styles.label}>
                    Bairro:
                    {!isReadOnly && <Text style={styles.obrigatorio}>*</Text>}
                  </Text>

                  <AppInput
                    placeholder="Bairro"
                    value={bairro}
                    onChangeText={setBairro}
                    editable={canEdit}
                  />
                </View>
              </View>
              <Text style={styles.label}>
                Logradouro:
                {!isReadOnly && <Text style={styles.obrigatorio}>*</Text>}
              </Text>
              <View style={styles.row}>
                <AppInput
                  placeholder="Rua"
                  value={logradouro}
                  onChangeText={setLogradouro}
                  editable={canEdit}
                />
              </View>
              <View style={styles.row}>
                <View style={styles.column}>
                  <Text style={styles.label}>
                    Número:
                    {!isReadOnly && <Text style={styles.obrigatorio}>*</Text>}
                  </Text>

                  <AppInput
                    placeholder="Nº"
                    value={numero}
                    onChangeText={setNumero}
                    editable={canEdit}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.column}>
                  <Text style={styles.label}>Complemento:</Text>

                  <AppInput
                    placeholder="Compl."
                    value={complemento}
                    onChangeText={setComplemento}
                    editable={canEdit}
                  />
                </View>
              </View>
            </View>
          </>
        )}
        {/* BOTÃO PARA ABRIR*/}
        {!isAdd && !enderecoExpandido && (
          <Pressable
            onPress={() => setEnderecoExpandido(true)}
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              marginTop: 8,
              paddingVertical: 8,
            }}
          >
            <Text
              style={{
                color: theme.primary,
                fontWeight: "600",
              }}
            >
              Ver endereço completo
            </Text>

            <Ionicons
              name="chevron-down"
              size={18}
              color={theme.primary}
              style={{ marginLeft: 5 }}
            />
          </Pressable>
        )}
        <Text style={styles.subtitle}>Categorias e Serviços</Text>
        <View style={styles.divider} />
        {canEdit && (
          <AppButton
            title="Consultar preços na tabela SINAPI"
            icon="open-outline"
            variant="tinted"
            onPress={handleOpenSinapiLink}
          />
        )}
        {feedbackSinapi !== "" && (
          <Text style={styles.feedback}>{feedbackSinapi}</Text>
        )}
        {categorias.map((cat, idx) => (
          <View key={cat.id} style={[styles.card, { marginTop: 20 }]}>
            <View style={styles.serviceHeaderRow}>
              <Text style={styles.label}>
                Etapa {idx + 1}:
                {!isReadOnly && <Text style={styles.obrigatorio}>*</Text>}
              </Text>
              {canEdit && categorias.length > 1 && (
                <Pressable
                  onPress={() => removeCategoria(cat.id)}
                  hitSlop={8}
                  style={styles.iconButton}
                  accessibilityLabel={`Remover etapa ${idx + 1}`}
                >
                  <Ionicons name="trash-outline" size={16} color={theme.danger} />
                </Pressable>
              )}
            </View>
            <AppInput
              placeholder="Ex.: Fundação, Alvenaria, Acabamento"
              value={cat.nome}
              onChangeText={(t) => updateCategoria(cat.id, "nome", t)}
              editable={canEdit}
            />
            {cat.servicos.map((s, sIdx) => (
              <View key={s.id} style={styles.serviceContainer}>
                <View style={styles.serviceHeaderRow}>
                  <Text style={styles.label}>
                    Serviço {sIdx + 1}:
                    {!isReadOnly && <Text style={styles.obrigatorio}>*</Text>}
                  </Text>
                  {canEdit && cat.servicos.length > 1 && (
                    <Pressable
                      onPress={() => removeServico(cat.id, s.id)}
                      hitSlop={8}
                      accessibilityLabel={`Remover serviço ${sIdx + 1}`}
                    >
                      <Ionicons name="close-circle" size={20} color={theme.placeholder} />
                    </Pressable>
                  )}
                </View>
                <AppInput
                  placeholder="Nome do Serviço"
                  value={s.nome}
                  onChangeText={(t) => updateServico(cat.id, s.id, "nome", t)}
                  editable={canEdit}
                />
                <View style={styles.row}>
                  <View style={styles.column}>
                    <Text style={styles.label}>
                      Unidade do Serviço:
                      {!isReadOnly && <Text style={styles.obrigatorio}>*</Text>}
                    </Text>

                    <Picker
                      selectedValue={s.unidade}
                      onValueChange={(value) =>
                        updateServico(cat.id, s.id, "unidade", value)
                      }
                      style={[
                        styles.picker,
                        isReadOnly && styles.pickerReadOnly,
                      ]}
                      enabled={canEdit}
                    >
                      <Picker.Item label="Selecione a Unid. " value="" />
                      <Picker.Item label="Metro (m)" value="m" />
                      <Picker.Item label="Metro quadrado (m²)" value="m²" />
                      <Picker.Item label="Metro cúbico (m³)" value="m³" />
                      <Picker.Item label="Unidade (UN)" value="UN" />
                      <Picker.Item label="Quilograma (kg)" value="kg" />
                      <Picker.Item label="Tonelada (t)" value="t" />
                      <Picker.Item label="Hora (h)" value="h" />
                      <Picker.Item label="Dia (dia)" value="dia" />
                      <Picker.Item label="Mês (mês)" value="mês" />
                      <Picker.Item label="Verba (VB)" value="VB" />
                    </Picker>
                  </View>

                  <View style={styles.column}>
                    <Text style={styles.label}>
                      Valor Unitário:
                      {!isReadOnly && <Text style={styles.obrigatorio}>*</Text>}
                    </Text>

                    <AppCurrencyInput
                      value={s.preco_da_unidade}
                      onChangeValue={(value) =>
                        updateServico(
                          cat.id,
                          s.id,
                          "preco_da_unidade",
                          value ?? 0,
                        )
                      }
                      editable={canEdit}
                    />
                  </View>
                </View>
                <View style={styles.row}>
                  <View style={styles.column}>
                    <Text style={styles.label}>
                      Quantidade:
                      {!isReadOnly && <Text style={styles.obrigatorio}>*</Text>}
                    </Text>

                    <AppInput
                      placeholder="Ex.: 12,5"
                      value={s.quantidade_texto ?? formatDecimalInput(s.quantidade_unidade)}
                      onChangeText={(t) => updateQuantidade(cat.id, s.id, t)}
                      editable={canEdit}
                      keyboardType="decimal-pad"
                    />
                  </View>
                </View>
                <Text style={styles.serviceTotalText}>
                  Subtotal:{" "}
                  {s.preco_total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </Text>
              </View>
            ))}
            <Text
              style={[
                styles.serviceTotalText,
                { fontSize: 15, color: theme.primary },
              ]}
            >
              Subtotal da etapa:{" "}
              {cat.preco_total_da_categoria.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </Text>
            <View style={styles.divider} />

            {canEdit && (
              <AppButton
                title="Adicionar serviço"
                icon="add"
                variant="secondary"
                onPress={() => addServico(cat.id)}
              />
            )}
          </View>
        ))}

        {canEdit && (
          <AppButton
            title="Adicionar etapa"
            icon="layers-outline"
            variant="tinted"
            onPress={addCategoria}
          />
        )}

        <Text style={[styles.subtitle, { marginTop: 20 }]}>
          Valores Financeiros
        </Text>
        <View style={styles.divider} />
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Custo Obra:</Text>

              <AppInput
                value={custoObraCalculado.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
                editable={false}
              />
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>
                BDI (%):
                {!isReadOnly && <Text style={styles.obrigatorio}>*</Text>}
              </Text>

              <AppInput
                placeholder="BDI (%)"
                value={bdi}
                onChangeText={(t) => setBdi(sanitizeDecimalInput(t))}
                editable={canEdit}
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          <Text style={styles.label}>Custo Total da Obra com BDI:</Text>
          <AppInput
            value={custoTotalComBDI.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
            editable={false}
          />
        </View>
        {feedback !== "" && <Text style={styles.feedback}>{feedback}</Text>}
        {!!feedbackMessage && (
          <Text style={styles.feedback}>{feedbackMessage}</Text>
        )}
        <View style={styles.divider}></View>
        {isReadOnly ? (
          <AppButton
            title="Gerar PDF do orçamento"
            icon="document-text-outline"
            onPress={handleGeneratePdf}
            loading={pdfLoading}
          />
        ) : (
          !isLocked && (
            <AppButton
              title={mode === "add" ? "Salvar orçamento" : "Salvar alterações"}
              icon="checkmark"
              onPress={handleSubmit}
              loading={loadingSubmit}
            />
          )
        )}
        <AppButton
          variant="secondary"
          title={isReadOnly ? "Voltar" : "Cancelar"}
          onPress={handleClose}
        />
      </ScrollView>
      <Modal visible={clientModalVisible} animationType="slide" transparent>
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: theme.white,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              maxHeight: "90%",
              padding: 30,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 5,
              }}
            >
              <Text style={styles.subtitle}>Selecione um Cliente</Text>

              <Pressable onPress={() => setClientModalVisible(false)}>
                <Ionicons name="close" size={35} color={theme.danger} />
              </Pressable>
            </View>
            <View style={styles.divider} />
            <ScrollView>
              {clientsList.map((client) => (
                <Pressable
                  key={client._id}
                  onPress={() => {
                    setSelectedClient(client._id);
                    setClientModalVisible(false);
                  }}
                >
                  <ClientCardSelect
                    key={client._id}
                    name={client.nome}
                    phone={client.telefone}
                    icon={"checkbox-outline"}
                    onClick={() => {
                      setSelectedClient(client._id);
                      setClientModalVisible(false);
                    }}
                  />
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
