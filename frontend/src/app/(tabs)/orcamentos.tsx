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
import { orcamentos } from "../../data/orcamentos";

import { getClients } from "../../services/api";

import { AddOrcamentoModal } from "../../components/modals/AddOrcamentoModal"

interface Client {
  _id: string;
  nome: string;
  email: string;
  CPF: string;
}


export default function OrcamentosScreen() {
  const [search, setSearch] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [clientsList, setClientsList] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const {token} = useAuth();
  const FilteredOrcamentos = orcamentos.filter((orcamento) =>
    orcamento.servico.toLowerCase().includes(search.toLowerCase()),
  );


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

  useEffect(() => {
    loadClients();
  }, []);

  const nomeCliente = () => {
    return clientsList.length > 0
      ? clientsList[0].nome
      : "Cliente";
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
        contentContainerStyle={{ paddingBottom: 100 }}
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
          {["Todos", "Pendentes", "Aprovados", "Recusados"].map((item) => (
            <TouchableOpacity key={item} style={globalStyles.filterButton}>
              <Text style={globalStyles.filterButtonText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {orcamentos.map((orcamento) => (
          <View key={orcamento.id} style={globalStyles.orcamentoCard}>
            <Text style={globalStyles.orcamentoCliente}>
              {nomeCliente()}
            </Text>

            <Text style={globalStyles.orcamentoInfo}>
              Status: {orcamento.status}
            </Text>

            <Text style={globalStyles.orcamentoInfo}>
              Serviço: {orcamento.servico}
            </Text>

            <Text style={globalStyles.orcamentoInfo}>
              Valor: {orcamento.valor}
            </Text>

            <Text style={globalStyles.orcamentoInfo}>
              Data: {orcamento.data}
            </Text>

            <TouchableOpacity style={globalStyles.orcamentoDetailsButton}>
              <Text style={globalStyles.orcamentoDetailsButtonText}>
                Ver detalhes
              </Text>
            </TouchableOpacity>
          </View>
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
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}
