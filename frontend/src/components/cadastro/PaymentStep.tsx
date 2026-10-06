import { Text, View } from "react-native";
import { CreditCard } from "lucide-react-native";
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
      <Text style={styles.cadastroStepTitle}>Escolha seu plano</Text>
      <Text style={styles.cadastroStepSubtitle}>
        Comece com um período de testes ou escolha o plano institucional.
      </Text>
      <View style={styles.planCard}>
        <CreditCard size={32} color={theme.title} />
        <Text style={styles.planTitle}>Plano Institucional</Text>
        <Text style={styles.planFeature}>• Clientes ilimitados</Text>
        <Text style={styles.planFeature}>• Obras ilimitadas</Text>
        <Text style={styles.planFeature}>• Orçamentos ilimitados</Text>
        <Text style={styles.planFeature}>• Backup em nuvem</Text>
        <Text style={styles.planPrice}>R$ 29,90/mês</Text>
      </View>
      {!!feedback && <Text style={styles.cadastroFeedback}>{feedback}</Text>}
      <AppButton
        title={loading ? "Processando..." : "Efetuar pagamento"}
        onPress={onContinue}
        loading={loading}
        color={theme.title}
      />
      <AppButton title="Voltar" onPress={onBack} color={theme.placeholder} />
    </View>
  );
}
