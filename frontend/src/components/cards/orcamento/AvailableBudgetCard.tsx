import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

import { Ionicons } from "@expo/vector-icons";
import { getClientById } from "@/services/api";
import { COLORS, globalStyles } from "@/styles/globalStyles";
import { Orcamento } from "@/components/layout/interface";

interface Props {
  budget: Orcamento;
  selected: boolean;
  clientName: string;
  onPress(): void;
}

export function AvailableBudgetCard({
  budget,
  selected,
  clientName,
  onPress,
}: Props) {
  const { token } = useAuth();

  const [clientDisplayName, setClientDisplayName] = useState(
    clientName || "Carregando cliente...",
  );

  const [loadingClient, setLoadingClient] = useState(false);

  useEffect(() => {
    async function loadClient() {
      if (!token) {
        setClientDisplayName(clientName || "Cliente não encontrado");
        return;
      }

      if (!budget.cliente) {
        setClientDisplayName("Cliente não encontrado");
        return;
      }

      const clientId =
        typeof budget.cliente === "string"
          ? budget.cliente
          : budget.cliente._id;

      if (!clientId) {
        setClientDisplayName("Cliente não encontrado");
        return;
      }

      try {
        setLoadingClient(true);

        const client = await getClientById(clientId, token);

        setClientDisplayName(
          client?.nome || clientName || "Cliente não encontrado",
        );
      } catch (error: any) {
        console.log(
          "ERRO AO CARREGAR CLIENTE DO ORÇAMENTO:",
          error?.response?.data || error?.message || error,
        );

        setClientDisplayName(clientName || "Cliente não encontrado");
      } finally {
        setLoadingClient(false);
      }
    }

    loadClient();
  }, [budget.cliente, token, clientName]);

  const logradouro = budget.endereco?.rua || "";
  const numero = budget.endereco?.numero || "";
  const cidade = budget.endereco?.cidade || "";
  const estado = budget.endereco?.estado || "";

  const enderecoCompleto = `${logradouro || ""}${numero ? `, ${numero}` : ""}${
    cidade ? ` - ${cidade}` : ""
  }${estado ? `/${estado}` : ""}`.trim();

  return (
    <Pressable
      onPress={onPress}
      style={[
        globalStyles.orcamentoCard,
        {
          marginBottom: 15,
          borderWidth: selected ? 2 : 1,
          borderColor: selected ? COLORS.primary : COLORS.border,
        },
      ]}
    >
      {/* HEADER */}

      <View style={globalStyles.orcamentoHeader}>
        <Text style={globalStyles.orcamentoCliente} numberOfLines={1}>
          {budget.nome}
        </Text>

        <View
          style={[
            globalStyles.orcamentoStatusBadge,
            {
              backgroundColor: COLORS.success,
            },
          ]}
        >
          <Text
            style={[
              globalStyles.orcamentoStatusText,
              {
                color: COLORS.white,
              },
            ]}
          >
            APROVADO
          </Text>
        </View>
      </View>

      {/* CLIENTE */}

      {loadingClient ? (
          <ActivityIndicator size="small" color={COLORS.primary} />
        ) : (
          <Text style={globalStyles.orcamentoInfo}>
            Cliente: {clientDisplayName}
          </Text>
        )}

      {/* VALOR */}

      <Text style={globalStyles.orcamentoInfo}>
        Valor:{" "}
        {Number(budget.preco_com_bdi ?? 0).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })}
      </Text>

      {/* PUBLICAÇÃO */}

      <Text style={globalStyles.orcamentoInfo}>
        Publicação:{" "}
        {budget.data_publicacao
          ? new Date(budget.data_publicacao).toLocaleDateString("pt-BR")
          : "-"}
      </Text>

      {/* ENDEREÇO */}

      <Text style={globalStyles.orcamentoInfo}>
        Endereço: {enderecoCompleto || "Não informado"}
      </Text>

      {/* BOTÃO */}

      <View
        style={{
          marginTop: 15,
        }}
      >
        <Pressable
          onPress={onPress}
          style={[
            globalStyles.orcamentoMainButton,
            {
              flexDirection: "row",
              justifyContent: "center",
              width:"100%",
              alignItems: "center",
              backgroundColor: selected ? COLORS.success : COLORS.primary,
            },
          ]}
        >
          <Ionicons
            name={selected ? "checkmark-circle" : "add-circle-outline"}
            size={18}
            color={COLORS.white}
          />

          <Text
            style={[
              globalStyles.orcamentoDetailsButtonText,
              {
                marginLeft: 8,
              },
            ]}
          >
            {selected ? "Selecionado" : "Selecionar"}
          </Text>
        </Pressable>
      </View>
    </Pressable>
  );
}
