import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

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
  return (
    <Pressable
      style={[
        globalStyles.orcamentoCard,
        {
          marginBottom: 15,
          borderWidth: selected ? 2 : 1,
          borderColor: selected ? COLORS.primary : COLORS.border,
        },
      ]}
    >
      <View style={globalStyles.orcamentoHeader}>
        <Text style={globalStyles.orcamentoCliente} numberOfLines={1}>
          {budget.nome}
        </Text>

        <View
          style={[
            globalStyles.orcamentoStatusBadge,
            {
              backgroundColor: "#16A34A20",
            },
          ]}
        >
          <Text
            style={[
              globalStyles.orcamentoStatusText,
              {
                color: COLORS.success,
              },
            ]}
          >
            APROVADO
          </Text>
        </View>
      </View>

      <Text style={globalStyles.orcamentoInfo}>Cliente: {clientName}</Text>

      <Text style={globalStyles.orcamentoInfo}>
        Valor:{" "}
        {budget.preco_com_bdi.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })}
      </Text>

      <Text style={globalStyles.orcamentoInfo}>
        Publicação:{" "}
        {new Date(budget.data_publicacao).toLocaleDateString("pt-BR")}
      </Text>

      <Text style={globalStyles.orcamentoInfo}>
        Validade: {new Date(budget.data_validade).toLocaleDateString("pt-BR")}
      </Text>

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
