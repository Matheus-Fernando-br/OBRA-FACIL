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
import { globalStyles, COLORS } from "../../styles/globalStyles";

import { DashboardCard } from "../../components/cards/DashboardCard";
import { WorkCard } from "@/components/cards/obras/WorkCard";
import { QuickAccessCard } from "../../components/cards/QuickAccessCard";

import { Cliente, Orcamento, Obra } from "@/components/layout/interface";
import { getClients, getUser, getBudgets, getWork } from "../../services/api";
import { useAuth } from "@/contexts/AuthContext";
import { GradientBackground } from "@/styles/GradientBackground";
export default function HomeScreen() {
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
    <GradientBackground style={globalStyles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={globalStyles.homeHeader}>
          <View style={{ flexDirection: "column" }}>
            <Text style={globalStyles.title}>
              <Text style={{ color: COLORS.text }}>Olá, </Text>
              {user?.nome || "Usuário"} 👋
            </Text>

            <Text style={globalStyles.subtitle}>
              Aqui está o resumo dos seus projetos!
            </Text>
          </View>
          <Image
            source={require("../../assets/images/profile.png")}
            style={globalStyles.profileImageIndex}
          />
        </View>
        <View
          style={[
            globalStyles.section,
            { backgroundColor: COLORS.white },
          ]}
        >
          <Text style={globalStyles.sectionTitle}>Resumo geral:</Text>

          <View style={globalStyles.dashboardGrid}>
            <DashboardCard
              title="Orçamentos Pendentes"
              value={
                loading ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  orcamentosPendentesCount.toString()
                )
              }
              icon="document-text"
              color={COLORS.title}
            />

            <DashboardCard
              title="Clientes"
              value={
                loading ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  clientsList.length.toString()
                )
              }
              icon="people"
              color={COLORS.warning}
            />

            <DashboardCard
              title="Obras"
              value={
                loading ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  obrasCount.toString()
                )
              }
              icon="hammer"
              color={COLORS.primary}
            />

            <DashboardCard
              title="Faturamento Aprovado"
              value={
                loading ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
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
              color={COLORS.success}
              valueStyle={{ fontSize: 14 }}
            />
          </View>
        </View>
        <View style={globalStyles.divider} />
        <View style={globalStyles.section}>
          <View style={globalStyles.quickAccessHeader}>
            <Text style={globalStyles.sectionTitle}>Acesso rápido:</Text>

            <Pressable style={globalStyles.quickAccessEditButton}>
              <Ionicons name="pencil" size={25} color={COLORS.primary} />
            </Pressable>
          </View>
          <View style={globalStyles.quickAccessRow}>
            <QuickAccessCard
              title="Novo Orçamento"
              icon="document-text"
              onPress={() => {
                router.replace("/orcamentos");
              }}
              color={COLORS.title}
            />

            <QuickAccessCard
              title="Novo Cliente"
              icon="people"
              onPress={() => {
                router.replace("/clientes");
              }}
              color={COLORS.success}
            />

            <QuickAccessCard
              title="Configurações"
              icon="cog"
              onPress={() => {
                router.replace("/configuracoes");
              }}
              color={COLORS.textSecondary}
            />
          </View>
        </View>
        <View style={globalStyles.divider} />

        <View style={globalStyles.section}>
          <Text style={globalStyles.sectionTitle}>Obras em andamento</Text>

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
