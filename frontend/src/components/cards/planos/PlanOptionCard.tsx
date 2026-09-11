import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { Plano } from "@/components/layout/interface";
import { COLORS, globalStyles } from "@/styles/globalStyles";

interface PlanOptionCardProps {
  plano: Plano;
  atual?: boolean;
  onSelect: () => void;
}

export function PlanOptionCard({
  plano,
  atual = false,
  onSelect,
}: PlanOptionCardProps) {
  function formatPrice(value: number) {
    return value.toFixed(2).replace(".", ",");
  }

  return (
    <View
      style={[
        globalStyles.planOptionCard,
        plano.destaque && globalStyles.planOptionCardFeatured,
      ]}
    >
      {plano.destaque && (
        <View style={globalStyles.planRecommendedBadge}>
          <Ionicons name="star" size={13} color={COLORS.primary} />

          <Text style={globalStyles.planRecommendedText}>Recomendado</Text>
        </View>
      )}

      <View style={globalStyles.planOptionHeader}>
        <View style={globalStyles.planOptionTitleRow}>
          <Text style={globalStyles.planOptionName}>{plano.nome}</Text>

          {atual && (
            <View style={globalStyles.planCurrentBadge}>
              <Text style={globalStyles.planCurrentBadgeText}>Atual</Text>
            </View>
          )}
        </View>

        <Text style={globalStyles.planOptionDescription}>
          {plano.descricao}
        </Text>
      </View>

      <View style={globalStyles.planOptionPriceRow}>
        <Text style={globalStyles.planOptionPrice}>
          R$ {formatPrice(plano.preco)}
        </Text>

        <Text style={globalStyles.planOptionPeriod}>/{plano.periodo}</Text>
      </View>

      <View style={globalStyles.planLimits}>
        <View style={globalStyles.planLimitRow}>
          <Ionicons
            name="people-outline"
            size={17}
            color={COLORS.textSecondary}
          />

          <Text style={globalStyles.planLimitText}>
            {plano.limites.clientes} clientes
          </Text>
        </View>

        <View style={globalStyles.planLimitRow}>
          <Ionicons
            name="document-text-outline"
            size={17}
            color={COLORS.textSecondary}
          />

          <Text style={globalStyles.planLimitText}>
            {plano.limites.orcamentos} orçamentos
          </Text>
        </View>

        <View style={globalStyles.planLimitRow}>
          <Ionicons
            name="business-outline"
            size={17}
            color={COLORS.textSecondary}
          />

          <Text style={globalStyles.planLimitText}>
            {plano.limites.obras} obras
          </Text>
        </View>

        {plano.limites.usuarios !== undefined && (
          <View style={globalStyles.planLimitRow}>
            <Ionicons
              name="person-add-outline"
              size={17}
              color={COLORS.textSecondary}
            />

            <Text style={globalStyles.planLimitText}>
              {plano.limites.usuarios} usuários
            </Text>
          </View>
        )}

        {plano.limites.armazenamento !== undefined && (
          <View style={globalStyles.planLimitRow}>
            <Ionicons
              name="cloud-outline"
              size={17}
              color={COLORS.textSecondary}
            />

            <Text style={globalStyles.planLimitText}>
              {plano.limites.armazenamento} GB
            </Text>
          </View>
        )}
      </View>

      {plano.recursos.length > 0 && (
        <View style={globalStyles.planFeatures}>
          {plano.recursos.map((recurso, index) => (
            <View
              key={`${plano.id}-${index}`}
              style={globalStyles.planFeatureRow}
            >
              <Ionicons
                name="checkmark-circle"
                size={17}
                color={COLORS.primary}
              />

              <Text style={globalStyles.planFeatureText}>{recurso}</Text>
            </View>
          ))}
        </View>
      )}

      <Pressable
        style={({ pressed }) => [
          globalStyles.planSelectButton,
          atual && globalStyles.planSelectButtonCurrent,
          pressed && globalStyles.pressOpacity,
        ]}
        onPress={onSelect}
        disabled={atual}
      >
        <Text
          style={[
            globalStyles.planSelectButtonText,
            atual && globalStyles.planSelectButtonTextCurrent,
          ]}
        >
          {atual ? "Plano atual" : "Escolher plano"}
        </Text>
      </Pressable>
    </View>
  );
}
