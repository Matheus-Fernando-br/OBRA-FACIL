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
import { globalStyles, COLORS } from "@/styles/globalStyles";
import { AppInput } from "@/components/forms/AppInput";
import { AppCurrencyInput } from "./AppCurrencyInput";
import { AppButton } from "@/components/buttons/AppButton";
import { ClientCardSelect } from "@/components/cards/cliente/ClientCardSelect";
import * as Linking from "expo-linking";
import { cepMask } from "./mask";
import { useAuth } from "@/contexts/AuthContext";
import {
  Cliente,
  Servico,
  Categoria,
  Orcamento,
} from "@/components/layout/interface";
import { getClients } from "@/services/api";

interface ServicoForm extends Servico {
  id: number;
}

interface CategoriaForm extends Categoria {
  id: number;
  servicos: ServicoForm[];
}

interface OrcamentoFormProps {
  mode: "add" | "edit" | "details";
  initialData?: Orcamento | null;
  onClose: () => void;
  onSave?: (data: any) => Promise<void>;
  onGeneratePdf?: () => void;
  clientsList: Cliente[];
  feedbackMessage?: string;
  onSuccess?: () => void;
  onEdit?: () => void;
  onClientDetails?: (client: Cliente) => void;
  onClientEdit?: (client: Cliente) => void;
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
  onClientEdit,
}: OrcamentoFormProps) {
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
  const [loadingClose, setLoadingClose] = useState(false);
  const [status, setStatus] = useState(initialData?.status || "PENDENTE");
  const [descricao, setDescricao] = useState(initialData?.descricao || "");
  const [loadingClient, setLoadingClient] = useState(mode !== "add");
  const [clientModalVisible, setClientModalVisible] = useState(false);
  const [selectedClient, setSelectedClient] = useState(() => {
    if (!initialData?.cliente) return "";

    return typeof initialData.cliente === "string"
      ? initialData.cliente
      : initialData.cliente._id;
  });
  useEffect(() => {
    if (!initialData?.cliente) return;

    setSelectedClient(
      typeof initialData.cliente === "string"
        ? initialData.cliente
        : initialData.cliente._id,
    );
  }, [initialData]);

  useEffect(() => {
    if (mode === "add") {
      setLoadingClient(false);
      return;
    }

    if (!selectedClient) return;

    if (clientsList.length === 0) {
      setLoadingClient(true);
      return;
    }

    const client = clientsList.find((c) => c._id === selectedClient);

    if (client) {
      setLoadingClient(false);
    }
  }, [clientsList, selectedClient, mode]);
  async function loadClient() {
    try {
      if (!token) return;

      setLoadingClient(true);

      const data = await getClients(token);
    } catch (error) {
      console.log("ERRO CLIENTES:", error);
    } finally {
      setLoadingClient(false);
    }
  }

  useEffect(() => {
    if (isReadOnly) {
      loadClient();
    }
  }, [isReadOnly, initialData, token]);

  const selectedClientData = clientsList.find((c) => c._id === selectedClient);
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
  const [bdi, setBdi] = useState(initialData?.bdi.toString() || "");
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

  const custoObraCalculado = categorias.reduce(
    (acc, categoria) => acc + categoria.preco_total_da_categoria,
    0,
  );
  const custoTotalComBDI =
    custoObraCalculado + custoObraCalculado * (Number(bdi || 0) / 100);

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

      if (isLocked) {
        setFeedback("Este orçamento não pode mais ser alterado.");
        return;
      }

      if (isReadOnly) {
        return onGeneratePdf?.();
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

          if (servico.quantidade_unidade <= 0) {
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

      if (!bdi) {
        setFeedback("Informe o BDI.");
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
        bdi: Number(bdi),
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

  const handleOpenSinapiLink = async () => {
    const url =
      "https://www.caixa.gov.br/Downloads/sinapi-relatorios-mensais/SINAPI-2026-05-formato-pdf.zip";
    if (await Linking.canOpenURL(url)) await Linking.openURL(url);
    else setFeedbackSinapi("Erro ao abrir link.");
  };

  const scrollRef = useRef<ScrollView>(null);
  const irParaSalvar = () => {
    scrollRef.current?.scrollToEnd({
      animated: true,
    });
  };

  async function handleClose() {
    setLoadingClose(true);
    setFeedback("Cancelando Orçamento...");
    setTimeout(() => {
      onClose();
      setLoadingClose(false);
      setFeedback("");
    }, 1500);
  }

  return (
    <View style={globalStyles.container}>
      <View style={globalStyles.modalHeader}>
        <Pressable onPress={onClose} style={globalStyles.leftAction}>
          <Ionicons name="arrow-back" size={25} color={COLORS.text} />
        </Pressable>
        <Text style={globalStyles.addTitle}>
          {mode === "add"
            ? "Novo Orçamento"
            : mode === "edit"
              ? "Editar Orçamento"
              : "Detalhes"}
        </Text>

        {mode === "details" && !isLocked ? (
          <Pressable onPress={onEdit} style={globalStyles.rightAction}>
            <Text style={globalStyles.saveText}>Editar</Text>

            <Ionicons name="pencil-sharp" size={25} color={COLORS.title} />
          </Pressable>
        ) : mode !== "details" && !isLocked ? (
          <Pressable onPress={irParaSalvar} style={globalStyles.rightAction}>
            <Text style={globalStyles.saveText}>Salvar</Text>

            <Ionicons name="download" size={25} color={COLORS.title} />
          </Pressable>
        ) : mode === "details" && isLocked ? (
          <Pressable onPress={irParaSalvar} style={globalStyles.rightAction}>
            <Text style={globalStyles.saveText}>Gerar PDF</Text>

            <Ionicons
              name="document-text-outline"
              size={25}
              color={COLORS.title}
            />
          </Pressable>
        ) : null}
      </View>
      <ScrollView ref={scrollRef} style={{ flex: 1 }}>
        <Text style={globalStyles.subtitle}>Cliente</Text>

        <View style={globalStyles.divider} />

        {loadingClient ? (
          <View
            style={[
              globalStyles.clientCard,
              {
                justifyContent: "center",
                alignItems: "center",
                minHeight: 90,
                gap: 20,
              },
            ]}
          >
            <ActivityIndicator size="large" color={COLORS.primary} />

            <Text style={globalStyles.subtitle}>Carregando cliente...</Text>
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
        <Text style={globalStyles.subtitle}>Informações Gerais</Text>
        <View style={globalStyles.divider} />
        <View style={globalStyles.card}>
          <Text style={globalStyles.label}>
            Nome do orçamento:
            {!isReadOnly && <Text style={globalStyles.obrigatorio}>*</Text>}
          </Text>
          <AppInput
            placeholder="Nome do orçamento"
            value={nome}
            onChangeText={setNome}
            editable={canEdit}
          />

          <Text style={globalStyles.label}>Descrição:</Text>

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
              <Text style={globalStyles.label}>Status de Orçamento:</Text>
              <Picker
                selectedValue={status}
                onValueChange={(itemValue) => setStatus(itemValue)}
                style={[
                  globalStyles.picker,
                  isReadOnly && globalStyles.pickerReadOnly,
                ]}
              >
                <Picker.Item
                  label={"Selecione o Status do Orçamento " + nome}
                  value=""
                />
                <Picker.Item label="PENDENTE" value="PENDENTE" />
                <Picker.Item label="APROVADO" value="APROVADO" />
                <Picker.Item label="RECUSADO" value="RECUSADO" />
              </Picker>
            </>
          )}
          <View style={globalStyles.row}>
            <View style={globalStyles.column}>
              <Text style={globalStyles.label}>Data de Publicação:</Text>
              <AppInput
                value={dataPublicacao.toLocaleDateString("pt-BR")}
                editable={false}
              />
            </View>
            <View style={globalStyles.column}>
              <Text style={globalStyles.label}>
                Validade:
                {!isReadOnly && <Text style={globalStyles.obrigatorio}>*</Text>}
              </Text>
              <Picker
                selectedValue={validade}
                onValueChange={(v) => setValidade(Number(v))}
                style={[
                  globalStyles.picker,
                  isReadOnly && globalStyles.pickerReadOnly,
                ]}
                enabled={canEdit}
              >
                {Array.from({ length: 15 }, (_, i) => (
                  <Picker.Item key={i} label={`${i} dias`} value={i} />
                ))}
              </Picker>
            </View>
          </View>
          <Text style={globalStyles.label}>Válido até dia:</Text>
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
          <View style={globalStyles.card}>
            <Text style={globalStyles.label}>Endereço:</Text>

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
                color={COLORS.primary}
                style={{ marginLeft: 8 }}
              />
            </Pressable>
          </View>
        )}

        {/* ENDEREÇO COMPLETO*/}
        {(isAdd || enderecoExpandido) && (
          <>
            <Text style={globalStyles.subtitle}>Endereço:</Text>
            <View style={globalStyles.divider} />
            <View style={globalStyles.card}>
              <View style={globalStyles.row}>
                <View style={globalStyles.column}>
                  <Text style={globalStyles.label}>
                    CEP:
                    {!isReadOnly && (
                      <Text style={globalStyles.obrigatorio}>*</Text>
                    )}
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
                <View style={globalStyles.column}>
                  <View style={globalStyles.column}>
                    <Text style={globalStyles.label}>
                      Estado:
                      {!isReadOnly && (
                        <Text style={globalStyles.obrigatorio}>*</Text>
                      )}
                    </Text>

                    <Picker
                      selectedValue={estado}
                      onValueChange={(value) => setEstado(value)}
                      style={[
                        globalStyles.picker,
                        isReadOnly && globalStyles.pickerReadOnly,
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
              <View style={globalStyles.row}>
                <View style={globalStyles.column}>
                  <Text style={globalStyles.label}>
                    Cidade:
                    {!isReadOnly && (
                      <Text style={globalStyles.obrigatorio}>*</Text>
                    )}
                  </Text>

                  <AppInput
                    placeholder="Cidade"
                    value={cidade}
                    onChangeText={setCidade}
                    editable={canEdit}
                  />
                </View>
                <View style={globalStyles.column}>
                  <Text style={globalStyles.label}>
                    Bairro:
                    {!isReadOnly && (
                      <Text style={globalStyles.obrigatorio}>*</Text>
                    )}
                  </Text>

                  <AppInput
                    placeholder="Bairro"
                    value={bairro}
                    onChangeText={setBairro}
                    editable={canEdit}
                  />
                </View>
              </View>
              <Text style={globalStyles.label}>
                Logradouro:
                {!isReadOnly && <Text style={globalStyles.obrigatorio}>*</Text>}
              </Text>
              <View style={globalStyles.row}>
                <AppInput
                  placeholder="Rua"
                  value={logradouro}
                  onChangeText={setLogradouro}
                  editable={canEdit}
                />
              </View>
              <View style={globalStyles.row}>
                <View style={globalStyles.column}>
                  <Text style={globalStyles.label}>
                    Número:
                    {!isReadOnly && (
                      <Text style={globalStyles.obrigatorio}>*</Text>
                    )}
                  </Text>

                  <AppInput
                    placeholder="Nº"
                    value={numero}
                    onChangeText={setNumero}
                    editable={canEdit}
                    keyboardType="numeric"
                  />
                </View>
                <View style={globalStyles.column}>
                  <Text style={globalStyles.label}>Complemento:</Text>

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
                color: COLORS.primary,
                fontWeight: "600",
              }}
            >
              Ver endereço completo
            </Text>

            <Ionicons
              name="chevron-down"
              size={18}
              color={COLORS.primary}
              style={{ marginLeft: 5 }}
            />
          </Pressable>
        )}
        <Text style={globalStyles.subtitle}>Categorias e Serviços</Text>
        <View style={globalStyles.divider} />
        <Text style={globalStyles.label}>Link da tabela SINAPI:</Text>
        <AppButton
          title="Baixar Tabela SINAPI"
          onPress={handleOpenSinapiLink}
        />
        {feedbackSinapi !== "" && (
          <Text style={globalStyles.feedback}>{feedbackSinapi}</Text>
        )}
        {categorias.map((cat, idx) => (
          <View key={cat.id} style={[globalStyles.card, { marginTop: 20 }]}>
            <Text style={globalStyles.label}>
              Nome da Categoria {idx + 1}:
              {!isReadOnly && <Text style={globalStyles.obrigatorio}>*</Text>}
            </Text>
            <AppInput
              placeholder="Nome da Categoria"
              value={cat.nome}
              onChangeText={(t) => updateCategoria(cat.id, "nome", t)}
              editable={canEdit}
            />
            {cat.servicos.map((s, sIdx) => (
              <View key={s.id} style={globalStyles.serviceContainer}>
                <Text style={globalStyles.label}>
                  Nome do Serviço {sIdx + 1}:
                  {!isReadOnly && (
                    <Text style={globalStyles.obrigatorio}>*</Text>
                  )}
                </Text>
                <AppInput
                  placeholder="Nome do Serviço"
                  value={s.nome}
                  onChangeText={(t) => updateServico(cat.id, s.id, "nome", t)}
                  editable={canEdit}
                />
                <View style={globalStyles.row}>
                  <View style={globalStyles.column}>
                    <Text style={globalStyles.label}>
                      Unidade do Serviço:
                      {!isReadOnly && (
                        <Text style={globalStyles.obrigatorio}>*</Text>
                      )}
                    </Text>

                    <Picker
                      selectedValue={s.unidade}
                      onValueChange={(value) =>
                        updateServico(cat.id, s.id, "unidade", value)
                      }
                      style={[
                        globalStyles.picker,
                        isReadOnly && globalStyles.pickerReadOnly,
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

                  <View style={globalStyles.column}>
                    <Text style={globalStyles.label}>
                      Valor Unitário:
                      {!isReadOnly && (
                        <Text style={globalStyles.obrigatorio}>*</Text>
                      )}
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
                <View style={globalStyles.row}>
                  <View style={globalStyles.column}>
                    <Text style={globalStyles.label}>
                      Quantidade:
                      {!isReadOnly && (
                        <Text style={globalStyles.obrigatorio}>*</Text>
                      )}
                    </Text>

                    <AppInput
                      placeholder="Qtd"
                      value={String(s.quantidade_unidade)}
                      onChangeText={(t) =>
                        updateServico(
                          cat.id,
                          s.id,
                          "quantidade_unidade",
                          Number(t),
                        )
                      }
                      editable={canEdit}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
                <Text style={globalStyles.serviceTotalText}>
                  Subtotal do Serviço {sIdx + 1}: R$ {s.preco_total.toFixed(2)}
                </Text>
              </View>
            ))}
            <Text
              style={[
                globalStyles.serviceTotalText,
                { fontSize: 15, color: COLORS.primary },
              ]}
            >
              Subtotal da Categoria {idx + 1}: R$
              {cat.preco_total_da_categoria.toFixed(2)}
            </Text>
            <View style={globalStyles.divider} />

            {canEdit && (
              <AppButton title="+ Serviço" onPress={() => addServico(cat.id)} />
            )}
          </View>
        ))}

        {canEdit && (
          <AppButton
            title="+ Categoria"
            onPress={addCategoria}
            color={COLORS.primary}
          />
        )}

        <Text style={[globalStyles.subtitle, { marginTop: 20 }]}>
          Valores Financeiros
        </Text>
        <View style={globalStyles.divider} />
        <View style={globalStyles.card}>
          <View style={globalStyles.row}>
            <View style={globalStyles.column}>
              <Text style={globalStyles.label}>Custo Obra:</Text>

              <AppInput
                value={custoObraCalculado.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
                editable={false}
              />
            </View>
            <View style={globalStyles.column}>
              <Text style={globalStyles.label}>
                BDI (%):
                {!isReadOnly && <Text style={globalStyles.obrigatorio}>*</Text>}
              </Text>

              <AppInput
                placeholder="BDI (%)"
                value={bdi}
                onChangeText={setBdi}
                editable={canEdit}
                keyboardType="numeric"
              />
            </View>
          </View>

          <Text style={globalStyles.label}>Custo Total da Obra com BDI:</Text>
          <AppInput
            value={custoTotalComBDI.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
            editable={false}
          />
        </View>
        {feedback !== "" && (
          <Text style={globalStyles.feedback}>{feedback}</Text>
        )}
        {feedbackMessage !== "" && (
          <Text style={globalStyles.feedback}>{feedbackMessage}</Text>
        )}
        <View style={globalStyles.divider}></View>
        <AppButton
          title={
            mode === "add"
              ? "Salvar Novo Orçamento"
              : mode === "edit"
                ? "Salvar Alterações"
                : "Gerar PDF"
          }
          onPress={handleSubmit}
          color={COLORS.primary}
          loading={loadingSubmit}
        />
        <AppButton
          title={
            mode === "add"
              ? "Cancelar Orçamento"
              : mode === "edit"
                ? "Salvar Alterações"
                : "Voltar"
          }
          onPress={handleClose}
          color={COLORS.danger}
          loading={loadingClose}
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
              backgroundColor: COLORS.white,
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
              <Text style={globalStyles.subtitle}>Selecione um Cliente</Text>

              <Pressable onPress={() => setClientModalVisible(false)}>
                <Ionicons name="close" size={35} color={COLORS.danger} />
              </Pressable>
            </View>
            <View style={globalStyles.divider} />
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
