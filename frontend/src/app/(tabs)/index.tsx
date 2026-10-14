import {
  View,
  Text,
  ScrollView,
  Animated,
  RefreshControl,
  Pressable,
} from "react-native";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useState, useCallback, useMemo, useEffect, useRef } from "react";

import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardCard } from "@/components/cards/DashboardCard";
import { WorkCard } from "@/components/cards/obras/WorkCard";
import { QuickAccessCard } from "@/components/cards/QuickAccessCard";
import { Cliente, Orcamento, Obra } from "@/components/layout/interface";
import { getClients, getUser, getBudgets, getWork } from "@/services/api";
import { Avatar } from "@/components/ui/Avatar";
import { FadeInView } from "@/components/ui/FadeInView";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonBlock } from "@/components/ui/Skeleton";
import { BudgetStatusChart } from "@/components/dashboard/BudgetStatusChart";
import { MonthlyBudgetChart } from "@/components/dashboard/MonthlyBudgetChart";
import { AttentionList } from "@/components/dashboard/AttentionList";
import {
  firstName,
  formatCompactCurrency,
  formatCurrency,
  formatLongToday,
} from "@/utils/format";
import { getClientName, isBudgetExpired, getBudgetDaysLeft, isWorkFinished } from "@/utils/status";

export default function HomeScreen() {
  const { styles, theme } = useTheme();
  const { token, user, setUser } = useAuth();
  const { fromLogin } = useLocalSearchParams();

  /* ----------------------------------------------------------
     Fade de entrada vindo do login
  ---------------------------------------------------------- */
  const splashOpacity = useRef(new Animated.Value(1)).current;
  const [showLoginSplash, setShowLoginSplash] = useState(fromLogin === "true");

  useEffect(() => {
    if (fromLogin !== "true") return;

    splashOpacity.setValue(1);
    setShowLoginSplash(true);

    const timer = setTimeout(() => {
      Animated.timing(splashOpacity, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }).start(() => setShowLoginSplash(false));
    }, 150);

    return () => clearTimeout(timer);
  }, [fromLogin, splashOpacity]);

  /* ----------------------------------------------------------
     Dados
  ---------------------------------------------------------- */
  const [clientsList, setClientsList] = useState<Cliente[]>([]);
  const [budgets, setBudgets] = useState<Orcamento[]>([]);
  const [works, setWorks] = useState<Obra[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const loadData = useCallback(async () => {
    if (!token) return;

    try {
      setLoadError(false);
      const [loggedUser, clients, budgetsData, worksData] = await Promise.all([
        getUser(token),
        getClients(token),
        getBudgets(token),
        getWork(token),
      ]);

      setUser(loggedUser);
      setClientsList(Array.isArray(clients) ? clients : []);
      setBudgets(Array.isArray(budgetsData) ? budgetsData : []);
      setWorks(
        Array.isArray(worksData) ? worksData : (worksData?.obras ?? []),
      );
    } catch (error) {
      console.log(error);
      setLoadError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, setUser]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  /* ----------------------------------------------------------
     Indicadores
  ---------------------------------------------------------- */
  const budgetsMap = useMemo(() => {
    return budgets.reduce((acc: Record<string, Orcamento>, budget) => {
      acc[budget._id] = budget;
      return acc;
    }, {});
  }, [budgets]);

  const clientsById = useMemo(() => {
    return clientsList.reduce((acc: Record<string, Cliente>, client) => {
      acc[client._id] = client;
      return acc;
    }, {});
  }, [clientsList]);

  const stats = useMemo(() => {
    const approved = budgets.filter((b) => b.status === "APROVADO");
    const pending = budgets.filter((b) => b.status === "PENDENTE");
    const rejected = budgets.filter((b) => b.status === "RECUSADO");

    const approvedValue = approved.reduce(
      (total, b) => total + (b.preco_com_bdi ?? b.preco ?? 0),
      0,
    );
    const pendingValue = pending.reduce(
      (total, b) => total + (b.preco_com_bdi ?? b.preco ?? 0),
      0,
    );

    const decided = approved.length + rejected.length;
    const approvalRate = decided > 0 ? Math.round((approved.length / decided) * 100) : null;

    const activeWorks = works.filter((w) => !w.arquivado && !isWorkFinished(w));
    const lateWorks = activeWorks.filter((w) => w.status === "ATRASADO");

    const expiringSoon = pending.filter((b) => {
      const days = getBudgetDaysLeft(b);
      return days !== null && days >= 0 && days <= 3;
    });
    const expired = pending.filter(isBudgetExpired);

    return {
      approved,
      pending,
      rejected,
      approvedValue,
      pendingValue,
      approvalRate,
      activeWorks,
      lateWorks,
      expiringSoon,
      expired,
    };
  }, [budgets, works]);

  function getBudget(work: Obra) {
    if (typeof work.orcamento === "object" && work.orcamento) return work.orcamento;
    return budgetsMap[work.orcamento as string];
  }

  const goTo = (pathname: "/orcamentos" | "/clientes" | "/obras", action?: "new") =>
    router.navigate(action ? { pathname, params: { action } } : pathname);

  const userFirstName = firstName(user?.nome) || "Usuário";

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadData();
            }}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
      >
        {/* SAUDAÇÃO */}
        <FadeInView style={styles.homeHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.caption}>{formatLongToday()}</Text>
            <Text style={styles.pageHeaderTitle} numberOfLines={1}>
              Olá, {userFirstName}
            </Text>
          </View>
          <Pressable
            onPress={() => router.navigate("/mais")}
            accessibilityLabel="Abrir perfil"
            hitSlop={6}
          >
            <Avatar name={user?.nome} size={46} />
          </Pressable>
        </FadeInView>

        {loadError && (
          <View style={[styles.listCard, { flexDirection: "row", gap: 10, alignItems: "center" }]}>
            <Ionicons name="cloud-offline-outline" size={20} color={theme.danger} />
            <Text style={[styles.listCardMetaText, { flex: 1 }]}>
              Não foi possível atualizar os dados. Puxe para baixo para tentar novamente.
            </Text>
          </View>
        )}

        {/* DESTAQUE: RECEITA APROVADA */}
        <FadeInView index={1}>
          <LinearGradient
            colors={[theme.primary, theme.accentGradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={styles.heroLabel}>Receita aprovada</Text>
              <Ionicons name="trending-up" size={18} color="rgba(255,255,255,0.9)" />
            </View>

            {loading ? (
              <View style={{ marginTop: 12 }}>
                <SkeletonBlock width="60%" height={34} radius={10} />
              </View>
            ) : (
              <Text
                style={styles.heroValue}
                numberOfLines={1}
                adjustsFontSizeToFit
                accessibilityLabel={`Receita aprovada: ${formatCurrency(stats.approvedValue)}`}
              >
                {formatCurrency(stats.approvedValue)}
              </Text>
            )}

            <View style={styles.heroFooter}>
              <View style={styles.heroChip}>
                <Ionicons name="checkmark-circle" size={13} color="#FFFFFF" />
                <Text style={styles.heroChipText}>
                  {stats.approved.length} aprovado{stats.approved.length === 1 ? "" : "s"}
                </Text>
              </View>
              <View style={styles.heroChip}>
                <Ionicons name="pie-chart" size={12} color="#FFFFFF" />
                <Text style={styles.heroChipText}>
                  {stats.approvalRate === null
                    ? "Sem decisões ainda"
                    : `${stats.approvalRate}% de aprovação`}
                </Text>
              </View>
              {stats.pendingValue > 0 && (
                <View style={styles.heroChip}>
                  <Ionicons name="time" size={12} color="#FFFFFF" />
                  <Text style={styles.heroChipText}>
                    {formatCompactCurrency(stats.pendingValue)} em negociação
                  </Text>
                </View>
              )}
            </View>
          </LinearGradient>
        </FadeInView>

        {/* INDICADORES */}
        <FadeInView index={2} style={[styles.dashboardGrid, { marginTop: 16 }]}>
          <DashboardCard
            title="Orçamentos pendentes"
            value={stats.pending.length}
            icon="document-text"
            color={theme.warning}
            loading={loading}
            hint={
              stats.expiringSoon.length > 0
                ? `${stats.expiringSoon.length} vence${stats.expiringSoon.length === 1 ? "" : "m"} em até 3 dias`
                : undefined
            }
            onPress={() => goTo("/orcamentos")}
          />
          <DashboardCard
            title="Clientes"
            value={clientsList.length}
            icon="people"
            color={theme.info}
            loading={loading}
            onPress={() => goTo("/clientes")}
          />
          <DashboardCard
            title="Obras em andamento"
            value={stats.activeWorks.length}
            icon="construct"
            color={theme.primary}
            loading={loading}
            onPress={() => goTo("/obras")}
          />
          <DashboardCard
            title="Obras atrasadas"
            value={stats.lateWorks.length}
            icon="alert-circle"
            color={theme.danger}
            loading={loading}
            hint={stats.lateWorks.length === 0 && !loading ? "Tudo em dia" : undefined}
            onPress={() => goTo("/obras")}
          />
        </FadeInView>

        {/* ACESSO RÁPIDO */}
        <FadeInView index={3}>
          <Text style={styles.sectionTitle}>Acesso rápido</Text>
          <View style={styles.quickAccessRow}>
            <QuickAccessCard
              title="Novo orçamento"
              icon="document-text"
              color={theme.primary}
              onPress={() => goTo("/orcamentos", "new")}
            />
            <QuickAccessCard
              title="Novo cliente"
              icon="person-add"
              color={theme.info}
              onPress={() => goTo("/clientes", "new")}
            />
            <QuickAccessCard
              title="Nova obra"
              icon="construct"
              color={theme.success}
              onPress={() => goTo("/obras", "new")}
            />
            <QuickAccessCard
              title="Relatórios"
              icon="bar-chart"
              color={theme.secondary}
              onPress={() => router.navigate("/relatorios")}
            />
          </View>
        </FadeInView>

        {/* ATENÇÃO */}
        {!loading && (
          <AttentionList
            expired={stats.expired}
            expiringSoon={stats.expiringSoon}
            lateWorks={stats.lateWorks}
            getWorkName={(w) => getBudget(w)?.nome ?? "Obra"}
            getClientLabel={(b) => getClientName(b.cliente, clientsById)}
          />
        )}

        {/* GRÁFICOS */}
        {!loading && budgets.length > 0 && (
          <>
            <FadeInView index={4}>
              <Text style={styles.sectionTitle}>Orçamentos por status</Text>
              <BudgetStatusChart
                approved={stats.approved.length}
                pending={stats.pending.length}
                rejected={stats.rejected.length}
              />
            </FadeInView>

            <FadeInView index={5}>
              <Text style={styles.sectionTitle}>Valor orçado por mês</Text>
              <MonthlyBudgetChart budgets={budgets} />
            </FadeInView>
          </>
        )}

        {/* OBRAS EM ANDAMENTO */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeaderTitle}>Obras em andamento</Text>
          {stats.activeWorks.length > 0 && (
            <Pressable onPress={() => goTo("/obras")} hitSlop={8}>
              <Text style={styles.sectionHeaderLink}>Ver todas</Text>
            </Pressable>
          )}
        </View>

        {loading ? (
          <View style={styles.workCard}>
            <SkeletonBlock width="50%" height={16} />
            <View style={{ height: 12 }} />
            <SkeletonBlock height={8} />
          </View>
        ) : stats.activeWorks.length === 0 ? (
          <View style={styles.card}>
            <EmptyState
              icon="construct-outline"
              title="Nenhuma obra em andamento"
              message="Quando um orçamento for aprovado, transforme-o em obra para acompanhar o progresso aqui."
              actionLabel="Nova obra"
              onAction={() => goTo("/obras", "new")}
            />
          </View>
        ) : (
          stats.activeWorks.slice(0, 4).map((work, index) => {
            const budget = getBudget(work);
            return (
              <FadeInView key={work._id} index={index}>
                <WorkCard
                  title={budget?.nome ?? "Obra"}
                  client={budget ? getClientName(budget.cliente, clientsById) : undefined}
                  progress={work.porcentagem_de_conclusao ?? 0}
                  status={work.status}
                  endDate={work.data_fim_prevista}
                  onPress={() => goTo("/obras")}
                />
              </FadeInView>
            );
          })
        )}
      </ScrollView>

      {showLoginSplash && (
        <Animated.View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: theme.white,
            zIndex: 9999,
            opacity: splashOpacity,
          }}
        />
      )}
    </View>
  );
}
