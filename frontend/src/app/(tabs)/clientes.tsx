import { View, Text, ScrollView, Pressable } from "react-native";
import { useState } from "react";

import { globalStyles } from "../../styles/globalStyles";

import { AppInput } from "../../components/forms/AppInput";
import { ClientCard } from "../../components/cards/ClientCard";
import { FabButton } from "../../components/buttons/FabButton";
import { AddClientModal } from "../../components/modals/AddClientModal";

import { clients } from "../../data/clients";

export default function ClientesScreen() {
  const [search, setSearch] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <View style={globalStyles.screen}>
      <ScrollView
        style={globalStyles.container}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={globalStyles.pageHeaderRow}>
          <Text style={globalStyles.title}>Clientes</Text>

          <Pressable
            style={globalStyles.pageHeaderButton}
            onPress={() => setModalVisible(true)}
          >
            <Text style={globalStyles.pageHeaderButtonText}>+</Text>
          </Pressable>
        </View>

        <AppInput
          placeholder="Buscar cliente..."
          value={search}
          onChangeText={setSearch}
        />

        {filteredClients.map((client) => (
          <ClientCard
            key={client.id}
            name={client.name}
            phone={client.phone}
            city={client.city}
          />
        ))}
      </ScrollView>

      <View style={globalStyles.bottomActionContainer}>
        <Pressable
          style={globalStyles.bottomActionButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={globalStyles.bottomActionButtonText}>
            + Novo Cliente
          </Text>
        </Pressable>
      </View>

      <AddClientModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}
