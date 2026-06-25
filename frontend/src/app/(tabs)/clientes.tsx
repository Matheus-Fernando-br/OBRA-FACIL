import { View, Text, ScrollView, Pressable } from "react-native";
import { useState, useEffect } from "react";

import { globalStyles } from "../../styles/globalStyles";

import { AppInput } from "../../components/forms/AppInput";
import { ClientCard } from "../../components/cards/ClientCard";
import { AddClientModal } from "../../components/modals/AddClientModal";
import { EditClientModal } from "../../components/modals/EditClientModal";
import { DeleteClientModal } from "../../components/modals/DeleteClientModal";
import { getClients } from "../../services/api";

interface Client {
  _id: string;
  nome: string;
  email: string;
  CPF: string;
}

export default function ClientesScreen() {
  const [clientsList, setClientsList] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);


const [selectedClient, setSelectedClient] =
  useState<Client | null>(null);

  async function loadClients() {
    try {
      const data = await getClients();

      setClientsList(data);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    loadClients();
  }, []);

  const filteredClients = clientsList.filter((client) =>
    client.nome.toLowerCase().includes(search.toLowerCase()),
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
            key={client._id}
            name={client.nome}
            phone={client.email}
            cpf={client.CPF}
            onEdit={() => {
              setSelectedClient(client);
              setEditVisible(true);
            }}
            onDelete={() => {
              setSelectedClient(client);
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
            + Novo Cliente
          </Text>
        </Pressable>
      </View>

      <AddClientModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);

          getClients()
            .then(setClientsList)
            .catch(console.log);
        }}
      />
      <EditClientModal
        visible={editVisible}
        onClose={() => setEditVisible(false)}
        onSuccess={loadClients}
        client={selectedClient}
      />

      <DeleteClientModal
        visible={deleteVisible}
        onClose={() => setDeleteVisible(false)}
        onSuccess={loadClients}
        clientId={selectedClient?._id || ""}
        clientName={selectedClient?.nome || ""}
      />
    </View>
  );
}