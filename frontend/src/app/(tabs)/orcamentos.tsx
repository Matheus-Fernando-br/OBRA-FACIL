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

import { AppInput } from "../../components/forms/AppInput";
import { useAuth } from "@/contexts/AuthContext";
import { getClients, getBudgets } from "../../services/api";
import { BudgetCard } from "@/components/cards/orcamento/BudgetCard";
import { EditOrcamentoModal } from "@/components/modals/orcamento/EditOrcamentoModal";
import { DeleteOrcamentoModal } from "@/components/modals/orcamento/DeleteOrcamentoModal";
import { AddOrcamentoModal } from "@/components/modals/orcamento/AddOrcamentoModal";
import { BudgetDetailsModal } from "@/components/modals/orcamento/BudgetDetailsModal";
import { Cliente, Orcamento } from "@/components/layout/interface";
import { GradientBackground } from "@/styles/GradientBackground";

export default function OrcamentosScreen() {
  const [search, setSearch] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [clientsMap, setClientsMap] = useState<Record<string, Cliente>>({});
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const [budgetsList, setBudgetsList] = useState<Orcamento[]>([]);
  const [detailsVisible, setDetailsVisible] = useState(false);

  const [selectedBudget, setSelectedBudget] = useState<Orcamento | null>(null);

  const [editVisible, setEditVisible] = useState(false);

  const [deleteVisible, setDeleteVisible] = useState(false);

  const [statusFilter, setStatusFilter] = useState("Todos");

  async function loadClients() {
    try {
      if (!token) return;
      setLoading(true);

      const data = await getClients(token);

      const map = data.reduce(
        (acc: Record<string, Cliente>, client: Cliente) => {
          acc[client._id] = client;
          return acc;
        },
        {},
      );

      setClientsMap(map);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  function getClientName(clienteId: string) {
    return clientsMap[clienteId]?.nome ?? "Cliente não encontrado";
  }

  async function loadBudgets() {
    try {
      if (!token) return;

      const data = await getBudgets(token);

      setBudgetsList(data);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    if (!token) return;

    async function load() {
      setLoading(true);

      await Promise.all([loadClients(), loadBudgets()]);

      setLoading(false);
    }

    load();
  }, [token]);

  const filteredBudgets = useMemo(() => {
    const searchLower = search.trim().toLowerCase();

    return budgetsList.filter((budget) => {
      const matchSearch =
        budget.nome.toLowerCase().includes(searchLower) ||
        getClientName(budget.cliente as string)
          .toLowerCase()
          .includes(searchLower);

      const matchStatus =
        statusFilter === "Todos" ||
        budget.status.toLowerCase() === statusFilter.toLowerCase();

      return matchSearch && matchStatus;
    });
  }, [budgetsList, search, statusFilter, clientsMap]);

  return (
    <View style={globalStyles.screen}>
      <GradientBackground style={globalStyles.container}>
        <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
          <View style={globalStyles.pageHeaderRow}>
            <Text style={globalStyles.title}>Orçamentos</Text>

            <Pressable
              style={globalStyles.pageHeaderButton}
              onPress={() => setModalVisible(true)}
            >
              <Text style={globalStyles.pageHeaderButtonText}>+</Text>
            </Pressable>
          </View>

          <AppInput
            placeholder="Buscar orçamento..."
            value={search}
            onChangeText={setSearch}
          />

          <View style={globalStyles.filterRow}>
            {["Todos", "Pendente", "Aprovado", "Recusado"].map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  globalStyles.filterButton,

                  statusFilter === item && {
                    backgroundColor: COLORS.primary,
                  },
                ]}
                onPress={() => setStatusFilter(item)}
              >
                <Text style={globalStyles.filterButtonText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {!loading && filteredBudgets.length === 0 && (
            <Text style={globalStyles.sectionTitle}>
              Nenhum orçamento encontrado.
            </Text>
          )}

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
              <Text style={{ color: COLORS.text, marginTop: 15 }}>
                Carregando Orçamentos...
              </Text>
            </View>
          ) : (
            filteredBudgets.map((budget) => (
              <BudgetCard
                key={budget._id}
                client={getClientName(budget.cliente as string)}
                nome={budget.nome}
                status={budget.status}
                value={budget.preco_com_bdi}
                date={new Date(budget.data_validade).toLocaleDateString(
                  "pt-BR",
                )}
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
              />
            ))
          )}
        </ScrollView>
      </GradientBackground>

      <View style={globalStyles.bottomActionContainer}>
        <Pressable
          style={globalStyles.bottomActionButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={globalStyles.bottomActionButtonText}>
            + Novo Orçamento
          </Text>
        </Pressable>
      </View>
      <AddOrcamentoModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          loadBudgets();
        }}
      />

      <EditOrcamentoModal
        visible={editVisible}
        onClose={() => setEditVisible(false)}
        budget={selectedBudget}
        onSuccess={loadBudgets}
      />

      <DeleteOrcamentoModal
        visible={deleteVisible}
        budgetId={selectedBudget?._id ?? ""}
        budgetName={selectedBudget?.nome ?? ""}
        onClose={() => setDeleteVisible(false)}
        onSuccess={loadBudgets}
      />

      <BudgetDetailsModal
        visible={detailsVisible}
        budget={selectedBudget}
        onClose={() => setDetailsVisible(false)}
      />
    </View>
  );
}
