import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { globalStyles, COLORS } from "@/styles/globalStyles";
import { AppInput } from "@/components/forms/AppInput";
import { AppButton } from "@/components/buttons/AppButton";
import { useAuth } from "@/contexts/AuthContext";
import {
  Cliente,
  Obra,
  Orcamento,
  CategoriaObra,
  ServicoObra,
  Usuario,
} from "@/components/layout/interface";
import { getBudgetById, getClientById } from "@/services/api";
import { maskDate } from "./mask";

type ObraStatus = Obra["status"];

interface ServicoObraForm extends ServicoObra {
  id: number;
  status: ObraStatus;
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
  onGeneratePdf?: () => void;
  client?: Cliente[];
  feedbackMessage?: string;
  loading?: boolean;
  onSuccess?: () => void;
}

function formatDateInput(value?: Date | string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().split("T")[0];
}

const calculateServiceStatus = (service: ServicoObraForm): ObraStatus => {
  const prevista = service.qt_dias_prevista || 0;
  const real = service.qt_dias_real || 0;

  if (!real) return "NOPRAZO";
  if (real > prevista) return "ATRASADO";
  if (real < prevista) return "ADIANTADO";
  return "NOPRAZO";
};

// Progresso, dias e status da categoria são 100% calculados a partir dos serviços
const calculateCategoryProgress = (services: ServicoObraForm[]) => {
  if (services.length === 0) {
    return {
      porcentagem_de_conclusao: 0,
      qt_dias_prevista: 0,
      qt_dias_real: 0,
      status: "NOPRAZO" as ObraStatus,
    };
  }

  const qt_dias_prevista = services.reduce(
    (sum, s) => sum + (s.qt_dias_prevista || 0),
    0,
  );
  const qt_dias_real = services.reduce(
    (sum, s) => sum + (s.qt_dias_real || 0),
    0,
  );
  const totalProgress = services.reduce(
    (sum, s) => sum + (s.porcentagem_de_conclusao || 0),
    0,
  );
  const porcentagem_de_conclusao = Math.round(totalProgress / services.length);

  let status: ObraStatus = "NOPRAZO";
  if (services.some((s) => s.status === "ATRASADO")) {
    status = "ATRASADO";
  } else if (services.every((s) => s.status === "ADIANTADO")) {
    status = "ADIANTADO";
  } else if (services.every((s) => s.status === "ENTREGUE")) {
    status = "ENTREGUE";
  } else if (services.every((s) => s.status === "CANCELADO")) {
    status = "CANCELADO";
  }

  return { porcentagem_de_conclusao, qt_dias_prevista, qt_dias_real, status };
};

