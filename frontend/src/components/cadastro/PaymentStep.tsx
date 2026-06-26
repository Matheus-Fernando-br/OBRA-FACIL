import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { AppButton } from "../buttons/AppButton";
import { COLORS } from "../../styles/globalStyles";

interface Props {
  loading: boolean;
  onBack: () => void;
  onContinue: () => void;
}

export function PaymentStep({
  loading,
  onBack,
  onContinue,
}: Props) {
  return (
    <View>

      <Text
        style={{
          color: "#FFF",
          fontSize: 22,
          fontWeight: "bold",
          marginBottom: 10,
        }}
      >
        Escolha seu plano
      </Text>

      <Text
        style={{
          color: "#94A3B8",
          marginBottom: 25,
          lineHeight: 22,
        }}
      >
        Você pode utilizar gratuitamente durante o período de testes ou
        contratar um plano institucional.
      </Text>

      <View
        style={{
          backgroundColor: COLORS.card,
          borderRadius: 15,
          padding: 20,
          marginBottom: 20,
          borderWidth: 1,
          borderColor: COLORS.primary,
        }}
      >
        <Ionicons
          name="card"
          color={COLORS.primary}
          size={40}
        />

        <Text
          style={{
            color: "#FFF",
            fontSize: 18,
            fontWeight: "bold",
            marginTop: 15,
          }}
        >
          Plano Institucional
        </Text>

        <Text
          style={{
            color: "#94A3B8",
            marginTop: 10,
          }}
        >
          • Clientes ilimitados
        </Text>

        <Text
          style={{
            color: "#94A3B8",
          }}
        >
          • Obras ilimitadas
        </Text>

        <Text
          style={{
            color: "#94A3B8",
          }}
        >
          • Orçamentos ilimitados
        </Text>

        <Text
          style={{
            color: "#94A3B8",
          }}
        >
          • Backup em nuvem
        </Text>

        <Text
          style={{
            color: COLORS.success,
            fontWeight: "bold",
            fontSize: 24,
            marginTop: 20,
          }}
        >
          R$ 29,90/mês
        </Text>
      </View>

      <AppButton
        title={
          loading
            ? "Processando..."
            : "Efetuar pagamento"
        }
        onPress={onContinue}
        loading={loading}
      />

      <AppButton
        title="Usar plano gratuito para teste"
        onPress={onContinue}
        color={COLORS.success}
      />

      <AppButton
        title="Voltar"
        onPress={onBack}
        color={COLORS.danger}
      />
    </View>
  );
}