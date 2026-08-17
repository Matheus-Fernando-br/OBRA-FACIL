import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";

import { useState, useEffect, useMemo } from "react";

import { globalStyles, COLORS } from "../../styles/globalStyles";

import { Ionicons } from "@expo/vector-icons";

import { AppInput } from "../../components/forms/AppInput";

import { useAuth } from "@/contexts/AuthContext";

import { getBudgets, archiveBudget } from "../../services/api";

import { BudgetCard } from "@/components/cards/orcamento/BudgetCard";

import { DetailsClientModal } from "@/components/modals/cliente/DetailsClientModal";

import { EditClientModal } from "@/components/modals/cliente/EditClientModal";

import { EditOrcamentoModal } from "@/components/modals/orcamento/EditOrcamentoModal";

import { DeleteOrcamentoModal } from "@/components/modals/orcamento/DeleteOrcamentoModal";

import { AddOrcamentoModal } from "@/components/modals/orcamento/AddOrcamentoModal";

import { BudgetDetailsModal } from "@/components/modals/orcamento/BudgetDetailsModal";

import { Orcamento, Cliente } from "@/components/layout/interface";

import { GradientBackground } from "@/styles/GradientBackground";

import FilterModal, {
  BudgetFilters,
  DEFAULT_BUDGET_FILTERS,
} from "@/components/modals/FilterModal";

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

  const [filterVisible, setFilterVisible] = useState(false);

  const [selectedBudget, setSelectedBudget] = useState<Orcamento | null>(null);

  // ============================================================
  // FILTROS
  // ============================================================

  const [filters, setFilters] = useState<BudgetFilters>({
    ...DEFAULT_BUDGET_FILTERS,

    value: {
      min: 0,
      max: 500000,
    },
  });

  // ============================================================
  // CLIENTE
  // ============================================================

  const [detailsClientVisible, setDetailsClientVisible] = useState(false);

  const [editClientVisible, setEditClientVisible] = useState(false);

  const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);

  // ============================================================
  // CARREGAR ORÇAMENTOS
  // ============================================================

  async function loadBudgets() {
    try {
      if (!token) return;

      setLoading(true);

      const data = await getBudgets(token);

      setBudgetsList(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.log("ERRO AO CARREGAR ORÇAMENTOS:", error);

      console.log("RESPONSE:", error?.response);

      console.log("DATA:", error?.response?.data);

      console.log("STATUS:", error?.response?.status);
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
  // ARQUIVAR / DESARQUIVAR
  // ============================================================

  async function handleArchiveBudget(budget: Orcamento) {
    try {
      if (!token) return;

      const novoEstado = !budget.arquivado;

      await archiveBudget(budget._id, novoEstado, token);

      await loadBudgets();
    } catch (error: any) {
      console.log(
        "ERRO AO ARQUIVAR ORÇAMENTO:",
        error?.response?.data || error?.message || error,
      );
    }
  }

  // ============================================================
  // FILTRO DE DATA DE PUBLICAÇÃO
  // ============================================================

  function matchBudgetPublicationDate(
    budget: Orcamento,
    dateFilter: BudgetFilters["publicationDate"],
  ) {
    if (dateFilter.preset === "all") {
      return true;
    }

    if (!budget.data_publicacao) {
      return false;
    }

    const publicationDate = new Date(budget.data_publicacao);

    if (Number.isNaN(publicationDate.getTime())) {
      return false;
    }

    const now = new Date();

    // ==========================================================
    // ÚLTIMA SEMANA
    // ==========================================================

    if (dateFilter.preset === "week") {
      const limit = new Date(now);

      limit.setDate(limit.getDate() - 7);

      return publicationDate >= limit;
    }

    // ==========================================================
    // ÚLTIMO MÊS
    // ==========================================================

    if (dateFilter.preset === "month") {
      const limit = new Date(now);

      limit.setMonth(limit.getMonth() - 1);

      return publicationDate >= limit;
    }

    // ==========================================================
    // ÚLTIMO ANO
    // ==========================================================

    if (dateFilter.preset === "year") {
      const limit = new Date(now);

      limit.setFullYear(limit.getFullYear() - 1);

      return publicationDate >= limit;
    }

    // ==========================================================
    // PERSONALIZADO
    // ==========================================================

    if (dateFilter.preset === "custom") {
      const from = parseBRDate(dateFilter.from, false);

      const to = parseBRDate(dateFilter.to, true);

      if (from && publicationDate < from) {
        return false;
      }

      if (to && publicationDate > to) {
        return false;
      }

      return true;
    }

    return true;
  }

  // ============================================================
  // CONVERTER DATA BR
  // ============================================================

  function parseBRDate(value: string, endOfDay: boolean) {
    if (!value) {
      return null;
    }

    const parts = value.split("/");

    if (parts.length !== 3) {
      return null;
    }

    const day = Number(parts[0]);

    const month = Number(parts[1]);

    const year = Number(parts[2]);

    if (!day || !month || !year) {
      return null;
    }

    const date = new Date(year, month - 1, day);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    if (endOfDay) {
      date.setHours(23, 59, 59, 999);
    } else {
      date.setHours(0, 0, 0, 0);
    }

    return date;
  }

  // ============================================================
  // FILTRAR ORÇAMENTOS
  // ============================================================

  const filteredBudgets = useMemo(() => {
    const searchLower = search.trim().toLowerCase();

    let result = budgetsList.filter((budget) => {
      // ======================================================
      // BUSCA
      // ======================================================

      const nome = budget.nome?.toLowerCase() || "";

      const clienteNome =
        typeof budget.cliente === "string"
          ? budget.cliente.toLowerCase()
          : budget.cliente?.nome?.toLowerCase() || "";

      const matchSearch =
        !searchLower ||
        nome.includes(searchLower) ||
        clienteNome.includes(searchLower);

      if (!matchSearch) {
        return false;
      }

      // ======================================================
      // STATUS
      // ======================================================

      if (filters.status !== "all") {
        const status = budget.status?.toUpperCase();

        const expectedStatus =
          filters.status === "pendente"
            ? "PENDENTE"
            : filters.status === "aprovado"
              ? "APROVADO"
              : "RECUSADO";

        if (status !== expectedStatus) {
          return false;
        }
      }

      // ======================================================
      // ARQUIVAMENTO
      // ======================================================

      if (filters.archived === "active" && budget.arquivado === true) {
        return false;
      }

      if (filters.archived === "archived" && budget.arquivado !== true) {
        return false;
      }

      // ======================================================
      // LOCALIZAÇÃO
      // ======================================================

      const estado = budget.endereco?.estado?.toLowerCase() || "";

      const cidade = budget.endereco?.cidade?.toLowerCase() || "";

      if (filters.state && estado !== filters.state.toLowerCase()) {
        return false;
      }

      if (filters.city && cidade !== filters.city.toLowerCase()) {
        return false;
      }

      // ======================================================
      // DATA DE PUBLICAÇÃO
      // ======================================================

      if (!matchBudgetPublicationDate(budget, filters.publicationDate)) {
        return false;
      }

      // ======================================================
      // VALOR COM BDI
      // ======================================================

      const valor = Number(budget.preco_com_bdi ?? 0);

      if (valor < filters.value.min || valor > filters.value.max) {
        return false;
      }

      return true;
    });

    // ==========================================================
    // ORDENAÇÃO POR NOME
    // ==========================================================

    if (filters.sort === "asc") {
      result.sort((a, b) =>
        (a.nome || "").localeCompare(b.nome || "", "pt-BR", {
          sensitivity: "base",
        }),
      );
    }

    if (filters.sort === "desc") {
      result.sort((a, b) =>
        (b.nome || "").localeCompare(a.nome || "", "pt-BR", {
          sensitivity: "base",
        }),
      );
    }

    // ==========================================================
    // ORDENAÇÃO POR CLIENTE
    // ==========================================================

    if (filters.clientSort) {
      result.sort((a, b) => {
        const clienteA =
          typeof a.cliente === "string" ? a.cliente : a.cliente?.nome || "";

        const clienteB =
          typeof b.cliente === "string" ? b.cliente : b.cliente?.nome || "";

        if (filters.clientSort === "asc") {
          return clienteA.localeCompare(clienteB, "pt-BR", {
            sensitivity: "base",
          });
        }

        return clienteB.localeCompare(clienteA, "pt-BR", {
          sensitivity: "base",
        });
      });
    }

    return result;
  }, [budgetsList, search, filters]);

  // ============================================================
  // ESTADOS DISPONÍVEIS
  // ============================================================

  const availableStates = useMemo(() => {
    const states = budgetsList
      .map((budget) => budget.endereco?.estado)
      .filter((state): state is string => Boolean(state));

    return Array.from(new Set(states)).sort((a, b) =>
      a.localeCompare(b, "pt-BR"),
    );
  }, [budgetsList]);

  // ============================================================
  // CIDADES DISPONÍVEIS
  // ============================================================

  const availableCities = useMemo(() => {
    const cities = budgetsList
      .filter((budget) => {
        if (!filters.state) {
          return true;
        }

        return (
          budget.endereco?.estado?.toLowerCase() === filters.state.toLowerCase()
        );
      })
      .map((budget) => budget.endereco?.cidade)
      .filter((city): city is string => Boolean(city));

    return Array.from(new Set(cities)).sort((a, b) =>
      a.localeCompare(b, "pt-BR"),
    );
  }, [budgetsList, filters.state]);

  // ============================================================
  // QUANTIDADE DE FILTROS ATIVOS
  // ============================================================

  const activeFiltersCount = useMemo(() => {
    let count = 0;

    // Ordenação por nome
    if (filters.sort) {
      count++;
    }

    // Ordenação por cliente
    if (filters.clientSort) {
      count++;
    }

    // Status
    if (filters.status !== "all") {
      count++;
    }

    // Arquivamento
    if (filters.archived !== "active") {
      count++;
    }

    // Estado
    if (filters.state) {
      count++;
    }

    // Cidade
    if (filters.city) {
      count++;
    }

    // Data de publicação
    if (filters.publicationDate.preset !== "all") {
      count++;
    }

    // Valor
    if (filters.value.min > 0 || filters.value.max < 500000) {
      count++;
    }

    return count;
  }, [filters]);

  // ============================================================
  // TEXTO DOS FILTROS ATIVOS
  // ============================================================

  const activeFilterLabels = useMemo(() => {
    const labels: string[] = [];

    // ==========================================================
    // ORDENAÇÃO
    // ==========================================================

    if (filters.sort === "asc") {
      labels.push("Nome A-Z");
    }

    if (filters.sort === "desc") {
      labels.push("Nome Z-A");
    }

    // ==========================================================
    // ORDENAÇÃO POR CLIENTE
    // ==========================================================

    if (filters.clientSort === "asc") {
      labels.push("Cliente A-Z");
    }

    if (filters.clientSort === "desc") {
      labels.push("Cliente Z-A");
    }

    // ==========================================================
    // STATUS
    // ==========================================================

    if (filters.status === "pendente") {
      labels.push("Pendente");
    }

    if (filters.status === "aprovado") {
      labels.push("Aprovado");
    }

    if (filters.status === "recusado") {
      labels.push("Recusado");
    }

    // ==========================================================
    // ARQUIVAMENTO
    // ==========================================================

    if (filters.archived === "archived") {
      labels.push("Arquivados");
    }

    // ==========================================================
    // ESTADO
    // ==========================================================

    if (filters.state) {
      labels.push(`Estado: ${filters.state}`);
    }

    // ==========================================================
    // CIDADE
    // ==========================================================

    if (filters.city) {
      labels.push(`Cidade: ${filters.city}`);
    }

    // ==========================================================
    // DATA DE PUBLICAÇÃO
    // ==========================================================

    if (filters.publicationDate.preset === "week") {
      labels.push("Última semana");
    }

    if (filters.publicationDate.preset === "month") {
      labels.push("Último mês");
    }

    if (filters.publicationDate.preset === "year") {
      labels.push("Último ano");
    }

    if (filters.publicationDate.preset === "custom") {
      const from = filters.publicationDate.from;

      const to = filters.publicationDate.to;

      if (from && to) {
        labels.push(`Data: ${from} - ${to}`);
      } else if (from) {
        labels.push(`Data: a partir de ${from}`);
      } else if (to) {
        labels.push(`Data: até ${to}`);
      } else {
        labels.push("Data personalizada");
      }
    }

    // ==========================================================
    // VALOR
    // ==========================================================

    if (filters.value.min > 0 || filters.value.max < 500000) {
      const min = filters.value.min.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });

      const max = filters.value.max.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });

      labels.push(`Valor: ${min} - ${max}`);
    }

    return labels;
  }, [filters]);

  // ============================================================
  // LIMPAR FILTROS
  // ============================================================

  function clearFilters() {
    setFilters({
      ...DEFAULT_BUDGET_FILTERS,

      value: {
        min: 0,
        max: 500000,
      },
    });
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <View style={globalStyles.screen}>
      <GradientBackground style={globalStyles.container}>
        <ScrollView
          contentContainerStyle={{
            paddingBottom: 100,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* ==================================================
              CABEÇALHO
          =================================================== */}

          <View style={globalStyles.pageHeaderRow}>
            <Text style={globalStyles.title}>Orçamentos</Text>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
            >
              {/* FILTRO */}

              <Pressable
                style={[
                  globalStyles.pageHeaderButtonFilter,

                  activeFiltersCount > 0
                    ? {
                        backgroundColor: COLORS.primary,
                      }
                    : null,
                ]}
                onPress={() => setFilterVisible(true)}
              >
                <Ionicons
                  name="filter-outline"
                  size={22}
                  color={activeFiltersCount > 0 ? COLORS.white : COLORS.text}
                />

                {activeFiltersCount > 0 && (
                  <View
                    style={{
                      position: "absolute",
                      right: -4,
                      top: -4,
                      minWidth: 18,
                      height: 18,
                      borderRadius: 999,
                      paddingHorizontal: 4,
                      backgroundColor: COLORS.danger,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: COLORS.white,
                        fontSize: 10,
                        fontWeight: "700",
                      }}
                    >
                      {activeFiltersCount}
                    </Text>
                  </View>
                )}
              </Pressable>

              {/* NOVO ORÇAMENTO */}

              <Pressable
                style={globalStyles.pageHeaderButton}
                onPress={() => setAddVisible(true)}
              >
                <Ionicons name="add" color={COLORS.text} size={25} />
              </Pressable>
            </View>
          </View>

          {/* ==================================================
              BUSCA
          =================================================== */}

          <AppInput
            placeholder="Buscar orçamento..."
            value={search}
            onChangeText={setSearch}
          />

          {/* ==================================================
              FILTROS ATIVOS
          =================================================== */}

          {activeFilterLabels.length > 0 && (
            <View
              style={{
                marginTop: 12,
                marginBottom: 4,
              }}
            >
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  paddingRight: 8,
                }}
              >
                {/* FILTROS */}

                {activeFilterLabels.map((label) => (
                  <View
                    key={label}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: COLORS.primary,
                      borderRadius: 999,
                      paddingHorizontal: 12,
                      paddingVertical: 7,
                    }}
                  >
                    <Text
                      style={{
                        color: COLORS.white,
                        fontSize: 12,
                        fontWeight: "600",
                      }}
                      numberOfLines={1}
                    >
                      {label}
                    </Text>
                  </View>
                ))}

                {/* LIMPAR */}

                <Pressable
                  onPress={clearFilters}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 5,
                    paddingHorizontal: 10,
                    paddingVertical: 7,
                  }}
                >
                  <Ionicons
                    name="close-circle-outline"
                    size={17}
                    color={COLORS.textSecondary}
                  />

                  <Text
                    style={{
                      color: COLORS.textSecondary,
                      fontSize: 12,
                      fontWeight: "600",
                    }}
                  >
                    Limpar
                  </Text>
                </Pressable>
              </ScrollView>
            </View>
          )}

          {/* ==================================================
              NENHUM ORÇAMENTO
          =================================================== */}

          {!loading && filteredBudgets.length === 0 && (
            <Text style={globalStyles.sectionTitle}>
              {filters.archived === "archived"
                ? "Nenhum orçamento arquivado encontrado."
                : "Nenhum orçamento encontrado."}
            </Text>
          )}

          {/* ==================================================
              LOADING
          =================================================== */}

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
              <ActivityIndicator size="large" color={COLORS.primary} />

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
            /* ==================================================
               LISTA
            ================================================== */

            filteredBudgets.map((budget) => {
              const nomeCliente =
                typeof budget.cliente === "object"
                  ? (budget.cliente?.nome ?? "")
                  : "Cliente não encontrado";

              return (
                <BudgetCard
                  key={budget._id}
                  client={nomeCliente}
                  nome={budget.nome}
                  status={budget.status}
                  value={budget.preco_com_bdi}
                  date={new Date(budget.data_validade).toLocaleDateString(
                    "pt-BR",
                  )}
                  arquivado={budget.arquivado}
                  onDetails={() => {
                    setSelectedBudget(budget);

                    setDetailsVisible(true);
                  }}
                  onEdit={() => {
                    setSelectedBudget(budget);

                    setEditVisible(true);
                  }}
                  onDelete={() => {
                    setSelectedBudget(budget);

                    setDeleteVisible(true);
                  }}
                  onArchive={() => handleArchiveBudget(budget)}
                />
              );
            })
          )}
        </ScrollView>
      </GradientBackground>

      {/* ======================================================
          BOTÃO NOVO ORÇAMENTO
      ====================================================== */}

      <View style={globalStyles.bottomActionContainer}>
        <Pressable
          style={globalStyles.bottomActionButton}
          onPress={() => setAddVisible(true)}
        >
          <Text style={globalStyles.bottomActionButtonText}>
            + Novo Orçamento
          </Text>
        </Pressable>
      </View>

      {/* ======================================================
          MODAL - ADICIONAR
      ====================================================== */}

      <AddOrcamentoModal
        visible={addVisible}
        onClose={() => {
          setAddVisible(false);
          loadBudgets();
        }}
      />

      {/* ======================================================
          MODAL - EDITAR
      ====================================================== */}

      <EditOrcamentoModal
        visible={editVisible}
        onClose={() => setEditVisible(false)}
        budget={selectedBudget}
        onSuccess={loadBudgets}
      />

      {/* ======================================================
          MODAL - EXCLUIR
      ====================================================== */}

      <DeleteOrcamentoModal
        visible={deleteVisible}
        budgetId={selectedBudget?._id ?? ""}
        budgetName={selectedBudget?.nome ?? ""}
        onClose={() => setDeleteVisible(false)}
        onSuccess={loadBudgets}
      />

      {/* ======================================================
          MODAL - DETALHES ORÇAMENTO
      ====================================================== */}

      <BudgetDetailsModal
        visible={detailsVisible}
        budget={selectedBudget}
        onClose={() => setDetailsVisible(false)}
        onEdit={() => {
          setDetailsVisible(false);

          setTimeout(() => {
            setEditVisible(true);
          }, 200);
        }}
        onClientDetails={(client) => {
          setSelectedClient(client);

          setTimeout(() => {
            setDetailsClientVisible(true);
          }, 200);
        }}
        onClientEdit={(client) => {
          setSelectedClient(client);

          setTimeout(() => {
            setEditClientVisible(true);
          }, 200);
        }}
      />

      {/* ======================================================
          MODAL - DETALHES CLIENTE
      ====================================================== */}

      <DetailsClientModal
        visible={detailsClientVisible}
        client={selectedClient}
        onClose={() => {
          setDetailsClientVisible(false);

          setSelectedClient(null);
        }}
        onEdit={() => {
          setDetailsClientVisible(false);

          setTimeout(() => {
            setEditClientVisible(true);
          }, 200);
        }}
      />

      {/* ======================================================
          MODAL - EDITAR CLIENTE
      ====================================================== */}

      <EditClientModal
        visible={editClientVisible}
        client={selectedClient}
        onClose={() => {
          setEditClientVisible(false);

          setSelectedClient(null);
        }}
        onSuccess={() => {
          setEditClientVisible(false);

          setSelectedClient(null);

          loadBudgets();
        }}
      />

      {/* ======================================================
          MODAL - FILTROS
      ====================================================== */}

      <FilterModal
        visible={filterVisible}
        mode="orcamentos"
        initialFilters={filters}
        states={availableStates}
        cities={availableCities}
        maxValue={500000}
        onClose={() => setFilterVisible(false)}
        onApply={(newFilters) => {
          setFilters(newFilters as BudgetFilters);

          setFilterVisible(false);
        }}
      />
    </View>
  );
}
