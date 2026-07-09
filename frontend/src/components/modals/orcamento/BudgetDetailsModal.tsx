import {
  Modal,
  View,
  Text,
  ScrollView,
  Pressable,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import {
  COLORS,
  globalStyles,
} from "@/styles/globalStyles";

interface Budget {
  _id: string;

  client: {
    nome: string;
    email: string;
    CPF: string;
  };

  serviceName: string;

  description: string;

  totalPrice: number;

  status: string;

  createdAt: string;
}

interface Props {
  visible: boolean;

  budget: Budget | null;

  onClose(): void;
}

export function BudgetDetailsModal({
  visible,
  budget,
  onClose,
}: Props) {
  if (!budget) return null;

  function statusColor(status:string) {
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
    <Modal
      visible={visible}
      transparent
      animationType="fade"
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,.65)",
          justifyContent: "flex-end",
        }}
      >
        <View
          style={{
            backgroundColor: COLORS.white,
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
            padding: 25,
            maxHeight: "90%",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 25,
            }}
          >
            <Text
              style={{
                fontSize: 24,
                fontWeight: "700",
              }}
            >
              Detalhes do orçamento
            </Text>

            <Pressable onPress={onClose}>
              <Ionicons
                name="close"
                size={30}
                color={COLORS.text}
              />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
          >
            <Text style={globalStyles.label}>
              Cliente
            </Text>

            <Text>{budget.client.nome}</Text>

            <Text style={globalStyles.label}>
              Email
            </Text>

            <Text>{budget.client.email}</Text>

            <Text style={globalStyles.label}>
              CPF
            </Text>

            <Text>{budget.client.CPF}</Text>

            <Text style={globalStyles.label}>
              Serviço
            </Text>

            <Text>{budget.serviceName}</Text>

            <Text style={globalStyles.label}>
              Descrição
            </Text>

            <Text>{budget.description}</Text>

            <Text style={globalStyles.label}>
              Valor Total
            </Text>

            <Text>
              R$ {budget.totalPrice.toFixed(2)}
            </Text>

            <Text style={globalStyles.label}>
              Status
            </Text>

            <View
              style={{
                alignSelf: "flex-start",
                backgroundColor: `${statusColor(budget.status)}20`,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 30,
              }}
            >
              <Text
                style={{
                  color: statusColor(budget.status),
                  fontWeight: "700",
                }}
              >
                {budget.status}
              </Text>
            </View>

            <Text style={globalStyles.label}>
              Criado em
            </Text>

            <Text>
              {new Date(
                budget.createdAt
              ).toLocaleDateString("pt-BR")}
            </Text>
          </ScrollView>

          <Pressable
            style={[
              globalStyles.loginButton,
              {
                marginTop: 25,
              },
            ]}
            onPress={onClose}
          >
            <Text style={globalStyles.loginButtonText}>
              Fechar
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}