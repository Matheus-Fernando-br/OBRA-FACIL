import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { COLORS, globalStyles } from "@/styles/globalStyles";

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
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <Text style={globalStyles.orcamentoCliente}>{client}</Text>

        <View
          style={{
            backgroundColor: `${getStatusColor()}20`,
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 30,
          }}
        >
          <Text
            style={{
              color: getStatusColor(),
              fontWeight: "700",
            }}
          >
            {status}
          </Text>
        </View>
      </View>

      <Text style={globalStyles.orcamentoInfo}>
        Serviço: {service}
      </Text>

      <Text style={globalStyles.orcamentoInfo}>
        Valor: R$ {value.toFixed(2)}
      </Text>

      <Text style={globalStyles.orcamentoInfo}>
        Criado em: {date}
      </Text>

      <View
        style={{
          flexDirection: "row",
          marginTop: 20,
        }}
      >
        <Pressable
          style={[
            globalStyles.orcamentoDetailsButton,
            {
              flex: 1,
              marginRight: 8,
            },
          ]}
          onPress={onDetails}
        >
          <Ionicons
            name="eye"
            size={18}
            color="#FFF"
          />

          <Text
            style={[
              globalStyles.orcamentoDetailsButtonText,
              {
                marginLeft: 8,
              },
            ]}
          >
            Detalhes
          </Text>
        </Pressable>

        <Pressable
          style={[
            globalStyles.orcamentoDetailsButton,
            {
              backgroundColor: COLORS.warning,
              marginRight: 8,
            },
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
            {
              backgroundColor: COLORS.danger,
            },
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