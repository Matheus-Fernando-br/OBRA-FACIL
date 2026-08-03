import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
} from "react-native";

import { useEffect, useState, useMemo } from "react";

import { globalStyles, COLORS } from "../../styles/globalStyles";

import { AppInput } from "../../components/forms/AppInput";

import { useAuth } from "@/contexts/AuthContext";

import { getWork, getBudgets, getClients } from "../../services/api";

import { ObrasCard } from "@/components/cards/ObrasCard";

import { Cliente, Obra, Orcamento } from "@/components/layout/interface";
import { AddObrasModal } from "@/components/modals/obras/AddObrasModal";
import { CreateObraModal } from "@/components/modals/obras/CreateObraModal";
import { DetailsObraModal } from "@/components/modals/obras/DetailsObraModal";
import { EditObraModal } from "@/components/modals/obras/EditObraModal";
import { DeleteObraModal } from "@/components/modals/obras/DeleteObraModal";
import { GradientBackground } from "@/styles/GradientBackground";

export default function ObrasScreen() {
  const { token } = useAuth();

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [worksList, setWorksList] = useState<Obra[]>([]);
  const [budgets, setBudgets] = useState<Orcamento[]>([]);
  const [clients, setClients] = useState<Cliente[]>([]);
  const [selectedWork, setSelectedWork] = useState<Obra | null>(null);

  const [detailsVisible, setDetailsVisible] = useState(false);

  const [editVisible, setEditVisible] = useState(false);

  const [deleteVisible, setDeleteVisible] = useState(false);
  const [statusFilter, setStatusFilter] = useState("Todos");

  const [addObraVisible, setAddObraVisible] = useState(false);

  const [createVisible, setCreateVisible] = useState(false);

  const [selectedBudget, setSelectedBudget] = useState<Orcamento | null>(null);

  async function loadWorks() {
    try {
      if (!token) return;

      setLoading(true);

      const [worksData, budgetsData, clientsData] = await Promise.all([
        getWork(token),
        getBudgets(token),
        getClients(token),
      ]);

      setWorksList(Array.isArray(worksData) ? worksData : worksData.obras);

      setBudgets(budgetsData);
      
      setClients(clientsData);
    } catch (err: any) {
      console.log("ERRO COMPLETO");
      console.log(err);
      console.log(err.response);
      console.log(err.response?.data);
      console.log(err.response?.status);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!token) return;

    loadWorks();
  }, [token]);

  const budgetsMap = useMemo(() => {
    return budgets.reduce((acc: Record<string, Orcamento>, budget) => {
      acc[budget._id] = budget;
      return acc;
    }, {});
  }, [budgets]);

  const clientsMap = useMemo(() => {
    return clients.reduce(
      (acc: Record<string, Cliente>, client) => {
        acc[client._id] = client;
        return acc;
      },
      {},
    );
  }, [clients]);

  function getClientName(clientId: string) {
    return clientsMap[clientId]?.nome ?? "Cliente não encontrado";
  }

  function getBudget(work: Obra) {
    const budgetId =
      typeof work.orcamento === "string" ? work.orcamento : work.orcamento._id;

    return budgetsMap[budgetId];
  }

  const filteredWorks = useMemo(() => {
    const searchLower = search.trim().toLowerCase();

    return worksList.filter((work) => {
      const budget = getBudget(work);

      const matchSearch =
        !searchLower ||
        budget?.nome.toLowerCase().includes(searchLower) ||
        (typeof budget?.cliente === "string"
          ? budget.cliente.toLowerCase().includes(searchLower)
          : budget?.cliente.nome.toLowerCase().includes(searchLower));

      const matchStatus =
        statusFilter === "Todos" ||
        work.status === statusFilter.replace(" ", "").toUpperCase();

      return matchSearch && matchStatus;
    });
  }, [worksList, budgetsMap, search, statusFilter]);

  const selectedBudgetObra = selectedWork ? getBudget(selectedWork) : null;

  return (
    <View style={globalStyles.screen}>
      <GradientBackground style={globalStyles.container}>
        <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
          <View style={globalStyles.pageHeaderRow}>
            <Text style={globalStyles.title}>Obras</Text>

            <Pressable style={globalStyles.pageHeaderButton}>
              <Text style={globalStyles.pageHeaderButtonText}>+</Text>
            </Pressable>
          </View>

          <AppInput
            placeholder="Buscar obra..."
            value={search}
            onChangeText={setSearch}
          />

          <View style={globalStyles.filterRow}>
            {[
              "Todos",
              "No Prazo",
              "Atrasado",
              "Adiantado",
              "Entregue",
              "Cancelado",
            ].map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  globalStyles.filterButton,
                  statusFilter === item && {
                    backgroundColor: "#2563EB",
                  },
                ]}
                onPress={() => setStatusFilter(item)}
              >
                <Text style={globalStyles.filterButtonText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {(!loading && filteredWorks.length === 0) && (
            <Text style={globalStyles.sectionTitle}>Nenhum obra encontrada.</Text>
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
                Carregando Serviços...
              </Text>
            </View>
          ) : (
            filteredWorks.map((work) => {
              const budget = getBudget(work);

              return (
                <ObrasCard
                  key={work._id}
                  title={budget?.nome ?? "Obra"}
                  client={
                    typeof budget?.cliente === "string"
                      ? getClientName(budget.cliente)
                      : budget?.cliente.nome ?? ""
                  }
                  status={work.status}
                  progress={work.porcentagem_de_conclusao ?? 0}
                  EndDate={new Date(work.data_fim_prevista).toLocaleDateString(
                    "pt-BR",
                  )}
                  startDate={new Date(
                    work.data_inicio_prevista,
                  ).toLocaleDateString("pt-BR")}
                  onDetails={() => {
                    setSelectedWork(work);
                    setDetailsVisible(true);
                  }}
                  onEdit={() => {
                    setSelectedWork(work);
                    setEditVisible(true);
                  }}
                  onDelete={() => {
                    setSelectedWork(work);
                    setDeleteVisible(true);
                  }}
                />
              );
            })
          )}
        </ScrollView>
      </GradientBackground>

      <View style={globalStyles.bottomActionContainer}>
        <Pressable
          style={globalStyles.bottomActionButton}
          onPress={() => setAddObraVisible(true)}
        >
          <Text style={globalStyles.bottomActionButtonText}>+ Nova Obra</Text>
        </Pressable>
      </View>
      <AddObrasModal
        visible={addObraVisible}
        onClose={() => setAddObraVisible(false)}
        onSelect={(budget) => {
          setSelectedBudget(budget);

          setAddObraVisible(false);

          setTimeout(() => {
            setCreateVisible(true);
          }, 250);
        }}
      />

      <CreateObraModal
        visible={createVisible}
        budget={selectedBudget}
        clientsList={clients}
        onClose={() => {
          setCreateVisible(false);

          setSelectedBudget(null);
        }}
        onSuccess={() => {
          loadWorks();

          setCreateVisible(false);

          setSelectedBudget(null);
        }}
      />

      <EditObraModal
        visible={editVisible}
        onClose={() => setEditVisible(false)}
        work={selectedWork}
        onSuccess={loadWorks}
      />

      <DeleteObraModal
        visible={deleteVisible}
        WorkId={selectedWork?._id ?? ""}
        WorkName={selectedBudgetObra?.nome ?? "Obra"}
        onClose={() => setDeleteVisible(false)}
        onSuccess={loadWorks}
      />
      <DetailsObraModal
        visible={detailsVisible}
        work={selectedWork}
        onClose={() => setDetailsVisible(false)}
      />
    </View>
  );
}
