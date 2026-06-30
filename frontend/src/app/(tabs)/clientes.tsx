import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useState, useEffect } from "react";

import { globalStyles } from "../../styles/globalStyles";
import { useAuth } from "../../contexts/AuthContext";

import { AppInput } from "../../components/forms/AppInput";
import { ClientCard } from "../../components/cards/ClientCard";

import { AddClientModal } from "../../components/modals/cliente/AddClientModal";
import { EditClientModal } from "../../components/modals/cliente/EditClientModal";
import { DeleteClientModal } from "../../components/modals/cliente/DeleteClientModal";

import { getClients } from "../../services/api";

interface Client {
  _id: string;
  nome: string;
  email: string;
  CPF: string;
}

export default function ClientesScreen() {
  const { token } = useAuth();

  const [clientsList, setClientsList] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] =
    useState<Client | null>(null);

  const [search, setSearch] = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);

  const [loading, setLoading] = useState(true);

  async function loadClients() {
    try {
      if (!token) return;

      setLoading(true);

      const data = await getClients(token);

      setClientsList(data);
    } catch (error) {
      console.log("ERRO CLIENTES:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) {
      loadClients();
    }
  }, [token]);

  const filteredClients = clientsList.filter((client) =>
    client.nome
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <View style={globalStyles.screen}>
      <ScrollView
        style={globalStyles.container}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={globalStyles.pageHeaderRow}>
          <Text style={globalStyles.title}>
            Clientes
          </Text>

          <Pressable
            style={globalStyles.pageHeaderButton}
            onPress={() => setModalVisible(true)}
          >
            <Text style={globalStyles.pageHeaderButtonText}>
              +
            </Text>
          </Pressable>
        </View>

        <AppInput
          placeholder="Buscar cliente..."
          value={search}
          onChangeText={setSearch}
        />

        {loading ? (
          <View
            style={{
              marginTop: 40,
              alignItems: "center",
            }}
          >
            <ActivityIndicator
              size="large"
              color="#3B82F6"
            />

            <Text
              style={{
                color: "#FFF",
                marginTop: 15,
              }}
            >
              Carregando clientes...
            </Text>
          </View>
        ) : (
          filteredClients.map((client) => (
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
          ))
        )}
      </ScrollView>

      <View style={globalStyles.bottomActionContainer}>
        <Pressable
          style={globalStyles.bottomActionButton}
          onPress={() => setModalVisible(true)}
        >
          <Text
            style={globalStyles.bottomActionButtonText}
          >
            + Novo Cliente
          </Text>
        </Pressable>
      </View>

      <AddClientModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          loadClients();
        }}
      />

      <EditClientModal
        visible={editVisible}
        onClose={() => setEditVisible(false)}
        client={selectedClient}
        onSuccess={loadClients}
      />

      <DeleteClientModal
        visible={deleteVisible}
        onClose={() => setDeleteVisible(false)}
        clientId={selectedClient?._id || ""}
        clientName={selectedClient?.nome || ""}
        onSuccess={loadClients}
      />
    </View>
  );
}