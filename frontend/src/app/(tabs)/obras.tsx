import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
} from "react-native";

import { useEffect, useState, useMemo } from "react";
import { Ionicons } from "@expo/vector-icons";
import { globalStyles, COLORS } from "../../styles/globalStyles";

import { AppInput } from "../../components/forms/AppInput";

import { useAuth } from "@/contexts/AuthContext";

import { getWork, getBudgets, archiveWork } from "../../services/api";

import { ObrasCard } from "@/components/cards/obras/ObrasCard";

import { Obra, Orcamento } from "@/components/layout/interface";

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
  const [selectedWork, setSelectedWork] = useState<Obra | null>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [addObraVisible, setAddObraVisible] = useState(false);
  const [createVisible, setCreateVisible] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Orcamento | null>(null);

  const [showArchived, setShowArchived] = useState(false);

  // ============================================================
  // CARREGAR OBRAS E ORÇAMENTOS
  // ============================================================

  async function loadWorks() {
    try {
      if (!token) return;

      setLoading(true);

      const [worksData, budgetsData] = await Promise.all([
        getWork(token),
        getBudgets(token),
      ]);

      setWorksList(
        Array.isArray(worksData) ? worksData : (worksData.obras ?? []),
      );

      setBudgets(Array.isArray(budgetsData) ? budgetsData : []);
    } catch (err: any) {
      console.log("ERRO AO CARREGAR OBRAS:", err);
      console.log("RESPONSE:", err?.response);
      console.log("DATA:", err?.response?.data);
      console.log("STATUS:", err?.response?.status);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!token) return;

    loadWorks();
  }, [token]);

  async function handleArchiveWork(obra: Obra) {
    try {
      if (!token) return;

      const novoEstado = !obra.arquivado;

      await archiveWork(obra._id, novoEstado, token);

      await loadWorks();
    } catch (error: any) {
      console.log(
        "ERRO AO ARQUIVAR OBRA:",
        error?.response?.data || error?.message || error,
      );
    }
  }

  // ============================================================
  // MAPA DE ORÇAMENTOS
  // ============================================================

  const budgetsMap = useMemo(() => {
    return budgets.reduce((acc: Record<string, Orcamento>, budget) => {
      acc[budget._id] = budget;
      return acc;
    }, {});
  }, [budgets]);

  // ============================================================
  // PEGAR ORÇAMENTO DA OBRA
  // ============================================================

  function getBudget(work: Obra) {
    const budgetId =
      typeof work.orcamento === "string" ? work.orcamento : work.orcamento?._id;

    if (!budgetId) {
      return undefined;
    }

    return budgetsMap[budgetId];
  }

  // ============================================================
  // FILTRAR OBRAS
  // ============================================================

  const filteredWorks = useMemo(() => {
    const searchLower = search.trim().toLowerCase();

    return worksList.filter((work) => {
      const budget = getBudget(work);

      const nomeObra = budget?.nome?.toLowerCase() ?? "";

      const nomeCliente =
        typeof budget?.cliente === "string"
          ? budget.cliente.toLowerCase()
          : (budget?.cliente?.nome?.toLowerCase() ?? "");

      /*
       * BUSCA
       */
      const matchSearch =
        !searchLower ||
        nomeObra.includes(searchLower) ||
        nomeCliente.includes(searchLower);

      /*
       * ARQUIVADOS
       *
       * Se estiver em "Arquivados":
       * mostra somente arquivados.
       *
       * Nos demais filtros:
       * NÃO mostra arquivados.
       */
      const matchArchived = showArchived
        ? work.arquivado === true
        : work.arquivado !== true;

      /*
       * FILTRO DE STATUS
       *
       * Quando estiver em Arquivados,
       * não aplicamos filtro de status.
       */
      if (showArchived) {
        return matchSearch && matchArchived;
      }

      /*
       * FILTRO "TODOS"
       */
      if (statusFilter === "Todos") {
        return matchSearch && matchArchived;
      }

      /*
       * FILTRO DE STATUS
       */
      const matchStatus =
        work.status?.toUpperCase() ===
        statusFilter.replace(" ", "").toUpperCase();

      return matchSearch && matchArchived && matchStatus;
    });
  }, [worksList, budgetsMap, search, statusFilter, showArchived]);

  // ============================================================
  // ORÇAMENTO DA OBRA SELECIONADA
  // ============================================================

  const selectedBudgetObra = selectedWork ? getBudget(selectedWork) : null;

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
          <View style={globalStyles.pageHeaderRow}>
            <Text style={globalStyles.title}>Obras</Text>

            <Pressable style={globalStyles.pageHeaderButton}>
              <Ionicons name="add" color={COLORS.text} size={25} />
            </Pressable>
          </View>

          <AppInput
            placeholder="Buscar obra..."
            value={search}
            onChangeText={setSearch}
          />

          {/* FILTROS */}

          <View style={globalStyles.filterRow}>
            {[
              "Todos",
              "No Prazo",
              "Atrasado",
              "Adiantado",
              "Entregue",
              "Cancelado",
              "Arquivados",
            ].map((item) => (
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

          {/* NENHUMA OBRA */}

          {!loading && filteredWorks.length === 0 && (
            <Text style={globalStyles.sectionTitle}>
              Nenhuma obra encontrada.
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
              <ActivityIndicator size="large" color={COLORS.primary} />

              <Text
                style={{
                  color: COLORS.text,
                  marginTop: 15,
                }}
              >
                Carregando Obras...
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
                      ? budget.cliente
                      : (budget?.cliente?.nome ?? "Cliente não encontrado")
                  }
                  status={work.status}
                  progress={work.porcentagem_de_conclusao ?? 0}
                  EndDate={new Date(work.data_fim_prevista).toLocaleDateString(
                    "pt-BR",
                  )}
                  startDate={new Date(
                    work.data_inicio_prevista,
                  ).toLocaleDateString("pt-BR")}
                  arquivado={work.arquivado}
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
                  onArchive={() => {
                    handleArchiveWork(work);
                  }}
                />
              );
            })
          )}
        </ScrollView>
      </GradientBackground>

      {/* BOTÃO NOVA OBRA */}

      <View style={globalStyles.bottomActionContainer}>
        <Pressable
          style={globalStyles.bottomActionButton}
          onPress={() => setAddObraVisible(true)}
        >
          <Text style={globalStyles.bottomActionButtonText}>+ Nova Obra</Text>
        </Pressable>
      </View>

      {/* SELECIONAR ORÇAMENTO */}

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

      {/* CRIAR OBRA */}

      <CreateObraModal
        visible={createVisible}
        budget={selectedBudget}
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

      {/* EDITAR OBRA */}

      <EditObraModal
        visible={editVisible}
        onClose={() => setEditVisible(false)}
        work={selectedWork}
        onSuccess={loadWorks}
      />

      {/* EXCLUIR OBRA */}

      <DeleteObraModal
        visible={deleteVisible}
        WorkId={selectedWork?._id ?? ""}
        WorkName={selectedBudgetObra?.nome ?? "Obra"}
        onClose={() => setDeleteVisible(false)}
        onSuccess={loadWorks}
      />

      {/* DETALHES DA OBRA */}

      <DetailsObraModal
        visible={detailsVisible}
        work={selectedWork}
        onClose={() => setDetailsVisible(false)}
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
