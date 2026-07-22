import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
} from "react-native";

import { useEffect, useState } from "react";

import { globalStyles, COLORS } from "../../styles/globalStyles";

import { AppInput } from "../../components/forms/AppInput";

import { useAuth } from "@/contexts/AuthContext";

import { getWork } from "../../services/api";

import { ObrasCard } from "@/components/cards/ObrasCard";

import { Obra, Orcamento } from "@/components/layout/interface";
import { AddObrasModal } from "@/components/modals/obras/AddObrasModal";
import { CreateObraModal } from "@/components/modals/obras/CreateObraModal";
import { GradientBackground } from "@/styles/GradientBackground";

export default function ObrasScreen() {
  const { token } = useAuth();

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [worksList, setWorksList] = useState<Obra[]>([]);

  const [statusFilter, setStatusFilter] = useState("Todos");

  const [addObraVisible, setAddObraVisible] = useState(false);

  const [createVisible, setCreateVisible] = useState(false);

  const [selectedBudget, setSelectedBudget] = useState<Orcamento | null>(null);

  async function loadWorks() {
    try {
      if (!token) return;

      setLoading(true);

      const data = await getWork(token);

      setWorksList(data);
    } catch (err: any) {
      console.log("ERRO COMPLETO");

      console.log(err);

      console.log(err.response);

      console.log(err.response?.data);

      console.log(err.response?.status);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWorks();
  }, [token]);

  useEffect(() => {
    if (selectedBudget) {
      console.log(selectedBudget.nome);
    }
  }, [selectedBudget]);

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

  return (
    <View style={globalStyles.screen}>
      <GradientBackground style={globalStyles.container}>
        <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
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
              <Text style={{ color: COLORS.text, marginTop: 15 }}>
                Carregando Serviços...
              </Text>
            </View>
          ) : (
            filteredWorks.map((work) => {
              const budget =
                typeof work.orcamento === "string" ? null : work.orcamento;

              return (
                <ObrasCard
                  key={work._id}
                  title={budget?.nome ?? "Orçamento"}
                  client={budget?.cliente.nome ?? "Cliente"}
                  status={work.status}
                  progress={work.porcentagem_de_conclusao ?? 0}
                  type="Residencial"
                  meters={0}
                  startDate={new Date(
                    work.data_inicio_prevista,
                  ).toLocaleDateString("pt-BR")}
                />
              );
            })
          )}
        </ScrollView>
      </GradientBackground>

      <View style={globalStyles.bottomActionContainer}>
        <Pressable
          style={globalStyles.bottomActionButton}
          onPress={() => setAddObraVisible(true)}
        >
          <Text style={globalStyles.bottomActionButtonText}>+ Nova Obra</Text>
        </Pressable>
      </View>
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
    </View>
  );
}
