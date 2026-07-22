import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
} from "react-native";

import { useEffect, useState } from "react";

import { globalStyles } from "../../styles/globalStyles";

import { AppInput } from "../../components/forms/AppInput";

import { useAuth } from "@/contexts/AuthContext";

import { getWork } from "../../services/api";

import { ObrasCard } from "@/components/cards/ObrasCard";

import { Obra, Orcamento } from "@/components/layout/interface";

export default function ObrasScreen() {
  const { token } = useAuth();

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [worksList, setWorksList] = useState<Obra[]>([]);

  const [statusFilter, setStatusFilter] = useState("Todos");

  async function loadWorks() {
    try {
      if (!token) return;

      setLoading(true);

      const data = await getWork(token);

      setWorksList(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWorks();
  }, [token]);

  const filteredWorks = worksList.filter((work) => {
    if (typeof work.orcamento === "string") return true;

    const budget = work.orcamento as Orcamento;

    const matchSearch =
      budget.nome.toLowerCase().includes(search.toLowerCase()) ||
      budget.cliente.nome.toLowerCase().includes(search.toLowerCase());

    const matchStatus =
      statusFilter === "Todos"
        ? true
        : work.status === statusFilter.replace(" ", "").toUpperCase();

    return matchSearch && matchStatus;
  });

  if (loading) {
    return (
      <View
        style={[
          globalStyles.screen,
          {
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <ActivityIndicator size="large" color="#2563EB" />

        <Text style={{ color: "#FFF", marginTop: 15 }}>
          Carregando obras...
        </Text>
      </View>
    );
  }

  return (
    <View style={globalStyles.screen}>
      <ScrollView
        style={globalStyles.container}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
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

        {filteredWorks.map((work) => {
          if (typeof work.orcamento === "string") return null;

          const budget = work.orcamento as Orcamento;

          return (
            <ObrasCard
              key={work._id}
              title={budget.nome}
              client={budget.cliente.nome}
              status={work.status}
              progress={work.porcentagem_de_conclusao ?? 0}
              type="Residencial"
              meters={0}
              startDate={new Date(work.data_inicio_prevista).toLocaleDateString(
                "pt-BR",
              )}
            />
          );
        })}
      </ScrollView>

      <View style={globalStyles.bottomActionContainer}>
        <Pressable style={globalStyles.bottomActionButton}>
          <Text style={globalStyles.bottomActionButtonText}>+ Nova Obra</Text>
        </Pressable>
      </View>
    </View>
  );
}
