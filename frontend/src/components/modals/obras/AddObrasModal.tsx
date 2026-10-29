import { useTheme } from "@/contexts/ThemeContext";
// src/components/modals/obras/AddObrasModal.tsx

import { useEffect, useMemo, useState } from "react";
import {
  Modal,
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { AppInput } from "@/components/forms/AppInput";
import { AppButton } from "@/components/buttons/AppButton";

import { useAuth } from "@/contexts/AuthContext";
import { getBudgets, getClients, getWork } from "@/services/api";

import { Obra, Orcamento, Cliente } from "@/components/layout/interface";

import { AvailableBudgetCard } from "../../cards/orcamento/AvailableBudgetCard";
import { getClientName } from "@/utils/status";
import { router } from "expo-router";

interface Props {
  visible: boolean;
  onClose(): void;

  // Próxima etapa
  onSelect?(budget: Orcamento): void;
}

export function AddObrasModal({ visible, onClose, onSelect }: Props) {
  const { styles, theme } = useTheme();
  const { token } = useAuth();

  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");

  const [budgets, setBudgets] = useState<Orcamento[]>([]);

  const [works, setWorks] = useState<Obra[]>([]);

  const [selectedBudget, setSelectedBudget] = useState<Orcamento | null>(null);

  const [clients, setClients] = useState<Cliente[]>([]);

  async function loadData() {
    if (!token) return;

    setLoading(true);

    let budgetsData: Orcamento[] = [];
    let worksData: Obra[] = [];
    let clientsData: Cliente[] = [];
    // Busca os orçamentos
    try {
      budgetsData = await getBudgets(token);
    } catch (error) {
      console.log("ERRO AO BUSCAR ORÇAMENTOS");
      console.log(error);
    }

    // Busca as obras
    try {
      worksData = await getWork(token);
    } catch (error) {
      console.log("ERRO AO BUSCAR OBRAS");
      console.log(error);

      // Mesmo que dê erro, continua funcionando
      worksData = [];
    }

    try {
      clientsData = await getClients(token);
    } catch (error) {
      console.log("ERRO AO BUSCAR CLIENTES");
      console.log(error);

      clientsData = [];
    }

    setBudgets(budgetsData);
    setWorks(worksData);
    setClients(clientsData);

    setLoading(false);
  }

  useEffect(() => {
    if (!visible) return;

    setSelectedBudget(null);
    setSearch("");

    loadData();
  }, [visible]);

  const availableBudgets = useMemo(() => {
    return budgets.filter((budget) => {
      if (budget.status !== "APROVADO") return false;

      const alreadyCreated = works.some((work) => {
        if (typeof work.orcamento === "string") {
          return work.orcamento === budget._id;
        }

        return work.orcamento._id === budget._id;
      });

      return !alreadyCreated;
    });
  }, [budgets, works]);

  // Um único orçamento disponível: já deixa selecionado.
  useEffect(() => {
    if (!loading && availableBudgets.length === 1) setSelectedBudget(availableBudgets[0]);
  }, [loading, availableBudgets]);

  const clientsMap = useMemo(() => {
    return clients.reduce((acc: Record<string, Cliente>, client) => {
      acc[client._id] = client;
      return acc;
    }, {});
  }, [clients]);

  const filteredBudgets = useMemo(() => {
    if (search.trim() === "") return availableBudgets;

    const searchLower = search.toLowerCase();

    return availableBudgets.filter((budget) => {
      const clientName = getClientName(budget.cliente, clientsMap);

      return (
        budget.nome.toLowerCase().includes(searchLower) ||
        clientName.toLowerCase().includes(searchLower)
      );
    });
  }, [availableBudgets, clientsMap, search]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          backgroundColor: theme.white,
        }}
      >
        <View style={styles.modalHeader}>
          <Pressable onPress={onClose} style={styles.leftAction}>
            <Ionicons name="chevron-back" size={26} color={theme.primary} />
          </Pressable>

          <Text style={styles.addTitle}>Nova Obra</Text>

          <View style={styles.rightAction} />
        </View>

        <View
          style={{
            flex: 1,
            paddingHorizontal: 20,
            paddingTop: 20,
          }}
        >
          <Text style={styles.subtitle}>
            Selecione um orçamento aprovado
          </Text>

          <View style={styles.divider} />

          <AppInput
            placeholder="Buscar orçamento..."
            value={search}
            onChangeText={setSearch}
          />

          {loading ? (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <ActivityIndicator size="large" color={theme.primary} />

              <Text
                style={{
                  marginTop: 15,
                  color: theme.text,
                }}
              >
                Carregando orçamentos aprovados...
              </Text>
            </View>
          ) : filteredBudgets.length === 0 ? (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons name="folder-open-outline" size={70} color={theme.placeholder} />

              <Text
                style={{
                  marginTop: 15,
                  fontSize: 16,
                  color: theme.text,
                  textAlign: "center",
                }}
              >
                Nenhum orçamento disponível
              </Text>

              <Text
                style={{
                  marginTop: 8,
                  color: theme.textSecondary,
                  textAlign: "center",
                }}
              >
                {budgets.some((b) => b.status === "PENDENTE")
                  ? "A obra nasce de um orçamento aprovado. Aprove um orçamento pendente (botão Aprovar no card) e volte aqui."
                  : "A obra nasce de um orçamento aprovado. Crie o orçamento da obra primeiro."}
              </Text>
              <View style={{ width: "100%", marginTop: 16 }}>
                <AppButton
                  title={budgets.some((b) => b.status === "PENDENTE") ? "Ver orçamentos pendentes" : "Criar orçamento"}
                  icon="document-text-outline"
                  onPress={() => {
                    onClose();
                    const pendente = budgets.some((b) => b.status === "PENDENTE");
                    router.navigate(pendente ? "/orcamentos" : { pathname: "/orcamentos", params: { action: "new" } });
                  }}
                />
              </View>
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingBottom: 120,
              }}
            >
              {filteredBudgets.map((budget) => (
                <AvailableBudgetCard
                  key={budget._id}
                  budget={budget}
                  clientName={getClientName(budget.cliente, clientsMap)}
                  selected={selectedBudget?._id === budget._id}
                  onPress={() => setSelectedBudget(budget)}
                />
              ))}
            </ScrollView>
          )}
        </View>

        <View style={styles.bottomActionContainer}>
          <AppButton
            title="Continuar"
            disabled={!selectedBudget}
            onPress={() => {
              if (!selectedBudget) return;

              onSelect?.(selectedBudget);
            }}
          />
        </View>
      </View>
    </Modal>
  );
}
