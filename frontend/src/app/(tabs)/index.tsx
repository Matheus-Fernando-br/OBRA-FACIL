import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { globalStyles } from "../../styles/globalStyles";

import { DashboardCard } from "../../components/cards/DashboardCard";
import { WorkCard } from "../../components/cards/WorkCard";
import { QuickAccessCard } from "../../components/cards/QuickAccessCard";
import { obras } from "../../data/obras";
import { orcamentos } from "../../data/orcamentos";
import { useState, useEffect } from "react";
import { getClients } from "../../services/api";

interface Client {
  _id: string;
  nome: string;
  email: string;
  CPF: string;
}

export default function HomeScreen() {
  const [clientsList, setClientsList] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const obrasCount = obras.length;
  const orcamentosPendentesCount = orcamentos.filter(
    (o) => o.status === "Pendente",
  ).length;
  const faturamentoTotal = orcamentos
    .filter((orcamento) => orcamento.status === "Aprovado")
    .reduce((acc, orcamento) => acc + orcamento.valor, 0);

    async function loadClients() {
      try {
        setLoading(true);
    
        const data = await getClients();
    
        setClientsList(data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    }

    useEffect(() => {
      loadClients();
    }, []);
    const clientesCount = clientsList.length;

  return (
    <ScrollView
      style={globalStyles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={globalStyles.homeHeader}>
        <Text style={globalStyles.title}>Olá, Matheus 👋</Text>

        <Text style={globalStyles.subtitle}>Bem-vindo ao OBRA-FÁCIL</Text>
      </View>

      <Text style={globalStyles.sectionTitle}>Resumo geral</Text>

      <View style={globalStyles.dashboardGrid}>
        <DashboardCard
          title="Orçamentos Pendentes"
          value={orcamentosPendentesCount.toString()}
        />

      <DashboardCard
        title="Clientes"
        value={loading ? "..." : clientesCount.toString()}
      />

        <DashboardCard title="Obras" value={obrasCount.toString()} />

        <DashboardCard
          title="Faturamento"
          value={parseFloat(faturamentoTotal.toString()).toLocaleString(
            "pt-BR",
            {
              style: "currency",
              currency: "BRL",
            },
          )}
        />
      </View>

      <View style={globalStyles.quickAccessHeader}>
        <Text style={globalStyles.sectionTitle}>Acesso rápido</Text>

        <Pressable
          style={({ hovered }) => [
            globalStyles.quickAccessEditButton,
            hovered && globalStyles.quickButtonHover,
          ]}
        >
          <Ionicons name="pencil" size={25} color="#ffffff" />
        </Pressable>
      </View>

      <View style={globalStyles.quickAccessRow}>
        <QuickAccessCard title="Clientes" icon="people" onPress={() => {}} />

        <QuickAccessCard title="Obras" icon="hammer" onPress={() => {}} />

        <QuickAccessCard title="Financeiro" icon="cash" onPress={() => {}} />
      </View>

      <View style={globalStyles.workSection}>
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
