import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Pressable,
} from "react-native";

import { useState } from "react";

import { globalStyles } from "../../styles/globalStyles";

import { AppInput } from "../../components/forms/AppInput";

import { orcamentos } from "../../data/orcamentos";

import { clients } from "../../data/clients";

import { AddOrcamentoModal } from "../../components/modals/addOrcamentoModal";

export default function OrcamentosScreen() {
  const [search, setSearch] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  const FilteredOrcamentos = orcamentos.filter((orcamento) =>
    orcamento.servico.toLowerCase().includes(search.toLowerCase()),
  );

  //APAGAR O CLIENTE, POIS N TEMOS BD AINDA
  const nomeCliente = (clienteId: number) => {
    const cliente = clients.find((cliente) => cliente.id === clienteId);

    return cliente ? cliente.name : "Cliente não encontrado";
  };

  return (
    <View style={globalStyles.screen}>
      <ScrollView
        style={globalStyles.container}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View style={globalStyles.pageHeaderRow}>
          <Text style={globalStyles.title}>Orçamentos</Text>

          <Pressable style={globalStyles.pageHeaderButton}>
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
              {nomeCliente(orcamento.clienteId)}
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
