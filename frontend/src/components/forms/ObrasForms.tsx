import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { globalStyles, COLORS } from "@/styles/globalStyles";
import { AppInput } from "@/components/forms/AppInput";
import { ClientCardSelect } from "@/components/cards/cliente/ClientCardSelect";
import { DetailsClientModal } from "@/components/modals/cliente/DetailsClientModal";
import { EditClientModal } from "@/components/modals/cliente/EditClientModal";
import { Checkbox } from "expo-checkbox";
import { AppButton } from "@/components/buttons/AppButton";
import { useAuth } from "@/contexts/AuthContext";
import {
  Cliente,
  Obra,
  Orcamento,
  CategoriaObra,
  ServicoObra,
} from "@/components/layout/interface";
import { getBudgetById, getClientById, getClients } from "@/services/api";
import { maskDate } from "./mask";

type ObraStatus = Obra["status"];

interface ServicoObraForm extends ServicoObra {
  id: number;
  status: ObraStatus;
  concluido: boolean;
}

interface CategoriaObraForm extends CategoriaObra {
  id: number;
  servicos: ServicoObraForm[];
  status?: ObraStatus;
}

interface ObrasFormProps {
  mode: "add" | "edit" | "details";
  initialData?: Obra | null;
  budget?: Orcamento | null;
  onClose: () => void;
  onSave?: (data: any) => Promise<void>;
  feedbackMessage?: string;
  loading?: boolean;
  onSuccess?: () => void;
  onEdit?: () => void;
}

function formatDateToBR(value?: Date | string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const dia = String(date.getDate()).padStart(2, "0");
  const mes = String(date.getMonth() + 1).padStart(2, "0");
  const ano = date.getFullYear();
  return `${dia}/${mes}/${ano}`;
}

const calculateServiceStatus = (service: ServicoObraForm): ObraStatus => {
  const prevista = Number(service.qt_dias_prevista ?? 0);
  const real = Number(service.qt_dias_real ?? 0);

  if (!service.concluido) {
    return "NOPRAZO";
  }

  if (real > prevista) {
    return "ATRASADO";
  }

  if (real < prevista) {
    return "ADIANTADO";
  }

  return "ENTREGUE";
};

// Progresso, dias e status da categoria são 100% calculados a partir dos serviços
const calculateCategoryProgress = (
  services: ServicoObraForm[],
): {
  porcentagem_de_conclusao: number;
  qt_dias_prevista: number;
  qt_dias_real: number;
  status: ObraStatus;
} => {
  if (services.length === 0) {
    return {
      porcentagem_de_conclusao: 0,
      qt_dias_prevista: 0,
      qt_dias_real: 0,
      status: "NOPRAZO",
    };
  }

  const qt_dias_prevista = services.reduce(
    (sum, s) => sum + Number(s.qt_dias_prevista ?? 0),
    0,
  );

  const qt_dias_real = services.reduce(
    (sum, s) => sum + Number(s.qt_dias_real ?? 0),
    0,
  );

  // Dias previstos dos serviços concluídos
  const diasPrevistosConcluidos = services.reduce(
    (sum, s) => (s.concluido ? sum + Number(s.qt_dias_prevista ?? 0) : sum),
    0,
  );

  const porcentagem_de_conclusao =
    qt_dias_prevista > 0
      ? Math.min(
          100,
          Math.round((diasPrevistosConcluidos / qt_dias_prevista) * 100),
        )
      : 0;

  const todosConcluidos = services.every((s) => s.concluido === true);

  let status: ObraStatus = "NOPRAZO";

  if (todosConcluidos) {
    if (qt_dias_real > qt_dias_prevista) {
      status = "ATRASADO";
    } else if (qt_dias_real < qt_dias_prevista) {
      status = "ADIANTADO";
    } else {
      status = "ENTREGUE";
    }
  }

  return {
    porcentagem_de_conclusao,
    qt_dias_prevista,
    qt_dias_real,
    status,
  };
};

