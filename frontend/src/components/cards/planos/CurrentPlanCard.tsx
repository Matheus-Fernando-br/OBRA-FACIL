import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { Assinatura } from "@/components/layout/interface";
import { COLORS, globalStyles } from "@/styles/globalStyles";

interface CurrentPlanCardProps {
  assinatura: Assinatura;
  onChangePlan: () => void;
}

export function CurrentPlanCard({
  assinatura,
  onChangePlan,
}: CurrentPlanCardProps) {
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
    <View style={globalStyles.planCurrentCard}>
      <View style={globalStyles.planCurrentHeader}>
        <View style={globalStyles.planCurrentTitleContainer}>
          <Text style={globalStyles.planCurrentLabel}>PLANO ATUAL</Text>

          <Text style={globalStyles.planCurrentName}>{plano.nome}</Text>

          <View style={globalStyles.divider} />
        </View>

        <View style={globalStyles.planActiveBadge}>
          <View style={globalStyles.planActiveDot} />

          <Text style={globalStyles.planActiveText}>
            {assinatura.status === "ATIVA" ? "Ativo" : assinatura.status}
          </Text>
        </View>
      </View>

      <View style={globalStyles.planCurrentPriceRow}>
        <Text style={globalStyles.planCurrentPrice}>
          R$ {formatPrice(plano.preco)}
        </Text>

        <Text style={globalStyles.planCurrentPeriod}>/{plano.periodo}</Text>
      </View>

      <View style={globalStyles.planCurrentInfo}>
        <View style={globalStyles.planCurrentInfoItem}>
          <Ionicons
            name="calendar-outline"
            size={18}
            color={COLORS.textSecondary}
          />

          <View>
            <Text style={globalStyles.planCurrentInfoLabel}>Início</Text>

            <Text style={globalStyles.planCurrentInfoValue}>
              {formatDate(assinatura.inicio)}
            </Text>
          </View>
        </View>

        <View style={globalStyles.planCurrentInfoItem}>
          <Ionicons
            name="refresh-outline"
            size={18}
            color={COLORS.textSecondary}
          />

          <View>
            <Text style={globalStyles.planCurrentInfoLabel}>
              Próxima cobrança
            </Text>

            <Text style={globalStyles.planCurrentInfoValue}>
              {formatDate(assinatura.proxima_cobranca)}
            </Text>
          </View>
        </View>

        <View style={globalStyles.planCurrentInfoItem}>
          <Ionicons
            name="card-outline"
            size={18}
            color={COLORS.textSecondary}
          />

          <View>
            <Text style={globalStyles.planCurrentInfoLabel}>Pagamento</Text>

            <Text style={globalStyles.planCurrentInfoValue}>
              {assinatura.forma_pagamento || "Não definido"}
            </Text>
          </View>
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [
          globalStyles.planChangeButton,
          pressed && globalStyles.pressOpacity,
        ]}
        onPress={onChangePlan}
      >
        <Ionicons
          name="swap-horizontal-outline"
          size={18}
          color={COLORS.primary}
        />

        <Text style={globalStyles.planChangeButtonText}>Alterar plano</Text>
      </Pressable>
    </View>
  );
}
