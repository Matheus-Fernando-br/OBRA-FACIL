import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { Assinatura } from "@/components/layout/interface";

interface CurrentPlanCardProps {
  assinatura: Assinatura;
  onChangePlan: () => void;
}

export function CurrentPlanCard({
  assinatura,
  onChangePlan,
}: CurrentPlanCardProps) {
  const { styles, theme } = useTheme();
  const { plano } = assinatura;

  function formatPrice(value: number) {
    return value.toFixed(2).replace(".", ",");
  }

  function formatDate(date?: string) {
    if (!date) return "Não definida";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("pt-BR");
  }

  return (
    <View style={styles.planCurrentCard}>
      <View style={styles.planCurrentHeader}>
        <View style={styles.planCurrentTitleContainer}>
          <Text style={styles.planCurrentLabel}>PLANO ATUAL</Text>

          <Text style={styles.planCurrentName}>{plano.nome}</Text>

          <View style={styles.divider} />
        </View>

        <View style={styles.planActiveBadge}>
          <View style={styles.planActiveDot} />

          <Text style={styles.planActiveText}>
            {assinatura.status === "ATIVA" ? "Ativo" : assinatura.status}
          </Text>
        </View>
      </View>

      <View style={styles.planCurrentPriceRow}>
        <Text style={styles.planCurrentPrice}>
          R$ {formatPrice(plano.preco)}
        </Text>

        <Text style={styles.planCurrentPeriod}>/{plano.periodo}</Text>
      </View>

      <View style={styles.planCurrentInfo}>
        <View style={styles.planCurrentInfoItem}>
          <Ionicons
            name="calendar-outline"
            size={18}
            color={theme.textSecondary}
          />

          <View>
            <Text style={styles.planCurrentInfoLabel}>Início</Text>

            <Text style={styles.planCurrentInfoValue}>
              {formatDate(assinatura.inicio)}
            </Text>
          </View>
        </View>

        <View style={styles.planCurrentInfoItem}>
          <Ionicons
            name="refresh-outline"
            size={18}
            color={theme.textSecondary}
          />

          <View>
            <Text style={styles.planCurrentInfoLabel}>
              Próxima cobrança
            </Text>

            <Text style={styles.planCurrentInfoValue}>
              {formatDate(assinatura.proxima_cobranca)}
            </Text>
          </View>
        </View>

        <View style={styles.planCurrentInfoItem}>
          <Ionicons
            name="card-outline"
            size={18}
            color={theme.textSecondary}
          />

          <View>
            <Text style={styles.planCurrentInfoLabel}>Pagamento</Text>

            <Text style={styles.planCurrentInfoValue}>
              {assinatura.forma_pagamento || "Não definido"}
            </Text>
          </View>
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.planChangeButton,
          pressed && styles.pressOpacity,
        ]}
        onPress={onChangePlan}
      >
        <Ionicons
          name="swap-horizontal-outline"
          size={18}
          color={theme.primary}
        />

        <Text style={styles.planChangeButtonText}>Alterar plano</Text>
      </Pressable>
    </View>
  );
}