const calculateWorkStatus = (
  categorias: CategoriaObraForm[],
  dataFimPrevista?: string,
  porcentagem?: number,
): ObraStatus => {
  if (categorias.length === 0) {
    return "NOPRAZO";
  }

  const todasConcluidas = categorias.every(
    (c) => c.porcentagem_de_conclusao === 100,
  );

  const diasPrevistos = categorias.reduce(
    (s, c) => s + Number(c.qt_dias_prevista ?? 0),
    0,
  );

  const diasReais = categorias.reduce(
    (s, c) => s + Number(c.qt_dias_real ?? 0),
    0,
  );

  if (todasConcluidas) {
    if (diasReais > diasPrevistos) {
      return "ATRASADO";
    }

    if (diasReais < diasPrevistos) {
      return "ADIANTADO";
    }

    return "ENTREGUE";
  }

  if (dataFimPrevista) {
    const [d, m, a] = dataFimPrevista.split("/");

    const fim = new Date(Number(a), Number(m) - 1, Number(d));

    const hoje = new Date();

    hoje.setHours(0, 0, 0, 0);

    fim.setHours(0, 0, 0, 0);

    if (hoje > fim) {
      return "ATRASADO";
    }
  }

  return "NOPRAZO";
};

function mapCategoriasFromObra(
  categorias: CategoriaObra[],
): CategoriaObraForm[] {
  return categorias.map((cat, catIdx) => {
    const servicos: ServicoObraForm[] = cat.servicos.map((serv, servIdx) => {
      const servicoForm: ServicoObraForm = {
        ...serv,
        id: Date.now() + catIdx * 1000 + servIdx + 1,
        qt_dias_prevista: Number(serv.qt_dias_prevista ?? 0),
        qt_dias_real: Number(serv.qt_dias_real ?? 0),
        concluido: Boolean(serv.concluido),
        status: "NOPRAZO",
      };

      servicoForm.status = calculateServiceStatus(servicoForm);

      return servicoForm;
    });

    return {
      ...cat,
      id: Date.now() + catIdx,
      servicos,
    };
  });
}

function mapCategoriasFromBudget(budget: Orcamento): CategoriaObraForm[] {
  return budget.categoria.map((cat, catIdx) => ({
    id: Date.now() + catIdx,
    nome: cat.nome,
    qt_dias_prevista: 0,
    qt_dias_real: 0,
    porcentagem_de_conclusao: 0,
    servicos: cat.servicos.map((serv, servIdx) => ({
      id: Date.now() + catIdx * 1000 + servIdx + 1,
      nome: serv.nome,
      descricao: serv.descricao,
      qt_dias_prevista: 0,
      qt_dias_real: 0,
      concluido: false,
      status: "NOPRAZO" as ObraStatus,
    })),
  }));
}