function mapCategoriasFromObra(
  categorias: CategoriaObra[],
): CategoriaObraForm[] {
  return categorias.map((cat, catIdx) => {
    const servicos: ServicoObraForm[] = cat.servicos.map((serv, servIdx) => {
      const servicoForm: ServicoObraForm = {
        ...serv,
        id: Date.now() + catIdx * 1000 + servIdx + 1,
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
      porcentagem_de_conclusao: 0,
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
  onGeneratePdf,
  client,
  feedbackMessage,
  loading,
  onSuccess,
}: ObrasFormProps) {
  const { token, user } = useAuth();
  const isReadOnly = mode === "details";
  const isAdd = mode === "add";
  const [obraStatus, setObraStatus] = useState<ObraStatus>("NOPRAZO");
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
  const [dataFimPrevista, setDataFimPrevista] = useState("");
  const [dataFimReal, setDataFimReal] = useState("");

  const [categorias, setCategorias] = useState<CategoriaObraForm[]>([]);
  const [formFeedback, setFormFeedback] = useState("");

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
        ...calculated,
      };
    });
  }, [categorias]);

  const porcentagemConclusaoGeral = useMemo(() => {
    if (categoriasCalculadas.length === 0) {
      return initialData?.porcentagem_de_conclusao || 0;
    }

    const total = categoriasCalculadas.reduce(
      (sum, cat) => sum + (cat.porcentagem_de_conclusao || 0),
      0,
    );

    return Math.round(total / categoriasCalculadas.length);
  }, [categoriasCalculadas, initialData]);

  // Total de dias previstos/reais da obra = soma dos totais de cada categoria
  const totalQtDiasPrevista = useMemo(
    () =>
      categoriasCalculadas.reduce(
        (sum, cat) => sum + (cat.qt_dias_prevista || 0),
        0,
      ),
    [categoriasCalculadas],
  );

  const totalQtDiasReal = useMemo(
    () =>
      categoriasCalculadas.reduce(
        (sum, cat) => sum + (cat.qt_dias_real || 0),
        0,
      ),
    [categoriasCalculadas],
  );

  // Data fim prevista = data início prevista + total de dias previstos
  const dataFimPrevistaCalculada = useMemo(() => {
    if (!dataInicioPrevista) return "";
    const start = new Date(dataInicioPrevista);
    if (Number.isNaN(start.getTime())) return "";
    const end = new Date(start);
    end.setDate(end.getDate() + totalQtDiasPrevista);
    return end.toISOString().split("T")[0];
  }, [dataInicioPrevista, totalQtDiasPrevista]);

  // Data fim real = data início real + total de dias reais
  const dataFimRealCalculada = useMemo(() => {
    if (!dataInicioReal) return "";
    const start = new Date(dataInicioReal);
    if (Number.isNaN(start.getTime())) return "";
    const end = new Date(start);
    end.setDate(end.getDate() + totalQtDiasReal);
    return end.toISOString().split("T")[0];
  }, [dataInicioReal, totalQtDiasReal]);

  const updateServico = useCallback(
    (
      categoriaId: number,
      servicoId: number,
      field: keyof ServicoObraForm,
      value: string | number,
    ) => {
      setCategorias((prevCategorias) =>
        prevCategorias.map((cat) => {
          if (cat.id !== categoriaId) return cat;

          const novosServicos = cat.servicos.map((serv) => {
            if (serv.id !== servicoId) return serv;
            return { ...serv, [field]: value };
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

  const handleSave = async () => {
    if (isReadOnly) return;
    setFormFeedback("");

    if (!token || !user) {
      setFormFeedback("Sessão expirada.");
      return;
    }

    if (!orcamentoAtrelado) {
      Alert.alert("Erro", "Orçamento não encontrado para a obra.");
      return;
    }

    if (!dataInicioPrevista) {
      Alert.alert("Atenção", "Informe a data de início prevista da obra.");
      return;
    }

    const workData = {
      orcamento: orcamentoAtrelado._id,
      responsavel: user._id,
      status: obraStatus,
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
        servicos: cat.servicos.map((s) => ({
          nome: s.nome,
          descricao: s.descricao,
          qt_dias_prevista: s.qt_dias_prevista,
          qt_dias_real: s.qt_dias_real,
          porcentagem_de_conclusao: s.porcentagem_de_conclusao,
        })),
      })),
    };

    if (onSave) await onSave(workData);
    if (onSuccess) onSuccess();
  };

  const scrollRef = useRef<ScrollView>(null);
  const irParaSalvar = () => {
    scrollRef.current?.scrollToEnd({
      animated: true,
    });
  };

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

        <Pressable onPress={irParaSalvar} style={globalStyles.rightAction}>
          <Text style={globalStyles.saveText}>
            {mode === "details" ? "Gerar PDF" : "Salvar"}
          </Text>
          <Ionicons name="download" size={25} color={COLORS.title} />
        </Pressable>
      </View>

      <ScrollView ref={scrollRef} style={{ flex: 1 }}>
        <Text style={globalStyles.subtitle}>Informações Gerais</Text>
        <View style={globalStyles.divider} />
        <View style={globalStyles.card}>
          <Text style={globalStyles.label}>Nome da Obra:</Text>
          <AppInput
            value={orcamentoAtrelado?.nome ?? ""}
            editable={false}
            selectTextOnFocus={false}
          />
          <Text style={globalStyles.label}>Cliente:</Text>
          <AppInput
            value={cliente?.nome ?? ""}
            editable={false}
            selectTextOnFocus={false}
          />

          <View style={globalStyles.row}>
            <View style={globalStyles.column}>
              <Text style={globalStyles.label}>Data de Início Prevista:</Text>
              <AppInput
                placeholder="DD/MM/YYYY"
                value={dataInicioPrevista}
                keyboardType="numeric"
                maxLength={10}
                onChangeText={(text) => setDataInicioPrevista(maskDate(text))}
                editable={!isReadOnly}
              />
            </View>

            {!isAdd && (
              <View style={globalStyles.column}>
                <Text style={globalStyles.label}>Data de Início Real:</Text>
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
          <View style={globalStyles.row}>
            <View style={globalStyles.column}>
              <Text style={globalStyles.label}>Status da Obra:</Text>
              <Picker
                selectedValue={obraStatus}
                onValueChange={(itemValue) => setObraStatus(itemValue)}
                style={globalStyles.picker}
                enabled={!isReadOnly && !isAdd}
              >
                <Picker.Item label="NO PRAZO" value="NOPRAZO" />
                <Picker.Item label="ATRASADO" value="ATRASADO" />
                <Picker.Item label="ADIANTADO" value="ADIANTADO" />
                <Picker.Item label="ENTREGUE" value="ENTREGUE" />
                <Picker.Item label="CANCELADO" value="CANCELADO" />
              </Picker>
            </View>

            {!isAdd && (
              <View style={globalStyles.column}>
                <Text style={globalStyles.label}>Conclusão Geral:</Text>
                <AppInput
                  value={`${porcentagemConclusaoGeral}%`}
                  editable={false}
                />
              </View>
            )}
          </View>
        </View>
        <Text style={globalStyles.subtitle}>Endereço da Obra</Text>
        <View style={globalStyles.divider} />
        <View style={globalStyles.card}>
          <View style={globalStyles.row}>
            <View style={globalStyles.column}>
              <Text style={globalStyles.label}>CEP</Text>
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
          <View style={globalStyles.row}>
            <AppInput
              value={orcamentoAtrelado?.endereco?.rua ?? ""}
              editable={false}
            />
          </View>
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
        </View>
        <Text style={globalStyles.subtitle}>Categorias e Serviços</Text>
        <View style={globalStyles.divider} />
        {categoriasCalculadas.map((categoria) => (
          <View key={categoria.id} style={globalStyles.card}>
            <Text style={globalStyles.label}>Categoria: {categoria.nome}</Text>
            <View style={globalStyles.row}>
              <View style={globalStyles.column}>
                <Text style={globalStyles.label}>
                  Dias Previstos da Categoria: {categoria.qt_dias_prevista || 0}
                </Text>
              </View>
              <View style={globalStyles.column}>
                <Text style={globalStyles.label}>
                  Dias Reais da Categoria: {categoria.qt_dias_real || 0}
                </Text>
              </View>
            </View>
            <View style={globalStyles.row}>
              <View style={globalStyles.column}>
                <Text style={globalStyles.label}>
                  Status da Categoria: {categoria.status}
                </Text>
              </View>
              <View style={globalStyles.column}>
                <Text style={globalStyles.label}>
                  Progresso da Categoria:{" "}
                  {categoria.porcentagem_de_conclusao || 0}%
                </Text>
              </View>
            </View>

            {categoria.servicos.map((servico) => (
              <View key={servico.id} style={styles.serviceCard}>
                <Text style={globalStyles.label}>Serviço: {servico.nome}</Text>
                <Text style={globalStyles.label}>
                  Descrição: {servico.descricao}
                </Text>
                <View style={globalStyles.row}>
                  <View style={globalStyles.column}>
                    <Text style={globalStyles.label}>Dias Previstos:</Text>
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
                      editable={!isReadOnly}
                    />
                  </View>
                  <View style={globalStyles.column}>
                    <Text style={globalStyles.label}>Dias Reais:</Text>
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
                </View>
                <View style={globalStyles.row}>
                  <View style={globalStyles.column}>
                    <Text style={globalStyles.label}>
                      Status do Serviço: {servico.status}
                    </Text>
                  </View>
                  <View style={globalStyles.column}>
                    <Text style={globalStyles.label}>
                      Porcentagem de Conclusão:
                    </Text>
                    <AppInput
                      placeholder="%"
                      value={String(servico.porcentagem_de_conclusao || 0)}
                      onChangeText={(text) =>
                        updateServico(
                          categoria.id,
                          servico.id,
                          "porcentagem_de_conclusao",
                          Number(text) || 0,
                        )
                      }
                      keyboardType="numeric"
                      editable={!isReadOnly}
                    />
                  </View>
                </View>
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
                onChangeText={(text) => setDataFimPrevista(maskDate(text))}
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
                  onChangeText={(text) => setDataFimReal(maskDate(text))}
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
                <Text style={globalStyles.label}>Valor do Orçamento Real:</Text>
                <AppInput
                  placeholder="R$ 0,00"
                  value={"R$ 0.00"}
                  editable={false}
                />
              </View>
            )}
          </View>
        </View>

        {formFeedback !== "" && (
          <Text style={globalStyles.feedback}>{formFeedback}</Text>
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
          onPress={handleSave}
          loading={loading}
          color={COLORS.primary}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  serviceCard: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
});
