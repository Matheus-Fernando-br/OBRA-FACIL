import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

import { Ionicons } from "@expo/vector-icons";
import { getClientById } from "@/services/api";
import { useTheme } from "@/contexts/ThemeContext";
import { PressableScale } from "@/components/ui/PressableScale";
import { StatusPill } from "@/components/ui/StatusPill";
import { getBudgetStatusMeta } from "@/utils/status";
import { formatCurrency, formatDate } from "@/utils/format";
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
  const { styles, theme } = useTheme();

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
    <PressableScale
      onPress={onPress}
      activeScale={0.985}
      style={[
        styles.listCard,
        {
          borderWidth: selected ? 2 : StyleSheet.hairlineWidth,
          borderColor: selected ? theme.primary : theme.separator,
        },
      ]}
      accessibilityState={{ selected }}
    >
      <View style={styles.listCardHeader}>
        <Text style={[styles.listCardTitle, { flex: 1 }]} numberOfLines={2}>
          {budget.nome}
        </Text>
        <StatusPill meta={getBudgetStatusMeta("APROVADO", theme)} withIcon />
      </View>

      <View style={[styles.listCardMeta, { marginTop: 6 }]}>
        <Ionicons name="person-outline" size={13} color={theme.textSecondary} />
        {loadingClient ? (
          <ActivityIndicator size="small" color={theme.primary} />
        ) : (
          <Text style={styles.listCardMetaText} numberOfLines={1}>
            {clientDisplayName}
          </Text>
        )}
      </View>

      <Text style={styles.listCardValue}>
        {formatCurrency(budget.preco_com_bdi ?? 0)}
      </Text>

      <View style={styles.listCardMetaRow}>
        <View style={styles.listCardMeta}>
          <Ionicons name="calendar-outline" size={13} color={theme.textSecondary} />
          <Text style={styles.listCardMetaText}>
            Emitido {formatDate(budget.data_publicacao)}
          </Text>
        </View>
        <View style={[styles.listCardMeta, { flexShrink: 1 }]}>
          <Ionicons name="location-outline" size={13} color={theme.textSecondary} />
          <Text style={styles.listCardMetaText} numberOfLines={1}>
            {enderecoCompleto || "Endereço não informado"}
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.bottomActionButton,
          {
            height: 44,
            marginTop: 14,
            backgroundColor: selected ? theme.success : theme.primary,
            shadowOpacity: 0,
            elevation: 0,
          },
        ]}
      >
        <Ionicons
          name={selected ? "checkmark-circle" : "add-circle-outline"}
          size={18}
          color={theme.onAccent}
        />
        <Text style={[styles.bottomActionButtonText, { fontSize: 15 }]}>
          {selected ? "Selecionado" : "Usar este orçamento"}
        </Text>
      </View>
    </PressableScale>
  );
}
