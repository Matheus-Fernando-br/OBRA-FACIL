import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { globalStyles } from "@/styles/globalStyles";

interface Props {
  client: string;
  service: string;
  status: string;
  value: number;
  date: string;

  onDetails(): void;
  onEdit(): void;
  onDelete(): void;
}

export function BudgetCard({
  client,
  service,
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
        return "#16A34A";

      case "recusado":
        return "#DC2626";

      default:
        return "#F59E0B";
    }
  }

  return (
    <View style={globalStyles.orcamentoCard}>
      <View style={globalStyles.orcamentoHeader}>
        <Text style={globalStyles.orcamentoCliente}>
          {service}
        </Text>

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

      <Text style={globalStyles.orcamentoInfo}>
        Cliente: {client}
      </Text>

      <Text style={globalStyles.orcamentoInfo}>
        Valor: R$ {value.toFixed(2)}
      </Text>

      <Text style={globalStyles.orcamentoInfo}>
        Criado em: {date}
      </Text>

      <View style={globalStyles.orcamentoButtons}>
        <Pressable
          style={[
            globalStyles.orcamentoDetailsButton,
            globalStyles.orcamentoMainButton,
          ]}
          onPress={onDetails}
        >
          <Ionicons
            name="eye"
            size={18}
            color="#FFF"
          />

          <Text style={globalStyles.orcamentoDetailsButtonText}>
            Detalhes
          </Text>
        </Pressable>

        <Pressable
          style={[
            globalStyles.orcamentoDetailsButton,
            globalStyles.orcamentoEditButton,
          ]}
          onPress={onEdit}
        >
          <Ionicons
            name="create"
            size={18}
            color="#FFF"
          />
        </Pressable>

        <Pressable
          style={[
            globalStyles.orcamentoDetailsButton,
            globalStyles.orcamentoDeleteButton,
          ]}
          onPress={onDelete}
        >
          <Ionicons
            name="trash"
            size={18}
            color="#FFF"
          />
        </Pressable>
      </View>
    </View>
  );
}