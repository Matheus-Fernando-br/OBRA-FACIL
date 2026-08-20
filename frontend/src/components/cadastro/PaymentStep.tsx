import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppButton } from "../buttons/AppButton";
import { useTheme } from "@/contexts/ThemeContext";

interface Props {
  loading: boolean;
  feedback: string;
  onBack: () => void;
  onContinue: () => void;
}

export function PaymentStep({ loading, feedback, onBack, onContinue }: Props) {
  const { styles, theme } = useTheme();

  return (
    <View>
      <Text style={styles.title}>Escolha seu plano</Text>

      <Text style={[styles.subtitle, { marginTop: 10, marginBottom: 10 }]}>
        Você pode utilizar gratuitamente durante o período de testes ou
        contratar um plano institucional.
      </Text>

      <View
        style={{
          backgroundColor: theme.card,
          borderRadius: 15,
          padding: 15,
          marginBottom: 20,
          borderWidth: 1,
          borderColor: theme.title,
        }}
      >
        <Ionicons name="card" color={theme.primary} size={40} />

        <Text
          style={{
            color: theme.white,
            fontSize: 18,
            fontWeight: "bold",
            marginTop: 15,
          }}
        >
          Plano Institucional
        </Text>

        <Text
          style={{
            color: theme.placeholder,
            marginTop: 10,
          }}
        >
          • Clientes ilimitados
        </Text>

        <Text
          style={{
            color: theme.placeholder,
          }}
        >
          • Obras ilimitadas
        </Text>

        <Text
          style={{
            color: theme.placeholder,
          }}
        >
          • Orçamentos ilimitados
        </Text>

        <Text
          style={{
            color: theme.placeholder,
          }}
        >
          • Backup em nuvem
        </Text>

        <Text
          style={{
            color: theme.success,
            fontWeight: "bold",
            fontSize: 24,
            marginTop: 20,
          }}
        >
          R$ 29,90/mês
        </Text>
      </View>

      {feedback !== "" && <Text style={styles.feedback}>{feedback}</Text>}

      <AppButton
        title={loading ? "Processando..." : "Efetuar pagamento"}
        onPress={onContinue}
        loading={loading}
        color={theme.primary}
      />
      {/*
      <AppButton
        title="Usar plano gratuito para teste"
        onPress={onContinue}
        color={theme.success}
      />
*/}
      <AppButton title="Voltar" onPress={onBack} color={theme.title} />
    </View>
  );
}
