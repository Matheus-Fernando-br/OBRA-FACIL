import { View, Text, ScrollView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { globalStyles, COLORS } from "../../styles/globalStyles";

import { DashboardCard } from "../../components/cards/DashboardCard";
import { WorkCard } from "../../components/cards/WorkCard";
import { QuickAccessCard } from "../../components/cards/QuickAccessCard";

import { obras } from "../../data/obras";
import { orcamentos } from "../../data/orcamentos";

import { getClients, getUser } from "../../services/api";
import { useAuth } from "@/contexts/AuthContext";
interface Client {
  _id: string;
  nome: string;
  email: string;
  CPF: string;
}

export default function HomeScreen() {
  const { token, user, setUser } = useAuth();

  const [clientsList, setClientsList] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  const obrasCount = obras.length;

  const orcamentosPendentesCount = orcamentos.filter(
    (o) => o.status === "Pendente",
  ).length;

  const faturamentoTotal = orcamentos
    .filter((o) => o.status === "Aprovado")
    .reduce((acc, o) => acc + o.valor, 0);

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
    <ScrollView
      style={globalStyles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={globalStyles.homeHeader}>
        <Text style={globalStyles.title}>
          <span style={{ color: COLORS.text }}>Olá, </span>
          {user?.nome || "Usuário"} 👋
        </Text>

        <Text style={globalStyles.subtitle}>
          Aqui está o resumo dos seus projetos!
        </Text>
      </View>
      <View style={globalStyles.section}>
        <Text style={globalStyles.sectionTitle}>Resumo geral</Text>

        <View style={globalStyles.dashboardGrid}>
          <DashboardCard
            title="Orçamentos Pendentes"
            value={orcamentosPendentesCount.toString()}
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
            title="Obras em Andamento"
            value={obrasCount.toString()}
            icon="hammer"
            color={COLORS.primary}
          />

          <DashboardCard
            title="Faturamento"
            value={faturamentoTotal.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
            icon="cash"
            color={COLORS.success}
          />
        </View>
      </View>
      <View style={globalStyles.section}>
      <View style={globalStyles.quickAccessHeader}>
        <Text style={globalStyles.sectionTitle}>Acesso rápido</Text>

        <Pressable
          style={({ hovered }) => [
            globalStyles.quickAccessEditButton,
            hovered && globalStyles.quickButtonHover,
          ]}
        >
          <Ionicons name="pencil" size={25} color={COLORS.primary} />
        </Pressable>
      </View>

      <View style={globalStyles.quickAccessRow}>
        <QuickAccessCard title="Clientes" icon="people" onPress={() => {}} />

        <QuickAccessCard title="Obras" icon="hammer" onPress={() => {}} />

        <QuickAccessCard title="Financeiro" icon="cash" onPress={() => {}} />
      </View>
      </View>
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
  );
}
