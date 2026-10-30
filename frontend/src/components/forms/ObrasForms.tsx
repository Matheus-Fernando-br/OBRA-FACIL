import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ComponentRef, useEffect, useState, useCallback, useMemo, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";
import { AppInput } from "@/components/forms/AppInput";
import { ClientCardSelect } from "@/components/cards/cliente/ClientCardSelect";
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
import { getBudgetById, getClientById } from "@/services/api";
import { maskDate } from "./mask";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StatusPill } from "@/components/ui/StatusPill";
import { getWorkStatusMeta } from "@/utils/status";
import { diasPrevistos, diasReais, duracaoServico, erroPeriodo, periodo, temCronograma } from "@/utils/workSchedule";

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
  /** Gera o relatório da obra em PDF (inclui a EAP no final). */
  onGeneratePdf?: () => Promise<void> | void;
  /** Gera só a EAP e o cronograma em PDF. */
  onGenerateEapPdf?: () => Promise<void> | void;
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

  // Com cronograma: período da etapa (serviços simultâneos não somam).
  const qt_dias_prevista = diasPrevistos(services);
  const qt_dias_real = diasReais(services);

  // Peso de cada serviço no progresso = sua duração prevista.
  const pesoTotal = services.reduce((sum, s) => sum + Number(s.qt_dias_prevista ?? 0), 0);
  const diasPrevistosConcluidos = services.reduce(
    (sum, s) => (s.concluido ? sum + Number(s.qt_dias_prevista ?? 0) : sum),
    0,
  );

  const porcentagem_de_conclusao =
    pesoTotal > 0
      ? Math.min(100, Math.round((diasPrevistosConcluidos / pesoTotal) * 100))
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
  totais?: { previstos: number; reais: number },
): ObraStatus => {
  if (categorias.length === 0) {
    return "NOPRAZO";
  }

  const todasConcluidas = categorias.every(
    (c) => c.porcentagem_de_conclusao === 100,
  );

  const previstosObra =
    totais?.previstos ?? categorias.reduce((s, c) => s + Number(c.qt_dias_prevista ?? 0), 0);
  const reaisObra = totais?.reais ?? categorias.reduce((s, c) => s + Number(c.qt_dias_real ?? 0), 0);

  if (todasConcluidas) {
    if (reaisObra > previstosObra) {
      return "ATRASADO";
    }

    if (reaisObra < previstosObra) {
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
        qt_dias_prevista: duracaoServico(serv) ?? Number(serv.qt_dias_prevista ?? 0),
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
      dia_inicio: undefined,
      dia_fim: undefined,
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
  onGeneratePdf,
  onGenerateEapPdf,
}: ObrasFormProps) {
  const { styles, theme } = useTheme();
  const insets = useSafeAreaInsets();

  const { token, user } = useAuth();
  const isReadOnly = mode === "details";
  const isAdd = mode === "add";
  const isEdit = mode === "edit";
  const [orcamentoAtrelado, setOrcamentoAtrelado] = useState<Orcamento | null>(
    budget ?? null,
  );
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [loadingClient, setLoadingClient] = useState(mode !== "add");

  useEffect(() => {
    async function carregarDados() {
      if (!token) return;

      try {
        setLoadingClient(mode !== "add");

        let orcamento: Orcamento;

        // Se já recebeu o orçamento, não busca novamente
        if (budget) {
          orcamento = budget;
        }

        // Se a obra possui apenas o ID do orçamento, busca pelo ID
        else if (initialData && typeof initialData.orcamento === "string") {
          orcamento = await getBudgetById(initialData.orcamento, token);
        }

        // Se a obra já possui o objeto orçamento
        else if (initialData && typeof initialData.orcamento === "object") {
          orcamento = initialData.orcamento;
        }

        // Não encontrou orçamento
        else {
          setOrcamentoAtrelado(null);
          setCliente(null);
          return;
        }

        // Guarda o orçamento encontrado
        setOrcamentoAtrelado(orcamento);

        // Agora busca o cliente pelo ID que está dentro do orçamento
        if (typeof orcamento.cliente === "string") {
          const clienteEncontrado = await getClientById(
            orcamento.cliente,
            token,
          );

          setCliente(clienteEncontrado);
        } else {
          // Caso o orçamento já venha com o cliente completo
          setCliente(orcamento.cliente);
        }
      } catch (error) {
        console.error("Erro ao carregar orçamento/cliente:", error);

        setOrcamentoAtrelado(null);
        setCliente(null);
      } finally {
        setLoadingClient(false);
      }
    }

    carregarDados();
  }, [budget, initialData, token, mode]);

  // Nome da obra: editável na obra (o orçamento aprovado continua intacto).
  const [nomeObra, setNomeObra] = useState(initialData?.nome || budget?.nome || "");
  useEffect(() => {
    if (!nomeObra && orcamentoAtrelado?.nome) setNomeObra(orcamentoAtrelado.nome);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orcamentoAtrelado]);

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

  // Conclusão geral = dias previstos dos serviços concluídos / dias previstos
  // totais (mesmo critério das etapas). Antes era ponderada pelos dias
  // reais, o que marcava 100% com etapas ainda não iniciadas.
  const porcentagemConclusaoGeral = useMemo(() => {
    let previstos = 0;
    let concluidos = 0;

    categoriasCalculadas.forEach((cat) =>
      cat.servicos.forEach((serv) => {
        const dias = Number(serv.qt_dias_prevista ?? 0);
        previstos += dias;
        if (serv.concluido) concluidos += dias;
      }),
    );

    if (previstos === 0) return 0;

    return Math.min(100, Math.round((concluidos / previstos) * 100));
  }, [categoriasCalculadas]);

  // Duração da obra: período geral do cronograma (do primeiro ao último dia),
  // não a soma das durações. Obras antigas sem cronograma: soma das etapas.
  const todosServicos = useMemo(() => categoriasCalculadas.flatMap((c) => c.servicos), [categoriasCalculadas]);
  const usaCronograma = isAdd || temCronograma(todosServicos);
  const periodoGeral = useMemo(() => periodo(todosServicos), [todosServicos]);

  const totalQtDiasPrevista = useMemo(
    () =>
      usaCronograma
        ? diasPrevistos(todosServicos)
        : categoriasCalculadas.reduce((sum, cat) => sum + Number(cat.qt_dias_prevista ?? 0), 0),
    [usaCronograma, todosServicos, categoriasCalculadas],
  );

  const totalQtDiasReal = useMemo(
    () =>
      usaCronograma
        ? diasReais(todosServicos)
        : categoriasCalculadas.reduce((sum, cat) => sum + Number(cat.qt_dias_real ?? 0), 0),
    [usaCronograma, todosServicos, categoriasCalculadas],
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

    // Com cronograma: dia 1 = início previsto; termina no último dia do cronograma.
    const ultimoDia = periodoGeral ? periodoGeral.fim : totalQtDiasPrevista;
    if (ultimoDia > 0) {
      end.setDate(end.getDate() + ultimoDia - 1);
    }

    return formatDate(end);
  }, [dataInicioPrevista, totalQtDiasPrevista, periodoGeral]);

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
      { previstos: totalQtDiasPrevista, reais: totalQtDiasReal },
    );
  }, [
    categoriasCalculadas,
    dataFimPrevistaCalculada,
    porcentagemConclusaoGeral,
    totalQtDiasPrevista,
    totalQtDiasReal,
  ]);

  const updateServico = useCallback(
    (
      categoriaId: number,
      servicoId: number,
      field: keyof ServicoObraForm,
      value: string | number | boolean | undefined,
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
            if (field === "dia_inicio" || field === "dia_fim") {
              novoServico.qt_dias_prevista = duracaoServico(novoServico) ?? 0;
            }

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

  /** Data completa e existente no calendário (rejeita 31/02, etc.). */
  function isValidBRDate(value: string) {
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return false;
    const d = parseDate(value);
    return formatDateToBR(d) === value;
  }

  const [submitting, setSubmitting] = useState(false);
  const [pdfLoading, setPdfLoading] = useState<"completo" | "eap" | null>(null);

  async function runPdf(kind: "completo" | "eap") {
    const fn = kind === "eap" ? onGenerateEapPdf : onGeneratePdf;
    if (!fn || pdfLoading) return;
    setFeedback("");
    setPdfLoading(kind);
    try {
      await fn();
    } catch (error: any) {
      console.log("ERRO AO GERAR PDF DA OBRA:", error);
      setFeedback(error?.message ? `Erro ao gerar PDF: ${error.message}` : "Erro ao gerar PDF.");
    } finally {
      setPdfLoading(null);
    }
  }
  const handleGeneratePdf = () => runPdf("completo");

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

    if (!isValidBRDate(dataInicioPrevista)) {
      setFeedback("Data de início prevista inválida. Use DD/MM/AAAA.");
      return;
    }

    if (!isAdd && !dataInicioReal) {
      setFeedback("Informe a data de início real da obra.");
      return;
    }

    if (dataInicioReal && !isValidBRDate(dataInicioReal)) {
      setFeedback("Data de início real inválida. Use DD/MM/AAAA.");
      return;
    }

    if (!nomeObra.trim()) {
      setFeedback("Informe o nome da obra.");
      return;
    }

    const semNome = todosServicos.find((serv) => !serv.nome?.trim());
    if (semNome) {
      setFeedback("Informe o nome de todos os serviços.");
      return;
    }

    if (usaCronograma) {
      for (const serv of todosServicos) {
        const erro = erroPeriodo(serv);
        if (erro) {
          setFeedback(`Cronograma do serviço "${serv.nome}": ${erro}`);
          return;
        }
      }
    }

    const workData = {
      nome: nomeObra.trim(),
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
          dia_inicio: s.dia_inicio,
          dia_fim: s.dia_fim,
          status: s.status,
        })),
      })),
    };

    try {
      setSubmitting(true);
      if (onSave) await onSave(workData);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.log("ERRO AO SALVAR OBRA:", error?.response?.data || error);
      setFeedback(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Erro ao salvar a obra.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);

  // Mensagens de validação ficam no fim do formulário: leva o usuário até elas.
  useEffect(() => {
    if (feedback) scrollRef.current?.scrollToEnd({ animated: true });
  }, [feedback]);
  function handleClose() {
    setFeedback("");
    onClose();
  }



  const [enderecoExpandido, setEnderecoExpandido] = useState(false);

  return (
    <View style={[styles.formScreen, { paddingTop: insets.top }]}>
      <View style={styles.modalHeader}>
        <Pressable onPress={onClose} style={styles.leftAction}>
          <Ionicons name="chevron-back" size={26} color={theme.primary} />
        </Pressable>

        <Text style={styles.addTitle}>
          {mode === "add"
            ? "Nova Obra"
            : mode === "edit"
              ? "Atualizar Obra"
              : "Detalhes da Obra"}
        </Text>

        {mode === "details" ? (
          <View style={styles.right}>
            {onEdit && (
              <Pressable
                onPress={onEdit}
                style={[styles.rightAction, { backgroundColor: "transparent", paddingHorizontal: 6 }]}
                accessibilityLabel="Atualizar andamento"
              >
                <Text style={styles.saveText}>Editar</Text>
              </Pressable>
            )}
            {onGenerateEapPdf && (
              <Pressable
                onPress={() => runPdf("eap")}
                disabled={!!pdfLoading}
                style={[styles.rightAction, { marginRight: 6 }]}
                accessibilityLabel="Gerar estrutura analítica em PDF"
              >
                {pdfLoading === "eap" ? (
                  <ActivityIndicator size="small" color={theme.primary} />
                ) : (
                  <Ionicons name="git-network-outline" size={16} color={theme.primary} />
                )}
                <Text style={styles.saveText}>EAP</Text>
              </Pressable>
            )}
            {onGeneratePdf && (
              <Pressable
                onPress={handleGeneratePdf}
                disabled={!!pdfLoading}
                style={styles.rightAction}
                accessibilityLabel="Gerar relatório em PDF"
              >
                {pdfLoading === "completo" ? (
                  <ActivityIndicator size="small" color={theme.primary} />
                ) : (
                  <Ionicons name="document-text-outline" size={16} color={theme.primary} />
                )}
                <Text style={styles.saveText}>PDF</Text>
              </Pressable>
            )}
          </View>
        ) : (
          <Pressable
            onPress={handleSubmit}
            disabled={submitting || loading}
            style={styles.rightAction}
            accessibilityLabel="Salvar obra"
          >
            {submitting || loading ? (
              <ActivityIndicator size="small" color={theme.primary} />
            ) : (
              <Ionicons name="checkmark" size={16} color={theme.primary} />
            )}
            <Text style={styles.saveText}>Salvar</Text>
          </Pressable>
        )}
      </View>

      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>Informações Gerais</Text>
        <View style={styles.divider} />
        <View style={styles.card}>
          {isReadOnly ? (
            <Text style={[styles.title, { marginVertical: 10, textAlign: "center" }]}>
              {nomeObra || orcamentoAtrelado?.nome || ""}
            </Text>
          ) : (
            <>
              <Text style={styles.label}>
                Nome da obra:<Text style={styles.obrigatorio}>*</Text>
              </Text>
              <AppInput placeholder="Nome da obra" value={nomeObra} onChangeText={setNomeObra} maxLength={200} />
            </>
          )}
          {!isAdd && (
            <View style={{ alignSelf: "center", marginBottom: 8 }}>
              <StatusPill meta={getWorkStatusMeta(obraStatusCalculado, theme)} withIcon />
            </View>
          )}
          <Text style={styles.label}>Cliente:</Text>
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
              name={cliente?.nome ?? "Cliente não encontrado"}
              phone={cliente?.telefone ?? ""}
              onClick={() => {
                setCliente(cliente);
              }}
              icon={"eye"}
            />
          )}

          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>
                Data de Início Prevista:
                {!isReadOnly && !isEdit && (
                  <Text style={styles.obrigatorio}>*</Text>
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
              <View style={styles.column}>
                <Text style={styles.label}>
                  Data de Início Real:
                  {!isReadOnly && <Text style={styles.obrigatorio}>*</Text>}
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
              <Text style={styles.label}>Conclusão Geral:</Text>

              <View style={{ marginTop: 8 }}>
                <ProgressBar
                  value={porcentagemConclusaoGeral}
                  color={getWorkStatusMeta(obraStatusCalculado, theme).color}
                />
              </View>
            </View>
          )}
        </View>
        <Text style={styles.subtitle}>Endereço da Obra</Text>
        <View style={styles.divider} />

        <View style={styles.card}>
          {/* ENDEREÇO RESUMIDO */}
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Endereço:</Text>

              <AppInput
                value={
                  [
                    [orcamentoAtrelado?.endereco?.rua, orcamentoAtrelado?.endereco?.numero]
                      .filter(Boolean)
                      .join(", "),
                    [orcamentoAtrelado?.endereco?.cidade, orcamentoAtrelado?.endereco?.estado]
                      .filter(Boolean)
                      .join("/"),
                  ]
                    .filter(Boolean)
                    .join(" - ") || "Endereço não informado"
                }
                editable={false}
              />
            </View>
          </View>

          {/* CAMPOS EXPANDIDOS */}
          {enderecoExpandido && (
            <>
              <View style={styles.row}>
                <View style={styles.column}>
                  <Text style={styles.label}>CEP:</Text>
                  <AppInput
                    value={orcamentoAtrelado?.endereco?.CEP ?? ""}
                    editable={false}
                  />
                </View>

                <View style={styles.column}>
                  <Text style={styles.label}>Estado:</Text>
                  <AppInput
                    value={orcamentoAtrelado?.endereco?.estado ?? ""}
                    editable={false}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.column}>
                  <Text style={styles.label}>Cidade:</Text>
                  <AppInput
                    value={orcamentoAtrelado?.endereco?.cidade ?? ""}
                    editable={false}
                  />
                </View>

                <View style={styles.column}>
                  <Text style={styles.label}>Bairro:</Text>
                  <AppInput
                    value={orcamentoAtrelado?.endereco?.bairro ?? ""}
                    editable={false}
                  />
                </View>
              </View>

              <Text style={styles.label}>Logradouro:</Text>

              <AppInput
                value={orcamentoAtrelado?.endereco?.rua ?? ""}
                editable={false}
              />

              <View style={styles.row}>
                <View style={styles.column}>
                  <Text style={styles.label}>Número:</Text>
                  <AppInput
                    value={orcamentoAtrelado?.endereco?.numero ?? ""}
                    editable={false}
                  />
                </View>

                <View style={styles.column}>
                  <Text style={styles.label}>Complemento:</Text>
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
                color: theme.primary,
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
              color={theme.primary}
              style={{ marginLeft: 5 }}
            />
          </Pressable>
        </View>
        <Text style={styles.subtitle}>Categorias e Serviços</Text>
        <View style={styles.divider} />
        {categoriasCalculadas.map((categoria, idx) => (
          <View key={categoria.id} style={styles.card}>
            <Text style={styles.label}>Etapa {idx + 1}:</Text>
            <AppInput value={categoria.nome} editable={false} />
            <View style={styles.row}>
              <View style={styles.column}>
                <Text style={styles.label}>Dias Previstos:</Text>
                <AppInput
                  value={String(categoria.qt_dias_prevista || 0)}
                  editable={false}
                />
              </View>
              {!isAdd && (
                <View style={styles.column}>
                  <Text style={styles.label}>Dias Reais:</Text>
                  <AppInput
                    value={String(categoria.qt_dias_real || 0)}
                    editable={false}
                  />
                </View>
              )}
            </View>
            {!isAdd && (
              <View style={styles.row}>
                <View style={styles.column}>
                  <Text style={styles.label}>Status da etapa:</Text>
                  <AppInput
                    value={getWorkStatusMeta(categoria.status, theme).label}
                    editable={false}
                  />
                </View>
                <View style={styles.column}>
                  <Text style={styles.label}>Progresso da etapa:</Text>
                  <AppInput
                    value={`${categoria.porcentagem_de_conclusao || 0}%`}
                    editable={false}
                  />
                </View>
              </View>
            )}
            {categoria.servicos.map((servico, sIdx) => (
              <View key={servico.id} style={styles.serviceCard}>
                {!isAdd && (
                  <StatusPill
                    meta={
                      servico.concluido
                        ? getWorkStatusMeta(servico.status, theme)
                        : { label: "Em execução", color: theme.info, icon: "time" }
                    }
                  />
                )}

                <Text style={styles.label}>Nome do Serviço {sIdx + 1}:</Text>

                <AppInput
                  value={servico.nome}
                  placeholder="Nome do serviço"
                  onChangeText={(text) => updateServico(categoria.id, servico.id, "nome", text)}
                  editable={!isReadOnly}
                />
                {usaCronograma && (
                  <>
                    <Text style={styles.label}>
                      Cronograma (dias a partir do início da obra):
                      {isAdd && <Text style={styles.obrigatorio}>*</Text>}
                    </Text>
                    <View style={styles.row}>
                      <View style={styles.column}>
                        <Text style={styles.label}>Do dia</Text>
                        <AppInput
                          placeholder="Ex.: 2"
                          value={servico.dia_inicio ? String(servico.dia_inicio) : ""}
                          onChangeText={(text) => {
                            const n = parseInt(text.replace(/\D/g, ""), 10);
                            updateServico(categoria.id, servico.id, "dia_inicio", Number.isFinite(n) ? n : undefined);
                          }}
                          keyboardType="numeric"
                          maxLength={4}
                          editable={isAdd}
                        />
                      </View>
                      <View style={styles.column}>
                        <Text style={styles.label}>Até o dia</Text>
                        <AppInput
                          placeholder="Ex.: 4"
                          value={servico.dia_fim ? String(servico.dia_fim) : ""}
                          onChangeText={(text) => {
                            const n = parseInt(text.replace(/\D/g, ""), 10);
                            updateServico(categoria.id, servico.id, "dia_fim", Number.isFinite(n) ? n : undefined);
                          }}
                          keyboardType="numeric"
                          maxLength={4}
                          editable={isAdd}
                        />
                      </View>
                    </View>
                    {isAdd && !!erroPeriodo(servico) && (servico.dia_inicio || servico.dia_fim) ? (
                      <Text style={styles.feedback}>{erroPeriodo(servico)}</Text>
                    ) : null}
                  </>
                )}
                <Text style={styles.label}>Descrição:</Text>
                <AppInput
                  placeholder="Informe detalhes sobre esse serviço"
                  onChangeText={(text) =>
                    updateServico(categoria.id, servico.id, "descricao", text)
                  }
                  value={servico.descricao}
                  editable={!isReadOnly}
                />
                <View style={styles.row}>
                  <View style={styles.column}>
                    <Text style={styles.label}>Dias Previstos:</Text>
                    {/* Calculado pelo cronograma (sempre só leitura). */}
                    <AppInput value={String(servico.qt_dias_prevista ?? 0)} editable={false} />
                  </View>
                  {!isAdd && (
                    <View style={styles.column}>
                      <Text style={styles.label}>
                        Dias Reais:
                        {!isReadOnly && (
                          <Text style={styles.obrigatorio}>*</Text>
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
                  <View style={styles.row}>
                    <Text style={styles.label}>O Serviço foi Concluído?</Text>
                    <Checkbox
                      color={servico.concluido ? theme.primary : undefined}
                      style={styles.checkbox}
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
        <Text style={styles.subtitle}>Resumo da Obra</Text>
        <View style={styles.divider} />
        <View style={styles.card}>
          <Text style={styles.label}>Duração prevista da obra:</Text>
          <AppInput
            value={
              periodoGeral
                ? `${periodoGeral.dias} ${periodoGeral.dias === 1 ? "dia" : "dias"} (do dia ${periodoGeral.inicio} ao dia ${periodoGeral.fim})`
                : `${totalQtDiasPrevista} ${totalQtDiasPrevista === 1 ? "dia" : "dias"}`
            }
            editable={false}
          />
          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Data de Fim Prevista:</Text>
              <AppInput
                placeholder="DD/MM/YYYY"
                value={dataFimPrevistaCalculada}
                editable={false}
              />
            </View>

            {!isAdd && (
              <View style={styles.column}>
                <Text style={styles.label}>Data de Fim Real:</Text>
                <AppInput
                  placeholder="DD/MM/YYYY"
                  value={dataFimRealCalculada}
                  editable={false}
                />
              </View>
            )}
          </View>
          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Orçamento Aprovado:</Text>
              <AppInput
                value={(orcamentoAtrelado?.preco_com_bdi ?? 0).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
                editable={false}
              />
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Custo direto:</Text>
              <AppInput
                value={(orcamentoAtrelado?.preco ?? 0).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
                editable={false}
              />
            </View>
          </View>
        </View>

        {feedback !== "" && <Text style={styles.feedback}>{feedback}</Text>}
        {feedbackMessage && feedbackMessage !== "" && (
          <Text style={styles.feedback}>{feedbackMessage}</Text>
        )}
        <View style={styles.divider}></View>
        {(onGeneratePdf || onGenerateEapPdf) && !isAdd && (
          <View>
            {onGeneratePdf && (
              <View>
                <AppButton
                  title="Relatório (PDF)"
                  icon="document-text-outline"
                  variant={isReadOnly ? "primary" : "tinted"}
                  onPress={handleGeneratePdf}
                  loading={pdfLoading === "completo"}
                />
              </View>
            )}
            {onGenerateEapPdf && (
              <View>
                <AppButton
                  title="Estrutura analítica (PDF)"
                  icon="git-network-outline"
                  variant="tinted"
                  onPress={() => runPdf("eap")}
                  loading={pdfLoading === "eap"}
                />
              </View>
            )}
          </View>
        )}
        {isReadOnly ? null : (
          <AppButton
            title={mode === "add" ? "Criar obra" : "Salvar andamento"}
            icon="checkmark"
            onPress={handleSubmit}
            loading={submitting || loading}
          />
        )}
        <AppButton
          variant="secondary"
          title={isReadOnly ? "Voltar" : "Cancelar"}
          onPress={handleClose}
        />
      </ScrollView>
    </View>
  );
}

