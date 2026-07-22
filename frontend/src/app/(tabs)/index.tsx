import { View, Text, ScrollView, Pressable, Image } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { globalStyles, COLORS } from "../../styles/globalStyles";

import { DashboardCard } from "../../components/cards/DashboardCard";
import { WorkCard } from "../../components/cards/WorkCard";
import { QuickAccessCard } from "../../components/cards/QuickAccessCard";

import { obras } from "../../data/obras";
import { Cliente, Orcamento } from "@/components/layout/interface";
import { getClients, getUser, getBudgets } from "../../services/api";
import { useAuth } from "@/contexts/AuthContext";
import { GradientBackground } from "@/styles/GradientBackground";

export default function HomeScreen() {
  const { token, user, setUser } = useAuth();

  const [clientsList, setClientsList] = useState<Cliente[]>([]);
  const [budgets, setBudgets] = useState<Orcamento[]>([]);
  const [loading, setLoading] = useState(true);

  const obrasCount = obras.length;

  const orcamentosPendentesCount = budgets.filter(
    (budget) => budget.status === "PENDENTE",
  ).length;

  const faturamentoTotal = budgets
    .filter((budget) => budget.status === "APROVADO")
    .reduce(
      (total, budget) => total + (budget.preco_com_bdi ?? budget.preco ?? 0),
      0,
    );

  useFocusEffect(
    useCallback(() => {
      async function loadData() {
        try {
          if (!token) return;

          setLoading(true);

          // Busca usuário logado
          const loggedUser = await getUser(token);
          setUser(loggedUser);

          // Busca clientes do usuário
          const clients = await getClients(token);
          setClientsList(clients);

          //Busca orçamentos
          const budgetsData = await getBudgets(token);
          setBudgets(budgetsData);
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
            { backgroundColor: COLORS.backgroundSection },
          ]}
        >
          <Text style={globalStyles.sectionTitle}>Resumo geral:</Text>

          <View style={globalStyles.dashboardGrid}>
            <DashboardCard
              title="Orçamentos"
              value={loading ? "..." : orcamentosPendentesCount.toString()}
              icon="document-text"
              color={COLORS.title}
            />

            <DashboardCard
              title="Clientes"
              value={loading ? "..." : clientsList.length.toString()}
              icon="people"
              color={COLORS.warning}
            />

            <DashboardCard
              title="Obras"
              value={loading ? "..." : obrasCount.toString()}
              icon="hammer"
              color={COLORS.primary}
            />

            <DashboardCard
              title="Faturamento"
              value={
                loading
                  ? "..."
                  : faturamentoTotal.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })
              }
              icon="cash"
              color={COLORS.success}
              valueStyle={{ fontSize: 13 }}
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

          {obras.map((obra) => (
            <WorkCard
              key={obra.id}
              title={obra.nome}
              progress={obra.progresso}
              type={obra.tipo}
              meters={obra.metros}
            />
          ))}
        </View>
      </ScrollView>
    </GradientBackground>
  );
}
