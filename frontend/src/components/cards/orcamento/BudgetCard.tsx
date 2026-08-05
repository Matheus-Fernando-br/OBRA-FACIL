import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { globalStyles, COLORS } from "@/styles/globalStyles";

interface Props {
  client: string;
  nome: string;
  status: string;
  value: number;
  date: string;

  onDetails(): void;
  onEdit(): void;
  onDelete(): void;
}

export function BudgetCard({
  client,
  nome,
  status,
  value,
  date,
  onDetails,
  onEdit,
  onDelete,
}: Props) {
  function getStatusColor() {
    switch (status.toLowerCase()) {
      case "aprovado":
        return COLORS.success;

      case "recusado":
        return COLORS.danger;

      default:
        return COLORS.warning;
    }
  }

  return (
    <View style={globalStyles.orcamentoCard}>
      <View style={globalStyles.orcamentoHeader}>
        <Text style={globalStyles.orcamentoCliente}>{nome}</Text>

        <View
          style={[
            globalStyles.orcamentoStatusBadge,
            {
              backgroundColor: `${getStatusColor()}20`,
            },
          ]}
        >
          <Text
            style={[
              globalStyles.orcamentoStatusText,
              {
                color: getStatusColor(),
              },
            ]}
          >
            {status}
          </Text>
        </View>
      </View>

      <Text style={globalStyles.orcamentoInfo}>Cliente: {client}</Text>

      <Text style={globalStyles.orcamentoInfo}>
        Valor: R$ {value.toFixed(2)}
      </Text>

      <Text style={globalStyles.orcamentoInfo}>Criado em: {date}</Text>

      <View style={globalStyles.orcamentoButtons}>
        <Pressable
          style={[
            globalStyles.orcamentoDetailsButton,
            globalStyles.orcamentoMainButton,
          ]}
          onPress={onDetails}
        >
          <Ionicons name="eye" size={18} color={COLORS.white} />

          <Text style={globalStyles.orcamentoDetailsButtonText}>
            Ver Detalhes
          </Text>
        </Pressable>

        <Pressable
          style={[
            globalStyles.orcamentoDetailsButton,
            globalStyles.orcamentoEditButton,
          ]}
          onPress={onEdit}
        >
          <Ionicons name="create" size={18} color={COLORS.white} />
        </Pressable>

        <Pressable
          style={[
            globalStyles.orcamentoDetailsButton,
            globalStyles.orcamentoDeleteButton,
          ]}
          onPress={onDelete}
        >
          <Ionicons name="trash" size={18} color={COLORS.white} />
        </Pressable>
      </View>
    </View>
  );
}
