import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
} from "react-native";

import { useState, useEffect, useMemo } from "react";

import { globalStyles, COLORS } from "../../styles/globalStyles";
import { Ionicons } from "@expo/vector-icons";
import { AppInput } from "../../components/forms/AppInput";

import { useAuth } from "@/contexts/AuthContext";

import { getBudgets } from "../../services/api";

import { BudgetCard } from "@/components/cards/orcamento/BudgetCard";

import { EditOrcamentoModal } from "@/components/modals/orcamento/EditOrcamentoModal";
import { DeleteOrcamentoModal } from "@/components/modals/orcamento/DeleteOrcamentoModal";
import { AddOrcamentoModal } from "@/components/modals/orcamento/AddOrcamentoModal";
import { BudgetDetailsModal } from "@/components/modals/orcamento/BudgetDetailsModal";

import { Orcamento } from "@/components/layout/interface";

import { GradientBackground } from "@/styles/GradientBackground";

export default function OrcamentosScreen() {
  const { token } = useAuth();

  // ============================================================
  // ESTADOS
  // ============================================================

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [budgetsList, setBudgetsList] = useState<Orcamento[]>([]);

  const [addVisible, setAddVisible] = useState(false);

  const [detailsVisible, setDetailsVisible] = useState(false);

  const [editVisible, setEditVisible] = useState(false);

  const [deleteVisible, setDeleteVisible] = useState(false);

  const [selectedBudget, setSelectedBudget] =
    useState<Orcamento | null>(null);

  const [statusFilter, setStatusFilter] = useState("Todos");

  // ============================================================
  // CARREGAR ORÇAMENTOS
  // ============================================================

  async function loadBudgets() {
    try {
      if (!token) return;

      setLoading(true);

      const data = await getBudgets(token);

      setBudgetsList(
        Array.isArray(data)
          ? data
          : [],
      );
    } catch (error: any) {
      console.log(
        "ERRO AO CARREGAR ORÇAMENTOS:",
        error,
      );

      console.log(
        "RESPONSE:",
        error?.response,
      );

      console.log(
        "DATA:",
        error?.response?.data,
      );

      console.log(
        "STATUS:",
        error?.response?.status,
      );
    } finally {
      setLoading(false);
    }
  }

  // ============================================================
  // CARREGAR AO ENTRAR NA TELA
  // ============================================================

  useEffect(() => {
    if (!token) return;

    loadBudgets();
  }, [token]);

  // ============================================================
  // FILTRAR ORÇAMENTOS
  // ============================================================

  const filteredBudgets = useMemo(() => {
    const searchLower = search
      .trim()
      .toLowerCase();

    return budgetsList.filter((budget) => {
      // Cliente já vem populado pelo backend
      const nomeCliente =
        typeof budget.cliente === "object"
          ? budget.cliente?.nome ?? ""
          : "";

      const nomeOrcamento =
        budget.nome?.toLowerCase() ?? "";

      const clienteLower =
        nomeCliente.toLowerCase();

      // Busca por:
      // - nome do orçamento
      // - nome do cliente

      const matchSearch =
        !searchLower ||
        nomeOrcamento.includes(searchLower) ||
        clienteLower.includes(searchLower);

      // Filtro de status

      const matchStatus =
        statusFilter === "Todos" ||
        budget.status?.toLowerCase() ===
          statusFilter.toLowerCase();

      return (
        matchSearch &&
        matchStatus
      );
    });
  }, [
    budgetsList,
    search,
    statusFilter,
  ]);

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <View style={globalStyles.screen}>
      <GradientBackground style={globalStyles.container}>
        <ScrollView
             contentContainerStyle={{ paddingBottom: 100 }}
             showsVerticalScrollIndicator={false}
        >
          {/* CABEÇALHO */}

          <View
            style={globalStyles.pageHeaderRow}
          >
            <Text
              style={globalStyles.title}
            >
              Orçamentos
            </Text>

            <Pressable
              style={
                globalStyles.pageHeaderButton
              }
              onPress={() =>
                setAddVisible(true)
              }
            >
              <Ionicons
                name="add"
                color={COLORS.text}
                size={25}
              />
            </Pressable>
          </View>

          {/* BUSCA */}

          <AppInput
            placeholder="Buscar orçamento..."
            value={search}
            onChangeText={setSearch}
          />

          {/* FILTROS */}

          <View
            style={globalStyles.filterRow}
          >
            {[
              "Todos",
              "Pendente",
              "Aprovado",
              "Recusado",
            ].map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  globalStyles.filterButton,

                  statusFilter === item && {
                    backgroundColor:
                      COLORS.primary,
                  },
                ]}
                onPress={() =>
                  setStatusFilter(item)
                }
              >
                <Text
                  style={
                    globalStyles.filterButtonText
                  }
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* NENHUM ORÇAMENTO */}

          {!loading &&
            filteredBudgets.length === 0 && (
              <Text
                style={
                  globalStyles.sectionTitle
                }
              >
                Nenhum orçamento encontrado.
              </Text>
            )}

          {/* LOADING */}

          {loading ? (
            <View
              style={[
                globalStyles.screen,
                {
                  justifyContent: "center",
                  alignItems: "center",
                  marginTop: 40,
                },
              ]}
            >
              <ActivityIndicator
                size="large"
                color={COLORS.primary}
              />

              <Text
                style={{
                  color: COLORS.text,
                  marginTop: 15,
                }}
              >
                Carregando Orçamentos...
              </Text>
            </View>
          ) : (
            /* LISTA */

            filteredBudgets.map(
              (budget) => {
                const nomeCliente =
                  typeof budget.cliente ===
                  "object"
                    ? budget.cliente
                        ?.nome ?? ""
                    : "Cliente não encontrado";

                return (
                  <BudgetCard
                    key={budget._id}
                    client={nomeCliente}
                    nome={budget.nome}
                    status={budget.status}
                    value={
                      budget.preco_com_bdi
                    }
                    date={
                      new Date(
                        budget.data_validade,
                      ).toLocaleDateString(
                        "pt-BR",
                      )
                    }
                    onDetails={() => {
                      setSelectedBudget(
                        budget,
                      );

                      setDetailsVisible(
                        true,
                      );
                    }}
                    onEdit={() => {
                      setSelectedBudget(
                        budget,
                      );

                      setEditVisible(true);
                    }}
                    onDelete={() => {
                      setSelectedBudget(
                        budget,
                      );

                      setDeleteVisible(
                        true,
                      );
                    }}
                  />
                );
              },
            )
          )}
        </ScrollView>
      </GradientBackground>

      {/* ======================================================
          BOTÃO NOVO ORÇAMENTO
          ====================================================== */}

      <View
        style={
          globalStyles.bottomActionContainer
        }
      >
        <Pressable
          style={
            globalStyles.bottomActionButton
          }
          onPress={() =>
            setAddVisible(true)
          }
        >
          <Text
            style={
              globalStyles.bottomActionButtonText
            }
          >
            + Novo Orçamento
          </Text>
        </Pressable>
      </View>

      {/* ======================================================
          ADICIONAR ORÇAMENTO
          ====================================================== */}

      <AddOrcamentoModal
        visible={addVisible}
        onClose={() => {
          setAddVisible(false);
          loadBudgets();
        }}
      />

      {/* ======================================================
          EDITAR ORÇAMENTO
          ====================================================== */}

      <EditOrcamentoModal
        visible={editVisible}
        onClose={() =>
          setEditVisible(false)
        }
        budget={selectedBudget}
        onSuccess={loadBudgets}
      />

      {/* ======================================================
          EXCLUIR ORÇAMENTO
          ====================================================== */}

      <DeleteOrcamentoModal
        visible={deleteVisible}
        budgetId={
          selectedBudget?._id ?? ""
        }
        budgetName={
          selectedBudget?.nome ?? ""
        }
        onClose={() =>
          setDeleteVisible(false)
        }
        onSuccess={loadBudgets}
      />

      {/* ======================================================
          DETALHES DO ORÇAMENTO
          ====================================================== */}

      <BudgetDetailsModal
        visible={detailsVisible}
        budget={selectedBudget}
        onClose={() =>
          setDetailsVisible(false)
        }
        onEdit={() => {
          setDetailsVisible(false);

          setTimeout(() => {
            setEditVisible(true);
          }, 200);
        }}
      />
    </View>
  );
}