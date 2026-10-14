import {
  View,
  Text,
  ScrollView,
  RefreshControl,
} from "react-native";

import { useState, useEffect, useMemo } from "react";

import { useTheme } from "@/contexts/ThemeContext";

import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/cards/Header";
import { SearchField } from "@/components/ui/SearchField";
import { FilterChips } from "@/components/ui/FilterChips";
import { EmptyState } from "@/components/ui/EmptyState";
import { FadeInView } from "@/components/ui/FadeInView";
import { ListSkeleton } from "@/components/ui/Skeleton";

import { ClientCard } from "@/components/cards/cliente/ClientCard";

import { DetailsClientModal } from "../../components/modals/cliente/DetailsClientModal";
import { AddClientModal } from "../../components/modals/cliente/AddClientModal";
import { EditClientModal } from "../../components/modals/cliente/EditClientModal";
import { DeleteClientModal } from "../../components/modals/cliente/DeleteClientModal";

import { getClients, getBudgets } from "../../services/api";

import { Cliente, Orcamento } from "@/components/layout/interface";


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

  const [refreshing, setRefreshing] = useState(false);

  async function handleRefresh() {
    setRefreshing(true);
    await Promise.all([loadClients(), loadBudgets()]);
    setRefreshing(false);
  }

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
      // BUSCA POR NOME, E-MAIL OU TELEFONE
      // ==================================================

      const nome = client.nome?.toLowerCase() || "";
      const email = client.email?.toLowerCase() || "";
      const telefone = (client.telefone || "").replace(/\D/g, "");
      const searchDigits = searchLower.replace(/\D/g, "");

      const matchSearch =
        !searchLower ||
        nome.includes(searchLower) ||
        email.includes(searchLower) ||
        (searchDigits.length >= 3 && telefone.includes(searchDigits));

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
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
      >
        <Header
          title="Clientes"
          subtitle={
            loading
              ? "Carregando…"
              : `${clientsList.length} cliente${clientsList.length === 1 ? "" : "s"} cadastrado${clientsList.length === 1 ? "" : "s"}`
          }
          showFilter
          activeFiltersCount={activeFiltersCount}
          onFilterPress={() => setFilterVisible(true)}
          showAdd
          onAddPress={() => setAddVisible(true)}
        />

        <SearchField
          placeholder="Buscar por nome, e-mail ou telefone"
          value={search}
          onChangeText={setSearch}
        />

        <FilterChips labels={activeFilterLabels} onClear={clearFilters} />

        {loading && clientsList.length === 0 ? (
          <ListSkeleton count={4} />
        ) : filteredClients.length === 0 ? (
          clientsList.length === 0 ? (
            <EmptyState
              icon="people-outline"
              title="Nenhum cliente ainda"
              message="Cadastre seus clientes para criar orçamentos e acompanhar obras."
              actionLabel="Novo cliente"
              onAction={() => setAddVisible(true)}
            />
          ) : (
            <EmptyState
              icon="search-outline"
              title="Nenhum resultado"
              message="Ajuste a busca ou limpe os filtros para ver todos os clientes."
            />
          )
        ) : (
          filteredClients.map((client, index) => (
            <FadeInView key={client._id} index={index}>
              <ClientCard
                name={client.nome}
                phone={client.telefone}
                email={client.email}
                budgetsCount={getBudgetCount(client)}
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
            </FadeInView>
          ))
        )}
      </ScrollView>

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
