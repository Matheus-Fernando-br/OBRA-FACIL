import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { Plano, UsoPlano } from "@/components/layout/interface";

interface PlanUsageCardProps {
  plano: Plano;
  uso: UsoPlano;
}

interface UsageItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  used: number;
  limit: number;
  suffix?: string;
}

function UsageItem({ icon, title, used, limit, suffix = "" }: UsageItemProps) {
  const { styles, theme } = useTheme();
  const percentage = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;

  const isNearLimit = percentage >= 80;
  const isFull = percentage >= 100;

  return (
    <View style={styles.planUsageItem}>
      <View style={styles.planUsageTop}>
        <View style={styles.planUsageTitleRow}>
          <Ionicons name={icon} size={18} color={theme.textSecondary} />

          <Text style={styles.planUsageTitle}>{title}</Text>
        </View>

        <Text
          style={[
            styles.planUsageValue,
            isNearLimit && styles.planUsageValueWarning,
          ]}
        >
          {used}
          {suffix} / {limit}
          {suffix}
        </Text>
      </View>

      <View style={styles.planUsageBarBackground}>
        <View
          style={[
            styles.planUsageBar,
            {
              width: `${percentage}%`,
              backgroundColor: isFull
                ? theme.danger
                : isNearLimit
                  ? theme.warning
                  : theme.primary,
            },
          ]}
        />
      </View>
    </View>
  );
}

export function PlanUsageCard({ plano, uso }: PlanUsageCardProps) {
  const { styles } = useTheme();
  return (
    <View style={styles.planUsageCard}>
      <View>
        <Text style={styles.planSectionTitle}>Uso do plano</Text>

        <Text style={styles.planSectionDescription}>
          Acompanhe os recursos utilizados da sua assinatura.
        </Text>
      </View>

      <UsageItem
        icon="people-outline"
        title="Clientes"
        used={uso.clientes}
        limit={plano.limites.clientes}
      />

      <UsageItem
        icon="document-text-outline"
        title="Orçamentos"
        used={uso.orcamentos}
        limit={plano.limites.orcamentos}
      />

      <UsageItem
        icon="business-outline"
        title="Obras"
        used={uso.obras}
        limit={plano.limites.obras}
      />

      {plano.limites.usuarios !== undefined && uso.usuarios !== undefined && (
        <UsageItem
          icon="person-add-outline"
          title="Usuários"
          used={uso.usuarios}
          limit={plano.limites.usuarios}
        />
      )}

      {plano.limites.armazenamento !== undefined &&
        uso.armazenamento !== undefined && (
          <UsageItem
            icon="cloud-outline"
            title="Armazenamento"
            used={uso.armazenamento}
            limit={plano.limites.armazenamento}
            suffix=" GB"
          />
        )}
    </View>
  );
}
