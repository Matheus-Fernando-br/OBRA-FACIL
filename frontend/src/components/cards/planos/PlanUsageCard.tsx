import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { Plano, UsoPlano } from "@/components/layout/interface";
import { COLORS, globalStyles } from "@/styles/globalStyles";

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
  const percentage = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;

  const isNearLimit = percentage >= 80;
  const isFull = percentage >= 100;

  return (
    <View style={globalStyles.planUsageItem}>
      <View style={globalStyles.planUsageTop}>
        <View style={globalStyles.planUsageTitleRow}>
          <Ionicons name={icon} size={18} color={COLORS.textSecondary} />

          <Text style={globalStyles.planUsageTitle}>{title}</Text>
        </View>

        <Text
          style={[
            globalStyles.planUsageValue,
            isNearLimit && globalStyles.planUsageValueWarning,
          ]}
        >
          {used}
          {suffix} / {limit}
          {suffix}
        </Text>
      </View>

      <View style={globalStyles.planUsageBarBackground}>
        <View
          style={[
            globalStyles.planUsageBar,
            {
              width: `${percentage}%`,
              backgroundColor: isFull
                ? COLORS.danger
                : isNearLimit
                  ? COLORS.warning
                  : COLORS.primary,
            },
          ]}
        />
      </View>
    </View>
  );
}

export function PlanUsageCard({ plano, uso }: PlanUsageCardProps) {
  return (
    <View style={globalStyles.planUsageCard}>
      <View>
        <Text style={globalStyles.planSectionTitle}>Uso do plano</Text>

        <Text style={globalStyles.planSectionDescription}>
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