export function ObrasForm({
  mode,
  initialData,
  budget,
  onClose,
  onSave,
  feedbackMessage,
  loading,
  onSuccess,
  onEdit,
}: ObrasFormProps) {
  const { token, user } = useAuth();
  const isReadOnly = mode === "details";
  const isAdd = mode === "add";
  const isEdit = mode === "edit";
  const [orcamentoAtrelado, setOrcamentoAtrelado] = useState<Orcamento | null>(
    budget ?? null,
  );

  useEffect(() => {
    async function carregarOrcamento() {
      if (budget) {
        setOrcamentoAtrelado(budget);
        return;
      }

      if (initialData && typeof initialData.orcamento === "string") {
        const response = await getBudgetById(initialData.orcamento, token!);

        setOrcamentoAtrelado(response);
      }

      if (initialData && typeof initialData.orcamento === "object") {
        setOrcamentoAtrelado(initialData.orcamento);
      }
    }

    carregarOrcamento();
  }, [budget, initialData, token]);

  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [loadingClient, setLoadingClient] = useState(mode !== "add");
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);

  useEffect(() => {
    async function carregarDados() {
      if (!token) return;

      let orcamento: Orcamento;

      if (budget) {
        orcamento = budget;
      } else if (initialData && typeof initialData.orcamento === "string") {
        orcamento = await getBudgetById(initialData.orcamento, token);
      } else if (initialData && typeof initialData.orcamento === "object") {
        orcamento = initialData.orcamento;
      } else {
        return;
      }

      setOrcamentoAtrelado(orcamento);

      // Agora busca o cliente
      if (typeof orcamento.cliente === "string") {
        const cliente = await getClientById(orcamento.cliente, token);

        setCliente(cliente);
      } else {
        setCliente(orcamento.cliente);
      }
    }

    carregarDados();
  }, [budget, initialData, token]);

  const [dataInicioPrevista, setDataInicioPrevista] = useState("");
  const [dataInicioReal, setDataInicioReal] = useState("");
  const [categorias, setCategorias] = useState<CategoriaObraForm[]>([]);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (initialData) {
      // Edição / Detalhes: usa os dados reais da obra
      setCategorias(mapCategoriasFromObra(initialData.categoria));
      setDataInicioPrevista(formatDateToBR(initialData.data_inicio_prevista));
      setDataInicioReal(formatDateToBR(initialData.data_inicio_real));
    } else if (budget) {
      // Criação: monta categorias/serviços zerados a partir do orçamento
      setCategorias(mapCategoriasFromBudget(budget));
    }
  }, [initialData, budget]);

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

  // Recalcula status/dias/porcentagem de cada categoria a partir dos serviços
  const categoriasCalculadas = useMemo(() => {
    return categorias.map((cat) => {
      const servicesWithStatus = cat.servicos.map((serv) => ({
        ...serv,
        status: calculateServiceStatus(serv),
      }));
      const calculated = calculateCategoryProgress(servicesWithStatus);
      return {
        ...cat,

        servicos: servicesWithStatus,

        qt_dias_prevista: calculated.qt_dias_prevista,

        qt_dias_real: calculated.qt_dias_real,

        porcentagem_de_conclusao: calculated.porcentagem_de_conclusao,

        status: calculated.status,
      };
    });
  }, [categorias]);

  const porcentagemConclusaoGeral = useMemo(() => {
    const diasTotais = categoriasCalculadas.reduce(
      (sum, cat) => sum + Number(cat.qt_dias_real ?? 0),
      0,
    );

    const diasConcluidos = categoriasCalculadas.reduce(
      (sum, cat) =>
        sum +
        Math.round(
          ((cat.qt_dias_real ?? 0) * (cat.porcentagem_de_conclusao ?? 0)) / 100,
        ),
      0,
    );

    if (diasTotais === 0) return 0;

    return Math.round((diasConcluidos / diasTotais) * 100);
  }, [categoriasCalculadas]);

  // Total de dias previstos/reais da obra = soma dos totais de cada categoria
  const totalQtDiasPrevista = useMemo(
    () =>
      categoriasCalculadas.reduce(
        (sum, cat) => sum + Number(cat.qt_dias_prevista ?? 0),
        0,
      ),
    [categoriasCalculadas],
  );

  const totalQtDiasReal = useMemo(
    () =>
      categoriasCalculadas.reduce(
        (sum, cat) => sum + Number(cat.qt_dias_real ?? 0),
        0,
      ),
    [categoriasCalculadas],
  );

  const formatDate = (date: Date) => {
    const dia = String(date.getDate()).padStart(2, "0");
    const mes = String(date.getMonth() + 1).padStart(2, "0");
    const ano = date.getFullYear();

    return `${dia}/${mes}/${ano}`;
  };

  const dataFimPrevistaCalculada = useMemo(() => {
    if (!dataInicioPrevista) return "";

    const [dia, mes, ano] = dataInicioPrevista.split("/");
    const start = new Date(Number(ano), Number(mes) - 1, Number(dia));

    if (Number.isNaN(start.getTime())) return "";

    const end = new Date(start);

    if (totalQtDiasPrevista > 0) {
      end.setDate(end.getDate() + totalQtDiasPrevista - 1);
    }

    return formatDate(end);
  }, [dataInicioPrevista, totalQtDiasPrevista]);

  const dataFimRealCalculada = useMemo(() => {
    if (!dataInicioReal) return "";

    const [dia, mes, ano] = dataInicioReal.split("/");
    const start = new Date(Number(ano), Number(mes) - 1, Number(dia));

    if (Number.isNaN(start.getTime())) return "";

    const end = new Date(start);

    if (totalQtDiasReal > 0) {
      end.setDate(end.getDate() + totalQtDiasReal - 1);
    }

    return formatDate(end);
  }, [dataInicioReal, totalQtDiasReal]);

  const obraStatusCalculado = useMemo(() => {
    return calculateWorkStatus(
      categoriasCalculadas,
      dataFimPrevistaCalculada,
      porcentagemConclusaoGeral,
    );
  }, [
    categoriasCalculadas,
    dataFimPrevistaCalculada,
    porcentagemConclusaoGeral,
  ]);

  const updateServico = useCallback(
    (
      categoriaId: number,
      servicoId: number,
      field: keyof ServicoObraForm,
      value: string | number | boolean,
    ) => {
      setCategorias((prevCategorias) =>
        prevCategorias.map((cat) => {
          if (cat.id !== categoriaId) return cat;

          const novosServicos = cat.servicos.map((serv) => {
            if (serv.id !== servicoId) return serv;
            const novoServico = {
              ...serv,

              [field]: value,
            };

            novoServico.status = calculateServiceStatus(novoServico);

            return novoServico;
          });

          return {
            ...cat,
            servicos: novosServicos,
          };
        }),
      );
    },
    [],
  );

  function parseDate(date: string): Date {
    const [dia, mes, ano] = date.split("/");

    return new Date(Number(ano), Number(mes) - 1, Number(dia));
  }

  async function handleSubmit() {
    if (isReadOnly) return;

    setFeedback("");

    if (!token || !user) {
      setFeedback("Sessão expirada.");
      return;
    }

    if (!orcamentoAtrelado) {
      setFeedback("Orçamento não encontrado para a obra.");
      return;
    }

    if (!cliente) {
      setFeedback("Cliente não encontrado para o orçamento.");
      return;
    }

    if (!dataInicioPrevista) {
      setFeedback("Informe a data de início prevista da obra.");
      return;
    }

    if (!isAdd && !dataInicioReal) {
      setFeedback("Informe a data de início real da obra.");
      return;
    }

    const workData = {
      orcamento: orcamentoAtrelado._id,
      responsavel: user._id,
      status: obraStatusCalculado,
      data_inicio_prevista: parseDate(dataInicioPrevista),
      data_fim_prevista: parseDate(dataFimPrevistaCalculada),
      data_inicio_real: dataInicioReal ? parseDate(dataInicioReal) : undefined,
      data_fim_real: dataFimRealCalculada
        ? parseDate(dataFimRealCalculada)
        : undefined,
      qt_dias_prevista: totalQtDiasPrevista,
      qt_dias_real: totalQtDiasReal,
      porcentagem_de_conclusao: porcentagemConclusaoGeral,
      categoria: categoriasCalculadas.map((cat) => ({
        nome: cat.nome,
        qt_dias_prevista: cat.qt_dias_prevista,
        qt_dias_real: cat.qt_dias_real,
        porcentagem_de_conclusao: cat.porcentagem_de_conclusao,
        status: cat.status,
        servicos: cat.servicos.map((s) => ({
          nome: s.nome,
          descricao: s.descricao,
          qt_dias_prevista: s.qt_dias_prevista,
          qt_dias_real: s.qt_dias_real,
          concluido: s.concluido,
          status: s.status,
        })),
      })),
    };

    if (onSave) await onSave(workData);
    if (onSuccess) onSuccess();
  }

  const scrollRef = useRef<ScrollView>(null);
  const irParaSalvar = () => {
    scrollRef.current?.scrollToEnd({
      animated: true,
    });
  };

  const [loadingClose, setLoadingClose] = useState(false);

  async function handleClose() {
    setLoadingClose(true);
    setFeedback("Cancelando Serviço...");
    setTimeout(() => {
      onClose();
      setLoadingClose(false);
      setFeedback("");
    }, 1500);
  }

  function getStatusColor(status: ObraStatus) {
    switch (status) {
      case "ENTREGUE":
        return COLORS.primary;

      case "ADIANTADO":
        return COLORS.success;

      case "ATRASADO":
        return COLORS.danger;

      case "CANCELADO":
        return COLORS.danger;

      default:
        return COLORS.warning;
    }
  }

  const [enderecoExpandido, setEnderecoExpandido] = useState(false);

  return (
    <View style={globalStyles.container}>
      <View style={globalStyles.modalHeader}>
        <Pressable onPress={onClose} style={globalStyles.leftAction}>
          <Ionicons name="arrow-back" size={25} color={COLORS.text} />
        </Pressable>

        <Text style={globalStyles.addTitle}>
          {mode === "add"
            ? "Novo Serviço"
            : mode === "edit"
              ? "Editar Serviço"
              : "Detalhes"}
        </Text>

        <Pressable
          onPress={mode === "details" ? onEdit : irParaSalvar}
          style={globalStyles.rightAction}
        >
          <Text style={globalStyles.saveText}>
            {mode === "details" ? "Editar" : "Salvar"}
          </Text>
          <Ionicons
            name={mode === "details" ? "pencil-sharp" : "download"}
            size={25}
            color={COLORS.title}
          />
        </Pressable>
      </View>

      <ScrollView ref={scrollRef} style={{ flex: 1 }}>
        <Text style={globalStyles.subtitle}>Informações Gerais</Text>
        <View style={globalStyles.divider} />
        <View style={globalStyles.card}>
          <Text
            style={[
              globalStyles.title,
              { marginVertical: 10, textAlign: "center" },
            ]}
          >
            {orcamentoAtrelado?.nome ?? ""}
          </Text>
          <View
            style={[
              globalStyles.obraStatusBadge,
              {
                backgroundColor: `${getStatusColor(obraStatusCalculado)}20`,
              },
            ]}
          >
            <Text
              style={[
                globalStyles.obraStatusText,
                {
                  color: getStatusColor(obraStatusCalculado),
                },
              ]}
            >
              {obraStatusCalculado}
            </Text>
          </View>

          <Text style={globalStyles.label}>Cliente:</Text>
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
              name={cliente?.nome ?? ""}
              phone={cliente?.telefone ?? ""}
              onClick={() => {
                setCliente(cliente);
                setDetailsVisible(true);
              }}
              icon={"eye"}
            />
          )}

          <View style={globalStyles.row}>
            <View style={globalStyles.column}>
              <Text style={globalStyles.label}>
                Data de Início Prevista:
                {!isReadOnly && !isEdit && (
                  <Text style={globalStyles.obrigatorio}>*</Text>
                )}
              </Text>
              <AppInput
                placeholder="DD/MM/YYYY"
                value={dataInicioPrevista}
                keyboardType="numeric"
                maxLength={10}
                onChangeText={(text) => setDataInicioPrevista(maskDate(text))}
                editable={!isReadOnly && !isEdit}
              />
            </View>

            {!isAdd && (
              <View style={globalStyles.column}>
                <Text style={globalStyles.label}>
                  Data de Início Real:
                  {!isReadOnly && (
                    <Text style={globalStyles.obrigatorio}>*</Text>
                  )}
                </Text>
                <AppInput
                  placeholder="DD/MM/YYYY"
                  value={dataInicioReal}
                  keyboardType="numeric"
                  maxLength={10}
                  onChangeText={(text) => setDataInicioReal(maskDate(text))}
                  editable={!isReadOnly}
                />
              </View>
            )}
          </View>
          {!isAdd && (
            <View style={{ marginTop: 10 }}>
              <Text style={globalStyles.label}>Conclusão Geral:</Text>

              <View
                style={[
                  globalStyles.progressContainer,
                  {
                    width: "100%",
                    marginTop: 8,
                  },
                ]}
              >
                <View
                  style={[
                    globalStyles.progressBarBackground,
                    {
                      minWidth: 0,
                    },
                  ]}
                >
                  <View
                    style={[
                      globalStyles.progressBarFill,
                      {
                        width: `${Math.min(
                          100,
                          Math.max(0, porcentagemConclusaoGeral),
                        )}%`,
                      },
                    ]}
                  />
                </View>

                <Text
                  style={[
                    globalStyles.workCardProgress,
                    {
                      marginLeft: 10,
                    },
                  ]}
                >
                  {porcentagemConclusaoGeral}%
                </Text>
              </View>
            </View>
          )}
        </View>
        <Text style={globalStyles.subtitle}>Endereço da Obra</Text>
        <View style={globalStyles.divider} />

        <View style={globalStyles.card}>
          {/* ENDEREÇO RESUMIDO */}
          <View style={globalStyles.row}>
            <View style={{ flex: 1 }}>
              <Text style={globalStyles.label}>Endereço:</Text>

              <AppInput
                value={
                  `${orcamentoAtrelado?.endereco?.rua ?? ""}, ` +
                  `${orcamentoAtrelado?.endereco?.numero ?? ""} - ` +
                  `${orcamentoAtrelado?.endereco?.cidade ?? ""}/${orcamentoAtrelado?.endereco?.estado ?? ""}`
                }
                editable={false}
              />
            </View>
          </View>

          {/* CAMPOS EXPANDIDOS */}
          {enderecoExpandido && (
            <>
              <View style={globalStyles.row}>
                <View style={globalStyles.column}>
                  <Text style={globalStyles.label}>CEP:</Text>
                  <AppInput
                    value={orcamentoAtrelado?.endereco?.CEP ?? ""}
                    editable={false}
                  />
                </View>

                <View style={globalStyles.column}>
                  <Text style={globalStyles.label}>Estado:</Text>
                  <AppInput
                    value={orcamentoAtrelado?.endereco?.estado ?? ""}
                    editable={false}
                  />
                </View>
              </View>

              <View style={globalStyles.row}>
                <View style={globalStyles.column}>
                  <Text style={globalStyles.label}>Cidade:</Text>
                  <AppInput
                    value={orcamentoAtrelado?.endereco?.cidade ?? ""}
                    editable={false}
                  />
                </View>

                <View style={globalStyles.column}>
                  <Text style={globalStyles.label}>Bairro:</Text>
                  <AppInput
                    value={orcamentoAtrelado?.endereco?.bairro ?? ""}
                    editable={false}
                  />
                </View>
              </View>

              <Text style={globalStyles.label}>Logradouro:</Text>

              <AppInput
                value={orcamentoAtrelado?.endereco?.rua ?? ""}
                editable={false}
              />

              <View style={globalStyles.row}>
                <View style={globalStyles.column}>
                  <Text style={globalStyles.label}>Número:</Text>
                  <AppInput
                    value={orcamentoAtrelado?.endereco?.numero ?? ""}
                    editable={false}
                  />
                </View>

                <View style={globalStyles.column}>
                  <Text style={globalStyles.label}>Complemento:</Text>
                  <AppInput
                    value={orcamentoAtrelado?.endereco?.complemento ?? ""}
                    editable={false}
                  />
                </View>
              </View>
            </>
          )}

          {/* TEXTO DO BOTÃO */}
          <Pressable
            onPress={() => setEnderecoExpandido((prev) => !prev)}
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
              {enderecoExpandido
                ? "Ocultar endereço completo"
                : "Ver endereço completo"}
            </Text>

            <Ionicons
              name={enderecoExpandido ? "chevron-up" : "chevron-down"}
              size={18}
              color={COLORS.primary}
              style={{ marginLeft: 5 }}
            />
          </Pressable>
        </View>
        <Text style={globalStyles.subtitle}>Categorias e Serviços</Text>
        <View style={globalStyles.divider} />
        {categoriasCalculadas.map((categoria, idx) => (
          <View key={categoria.id} style={globalStyles.card}>
            <Text style={globalStyles.label}>Nome da Categoria {idx + 1}:</Text>
            <AppInput value={categoria.nome} editable={false} />
            <View style={globalStyles.row}>
              <View style={globalStyles.column}>
                <Text style={globalStyles.label}>Dias Previstos:</Text>
                <AppInput
                  value={String(categoria.qt_dias_prevista || 0)}
                  editable={false}
                />
              </View>
              {!isAdd && (
                <View style={globalStyles.column}>
                  <Text style={globalStyles.label}>Dias Reais:</Text>
                  <AppInput
                    value={String(categoria.qt_dias_real || 0)}
                    editable={false}
                  />
                </View>
              )}
            </View>
            {!isAdd && (
              <View style={globalStyles.row}>
                <View style={globalStyles.column}>
                  <Text style={globalStyles.label}>Status da Categoria:</Text>
                  <AppInput value={categoria.status} editable={false} />
                </View>
                <View style={globalStyles.column}>
                  <Text style={globalStyles.label}>
                    Progresso da Categoria:
                  </Text>
                  <AppInput
                    value={`${categoria.porcentagem_de_conclusao || 0}%`}
                    editable={false}
                  />
                </View>
              </View>
            )}
            {categoria.servicos.map((servico, sIdx) => (
              <View key={servico.id} style={styles.serviceCard}>
                <View
                  style={[
                    globalStyles.obraStatusBadge,
                    {
                      backgroundColor: `${getStatusColor(servico.status)}20`,
                    },
                  ]}
                >
                  <Text
                    style={[
                      globalStyles.obraStatusText,
                      {
                        color: getStatusColor(servico.status),
                      },
                    ]}
                  >
                    {servico.status}
                  </Text>
                </View>

                <Text style={globalStyles.label}>
                  Nome do Serviço {sIdx + 1}:
                </Text>

                <AppInput value={servico.nome} editable={false} />
                <Text style={globalStyles.label}>Descrição:</Text>
                <AppInput
                  placeholder="Informe detalhes sobre esse serviço"
                  onChangeText={(text) =>
                    updateServico(categoria.id, servico.id, "descricao", text)
                  }
                  value={servico.descricao}
                  editable={!isReadOnly}
                />
                <View style={globalStyles.row}>
                  <View style={globalStyles.column}>
                    <Text style={globalStyles.label}>
                      Dias Previstos:
                      {!isReadOnly && !isEdit && (
                        <Text style={globalStyles.obrigatorio}>*</Text>
                      )}
                    </Text>
                    <AppInput
                      placeholder="Dias"
                      value={String(servico.qt_dias_prevista ?? 0)}
                      onChangeText={(text) =>
                        updateServico(
                          categoria.id,
                          servico.id,
                          "qt_dias_prevista",
                          Number(text) || 0,
                        )
                      }
                      keyboardType="numeric"
                      editable={!isReadOnly && !isEdit}
                    />
                  </View>
                  {!isAdd && (
                    <View style={globalStyles.column}>
                      <Text style={globalStyles.label}>
                        Dias Reais:
                        {!isReadOnly && (
                          <Text style={globalStyles.obrigatorio}>*</Text>
                        )}
                      </Text>
                      <AppInput
                        placeholder="Dias"
                        value={String(servico.qt_dias_real ?? 0)}
                        onChangeText={(text) =>
                          updateServico(
                            categoria.id,
                            servico.id,
                            "qt_dias_real",
                            Number(text) || 0,
                          )
                        }
                        keyboardType="numeric"
                        editable={!isReadOnly}
                      />
                    </View>
                  )}
                </View>
                {!isAdd && (
                  <View style={globalStyles.row}>
                    <Text style={globalStyles.label}>
                      O Serviço foi Concluído?
                    </Text>
                    <Checkbox
                      color={servico.concluido ? COLORS.primary : undefined}
                      style={globalStyles.checkbox}
                      disabled={isReadOnly}
                      value={servico.concluido ?? false}
                      onValueChange={(newValue) => {
                        updateServico(
                          categoria.id,
                          servico.id,
                          "concluido",
                          newValue,
                        );

                        if (newValue && !servico.qt_dias_real) {
                          updateServico(
                            categoria.id,
                            servico.id,
                            "qt_dias_real",
                            servico.qt_dias_prevista ?? 0,
                          );
                        }

                        if (!newValue) {
                          updateServico(
                            categoria.id,
                            servico.id,
                            "qt_dias_real",
                            0,
                          );
                        }
                      }}
                    />
                  </View>
                )}
              </View>
            ))}
          </View>
        ))}
        <Text style={globalStyles.subtitle}>Resumo da Obra</Text>
        <View style={globalStyles.divider} />
        <View style={globalStyles.card}>
          <View style={globalStyles.row}>
            <View style={globalStyles.column}>
              <Text style={globalStyles.label}>Data de Fim Prevista:</Text>
              <AppInput
                placeholder="DD/MM/YYYY"
                value={dataFimPrevistaCalculada}
                editable={false}
              />
            </View>

            {!isAdd && (
              <View style={globalStyles.column}>
                <Text style={globalStyles.label}>Data de Fim Real:</Text>
                <AppInput
                  placeholder="DD/MM/YYYY"
                  value={dataFimRealCalculada}
                  editable={false}
                />
              </View>
            )}
          </View>
          <View style={globalStyles.row}>
            <View style={globalStyles.column}>
              <Text style={globalStyles.label}>Orçamento Aprovado:</Text>
              <AppInput
                value={`R$ ${(orcamentoAtrelado?.preco_com_bdi ?? 0).toFixed(2)}`}
                editable={false}
              />
            </View>
            {!isAdd && (
              <View style={globalStyles.column}>
                <Text style={globalStyles.label}>Total gasto:</Text>
                <AppInput
                  placeholder="R$ 0,00"
                  value={"R$ 0.00"}
                  editable={false}
                />
              </View>
            )}
          </View>
        </View>

        {feedback !== "" && (
          <Text style={globalStyles.feedback}>{feedback}</Text>
        )}
        {feedbackMessage && feedbackMessage !== "" && (
          <Text style={globalStyles.feedback}>{feedbackMessage}</Text>
        )}
        <View style={globalStyles.divider}></View>
        <AppButton
          title={
            mode === "add"
              ? "Salvar Novo Serviço"
              : mode === "edit"
                ? "Salvar Alterações"
                : "Gerar PDF"
          }
          onPress={handleSubmit}
          loading={loading}
          color={COLORS.primary}
        />
        <AppButton
          title={
            mode === "add"
              ? "Cancelar Serviço"
              : mode === "edit"
                ? "Cancelar Alterações"
                : "Voltar"
          }
          onPress={handleClose}
          loading={loadingClose}
          color={COLORS.danger}
        />
      </ScrollView>
      <DetailsClientModal
        visible={detailsVisible}
        client={cliente}
        onClose={() => setDetailsVisible(false)}
        onEdit={() => {
          setDetailsVisible(false);

          setTimeout(() => {
            setEditVisible(true);
          }, 200);
        }}
      />
      <EditClientModal
        visible={editVisible}
        onClose={() => setEditVisible(false)}
        client={cliente}
        onSuccess={loadClient}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  serviceCard: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
});
