import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useState, useEffect, useMemo } from "react";

import { COLORS, globalStyles } from "../../styles/globalStyles";
import { useAuth } from "@/contexts/AuthContext";
import { AppInput } from "../../components/forms/AppInput";
import { ClientCard } from "@/components/cards/cliente/ClientCard";
import { DetailsClientModal } from "../../components/modals/cliente/DetailsClientModal";
import { AddClientModal } from "../../components/modals/cliente/AddClientModal";
import { EditClientModal } from "../../components/modals/cliente/EditClientModal";
import { DeleteClientModal } from "../../components/modals/cliente/DeleteClientModal";


import { getClients } from "../../services/api";
import { Cliente } from "@/components/layout/interface";
import { GradientBackground } from "@/styles/GradientBackground";

export default function ClientesScreen() {
  const { token } = useAuth();

  const [clientsList, setClientsList] = useState<Cliente[]>([]);
  const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);

  const [search, setSearch] = useState("");
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [addVisible, setAddVisible] = useState(false);
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

  const filteredClients = useMemo(() => {
    const searchLower = search.trim().toLowerCase();

    return clientsList.filter((client) =>
      client.nome.toLowerCase().includes(searchLower),
    );
  }, [clientsList, search]);

  return (
    <View style={globalStyles.screen}>
      <GradientBackground style={globalStyles.container}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={globalStyles.pageHeaderRow}>
            <Text style={globalStyles.title}>Clientes</Text>

            <Pressable
              style={globalStyles.pageHeaderButton}
              onPress={() => setAddVisible(true)}
            >
              <Text style={globalStyles.pageHeaderButtonText}>+</Text>
            </Pressable>
          </View>

          <AppInput
            placeholder="Buscar cliente..."
            value={search}
            onChangeText={setSearch}
          />

          {!loading && filteredClients.length === 0 && (
            <Text style={globalStyles.sectionTitle}>
              Nenhum cliente encontrado.
            </Text>
          )}

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

              <Text
                style={{
                  color: COLORS.text,
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
                phone={client.telefone}
                email={client.email}
                onDetails={() => {
                  setSelectedClient(client);
                  setDetailsVisible(true);
                }}
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
      </GradientBackground>

      <View style={globalStyles.bottomActionContainer}>
        <Pressable
          style={globalStyles.bottomActionButton}
          onPress={() => setAddVisible(true)}
        >
          <Text style={globalStyles.bottomActionButtonText}>
            + Novo Cliente
          </Text>
        </Pressable>
      </View>

      <DetailsClientModal
        visible={detailsVisible}
        client={selectedClient}
        onClose={() => setDetailsVisible(false)}
        onEdit={() => {
          setDetailsVisible(false);
      
          setTimeout(() => {
            setEditVisible(true);
          }, 200);
        }}
      />
      <AddClientModal
        visible={addVisible}
        onClose={() => setAddVisible(false)}
        onSuccess={loadClients}
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
