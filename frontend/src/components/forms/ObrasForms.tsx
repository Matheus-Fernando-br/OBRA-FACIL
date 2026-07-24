import { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  StyleSheet,
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

type ObraStatus = Obra["status"];

interface ServicoObraForm extends ServicoObra {
  id: number;
  data_prevista_str: string;
  data_real_str: string;
  status: ObraStatus;
}

interface CategoriaObraForm extends CategoriaObra {
  id: number;
  servicos: ServicoObraForm[];
  data_prevista_inicial?: string;
  data_prevista_final?: string;
  data_real_inicial?: string;
  data_real_final?: string;
  status?: ObraStatus;
}

interface ObrasFormProps {
  mode: "add" | "edit" | "details";
  initialData?: Obra | null;
  budget?: Orcamento | null;
  onClose: () => void;
  onSave?: (data: any) => Promise<void>;
  onGeneratePdf?: () => void;
  clientsList: Cliente[];
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

function getServicoDateStr(
  serv: ServicoObra & {
    data_prevista?: Date | string;
    data_real?: Date | string;
    data_prevista_str?: string;
    data_real_str?: string;
  },
  field: "prevista" | "real",
): string {
  if (field === "prevista") {
    return (
      serv.data_prevista_str ||
      formatDateInput(serv.data_prevista) ||
      ""
    );
  }

  return serv.data_real_str || formatDateInput(serv.data_real) || "";
}

const calculateServiceStatus = (service: ServicoObraForm): ObraStatus => {
  const prevDate = service.data_prevista_str
    ? new Date(service.data_prevista_str)
    : null;
  const realDate = service.data_real_str
    ? new Date(service.data_real_str)
    : null;

  if (!prevDate || !realDate) return "NOPRAZO";
  if (realDate > prevDate) return "ATRASADO";
  if (realDate < prevDate) return "ADIANTADO";
  return "NOPRAZO";
};

const calculateCategoryProgressAndDates = (services: ServicoObraForm[]) => {
  if (services.length === 0) {
    return {
      porcentagem_de_conclusao: 0,
      data_prevista_inicial: undefined,
      data_prevista_final: undefined,
      data_real_inicial: undefined,
      data_real_final: undefined,
      status: "NOPRAZO" as ObraStatus,
    };
  }

  const totalProgress = services.reduce(
    (sum, s) => sum + (s.porcentagem_de_conclusao || 0),
    0,
  );
  const porcentagem_de_conclusao = Math.round(totalProgress / services.length);

  const allPrevDates = services
    .map((s) => s.data_prevista_str)
    .filter(Boolean)
    .map((d) => new Date(d).getTime());
  const allRealDates = services
    .map((s) => s.data_real_str)
    .filter(Boolean)
    .map((d) => new Date(d).getTime());

  const data_prevista_inicial = allPrevDates.length
    ? new Date(Math.min(...allPrevDates)).toISOString().split("T")[0]
    : undefined;
  const data_prevista_final = allPrevDates.length
    ? new Date(Math.max(...allPrevDates)).toISOString().split("T")[0]
    : undefined;
  const data_real_inicial = allRealDates.length
    ? new Date(Math.min(...allRealDates)).toISOString().split("T")[0]
    : undefined;
  const data_real_final = allRealDates.length
    ? new Date(Math.max(...allRealDates)).toISOString().split("T")[0]
    : undefined;

  let categoryStatus: ObraStatus = "NOPRAZO";
  if (services.some((s) => s.status === "ATRASADO")) {
    categoryStatus = "ATRASADO";
  } else if (services.every((s) => s.status === "ADIANTADO")) {
    categoryStatus = "ADIANTADO";
  } else if (services.every((s) => s.status === "ENTREGUE")) {
    categoryStatus = "ENTREGUE";
  } else if (services.every((s) => s.status === "CANCELADO")) {
    categoryStatus = "CANCELADO";
  }

  return {
    porcentagem_de_conclusao,
    data_prevista_inicial,
    data_prevista_final,
    data_real_inicial,
    data_real_final,
    status: categoryStatus,
  };
};

function mapCategoriasFromObra(categorias: CategoriaObra[]): CategoriaObraForm[] {
  return categorias.map((cat, catIdx) => ({
    ...cat,
    id: Date.now() + catIdx,
    servicos: cat.servicos.map((serv, servIdx) => {
      const servicoForm: ServicoObraForm = {
        ...serv,
        id: Date.now() + catIdx + servIdx + 1,
        data_prevista_str: getServicoDateStr(serv, "prevista"),
        data_real_str: getServicoDateStr(serv, "real"),
        status: "NOPRAZO",
      };
      servicoForm.status = calculateServiceStatus(servicoForm);
      return servicoForm;
    }),
  }));
}

function mapCategoriasFromBudget(budget: Orcamento): CategoriaObraForm[] {
  return budget.categoria.map((cat, catIdx) => ({
    id: Date.now() + catIdx,
    nome: cat.nome,
    servicos: cat.servicos.map((serv, servIdx) => ({
      id: Date.now() + catIdx + servIdx + 1,
      nome: serv.nome,
      descricao: serv.descricao,
      porcentagem_de_conclusao: 0,
      qt_dias_prevista: 0,
      qt_dias_real: 0,
      data_prevista_str: "",
      data_real_str: "",
      status: "NOPRAZO" as ObraStatus,
    })),
    porcentagem_de_conclusao: 0,
    status: "NOPRAZO" as ObraStatus,
  }));
}

export function ObrasForm({
  mode,
  initialData,
  budget,
  onClose,
  onSave,
  onGeneratePdf,
  clientsList,
  feedbackMessage,
  loading,
  onSuccess,
}: ObrasFormProps) {
  const { token, user } = useAuth();

  const isAdd = mode === "add";
  const isEdit = mode === "edit";
  const isDetails = mode === "details";
  const isReadOnly = isDetails;

  const [obraStatus, setObraStatus] = useState<ObraStatus>(
    initialData?.status || "NOPRAZO",
  );
  const [dataInicioPrevista, setDataInicioPrevista] = useState("");
  const [dataFimPrevista, setDataFimPrevista] = useState("");
  const [dataInicioReal, setDataInicioReal] = useState("");
  const [dataFimReal, setDataFimReal] = useState("");
  const [categorias, setCategorias] = useState<CategoriaObraForm[]>([]);
  const [formFeedback, setFormFeedback] = useState("");

  const clienteObra = useMemo(() => {
    if (budget) {
      return budget.cliente;
    }
  
    if (
      initialData &&
      typeof initialData.orcamento === "object"
    ) {
      return initialData.orcamento.cliente;
    }
  
    return undefined;
  }, [budget, initialData]);

  const orcamentoAtrelado = useMemo(() => {
    if (initialData && typeof initialData.orcamento === "object") {
      return initialData.orcamento;
    }
    if (budget) {
      return budget;
    }
    return undefined;
  }, [initialData, budget]);

  useEffect(() => {
    if (initialData) {
      setObraStatus(initialData.status);
      setDataInicioPrevista(formatDateInput(initialData.data_inicio_prevista));
      setDataFimPrevista(formatDateInput(initialData.data_fim_prevista));
      setDataInicioReal(formatDateInput(initialData.data_inicio_real));
      setDataFimReal(formatDateInput(initialData.data_fim_real));
      setCategorias(mapCategoriasFromObra(initialData.categoria));
      return;
    }

    if (isAdd && budget) {
      setObraStatus("NOPRAZO");
      setDataInicioPrevista("");
      setDataFimPrevista("");
      setDataInicioReal("");
      setDataFimReal("");
      setCategorias(mapCategoriasFromBudget(budget));
    }
  }, [initialData, isAdd, budget]);

  const categoriasCalculadas = useMemo(() => {
    return categorias.map((cat) => {
      const servicesWithStatus = cat.servicos.map((serv) => ({
        ...serv,
        status: calculateServiceStatus(serv),
      }));
      const calculated = calculateCategoryProgressAndDates(servicesWithStatus);
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

    const totalObraProgress = categoriasCalculadas.reduce(
      (sum, cat) => sum + (cat.porcentagem_de_conclusao || 0),
      0,
    );

    return Math.round(totalObraProgress / categoriasCalculadas.length);
  }, [categoriasCalculadas, initialData]);

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

    if (!dataInicioPrevista || !dataFimPrevista) {
      Alert.alert(
        "Atenção",
        "As datas previstas de início e fim da obra são obrigatórias.",
      );
      return;
    }

    const workData = {
      orcamento: orcamentoAtrelado._id,
      responsavel: user._id,
      status: obraStatus,
      data_inicio_prevista: new Date(dataInicioPrevista),
      data_fim_prevista: new Date(dataFimPrevista),
      data_inicio_real: dataInicioReal ? new Date(dataInicioReal) : undefined,
      data_fim_real: dataFimReal ? new Date(dataFimReal) : undefined,
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

  const handleHeaderAction = () => {
    if (isDetails) {
      onGeneratePdf?.();
      return;
    }

    handleSave();
  };

  const headerTitle = isAdd
    ? "Nova Obra"
    : isEdit
      ? "Editar Obra"
      : "Detalhes da Obra";

  const buttonText = isAdd
    ? "Iniciar Obra"
    : isEdit
      ? "Salvar Alterações"
      : "Gerar PDF";

  return (
    <View style={globalStyles.container}>
      <View style={globalStyles.modalHeader}>
        <Pressable onPress={onClose} style={globalStyles.leftAction}>
          <Ionicons name="arrow-back" size={25} color={COLORS.text} />
        </Pressable>

        <Text style={globalStyles.addTitle}>{headerTitle}</Text>

        <Pressable onPress={handleHeaderAction} style={globalStyles.rightAction}>
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <View style={globalStyles.saveTextStack}>
              <Text style={globalStyles.saveText}>{buttonText}</Text>
            </View>
          )}
          {!loading && (
            <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
          )}
        </Pressable>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingRight: 20,
        }}
      >
        <Text style={globalStyles.subtitle}>Informações Gerais</Text>
        <View style={globalStyles.divider} />

        <View style={globalStyles.card}>
          <Text style={globalStyles.label}>Nome da Obra / Orçamento:</Text>
          <AppInput value={orcamentoAtrelado?.nome ?? ""} editable={false} />

          <Text style={globalStyles.label}>Cliente:</Text>
          <AppInput value={clienteObra?.nome ?? ""} editable={false} />

          <Text style={globalStyles.label}>Responsável:</Text>
          <AppInput
            value={
              typeof initialData?.responsavel === "object"
                ? (initialData.responsavel as Usuario).nome
                : user?.nome || ""
            }
            editable={false}
          />

          <Text style={globalStyles.label}>Status da Obra:</Text>
          <Picker
            selectedValue={obraStatus}
            onValueChange={(itemValue) => setObraStatus(itemValue)}
            style={globalStyles.picker}
            enabled={isEdit && !isReadOnly}
          >
            <Picker.Item label="NO PRAZO" value="NOPRAZO" />
            <Picker.Item label="ATRASADO" value="ATRASADO" />
            <Picker.Item label="ADIANTADO" value="ADIANTADO" />
            <Picker.Item label="ENTREGUE" value="ENTREGUE" />
            <Picker.Item label="CANCELADO" value="CANCELADO" />
          </Picker>

          <Text style={globalStyles.label}>Valor do Orçamento Aprovado:</Text>
          <AppInput
            value={`R$ ${(orcamentoAtrelado?.preco_com_bdi ?? 0).toFixed(2)}`}
            editable={false}
          />

          <Text style={globalStyles.label}>
            Porcentagem de Conclusão Geral:
          </Text>
          <AppInput value={`${porcentagemConclusaoGeral}%`} editable={false} />
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
          <View style={globalStyles.row}>
            <Text style={globalStyles.label}>Logradouro:</Text>
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

        <Text style={globalStyles.subtitle}>Datas da Obra</Text>
        <View style={globalStyles.divider} />
        <View style={globalStyles.card}>
          <View style={globalStyles.row}>
            <View style={globalStyles.column}>
              <Text style={globalStyles.label}>Início Previsto:</Text>
              <AppInput
                placeholder="YYYY-MM-DD"
                value={dataInicioPrevista}
                onChangeText={setDataInicioPrevista}
                editable={!isReadOnly}
              />
            </View>
            <View style={globalStyles.column}>
              <Text style={globalStyles.label}>Fim Previsto:</Text>
              <AppInput
                placeholder="YYYY-MM-DD"
                value={dataFimPrevista}
                onChangeText={setDataFimPrevista}
                editable={!isReadOnly}
              />
            </View>
          </View>
          <View style={globalStyles.row}>
            <View style={globalStyles.column}>
              <Text style={globalStyles.label}>Início Real:</Text>
              <AppInput
                placeholder="YYYY-MM-DD"
                value={dataInicioReal}
                onChangeText={setDataInicioReal}
                editable={!isReadOnly}
              />
            </View>
            <View style={globalStyles.column}>
              <Text style={globalStyles.label}>Fim Real:</Text>
              <AppInput
                placeholder="YYYY-MM-DD"
                value={dataFimReal}
                onChangeText={setDataFimReal}
                editable={!isReadOnly}
              />
            </View>
          </View>
        </View>

        <Text style={globalStyles.subtitle}>Categorias e Serviços</Text>
        <View style={globalStyles.divider} />

        {categoriasCalculadas.map((categoria) => (
          <View key={categoria.id} style={globalStyles.card}>
            <Text style={globalStyles.label}>Categoria: {categoria.nome}</Text>
            <Text style={globalStyles.label}>
              Progresso da Categoria: {categoria.porcentagem_de_conclusao || 0}%
            </Text>
            <Text style={globalStyles.label}>
              Status da Categoria: {categoria.status}
            </Text>
            <Text style={globalStyles.label}>
              Início Previsto Categoria:{" "}
              {categoria.data_prevista_inicial || "N/A"}
            </Text>
            <Text style={globalStyles.label}>
              Fim Previsto Categoria: {categoria.data_prevista_final || "N/A"}
            </Text>
            <Text style={globalStyles.label}>
              Início Real Categoria: {categoria.data_real_inicial || "N/A"}
            </Text>
            <Text style={globalStyles.label}>
              Fim Real Categoria: {categoria.data_real_final || "N/A"}
            </Text>

            {categoria.servicos.map((servico) => (
              <View key={servico.id} style={styles.serviceCard}>
                <Text style={globalStyles.label}>Serviço: {servico.nome}</Text>
                <Text style={globalStyles.label}>
                  Descrição: {servico.descricao}
                </Text>

                <Text style={globalStyles.label}>Data Prevista:</Text>
                <AppInput
                  placeholder="YYYY-MM-DD"
                  value={servico.data_prevista_str}
                  onChangeText={(text) =>
                    updateServico(
                      categoria.id,
                      servico.id,
                      "data_prevista_str",
                      text,
                    )
                  }
                  editable={!isReadOnly}
                />

                <Text style={globalStyles.label}>Data Real:</Text>
                <AppInput
                  placeholder="YYYY-MM-DD"
                  value={servico.data_real_str}
                  onChangeText={(text) =>
                    updateServico(
                      categoria.id,
                      servico.id,
                      "data_real_str",
                      text,
                    )
                  }
                  editable={!isReadOnly}
                />

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
                <Text style={globalStyles.label}>
                  Status do Serviço: {servico.status}
                </Text>
              </View>
            ))}
          </View>
        ))}

        {formFeedback !== "" && (
          <Text style={globalStyles.feedback}>{formFeedback}</Text>
        )}

        {feedbackMessage && feedbackMessage !== "" && (
          <Text style={globalStyles.feedback}>{feedbackMessage}</Text>
        )}

        {!isDetails && (
          <AppButton
            title={buttonText}
            onPress={handleSave}
            loading={loading}
          />
        )}
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
