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

  const [selectedBudget, setSelectedBudget] = useState<Orcamento | null>(null);

  // ============================================================
  // FILTRO DE STATUS
  // ============================================================

  const [statusFilter, setStatusFilter] = useState("Todos");
  const [showArchived, setShowArchived] = useState(false);

  // ============================================================
  // FILTRO DE ARQUIVAMENTO
  //
  // "ativos" = todos os que NÃO estão arquivados
  // "arquivados" = somente os que estão arquivados
  // ============================================================

  const [archiveFilter, setArchiveFilter] = useState<"ativos" | "arquivados">(
    "ativos",
  );

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
  // FILTRAR ORÇAMENTOS
  // ============================================================

  const filteredBudgets = useMemo(() => {
    const searchLower = search.trim().toLowerCase();

    return budgetsList.filter((budget) => {
      const nomeCliente =
        typeof budget.cliente === "object" ? (budget.cliente?.nome ?? "") : "";

      const nomeOrcamento = budget.nome?.toLowerCase() ?? "";

      const clienteLower = nomeCliente.toLowerCase();

      const matchSearch =
        !searchLower ||
        nomeOrcamento.includes(searchLower) ||
        clienteLower.includes(searchLower);

      const matchStatus =
        statusFilter === "Todos" ||
        budget.status?.toLowerCase() === statusFilter.toLowerCase();

      const matchArchived = showArchived
        ? budget.arquivado === true
        : budget.arquivado !== true;

      return matchSearch && matchStatus && matchArchived;
    });
  }, [budgetsList, search, statusFilter, showArchived]);

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

            <Pressable
              style={globalStyles.pageHeaderButton}
              onPress={() => setAddVisible(true)}
            >
              <Ionicons name="add" color={COLORS.text} size={25} />
            </Pressable>
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
              FILTRO ARQUIVADOS
          =================================================== */}

          <View
            style={[
              globalStyles.filterRow,
              {
                marginBottom: 8,
              },
            ]}
          >
            <TouchableOpacity
              style={[
                globalStyles.filterButton,
                archiveFilter === "ativos" && {
                  backgroundColor: COLORS.primary,
                },
              ]}
              onPress={() => {
                setArchiveFilter("ativos");
                setStatusFilter("Todos");
              }}
            >
              <Ionicons
                name="documents-outline"
                size={17}
                color={archiveFilter === "ativos" ? COLORS.white : COLORS.text}
              />

              <Text
                style={[
                  globalStyles.filterButtonText,
                  archiveFilter === "ativos" && {
                    color: COLORS.white,
                  },
                ]}
              >
                Orçamentos
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                globalStyles.filterButton,
                archiveFilter === "arquivados" && {
                  backgroundColor: COLORS.primary,
                },
              ]}
              onPress={() => {
                setArchiveFilter("arquivados");
                setStatusFilter("Todos");
              }}
            >
              <Ionicons
                name="archive-outline"
                size={17}
                color={
                  archiveFilter === "arquivados" ? COLORS.white : COLORS.text
                }
              />

              <Text
                style={[
                  globalStyles.filterButtonText,
                  archiveFilter === "arquivados" && {
                    color: COLORS.white,
                  },
                ]}
              >
                Arquivados
              </Text>
            </TouchableOpacity>
          </View>

          {/* ==================================================
              FILTROS DE STATUS
          =================================================== */}

          {archiveFilter === "ativos" && (
            <View style={globalStyles.filterRow}>
              {["Todos", "Pendente", "Aprovado", "Recusado", "Arquivados"].map(
                (item) => (
                  <TouchableOpacity
                    key={item}
                    style={[
                      globalStyles.filterButton,

                      statusFilter === item && {
                        backgroundColor: COLORS.primary,
                      },
                    ]}
                    onPress={() => {
                      if (item === "Arquivados") {
                        setShowArchived(true);
                        setStatusFilter("Todos");
                      } else {
                        setShowArchived(false);
                        setStatusFilter(item);
                      }
                    }}
                  >
                    <Text
                      style={[
                        globalStyles.filterButtonText,
                        statusFilter === item && {
                          color: COLORS.white,
                        },
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                ),
              )}
            </View>
          )}

          {/* ==================================================
              NENHUM ORÇAMENTO
          =================================================== */}

          {!loading && filteredBudgets.length === 0 && (
            <Text style={globalStyles.sectionTitle}>
              {archiveFilter === "arquivados"
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
            =================================================== */

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
          MODALS
      ====================================================== */}

      <AddOrcamentoModal
        visible={addVisible}
        onClose={() => {
          setAddVisible(false);
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
    </View>
  );
}
