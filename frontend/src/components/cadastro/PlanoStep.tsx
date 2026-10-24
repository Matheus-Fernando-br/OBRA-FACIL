import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppButton } from "../buttons/AppButton";
import { useTheme } from "@/contexts/ThemeContext";
import { DEFAULT_PLAN_ID, formatPlanPrice, getPlan } from "@/config/plans";

interface Props {
  onContinue: () => void;
}

/**
 * Etapa 3 do cadastro: apresenta o plano inicial. Toda conta começa no
 * Gratuito, sem cobrança. (A conta já foi criada e o e-mail verificado.)
 */
export function PlanoStep({ onContinue }: Props) {
  const { styles, theme } = useTheme();
  const plan = getPlan(DEFAULT_PLAN_ID);

  return (
    <View>
      <Text style={styles.cadastroStepTitle}>Seu plano inicial</Text>
      <Text style={styles.cadastroStepSubtitle}>
        Você começa no plano Gratuito. Quando precisar de mais espaço, veja os planos em Mais → Planos.
      </Text>

      <View style={[styles.card, { borderColor: theme.primary, borderWidth: 1.5 }]}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }}>
          <Text style={styles.title}>{plan.nome}</Text>
          <Text style={[styles.listCardTitle, { color: theme.primary }]}>{formatPlanPrice(plan)}</Text>
        </View>
        <View style={{ marginTop: 10, gap: 8 }}>
          {plan.recursos.map((recurso) => (
            <View key={recurso} style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
              <Ionicons name="checkmark" size={16} color={theme.success} />
              <Text style={styles.menuCardDescription}>{recurso}</Text>
            </View>
          ))}
        </View>
      </View>

      <AppButton title="Concluir cadastro" onPress={onContinue} color={theme.title} />
    </View>
  );
}
