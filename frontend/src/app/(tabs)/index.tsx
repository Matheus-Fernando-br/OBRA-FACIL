import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useState, useCallback, useMemo } from "react";
import { useFocusEffect } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";
import { DashboardCard } from "../../components/cards/DashboardCard";
import { WorkCard } from "@/components/cards/obras/WorkCard";
import { QuickAccessCard } from "../../components/cards/QuickAccessCard";
import { Cliente, Orcamento, Obra } from "@/components/layout/interface";
import { getClients, getUser, getBudgets, getWork } from "../../services/api";
import { useAuth } from "@/contexts/AuthContext";
import { GradientBackground } from "@/styles/GradientBackground";
export default function HomeScreen() {
  const { styles, theme } = useTheme();
  const { token, user, setUser } = useAuth();
  const [clientsList, setClientsList] = useState<Cliente[]>([]);
  const [budgets, setBudgets] = useState<Orcamento[]>([]);
  const [works, setWorks] = useState<Obra[]>([]);
  const [loading, setLoading] = useState(true);

  const obrasCount = works.length;

  const orcamentosPendentesCount = useMemo(() => {
    return budgets.filter((budget) => budget.status === "PENDENTE").length;
  }, [budgets]);

  const faturamentoTotal = useMemo(() => {
    return budgets
      .filter((budget) => budget.status === "APROVADO")
      .reduce(
        (total, budget) => total + (budget.preco_com_bdi ?? budget.preco ?? 0),
        0,
      );
  }, [budgets]);

  const budgetsMap = useMemo(() => {
    return budgets.reduce((acc: Record<string, Orcamento>, budget) => {
      acc[budget._id] = budget;
      return acc;
    }, {});
  }, [budgets]);

  function getBudget(work: Obra) {
    const budgetId =
      typeof work.orcamento === "string" ? work.orcamento : work.orcamento._id;

    return budgetsMap[budgetId];
  }

  useFocusEffect(
    useCallback(() => {
      async function loadData() {
        try {
          if (!token) return;

          setLoading(true);

          const [loggedUser, clients, budgetsData, worksData] =
            await Promise.all([
              getUser(token),
              getClients(token),
              getBudgets(token),
              getWork(token),
            ]);

          setUser(loggedUser);
          setClientsList(clients);
          setBudgets(budgetsData);
          setWorks(worksData);
        } catch (error) {
          console.log(error);
        } finally {
          setLoading(false);
        }
      }

      if (token) {
        loadData();
      }

      return;
    }, [token, setUser]), // <-- Dependências necessárias
  );

  return (
    <GradientBackground style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.homeHeader}>
          <View
            style={[
              styles.row,
              {
                alignItems: "center",
                justifyContent: "space-between",
                flex: 1,
              },
            ]}
          >
            <View style={styles.column}>
              <Text style={styles.title}>
                <Text style={{ color: theme.text }}>Olá, </Text>
                {user?.nome || "Usuário"} 👋
              </Text>

              <Text style={styles.subtitle}>
                Aqui está o resumo dos seus projetos!
              </Text>
            </View>

            <View style={{ justifyContent: "center" }}>
              <Ionicons name="person-circle" size={60} color={theme.text} />
            </View>
          </View>
        </View>
        <View style={[styles.section, { backgroundColor: theme.white }]}>
          <Text style={styles.sectionTitle}>Resumo geral:</Text>

          <View style={styles.dashboardGrid}>
            <DashboardCard
              title="Orçamentos Pendentes"
              value={
                loading ? (
                  <ActivityIndicator size="small" color={theme.white} />
                ) : (
                  orcamentosPendentesCount.toString()
                )
              }
              icon="document-text"
              color={theme.title}
            />

            <DashboardCard
              title="Clientes"
              value={
                loading ? (
                  <ActivityIndicator size="small" color={theme.white} />
                ) : (
                  clientsList.length.toString()
                )
              }
              icon="people"
              color={theme.warning}
            />

            <DashboardCard
              title="Obras"
              value={
                loading ? (
                  <ActivityIndicator size="small" color={theme.white} />
                ) : (
                  obrasCount.toString()
                )
              }
              icon="hammer"
              color={theme.primary}
            />

            <DashboardCard
              title="Orçamento Aprovado"
              value={
                loading ? (
                  <ActivityIndicator size="small" color={theme.white} />
                ) : (
                  faturamentoTotal.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })
                )
              }
              icon="cash"
              color={theme.success}
              valueStyle={{ fontSize: 14 }}
            />
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.section}>
          <View style={styles.quickAccessHeader}>
            <Text style={styles.sectionTitle}>Acesso rápido:</Text>

            <Pressable style={styles.quickAccessEditButton}>
              <Ionicons name="pencil" size={25} color={theme.primary} />
            </Pressable>
          </View>
          <View style={styles.quickAccessRow}>
            <QuickAccessCard
              title="Novo Orçamento"
              icon="document-text"
              onPress={() => {
                router.replace("/orcamentos");
              }}
              color={theme.title}
            />

            <QuickAccessCard
              title="Novo Cliente"
              icon="people"
              onPress={() => {
                router.replace("/clientes");
              }}
              color={theme.success}
            />

            <QuickAccessCard
              title="Configurações"
              icon="cog"
              onPress={() => {
                router.replace("/configuracoes");
              }}
              color={theme.textSecondary}
            />
          </View>
        </View>
        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Obras em andamento</Text>

          {works.map((work) => {
            const budget = getBudget(work);

            return (
              <WorkCard
                key={work._id}
                title={budget?.nome ?? "Obra"}
                progress={work.porcentagem_de_conclusao ?? 0}
                type={work.status}
                diasReal={work.qt_dias_real ?? 0}
              />
            );
          })}
        </View>
      </ScrollView>
    </GradientBackground>
  );
}
