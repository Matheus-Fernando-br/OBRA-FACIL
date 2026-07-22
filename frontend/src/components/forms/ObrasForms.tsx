import React, { useEffect, useState } from "react";

import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { Picker } from "@react-native-picker/picker";

import { globalStyles, COLORS } from "@/styles/globalStyles";

import { AppInput } from "@/components/forms/AppInput";

import { useAuth } from "@/contexts/AuthContext";

import {
  CategoriaObra,
  Obra,
  Orcamento,
  ServicoObra,
} from "@/components/layout/interface";

interface ServicoForm extends ServicoObra {
  id: number;
}

interface CategoriaForm extends CategoriaObra {
  id: number;

  servicos: ServicoForm[];
}

interface ObrasFormProps {
  mode: "add" | "edit" | "details";

  initialData?: Obra | null;

  budgetsList: Orcamento[];

  loading?: boolean;

  feedbackMessage?: string;

  onClose: () => void;

  onSuccess?: () => void;

  onSave?: (data: any) => Promise<void>;
}

export function ObrasForm({
  mode,
  initialData,
  budgetsList,
  loading,
  feedbackMessage,
  onClose,
  onSuccess,
  onSave,
}: ObrasFormProps) {
  const { user, token } = useAuth();

  const isReadOnly = mode === "details";

  // ==========================
  // INFORMAÇÕES GERAIS
  // ==========================

  const [selectedBudget, setSelectedBudget] = useState(() => {
    if (!initialData?.orcamento) return "";

    return typeof initialData.orcamento === "string"
      ? initialData.orcamento
      : initialData.orcamento._id;
  });

  const [status, setStatus] = useState(initialData?.status ?? "NOPRAZO");

  const [dataInicioPrevista, setDataInicioPrevista] = useState(
    initialData?.data_inicio_prevista
      ? new Date(initialData.data_inicio_prevista).toLocaleDateString("pt-BR")
      : "",
  );

  const [dataFimPrevista, setDataFimPrevista] = useState(
    initialData?.data_fim_prevista
      ? new Date(initialData.data_fim_prevista).toLocaleDateString("pt-BR")
      : "",
  );

  const [dataInicioReal, setDataInicioReal] = useState(
    initialData?.data_inicio_real
      ? new Date(initialData.data_inicio_real).toLocaleDateString("pt-BR")
      : "",
  );

  const [dataFimReal, setDataFimReal] = useState(
    initialData?.data_fim_real
      ? new Date(initialData.data_fim_real).toLocaleDateString("pt-BR")
      : "",
  );

  const [categorias, setCategorias] = useState<CategoriaForm[]>([]);

  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (!initialData) return;

    setCategorias(
      initialData.categoria.map((categoria) => ({
        ...categoria,

        id: Date.now() + Math.random(),

        servicos: categoria.servicos.map((servico) => ({
          ...servico,

          id: Date.now() + Math.random(),
        })),
      })),
    );
  }, [initialData]);
  // ==========================
  // DADOS DO ORÇAMENTO
  // ==========================

  const selectedBudgetData =
    budgetsList.find((b) => b._id === selectedBudget) || null;

  // ==========================
  // TOTAIS DA OBRA
  // ==========================

  const totalDiasPrevistos = categorias.reduce(
    (acc, categoria) => acc + Number(categoria.qt_dias_prevista || 0),
    0,
  );

  const totalDiasReais = categorias.reduce(
    (acc, categoria) => acc + Number(categoria.qt_dias_real || 0),
    0,
  );

  const progressoGeral =
    categorias.length > 0
      ? Math.round(
          categorias.reduce(
            (acc, categoria) =>
              acc + Number(categoria.porcentagem_de_conclusao || 0),
            0,
          ) / categorias.length,
        )
      : 0;

  // ==========================
  // CATEGORIAS
  // ==========================

  function updateCategoria(id: number, field: keyof CategoriaForm, value: any) {
    setCategorias((prev) =>
      prev.map((categoria) =>
        categoria.id === id
          ? {
              ...categoria,
              [field]: value,
            }
          : categoria,
      ),
    );
  }

  // ==========================
  // SERVIÇOS
  // ==========================

  function updateServico(
    categoriaId: number,
    servicoId: number,
    field: keyof ServicoForm,
    value: any,
  ) {
    setCategorias((prev) =>
      prev.map((categoria) => {
        if (categoria.id !== categoriaId) return categoria;

        const servicos = categoria.servicos.map((servico) =>
          servico.id === servicoId
            ? {
                ...servico,
                [field]: value,
              }
            : servico,
        );

        const porcentagemCategoria =
          servicos.length > 0
            ? Math.round(
                servicos.reduce(
                  (acc, servico) =>
                    acc + Number(servico.porcentagem_de_conclusao || 0),
                  0,
                ) / servicos.length,
              )
            : 0;

        return {
          ...categoria,

          servicos,

          porcentagem_de_conclusao: porcentagemCategoria,
        };
      }),
    );
  }

  // ==========================
  // SALVAR
  // ==========================

  async function handleSubmit() {
    if (isReadOnly) return;

    if (!token || !user) {
      setFeedback("Sessão expirada.");

      return;
    }

    const workData = {
      orcamento: selectedBudget,

      responsavel: user._id,

      categoria: categorias.map((categoria) => ({
        nome: categoria.nome,

        qt_dias_prevista: Number(categoria.qt_dias_prevista || 0),

        qt_dias_real: Number(categoria.qt_dias_real || 0),

        porcentagem_de_conclusao: Number(
          categoria.porcentagem_de_conclusao || 0,
        ),

        servicos: categoria.servicos.map((servico) => ({
          nome: servico.nome,

          descricao: servico.descricao,

          qt_dias_prevista: Number(servico.qt_dias_prevista || 0),

          qt_dias_real: Number(servico.qt_dias_real || 0),

          porcentagem_de_conclusao: Number(
            servico.porcentagem_de_conclusao || 0,
          ),
        })),
      })),

      status,

      data_inicio_prevista: dataInicioPrevista,

      data_fim_prevista: dataFimPrevista,

      data_inicio_real: dataInicioReal || undefined,

      data_fim_real: dataFimReal || undefined,

      qt_dias_prevista: totalDiasPrevistos,

      qt_dias_real: totalDiasReais,

      porcentagem_de_conclusao: progressoGeral,
    };

    if (onSave) {
      await onSave(workData);
    }
  }

  return (
    <View style={globalStyles.container}>
      <View style={globalStyles.modalHeader}>
        <Pressable onPress={onClose} style={globalStyles.leftAction}>
          <Ionicons name="arrow-back" size={25} color={COLORS.text} />
        </Pressable>

        <Text style={globalStyles.addTitle}>
          {mode === "add"
            ? "Nova Obra"
            : mode === "edit"
              ? "Editar Obra"
              : "Detalhes da Obra"}
        </Text>

        <Pressable
          onPress={() => {
            if (!isReadOnly) {
              handleSubmit();
            }
          }}
          style={globalStyles.rightAction}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <>
              <Text style={globalStyles.saveText}>
                {mode === "add"
                  ? "Salvar"
                  : mode === "edit"
                    ? "Atualizar"
                    : "Fechar"}
              </Text>

              {!isReadOnly && (
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={COLORS.white}
                />
              )}
            </>
          )}
        </Pressable>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingRight: 20,
          paddingBottom: 40,
        }}
      >
        <Text style={globalStyles.subtitle}>Informações Gerais</Text>

        <View style={globalStyles.divider} />

        <View style={globalStyles.card}>
          <Text style={globalStyles.label}>Orçamento</Text>

          <Picker
            selectedValue={selectedBudget}
            onValueChange={setSelectedBudget}
            enabled={!isReadOnly}
            style={globalStyles.picker}
          >
            <Picker.Item label="Selecione um orçamento" value="" />

            {budgetsList.map((budget) => (
              <Picker.Item
                key={budget._id}
                label={budget.nome}
                value={budget._id}
              />
            ))}
          </Picker>

          {selectedBudgetData && (
            <>
              <Text style={globalStyles.label}>Cliente</Text>

              <AppInput
                editable={false}
                value={selectedBudgetData.cliente.nome}
              />

              <Text style={globalStyles.label}>Valor do Orçamento</Text>

              <AppInput
                editable={false}
                value={`R$ ${selectedBudgetData.preco_com_bdi.toFixed(2)}`}
              />
            </>
          )}

          <Text style={globalStyles.label}>Status da Obra</Text>

          <Picker
            selectedValue={status}
            onValueChange={setStatus}
            enabled={!isReadOnly}
            style={globalStyles.picker}
          >
            <Picker.Item label="NO PRAZO" value="NOPRAZO" />

            <Picker.Item label="ATRASADO" value="ATRASADO" />

            <Picker.Item label="ADIANTADO" value="ADIANTADO" />

            <Picker.Item label="ENTREGUE" value="ENTREGUE" />

            <Picker.Item label="CANCELADO" value="CANCELADO" />
          </Picker>

          <View style={globalStyles.row}>
            <View style={globalStyles.column}>
              <Text style={globalStyles.label}>Início Previsto</Text>

              <AppInput
                value={dataInicioPrevista}
                onChangeText={setDataInicioPrevista}
                editable={!isReadOnly}
                placeholder="dd/mm/aaaa"
              />
            </View>

            <View style={globalStyles.column}>
              <Text style={globalStyles.label}>Término Previsto</Text>

              <AppInput
                value={dataFimPrevista}
                onChangeText={setDataFimPrevista}
                editable={!isReadOnly}
                placeholder="dd/mm/aaaa"
              />
            </View>
          </View>

          <View style={globalStyles.row}>
            <View style={globalStyles.column}>
              <Text style={globalStyles.label}>Início Real</Text>

              <AppInput
                value={dataInicioReal}
                onChangeText={setDataInicioReal}
                editable={!isReadOnly}
                placeholder="dd/mm/aaaa"
              />
            </View>

            <View style={globalStyles.column}>
              <Text style={globalStyles.label}>Término Real</Text>

              <AppInput
                value={dataFimReal}
                onChangeText={setDataFimReal}
                editable={!isReadOnly}
                placeholder="dd/mm/aaaa"
              />
            </View>
          </View>
        </View>
        <Text style={globalStyles.subtitle}>Execução da Obra</Text>

        <View style={globalStyles.divider} />

        {categorias.map((categoria, categoriaIndex) => (
          <View key={categoria.id} style={globalStyles.card}>
            <Text
              style={[
                globalStyles.serviceTitle,
                {
                  fontSize: 18,
                  marginBottom: 15,
                },
              ]}
            >
              Categoria {categoriaIndex + 1}
            </Text>

            <Text style={globalStyles.label}>Nome da Categoria</Text>

            <AppInput editable={false} value={categoria.nome} />

            <View style={globalStyles.row}>
              <View style={globalStyles.column}>
                <Text style={globalStyles.label}>Dias Previstos</Text>

                <AppInput
                  keyboardType="numeric"
                  editable={!isReadOnly}
                  value={String(categoria.qt_dias_prevista)}
                  onChangeText={(text) =>
                    updateCategoria(
                      categoria.id,
                      "qt_dias_prevista",
                      Number(text),
                    )
                  }
                />
              </View>

              <View style={globalStyles.column}>
                <Text style={globalStyles.label}>Dias Reais</Text>

                <AppInput
                  keyboardType="numeric"
                  editable={!isReadOnly}
                  value={String(categoria.qt_dias_real)}
                  onChangeText={(text) =>
                    updateCategoria(categoria.id, "qt_dias_real", Number(text))
                  }
                />
              </View>

              <View style={globalStyles.column}>
                <Text style={globalStyles.label}>Conclusão (%)</Text>

                <AppInput
                  keyboardType="numeric"
                  editable={!isReadOnly}
                  value={String(categoria.porcentagem_de_conclusao)}
                  onChangeText={(text) =>
                    updateCategoria(
                      categoria.id,
                      "porcentagem_de_conclusao",
                      Number(text),
                    )
                  }
                />
              </View>
            </View>

            <View style={globalStyles.divider} />

            {categoria.servicos.map((servico, servicoIndex) => (
              <View key={servico.id} style={globalStyles.serviceContainer}>
                <Text
                  style={[
                    globalStyles.serviceTitle,
                    {
                      marginBottom: 10,
                    },
                  ]}
                >
                  Serviço {servicoIndex + 1}
                </Text>

                <Text style={globalStyles.label}>Nome</Text>

                <AppInput editable={false} value={servico.nome} />

                <Text style={globalStyles.label}>Descrição</Text>

                <AppInput
                  editable={false}
                  multiline
                  numberOfLines={2}
                  value={servico.descricao}
                />

                <View style={globalStyles.row}>
                  <View style={globalStyles.column}>
                    <Text style={globalStyles.label}>Dias Previstos</Text>

                    <AppInput
                      keyboardType="numeric"
                      editable={!isReadOnly}
                      value={String(servico.qt_dias_prevista)}
                      onChangeText={(text) =>
                        updateServico(
                          categoria.id,
                          servico.id,
                          "qt_dias_prevista",
                          Number(text),
                        )
                      }
                    />
                  </View>

                  <View style={globalStyles.column}>
                    <Text style={globalStyles.label}>Dias Reais</Text>

                    <AppInput
                      keyboardType="numeric"
                      editable={!isReadOnly}
                      value={String(servico.qt_dias_real)}
                      onChangeText={(text) =>
                        updateServico(
                          categoria.id,
                          servico.id,
                          "qt_dias_real",
                          Number(text),
                        )
                      }
                    />
                  </View>

                  <View style={globalStyles.column}>
                    <Text style={globalStyles.label}>Conclusão (%)</Text>

                    <AppInput
                      keyboardType="numeric"
                      editable={!isReadOnly}
                      value={String(servico.porcentagem_de_conclusao)}
                      onChangeText={(text) =>
                        updateServico(
                          categoria.id,
                          servico.id,
                          "porcentagem_de_conclusao",
                          Number(text),
                        )
                      }
                    />
                  </View>
                </View>
              </View>
            ))}
          </View>
        ))}
        <Text style={globalStyles.subtitle}>Resumo da Execução</Text>

        <View style={globalStyles.divider} />

        <View style={globalStyles.card}>
          <Text style={globalStyles.label}>Dias Previstos da Obra</Text>

          <AppInput editable={false} value={String(totalDiasPrevistos)} />

          <Text style={globalStyles.label}>Dias Reais da Obra</Text>

          <AppInput editable={false} value={String(totalDiasReais)} />

          <Text style={globalStyles.label}>Progresso Geral</Text>

          <View
            style={[
              globalStyles.progressBarBackground,
              {
                marginTop: 8,
                marginBottom: 8,
              },
            ]}
          >
            <View
              style={[
                globalStyles.progressBarFill,
                {
                  width: `${progressoGeral}%`,
                },
              ]}
            />
          </View>

          <Text
            style={[
              globalStyles.categoryTotalText,
              {
                textAlign: "center",
                fontSize: 18,
              },
            ]}
          >
            {progressoGeral}%
          </Text>

          <Text
            style={[
              globalStyles.label,
              {
                marginTop: 20,
              },
            ]}
          >
            Status Atual
          </Text>

          <AppInput editable={false} value={status} />
        </View>

        {feedback !== "" && (
          <Text style={globalStyles.feedback}>{feedback}</Text>
        )}

        {feedbackMessage !== "" && (
          <Text style={globalStyles.feedback}>{feedbackMessage}</Text>
        )}
      </ScrollView>
    </View>
  );
}
