  import {
    View,
    Text,
    ScrollView,
    Pressable,
    ActivityIndicator,
  } from "react-native";

  import { useEffect, useMemo, useState } from "react";

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

  import FilterModal, {
    WorkFilters,
    DEFAULT_WORK_FILTERS,
  } from "@/components/modals/FilterModal";

  import { GradientBackground } from "@/styles/GradientBackground";

  /* ============================================================
    TELA DE OBRAS
  ============================================================ */

  export default function ObrasScreen() {
    const { token } = useAuth();

    /* ==========================================================
      VALOR MÁXIMO DO FILTRO
    ========================================================== */

    const maxValue = 500000;

    /* ==========================================================
      ESTADOS
    ========================================================== */

    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");

    const [worksList, setWorksList] = useState<Obra[]>([]);

    const [budgets, setBudgets] = useState<Orcamento[]>([]);

    const [selectedWork, setSelectedWork] = useState<Obra | null>(null);

    const [selectedBudget, setSelectedBudget] = useState<Orcamento | null>(null);

    /* ==========================================================
      MODAIS
    ========================================================== */

    const [filterVisible, setFilterVisible] = useState(false);

    const [detailsVisible, setDetailsVisible] = useState(false);

    const [editVisible, setEditVisible] = useState(false);

    const [deleteVisible, setDeleteVisible] = useState(false);

    const [addObraVisible, setAddObraVisible] = useState(false);

    const [createVisible, setCreateVisible] = useState(false);

    /* ==========================================================
      FILTROS
    ========================================================== */

    const [workFilters, setWorkFilters] = useState<WorkFilters>({
      ...DEFAULT_WORK_FILTERS,

      value: {
        min: 0,
        max: maxValue,
      },
    });

    /* ============================================================
      CARREGAR OBRAS E ORÇAMENTOS
    ============================================================ */

    async function loadWorks() {
      try {
        if (!token) return;

        setLoading(true);

        const [worksData, budgetsData] = await Promise.all([
          getWork(token),
          getBudgets(token),
        ]);

        /* ======================================================
          OBRAS
        ====================================================== */

        setWorksList(
          Array.isArray(worksData) ? worksData : (worksData?.obras ?? []),
        );

        /* ======================================================
          ORÇAMENTOS
        ====================================================== */

        setBudgets(Array.isArray(budgetsData) ? budgetsData : []);
      } catch (error: any) {
        console.log("ERRO AO CARREGAR OBRAS:", error);

        console.log("RESPONSE:", error?.response);

        console.log("DATA:", error?.response?.data);

        console.log("STATUS:", error?.response?.status);
      } finally {
        setLoading(false);
      }
    }

    /* ============================================================
      CARREGAR AO ENTRAR NA TELA
    ============================================================ */

    useEffect(() => {
      if (!token) return;

      loadWorks();
    }, [token]);

    /* ============================================================
      ARQUIVAR / DESARQUIVAR
    ============================================================ */

    const [loadingArquivo, setLoadingArquivo] = useState<string | null>(null);

    async function handleArchiveWork(obra: Obra) {
      try {
        if (!token) return;
        setLoadingArquivo(obra._id);
        const novoEstado = !obra.arquivado;
        
        await archiveWork(obra._id, novoEstado, token);

        await loadWorks();
      } catch (error: any) {
        console.log(
          "ERRO AO ARQUIVAR OBRA:",
          error?.response?.data || error?.message || error,
        );
      } finally{
        setLoadingArquivo(null);
      }
    }

    /* ============================================================
      MAPA DE ORÇAMENTOS
    ============================================================ */

    const budgetsMap = useMemo(() => {
      return budgets.reduce((acc: Record<string, Orcamento>, budget) => {
        acc[budget._id] = budget;

        return acc;
      }, {});
    }, [budgets]);

    /* ============================================================
      PEGAR ORÇAMENTO DA OBRA
    ============================================================ */

    function getBudget(work: Obra): Orcamento | undefined {
      /*
      * A obra pode possuir:
      *
      * orcamento: "id"
      *
      * ou
      *
      * orcamento: objeto
      */

      if (typeof work.orcamento === "object" && work.orcamento !== null) {
        return work.orcamento;
      }

      const budgetId =
        typeof work.orcamento === "string" ? work.orcamento : undefined;

      if (!budgetId) {
        return undefined;
      }

      return budgetsMap[budgetId];
    }

    /* ============================================================
      ORÇAMENTO DA OBRA SELECIONADA
    ============================================================ */

    const selectedBudgetObra = selectedWork ? getBudget(selectedWork) : undefined;

    /* ============================================================
      NORMALIZAR STATUS
    ============================================================ */

    function normalizeStatus(status?: string) {
      return (status ?? "")
        .toUpperCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[\s_-]/g, "");
    }

    /* ============================================================
      FORMATAR DINHEIRO
    ============================================================ */

    function formatMoney(value: number) {
      return Number(value || 0).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }

    /* ============================================================
      CONVERTER DATA BR
    ============================================================ */

    function parseBRDate(value: string, endOfDay = false) {
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

    /* ============================================================
      FILTRO DE DATA
    ============================================================ */

    function matchesDateFilter(
      dateValue: Date | string | undefined,
      filter: WorkFilters["startDate"],
    ) {
      /* ========================================================
        SEM FILTRO
      ======================================================== */

      if (filter.preset === "all") {
        return true;
      }

      /* ========================================================
        OBRA SEM DATA
      ======================================================== */

      if (!dateValue) {
        return false;
      }

      const date = new Date(dateValue);

      if (Number.isNaN(date.getTime())) {
        return false;
      }

      const now = new Date();

      /* ========================================================
        ÚLTIMA SEMANA
      ======================================================== */

      if (filter.preset === "week") {
        const start = new Date(now);

        start.setDate(start.getDate() - 7);

        return date >= start && date <= now;
      }

      /* ========================================================
        ÚLTIMO MÊS
      ======================================================== */

      if (filter.preset === "month") {
        const start = new Date(now);

        start.setMonth(start.getMonth() - 1);

        return date >= start && date <= now;
      }

      /* ========================================================
        ÚLTIMO ANO
      ======================================================== */

      if (filter.preset === "year") {
        const start = new Date(now);

        start.setFullYear(start.getFullYear() - 1);

        return date >= start && date <= now;
      }

      /* ========================================================
        PERSONALIZADO
      ======================================================== */

      if (filter.preset === "custom") {
        const from = parseBRDate(filter.from, false);

        const to = parseBRDate(filter.to, true);

        if (from && date < from) {
          return false;
        }

        if (to && date > to) {
          return false;
        }

        return true;
      }

      return true;
    }

    /* ============================================================
      OBRAS FILTRADAS
    ============================================================ */

    const filteredWorks = useMemo(() => {
      const searchLower = search.trim().toLowerCase();

      const filtered = worksList.filter((work) => {
        const budget = getBudget(work);

        /* ======================================================
          NOME DA OBRA
        ====================================================== */

        const nomeObra = budget?.nome?.toLowerCase() ?? "";

        /* ======================================================
          NOME DO CLIENTE
        ====================================================== */

        const nomeCliente =
          typeof budget?.cliente === "string"
            ? budget.cliente.toLowerCase()
            : (budget?.cliente?.nome?.toLowerCase() ?? "");

        /* ======================================================
          BUSCA
        ====================================================== */

        const matchSearch =
          !searchLower ||
          nomeObra.includes(searchLower) ||
          nomeCliente.includes(searchLower);

        if (!matchSearch) {
          return false;
        }

        /* ======================================================
          ARQUIVAMENTO
        ====================================================== */

        if (workFilters.archived === "active" && work.arquivado === true) {
          return false;
        }

        if (workFilters.archived === "archived" && work.arquivado !== true) {
          return false;
        }

        /* ======================================================
          STATUS
        ====================================================== */

        if (workFilters.status !== "all") {
          const currentStatus = normalizeStatus(work.status);

          if (currentStatus !== workFilters.status) {
            return false;
          }
        }

        /* ======================================================
          DATA DE INÍCIO
        ====================================================== */

        const startDate = work.data_inicio_real ?? work.data_inicio_prevista;

        if (!matchesDateFilter(startDate, workFilters.startDate)) {
          return false;
        }

        /* ======================================================
          DATA DE FIM
        ====================================================== */

        const endDate = work.data_fim_real ?? work.data_fim_prevista;

        if (!matchesDateFilter(endDate, workFilters.endDate)) {
          return false;
        }

        /* ======================================================
          ESTADO
          =======================
          Estado pertence ao orçamento relacionado.
        ====================================================== */

        if (workFilters.state) {
          const estado = budget?.endereco?.estado?.toLowerCase() ?? "";

          if (estado !== workFilters.state.toLowerCase()) {
            return false;
          }
        }

        /* ======================================================
          CIDADE
        ====================================================== */

        if (workFilters.city) {
          const cidade = budget?.endereco?.cidade?.toLowerCase() ?? "";

          if (cidade !== workFilters.city.toLowerCase()) {
            return false;
          }
        }

        /* ======================================================
          VALOR
          =======================
          O valor vem do orçamento relacionado.
        ====================================================== */

        const valor = Number(budget?.preco_com_bdi ?? 0);

        if (valor < workFilters.value.min || valor > workFilters.value.max) {
          return false;
        }

        return true;
      });

      /* ========================================================
        ORDENAÇÃO
      ======================================================== */

      filtered.sort((a, b) => {
        const budgetA = getBudget(a);

        const budgetB = getBudget(b);

        /* ====================================================
          ORDENAÇÃO POR CLIENTE
        ==================================================== */

        if (workFilters.clientSort) {
          const clientA =
            typeof budgetA?.cliente === "string"
              ? budgetA.cliente
              : (budgetA?.cliente?.nome ?? "");

          const clientB =
            typeof budgetB?.cliente === "string"
              ? budgetB.cliente
              : (budgetB?.cliente?.nome ?? "");

          const comparison = clientA.localeCompare(clientB, "pt-BR", {
            sensitivity: "base",
          });

          if (comparison !== 0) {
            return workFilters.clientSort === "asc" ? comparison : -comparison;
          }
        }

        /* ====================================================
          ORDENAÇÃO POR OBRA
        ==================================================== */

        if (workFilters.sort) {
          const nomeA = budgetA?.nome?.toLowerCase() ?? "";

          const nomeB = budgetB?.nome?.toLowerCase() ?? "";

          const comparison = nomeA.localeCompare(nomeB, "pt-BR", {
            sensitivity: "base",
          });

          return workFilters.sort === "asc" ? comparison : -comparison;
        }

        return 0;
      });

      return filtered;
    }, [worksList, budgetsMap, search, workFilters]);

    /* ============================================================
      ESTADOS DISPONÍVEIS
    ============================================================ */

    const availableStates = useMemo(() => {
      const states = budgets
        .map((budget) => budget.endereco?.estado)
        .filter((state): state is string => Boolean(state));

      return Array.from(new Set(states)).sort((a, b) =>
        a.localeCompare(b, "pt-BR"),
      );
    }, [budgets]);

    /* ============================================================
      CIDADES DISPONÍVEIS
    ============================================================ */

    const availableCities = useMemo(() => {
      const cities = budgets
        .filter((budget) => {
          if (!workFilters.state) {
            return true;
          }

          return (
            budget.endereco?.estado?.toLowerCase() ===
            workFilters.state.toLowerCase()
          );
        })
        .map((budget) => budget.endereco?.cidade)
        .filter((city): city is string => Boolean(city));

      return Array.from(new Set(cities)).sort((a, b) =>
        a.localeCompare(b, "pt-BR"),
      );
    }, [budgets, workFilters.state]);

    /* ============================================================
      QUANTIDADE DE FILTROS ATIVOS
    ============================================================ */

    const activeFiltersCount = useMemo(() => {
      let count = 0;

      /* ========================================================
        ORDENAÇÃO POR OBRA
      ======================================================== */

      if (workFilters.sort) {
        count++;
      }

      /* ========================================================
        DATA DE INÍCIO
      ======================================================== */

      if (workFilters.startDate.preset !== "all") {
        count++;
      }

      /* ========================================================
        DATA DE FIM
      ======================================================== */

      if (workFilters.endDate.preset !== "all") {
        count++;
      }

      /* ========================================================
        ESTADO
      ======================================================== */

      if (workFilters.state) {
        count++;
      }

      /* ========================================================
        CIDADE
      ======================================================== */

      if (workFilters.city) {
        count++;
      }

      /* ========================================================
        STATUS
      ======================================================== */

      if (workFilters.status !== "all") {
        count++;
      }

      /* ========================================================
        ORDENAÇÃO POR CLIENTE
      ======================================================== */

      if (workFilters.clientSort) {
        count++;
      }

      /* ========================================================
        VALOR
      ======================================================== */

      if (workFilters.value.min > 0 || workFilters.value.max < maxValue) {
        count++;
      }

      /* ========================================================
        ARQUIVAMENTO
      ======================================================== */

      if (workFilters.archived !== "all") {
        count++;
      }

      return count;
    }, [workFilters]);

    /* ============================================================
      TEXTO DOS FILTROS ATIVOS
    ============================================================ */

    const activeFilterLabels = useMemo(() => {
      const labels: string[] = [];

      /* ========================================================
        ORDENAÇÃO
      ======================================================== */

      if (workFilters.sort === "asc") {
        labels.push("Nome A-Z");
      }

      if (workFilters.sort === "desc") {
        labels.push("Nome Z-A");
      }

      /* ========================================================
        DATA DE INÍCIO
      ======================================================== */

      if (workFilters.startDate.preset === "week") {
        labels.push("Início: Última semana");
      }

      if (workFilters.startDate.preset === "month") {
        labels.push("Início: Último mês");
      }

      if (workFilters.startDate.preset === "year") {
        labels.push("Início: Último ano");
      }

      if (workFilters.startDate.preset === "custom") {
        if (workFilters.startDate.from && workFilters.startDate.to) {
          labels.push(
            `Início: ${workFilters.startDate.from} - ${workFilters.startDate.to}`,
          );
        } else {
          labels.push("Início: Personalizado");
        }
      }

      /* ========================================================
        DATA DE FIM
      ======================================================== */

      if (workFilters.endDate.preset === "week") {
        labels.push("Fim: Última semana");
      }

      if (workFilters.endDate.preset === "month") {
        labels.push("Fim: Último mês");
      }

      if (workFilters.endDate.preset === "year") {
        labels.push("Fim: Último ano");
      }

      if (workFilters.endDate.preset === "custom") {
        if (workFilters.endDate.from && workFilters.endDate.to) {
          labels.push(
            `Fim: ${workFilters.endDate.from} - ${workFilters.endDate.to}`,
          );
        } else {
          labels.push("Fim: Personalizado");
        }
      }

      /* ========================================================
        ESTADO
      ======================================================== */

      if (workFilters.state) {
        labels.push(`Estado: ${workFilters.state}`);
      }

      /* ========================================================
        CIDADE
      ======================================================== */

      if (workFilters.city) {
        labels.push(`Cidade: ${workFilters.city}`);
      }

      /* ========================================================
        STATUS
      ======================================================== */

      if (workFilters.status === "noprazo") {
        labels.push("No prazo");
      }

      if (workFilters.status === "atrasado") {
        labels.push("Atrasado");
      }

      if (workFilters.status === "adiantado") {
        labels.push("Adiantado");
      }

      if (workFilters.status === "entregue") {
        labels.push("Entregue");
      }

      if (workFilters.status === "cancelado") {
        labels.push("Cancelado");
      }

      /* ========================================================
        CLIENTE
      ======================================================== */

      if (workFilters.clientSort === "asc") {
        labels.push("Cliente A-Z");
      }

      if (workFilters.clientSort === "desc") {
        labels.push("Cliente Z-A");
      }

      /* ========================================================
        VALOR
      ======================================================== */

      if (workFilters.value.min > 0 || workFilters.value.max < maxValue) {
        labels.push(
          `Valor: R$ ${formatMoney(workFilters.value.min)} - R$ ${formatMoney(
            workFilters.value.max,
          )}`,
        );
      }

      /* ========================================================
        ARQUIVAMENTO
      ======================================================== */

      if (workFilters.archived === "archived") {
        labels.push("Arquivados");
      }

      if (workFilters.archived === "active") {
        labels.push("Não Arquivados");
      }

      return labels;
    }, [workFilters]);

    /* ============================================================
      LIMPAR FILTROS
    ============================================================ */

    function clearFilters() {
      setWorkFilters({
        ...DEFAULT_WORK_FILTERS,

        value: {
          min: 0,
          max: maxValue,
        },
      });
    }

    /* ============================================================
      RENDER
    ============================================================ */

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
              <Text style={globalStyles.title}>Obras</Text>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                {/* ==================================================
                    FILTRO
                =================================================== */}

                <Pressable
                  style={[
                    globalStyles.pageHeaderButtonFilter,

                    activeFiltersCount > 0 && {
                      backgroundColor: COLORS.primary,
                    },
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

                {/* ==================================================
                    NOVA OBRA
                =================================================== */}

                <Pressable
                  style={globalStyles.pageHeaderButton}
                  onPress={() => setAddObraVisible(true)}
                >
                  <Ionicons name="add" color={COLORS.text} size={25} />
                </Pressable>
              </View>
            </View>

            {/* ==================================================
                BUSCA
            =================================================== */}

            <AppInput
              placeholder="Buscar obra..."
              value={search}
              onChangeText={setSearch}
            />

            {/* ==================================================
                FILTROS ATIVOS
            =================================================== */}

            {activeFilterLabels.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  paddingTop: 12,
                  paddingBottom: 4,
                }}
              >
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
                    >
                      {label}
                    </Text>
                  </View>
                ))}

                {/* ==================================================
                    LIMPAR
                =================================================== */}

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
            )}

            {/* ==================================================
                NENHUMA OBRA
            =================================================== */}

            {!loading && filteredWorks.length === 0 && (
              <Text style={globalStyles.sectionTitle}>
                {workFilters.archived === "archived"
                  ? "Nenhuma obra arquivada encontrada."
                  : "Nenhuma obra encontrada."}
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
                  Carregando Obras...
                </Text>
              </View>
            ) : (
              /* =================================================
                LISTA DE OBRAS
              ================================================= */

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
                    loadingArchive={loadingArquivo === work._id}
                  />
                );
              })
            )}
          </ScrollView>
        </GradientBackground>

        {/* ======================================================
            BOTÃO NOVA OBRA
        ====================================================== */}

        <View style={globalStyles.bottomActionContainer}>
          <Pressable
            style={globalStyles.bottomActionButton}
            onPress={() => setAddObraVisible(true)}
          >
            <Text style={globalStyles.bottomActionButtonText}>+ Nova Obra</Text>
          </Pressable>
        </View>

        {/* ======================================================
            FILTROS
        ====================================================== */}

        <FilterModal
          visible={filterVisible}
          mode="obras"
          initialFilters={workFilters}
          states={availableStates}
          cities={availableCities}
          maxValue={maxValue}
          onClose={() => setFilterVisible(false)}
          onApply={(newFilters) => {
            setWorkFilters(newFilters as WorkFilters);

            setFilterVisible(false);
          }}
        />

        {/* ======================================================
            SELECIONAR ORÇAMENTO
        ====================================================== */}

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

        {/* ======================================================
            CRIAR OBRA
        ====================================================== */}

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

        {/* ======================================================
            EDITAR OBRA
        ====================================================== */}

        <EditObraModal
          visible={editVisible}
          onClose={() => setEditVisible(false)}
          work={selectedWork}
          onSuccess={loadWorks}
        />

        {/* ======================================================
            EXCLUIR OBRA
        ====================================================== */}

        <DeleteObraModal
          visible={deleteVisible}
          WorkId={selectedWork?._id ?? ""}
          WorkName={selectedBudgetObra?.nome ?? "Obra"}
          onClose={() => setDeleteVisible(false)}
          onSuccess={loadWorks}
        />

        {/* ======================================================
            DETALHES DA OBRA
        ====================================================== */}

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
