import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
} from "react-native";

import { useState, useEffect } from "react";

import { globalStyles } from "../../styles/globalStyles";

import { AppInput } from "../../components/forms/AppInput";
import { useAuth } from "@/contexts/AuthContext";
import { getClients, getBudgets } from "../../services/api";
import { BudgetCard } from "@/components/cards/BudgetCard";
import { EditOrcamentoModal } from "@/components/modals/orcamento/EditOrcamentoModal";
import { DeleteOrcamentoModal } from "@/components/modals/orcamento/DeleteOrcamentoModal";
import { AddOrcamentoModal } from "@/components/modals/orcamento/AddOrcamentoModal";

interface Client {
  _id: string;
  nome: string;
  email: string;
  CPF: string;
}

interface Budget {
  _id: string;

  nome: string;

  descricao: string;

  cliente: {
    _id: string;
    nome: string;
  };

  endereco: {
    CEP: string;
    estado: string;
    cidade: string;
    bairro: string;
    rua: string;
    numero: string;
    complemento: string;
  };

  categoria: any[];

  preco: number;

  bdi: number;

  preco_com_bdi: number;

  status: string;

  valido_durante: number;

  data_validade: string;
}

export default function OrcamentosScreen() {
  const [search, setSearch] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [clientsList, setClientsList] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const [budgetsList, setBudgetsList] = useState<Budget[]>([]);
  const [detailsVisible, setDetailsVisible] = useState(false);

  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);

  const [editVisible, setEditVisible] = useState(false);

  const [deleteVisible, setDeleteVisible] = useState(false);

  const [statusFilter, setStatusFilter] = useState("Todos");

  async function loadClients() {
    try {
      if (!token) return;
      setLoading(true);

      const data = await getClients(token);

      setClientsList(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  async function loadBudgets() {
    try {
      if (!token) return;

      const data = await getBudgets(token);

      setBudgetsList(data);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    if (!token) return;

    async function load() {
      setLoading(true);

      await Promise.all([loadClients(), loadBudgets()]);

      setLoading(false);
    }

    load();
  }, [token]);

  const filteredBudgets = budgetsList.filter((budget) => {
    const matchSearch =
      budget.nome.toLowerCase().includes(search.toLowerCase()) ||
      budget.cliente.nome.toLowerCase().includes(search.toLowerCase());

    const matchStatus =
      statusFilter === "Todos"
        ? true
        : budget.status.toLowerCase() === statusFilter.toLowerCase();

    return matchSearch && matchStatus;
  });

  const nomeCliente = () => {
    return clientsList.length > 0 ? clientsList[0].nome : "Cliente";
  };

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
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={{ color: "#FFF", marginTop: 15 }}>
          Carregando clientes...
        </Text>
      </View>
    );
  }

  return (
    <View style={globalStyles.screen}>
      <ScrollView
        style={globalStyles.container}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        <View style={globalStyles.pageHeaderRow}>
          <Text style={globalStyles.title}>Orçamentos</Text>

          <Pressable
            style={globalStyles.pageHeaderButton}
            onPress={() => setModalVisible(true)}
          >
            <Text style={globalStyles.pageHeaderButtonText}>+</Text>
          </Pressable>
        </View>

        <AppInput
          placeholder="Buscar orçamento..."
          value={search}
          onChangeText={setSearch}
        />

        <View style={globalStyles.filterRow}>
          {["Todos", "Pendente", "Aprovado", "Recusado"].map((item) => (
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

        {filteredBudgets.map((budget) => (
          <BudgetCard
            key={budget._id}
            client={budget.cliente.nome}
            service={budget.nome}
            status={budget.status}
            value={budget.preco_com_bdi}
            date={new Date(budget.data_validade).toLocaleDateString("pt-BR")}
            onDetails={() => {
              setSelectedBudget(budget);
              setDetailsVisible(true);
            }}
            onEdit={() => {
              setSelectedBudget(budget);
              setEditVisible(true);
            }}
            onDelete={() => {
              setSelectedBudget(budget);
              setDeleteVisible(true);
            }}
          />
        ))}
      </ScrollView>

      <View style={globalStyles.bottomActionContainer}>
        <Pressable
          style={globalStyles.bottomActionButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={globalStyles.bottomActionButtonText}>
            + Novo Orçamento
          </Text>
        </Pressable>
      </View>
      <AddOrcamentoModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          loadBudgets();
        }}
      />

      <EditOrcamentoModal
  visible={editVisible}
  onClose={() => setEditVisible(false)}
  budget={selectedBudget}
  onSuccess={loadBudgets}
/>

<DeleteOrcamentoModal
  visible={deleteVisible}
  budgetId={selectedBudget?._id ?? ""}
  budgetName={selectedBudget?.nome ?? ""}
  onClose={() => setDeleteVisible(false)}
  onSuccess={loadBudgets}
/>
    </View>
  );
}
