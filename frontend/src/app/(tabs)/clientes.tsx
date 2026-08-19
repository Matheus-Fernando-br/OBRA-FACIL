import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";

import { useState, useEffect, useMemo } from "react";

import { useTheme } from "@/contexts/ThemeContext";

import { useAuth } from "@/contexts/AuthContext";

import { AppInput } from "../../components/forms/AppInput";

import { ClientCard } from "@/components/cards/cliente/ClientCard";

import { DetailsClientModal } from "../../components/modals/cliente/DetailsClientModal";
import { AddClientModal } from "../../components/modals/cliente/AddClientModal";
import { EditClientModal } from "../../components/modals/cliente/EditClientModal";
import { DeleteClientModal } from "../../components/modals/cliente/DeleteClientModal";

import { getClients, getBudgets } from "../../services/api";

import { Cliente, Orcamento } from "@/components/layout/interface";

import { GradientBackground } from "@/styles/GradientBackground";

import { Ionicons } from "@expo/vector-icons";

import FilterModal, {
  ClientFilters,
  DEFAULT_CLIENT_FILTERS,
} from "@/components/modals/FilterModal";

export default function ClientesScreen() {
  const { token } = useAuth();
  const { styles, theme } = useTheme();

  // ============================================================
  // CLIENTES
  // ============================================================

  const [clientsList, setClientsList] = useState<Cliente[]>([]);

  const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);

  // ============================================================
  // ORÇAMENTOS
  // ============================================================

  const [budgetsList, setBudgetsList] = useState<Orcamento[]>([]);

  // ============================================================
  // BUSCA
  // ============================================================

  const [search, setSearch] = useState("");

  // ============================================================
  // FILTROS
  // ============================================================

  const [filters, setFilters] = useState<ClientFilters>(DEFAULT_CLIENT_FILTERS);

  const [filterVisible, setFilterVisible] = useState(false);

  // ============================================================
  // MODAIS
  // ============================================================

  const [detailsVisible, setDetailsVisible] = useState(false);

  const [addVisible, setAddVisible] = useState(false);

  const [editVisible, setEditVisible] = useState(false);

  const [deleteVisible, setDeleteVisible] = useState(false);

  // ============================================================
  // LOADING
  // ============================================================

  const [loading, setLoading] = useState(true);

  // ============================================================
  // CARREGAR CLIENTES
  // ============================================================

  async function loadClients() {
    try {
      if (!token) return;

      setLoading(true);

      const data = await getClients(token);

      setClientsList(data);
    } catch (error) {
      console.log("ERRO CLIENTES:", error);
    } finally {
      setLoading(false);
    }
  }

  // ============================================================
  // CARREGAR ORÇAMENTOS
  // ============================================================

  async function loadBudgets() {
    try {
      if (!token) return;

      const data = await getBudgets(token);

      setBudgetsList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log("ERRO ORÇAMENTOS DOS CLIENTES:", error);

      setBudgetsList([]);
    }
  }

  // ============================================================
  // CARREGAMENTO INICIAL
  // ============================================================

  useEffect(() => {
    if (!token) return;

    loadClients();
    loadBudgets();
  }, [token]);

  // ============================================================
  // CONTAGEM DE ORÇAMENTOS POR CLIENTE
  // ============================================================

  const budgetsCountByClient = useMemo(() => {
    const countMap: Record<string, number> = {};

    budgetsList.forEach((budget) => {
      let clientId = "";

      if (typeof budget.cliente === "string") {
        clientId = budget.cliente;
      } else if (budget.cliente && typeof budget.cliente === "object") {
        clientId = budget.cliente._id;
      }

      if (!clientId) return;

      countMap[clientId] = (countMap[clientId] || 0) + 1;
    });

    return countMap;
  }, [budgetsList]);

  // ============================================================
  // QUANTIDADE DE ORÇAMENTOS
  // ============================================================

  function getBudgetCount(client: Cliente) {
    return budgetsCountByClient[client._id] || 0;
  }

  // ============================================================
  // FILTROS APLICADOS
  // ============================================================

  const filteredClients = useMemo(() => {
    const searchLower = search.trim().toLowerCase();

    let result = clientsList.filter((client) => {
      // ==================================================
      // BUSCA POR NOME
      // ==================================================

      const nome = client.nome?.toLowerCase() || "";

      const matchSearch = !searchLower || nome.includes(searchLower);

      if (!matchSearch) {
        return false;
      }

      // ==================================================
      // TIPO DE PESSOA
      // ==================================================

      if (filters.personType !== "all") {
        const tipoPessoa = client.tipo?.toUpperCase();

        if (tipoPessoa !== filters.personType) {
          return false;
        }
      }

      // ==================================================
      // QUANTIDADE DE ORÇAMENTOS
      // ==================================================

      const budgetCount = getBudgetCount(client);

      switch (filters.budgetQuantity) {
        case "none":
          if (budgetCount !== 0) {
            return false;
          }
          break;

        case "one":
          if (budgetCount !== 1) {
            return false;
          }
          break;

        case "two":
          if (budgetCount !== 2) {
            return false;
          }
          break;

        case "threePlus":
          if (budgetCount < 3) {
            return false;
          }
          break;

        case "all":
        default:
          break;
      }

      return true;
    });

    // ========================================================
    // ORDENAÇÃO
    // ========================================================

    if (filters.sort === "asc") {
      result.sort((a, b) =>
        a.nome.localeCompare(b.nome, "pt-BR", {
          sensitivity: "base",
        }),
      );
    }

    if (filters.sort === "desc") {
      result.sort((a, b) =>
        b.nome.localeCompare(a.nome, "pt-BR", {
          sensitivity: "base",
        }),
      );
    }

    return result;
  }, [clientsList, budgetsCountByClient, search, filters]);

  // ============================================================
  // QUANTIDADE DE FILTROS ATIVOS
  // ============================================================

  const activeFiltersCount = useMemo(() => {
    let count = 0;

    if (filters.sort) {
      count++;
    }

    if (filters.personType !== "all") {
      count++;
    }

    if (filters.budgetQuantity !== "all") {
      count++;
    }

    return count;
  }, [filters]);

  // ============================================================
  // TEXTO DOS FILTROS ATIVOS
  // ============================================================

  const activeFilterLabels = useMemo(() => {
    const labels: string[] = [];

    // Ordenação

    if (filters.sort === "asc") {
      labels.push("Nome A-Z");
    }

    if (filters.sort === "desc") {
      labels.push("Nome Z-A");
    }

    // Tipo

    if (filters.personType === "FISICO") {
      labels.push("Pessoa Física");
    }

    if (filters.personType === "JURIDICO") {
      labels.push("Pessoa Jurídica");
    }

    // Quantidade

    if (filters.budgetQuantity === "none") {
      labels.push("Sem orçamento");
    }

    if (filters.budgetQuantity === "one") {
      labels.push("1 orçamento");
    }

    if (filters.budgetQuantity === "two") {
      labels.push("2 orçamentos");
    }

    if (filters.budgetQuantity === "threePlus") {
      labels.push("3+ orçamentos");
    }

    return labels;
  }, [filters]);

  // ============================================================
  // LIMPAR FILTROS
  // ============================================================

  function clearFilters() {
    setFilters({
      ...DEFAULT_CLIENT_FILTERS,
    });
  }

  return (
    <View style={styles.screen}>
      <GradientBackground style={styles.container}>
        <ScrollView
          contentContainerStyle={{
            paddingBottom: 100,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* ==================================================
              CABEÇALHO
          ================================================== */}

          <View style={styles.pageHeaderRow}>
            <Text style={styles.title}>Clientes</Text>

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
                  styles.pageHeaderButtonFilter,
                  activeFiltersCount > 0 && {
                    backgroundColor: theme.primary,
                  },
                ]}
                onPress={() => setFilterVisible(true)}
              >
                <Ionicons
                  name="filter-outline"
                  color={activeFiltersCount > 0 ? theme.white : theme.text}
                  size={22}
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
                      backgroundColor: theme.danger,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: theme.white,
                        fontSize: 10,
                        fontWeight: "700",
                      }}
                    >
                      {activeFiltersCount}
                    </Text>
                  </View>
                )}
              </Pressable>

              {/* NOVO CLIENTE */}
              <Pressable
                style={styles.pageHeaderButton}
                onPress={() => setAddVisible(true)}
              >
                <Ionicons name="add" color={theme.text} size={25} />
              </Pressable>
            </View>
          </View>

          {/* ==================================================
              BUSCA
          ================================================== */}

          <AppInput
            placeholder="Buscar cliente..."
            value={search}
            onChangeText={setSearch}
          />

          {/* ==================================================
              FILTROS ATIVOS
          ================================================== */}

          {activeFilterLabels.length > 0 && (
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 8,
                marginTop: 12,
                marginBottom: 4,
              }}
            >
              {activeFilterLabels.map((label) => (
                <View
                  key={label}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: theme.primary,
                    borderRadius: 999,
                    paddingHorizontal: 12,
                    paddingVertical: 7,
                  }}
                >
                  <Text
                    style={{
                      color: theme.white,
                      fontSize: 12,
                      fontWeight: "600",
                    }}
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
                  color={theme.textSecondary}
                />

                <Text
                  style={{
                    color: theme.textSecondary,
                    fontSize: 12,
                    fontWeight: "600",
                  }}
                >
                  Limpar
                </Text>
              </Pressable>
            </View>
          )}

          {/* ==================================================
              NENHUM RESULTADO
          ================================================== */}

          {!loading && filteredClients.length === 0 && (
            <Text style={styles.sectionTitle}>Nenhum cliente encontrado.</Text>
          )}

          {/* ==================================================
              LOADING
          ================================================== */}

          {loading ? (
            <View
              style={[
                styles.screen,
                {
                  justifyContent: "center",
                  alignItems: "center",
                  marginTop: 40,
                },
              ]}
            >
              <ActivityIndicator size="large" color={theme.primary} />

              <Text
                style={{
                  color: theme.text,
                  marginTop: 15,
                }}
              >
                Carregando clientes...
              </Text>
            </View>
          ) : (
            /* ==================================================
               CLIENTES
            ================================================== */

            filteredClients.map((client) => (
              <ClientCard
                key={client._id}
                name={client.nome}
                phone={client.telefone}
                email={client.email}
                onDetails={() => {
                  setSelectedClient(client);

                  setDetailsVisible(true);
                }}
                onEdit={() => {
                  setSelectedClient(client);

                  setEditVisible(true);
                }}
                onDelete={() => {
                  setSelectedClient(client);

                  setDeleteVisible(true);
                }}
              />
            ))
          )}
        </ScrollView>
      </GradientBackground>

      {/* ======================================================
          BOTÃO NOVO CLIENTE
      ====================================================== */}

      <View style={styles.bottomActionContainer}>
        <Pressable
          style={styles.bottomActionButton}
          onPress={() => setAddVisible(true)}
        >
          <Text style={styles.bottomActionButtonText}>+ Novo Cliente</Text>
        </Pressable>
      </View>

      {/* ======================================================
          MODAL DE FILTROS
      ====================================================== */}

      <FilterModal
        visible={filterVisible}
        mode="clientes"
        initialFilters={filters}
        onClose={() => setFilterVisible(false)}
        onApply={(newFilters) => {
          setFilters(newFilters as ClientFilters);
        }}
      />

      {/* ======================================================
          DETALHES
      ====================================================== */}

      <DetailsClientModal
        visible={detailsVisible}
        client={selectedClient}
        onClose={() => setDetailsVisible(false)}
        onEdit={() => {
          setDetailsVisible(false);

          setTimeout(() => {
            setEditVisible(true);
          }, 200);
        }}
      />

      {/* ======================================================
          ADICIONAR
      ====================================================== */}

      <AddClientModal
        visible={addVisible}
        onClose={() => setAddVisible(false)}
        onSuccess={() => {
          loadClients();
          loadBudgets();
        }}
      />

      {/* ======================================================
          EDITAR
      ====================================================== */}

      <EditClientModal
        visible={editVisible}
        onClose={() => setEditVisible(false)}
        client={selectedClient}
        onSuccess={() => {
          loadClients();
          loadBudgets();
        }}
      />

      {/* ======================================================
          EXCLUIR
      ====================================================== */}

      <DeleteClientModal
        visible={deleteVisible}
        onClose={() => setDeleteVisible(false)}
        clientId={selectedClient?._id || ""}
        clientName={selectedClient?.nome || ""}
        onSuccess={() => {
          loadClients();
          loadBudgets();
        }}
      />
    </View>
  );
}
