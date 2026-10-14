import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { Plano } from "@/components/layout/interface";

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
  const { styles, theme } = useTheme();
  function formatPrice(value: number) {
    return value.toFixed(2).replace(".", ",");
  }

  return (
    <View
      style={[
        styles.planOptionCard,
        plano.destaque && styles.planOptionCardFeatured,
      ]}
    >
      {plano.destaque && (
        <View style={styles.planRecommendedBadge}>
          <Ionicons name="star" size={13} color={theme.primary} />

          <Text style={styles.planRecommendedText}>Recomendado</Text>
        </View>
      )}

      <View style={styles.planOptionHeader}>
        <View style={styles.planOptionTitleRow}>
          <Text style={styles.planOptionName}>{plano.nome}</Text>

          {atual && (
            <View style={styles.planCurrentBadge}>
              <Text style={styles.planCurrentBadgeText}>Atual</Text>
            </View>
          )}
        </View>

        <Text style={styles.planOptionDescription}>
          {plano.descricao}
        </Text>
      </View>

      <View style={styles.planOptionPriceRow}>
        <Text style={styles.planOptionPrice}>
          R$ {formatPrice(plano.preco)}
        </Text>

        <Text style={styles.planOptionPeriod}>/{plano.periodo}</Text>
      </View>

      <View style={styles.planLimits}>
        <View style={styles.planLimitRow}>
          <Ionicons
            name="people-outline"
            size={17}
            color={theme.textSecondary}
          />

          <Text style={styles.planLimitText}>
            {plano.limites.clientes} clientes
          </Text>
        </View>

        <View style={styles.planLimitRow}>
          <Ionicons
            name="document-text-outline"
            size={17}
            color={theme.textSecondary}
          />

          <Text style={styles.planLimitText}>
            {plano.limites.orcamentos} orçamentos
          </Text>
        </View>

        <View style={styles.planLimitRow}>
          <Ionicons
            name="business-outline"
            size={17}
            color={theme.textSecondary}
          />

          <Text style={styles.planLimitText}>
            {plano.limites.obras} obras
          </Text>
        </View>

        {plano.limites.usuarios !== undefined && (
          <View style={styles.planLimitRow}>
            <Ionicons
              name="person-add-outline"
              size={17}
              color={theme.textSecondary}
            />

            <Text style={styles.planLimitText}>
              {plano.limites.usuarios} usuários
            </Text>
          </View>
        )}

        {plano.limites.armazenamento !== undefined && (
          <View style={styles.planLimitRow}>
            <Ionicons
              name="cloud-outline"
              size={17}
              color={theme.textSecondary}
            />

            <Text style={styles.planLimitText}>
              {plano.limites.armazenamento} GB
            </Text>
          </View>
        )}
      </View>

      {plano.recursos.length > 0 && (
        <View style={styles.planFeatures}>
          {plano.recursos.map((recurso, index) => (
            <View
              key={`${plano.id}-${index}`}
              style={styles.planFeatureRow}
            >
              <Ionicons
                name="checkmark-circle"
                size={17}
                color={theme.primary}
              />

              <Text style={styles.planFeatureText}>{recurso}</Text>
            </View>
          ))}
        </View>
      )}

      <Pressable
        style={({ pressed }) => [
          styles.planSelectButton,
          atual && styles.planSelectButtonCurrent,
          pressed && styles.pressOpacity,
        ]}
        onPress={onSelect}
        disabled={atual}
      >
        <Text
          style={[
            styles.planSelectButtonText,
            atual && styles.planSelectButtonTextCurrent,
          ]}
        >
          {atual ? "Plano atual" : "Escolher plano"}
        </Text>
      </Pressable>
    </View>
  );
}
