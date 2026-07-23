import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { AppInput } from "@/components/forms/AppInput";

import { COLORS, globalStyles } from "@/styles/globalStyles";

import { Orcamento, Cliente, Obra } from "@/components/layout/interface";

interface Props {
  mode: "create" | "edit" | "details";

  budget: Orcamento;

  work?: Obra;

  loading?: boolean;

  clientsList: Cliente[];

  onClose(): void;

  onSave(data: any): Promise<void>;
}

export function ObrasForm({
  mode,
  budget,
  work,
  loading,
  clientsList,
  onClose,
  onSave,
}: Props) {
  const isCreate = mode === "create";
  const isEdit = mode === "edit";
  const isDetails = mode === "details";

  const [status, setStatus] = useState("NO_PRAZO");

  const [dataInicio, setDataInicio] = useState("");

  const [dataFim, setDataFim] = useState("");

  useEffect(() => {
    if (!work) return;

    setStatus(work.status);

    setDataInicio(
      work.data_inicio_prevista
        ? new Date(work.data_inicio_prevista).toISOString().split("T")[0]
        : "",
    );

    setDataFim(
      work.data_fim_prevista
        ? new Date(work.data_fim_prevista).toISOString().split("T")[0]
        : "",
    );
  }, [work]);

  const cliente = clientsList.find(
    (c) =>
      c._id ===
      (typeof budget.cliente === "string"
        ? budget.cliente
        : budget.cliente._id),
  );

  const headerTitle = isCreate
    ? "Nova Obra"
    : isEdit
      ? "Editar Obra"
      : "Detalhes da Obra";

  const buttonText = isCreate ? "Criar Obra" : "Salvar Alterações";

  const editable = !isDetails;

  async function handleSave() {
    const workData = {
      data_inicio_prevista: dataInicio,
      data_fim_prevista: dataFim,
      status,
    };

    await onSave(workData);
  }

  return (
    <View style={globalStyles.container}>
      {/* HEADER */}

      <View style={globalStyles.modalHeader}>
        <Pressable onPress={onClose} style={globalStyles.leftAction}>
          <Ionicons name="arrow-back" size={25} color={COLORS.text} />
        </Pressable>

        <Text style={globalStyles.addTitle}>{headerTitle}</Text>

        {!isDetails && (
          <Pressable onPress={handleSave} style={globalStyles.rightAction}>
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <>
                <Text style={globalStyles.saveText}>{buttonText}</Text>

                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={COLORS.white}
                />
              </>
            )}
          </Pressable>
        )}
      </View>

      {/* BODY */}

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingRight: 20,
        }}
      >
        {/* ========================= */}
        {/* Informações Gerais */}
        {/* ========================= */}

        <Text style={globalStyles.subtitle}>Informações do Orçamento</Text>

        <View style={globalStyles.divider} />

        <View style={globalStyles.card}>
          <Text style={globalStyles.label}>Nome da Obra</Text>

          <AppInput value={budget.nome ?? ""} editable={false} />

          <Text style={globalStyles.label}>Cliente</Text>

          <AppInput value={cliente?.nome ?? ""} editable={false} />

          <Text style={globalStyles.label}>Descrição</Text>

          <AppInput
            value={budget.descricao ?? ""}
            editable={false}
            multiline
            numberOfLines={4}
          />

          <Text style={globalStyles.label}>Valor Total</Text>

          <AppInput
            value={`R$ ${(budget.preco_com_bdi ?? 0).toFixed(2)}`}
            editable={false}
          />
        </View>

        {/* ========================= */}
        {/* Endereço */}
        {/* ========================= */}

        <Text style={globalStyles.subtitle}>Endereço da Obra</Text>

        <View style={globalStyles.divider} />

        <View style={globalStyles.card}>
          <View style={globalStyles.row}>
            <View style={globalStyles.column}>
              <Text style={globalStyles.label}>CEP</Text>

              <AppInput value={budget.endereco?.CEP ?? ""} editable={false} />
            </View>

            <View style={globalStyles.column}>
              <Text style={globalStyles.label}>Estado</Text>

              <AppInput
                value={budget.endereco?.estado ?? ""}
                editable={false}
              />
            </View>
          </View>

          <View style={globalStyles.row}>
            <View style={globalStyles.column}>
              <Text style={globalStyles.label}>Cidade</Text>

              <AppInput
                value={budget.endereco?.cidade ?? ""}
                editable={false}
              />
            </View>

            <View style={globalStyles.column}>
              <Text style={globalStyles.label}>Bairro</Text>

              <AppInput
                value={budget.endereco?.bairro ?? ""}
                editable={false}
              />
            </View>
          </View>

          <Text style={globalStyles.label}>Rua</Text>

          <AppInput value={budget.endereco?.rua ?? ""} editable={false} />

          <View style={globalStyles.row}>
            <View style={globalStyles.column}>
              <Text style={globalStyles.label}>Número</Text>

              <AppInput
                value={budget.endereco?.numero ?? ""}
                editable={false}
              />
            </View>

            <View style={globalStyles.column}>
              <Text style={globalStyles.label}>Complemento</Text>

              <AppInput
                value={budget.endereco?.complemento ?? ""}
                editable={false}
              />
            </View>
          </View>
        </View>

        {/* ========================= */}
        {/* Cronograma */}
        {/* ========================= */}

        <Text style={globalStyles.subtitle}>Cronograma da Obra</Text>

        <View style={globalStyles.divider} />

        <View style={globalStyles.card}>
          <Text style={globalStyles.label}>Data Prevista de Início</Text>

          <AppInput
            placeholder="dd/mm/aaaa"
            value={dataInicio}
            editable={editable}
            onChangeText={setDataInicio}
          />

          <Text style={globalStyles.label}>Data Prevista de Término</Text>

          <AppInput
            placeholder="dd/mm/aaaa"
            value={dataFim}
            editable={editable}
            onChangeText={setDataFim}
          />

          <Text style={globalStyles.label}>Status da Obra</Text>

          <AppInput value={status} editable={false} />
        </View>

        {/* ========================= */}
        {/* Resumo do Orçamento */}
        {/* ========================= */}

        <Text style={globalStyles.subtitle}>Resumo do Orçamento</Text>

        <View style={globalStyles.divider} />

        <View style={globalStyles.card}>
          <Text style={globalStyles.label}>Valor Total</Text>

          <Text style={globalStyles.categoryTotalText}>
            R$ {budget.preco_com_bdi.toFixed(2)}
          </Text>

          <Text style={globalStyles.label}>BDI</Text>

          <Text style={globalStyles.orcamentoInfo}>{budget.bdi}%</Text>

          <Text style={globalStyles.label}>Categorias</Text>

          <Text style={globalStyles.orcamentoInfo}>
            {budget.categoria.length}
          </Text>

          <Text style={globalStyles.label}>Serviços</Text>

          <Text style={globalStyles.orcamentoInfo}>
            {budget.categoria.reduce(
              (acc, cat) => acc + cat.servicos.length,
              0,
            )}
          </Text>
        </View>
        {/* ========================= */}
        {/* Categorias e Serviços */}
        {/* ========================= */}

        <Text style={globalStyles.subtitle}>
          Categorias e Serviços do Orçamento
        </Text>

        <View style={globalStyles.divider} />

        {/* ========================= */}
        {/* Planejamento da Execução */}
        {/* ========================= */}

        <Text style={globalStyles.subtitle}>Planejamento da Execução</Text>

        <View style={globalStyles.divider} />

        {budget.categoria.map((categoria, categoriaIndex) => (
          <View
            key={categoriaIndex}
            style={[
              globalStyles.card,
              {
                marginBottom: 20,
              },
            ]}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 15,
              }}
            >
              <Text
                style={[
                  globalStyles.title,
                  {
                    flex: 1,
                  },
                ]}
              >
                {categoria.nome}
              </Text>

              <View
                style={{
                  backgroundColor: "#EEF2FF",
                  paddingHorizontal: 12,
                  paddingVertical: 5,
                  borderRadius: 20,
                }}
              >
                <Text
                  style={{
                    color: COLORS.primary,
                    fontWeight: "700",
                  }}
                >
                  {work?.categoria?.[categoriaIndex]
                    ?.porcentagem_de_conclusao ?? 0}
                  %
                </Text>
              </View>
            </View>

            <View
              style={{
                height: 8,
                backgroundColor: "#E5E7EB",
                borderRadius: 20,
                overflow: "hidden",
                marginBottom: 20,
              }}
            >
              <View
                style={{
                  width: `${
                    work?.categoria?.[categoriaIndex]
                      ?.porcentagem_de_conclusao ?? 0
                  }%`,
                  height: "100%",
                  backgroundColor: "#22C55E",
                }}
              />
            </View>

            <Text
              style={[
                globalStyles.label,
                {
                  marginBottom: 10,
                },
              ]}
            >
              Serviços
            </Text>

            {categoria.servicos.map((servico, index) => (
              <View
                key={index}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <Ionicons name="ellipse-outline" size={18} color="#9CA3AF" />

                <View
                  style={{
                    marginLeft: 12,
                    flex: 1,
                  }}
                >
                  <Text
                    style={{
                      fontWeight: "600",
                      color: COLORS.text,
                    }}
                  >
                    {servico.nome}
                  </Text>

                  {!!servico.descricao && (
                    <Text
                      style={{
                        color: "#6B7280",
                        marginTop: 3,
                      }}
                    >
                      {servico.descricao}
                    </Text>
                  )}
                </View>

                {isDetails && (
                  <Text
                    style={{
                      color: COLORS.primary,
                      fontWeight: "700",
                    }}
                  >
                    {work?.categoria?.[categoriaIndex]?.servicos?.[index]
                      ?.porcentagem_de_conclusao ?? 0}
                    %
                  </Text>
                )}
              </View>
            ))}

            <View
              style={{
                marginTop: 10,
                paddingTop: 15,
                borderTopWidth: 1,
                borderColor: "#ECECEC",
              }}
            >
              <Text style={globalStyles.orcamentoInfo}>
                Serviços: {categoria.servicos.length}
              </Text>

              <Text style={globalStyles.orcamentoInfo}>
                Valor previsto: R${" "}
                {categoria.preco_total_da_categoria.toFixed(2)}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
