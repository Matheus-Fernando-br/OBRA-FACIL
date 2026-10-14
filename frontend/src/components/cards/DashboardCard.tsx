import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";
import { withAlpha } from "@/styles/globalStyles";
import { PressableScale } from "@/components/ui/PressableScale";
import { SkeletonBlock } from "@/components/ui/Skeleton";

interface Props {
  title: string;
  value: number | string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  loading?: boolean;
  /** Linha de contexto abaixo do título (ex.: "2 vencem em 3 dias"). */
  hint?: string;
  onPress?: () => void;
}

/** Indicador do dashboard: ícone tonal, número grande e rótulo. */
export function DashboardCard({
  title,
  value,
  icon,
  color,
  loading = false,
  hint,
  onPress,
}: Props) {
  const { styles, theme } = useTheme();

  return (
    <PressableScale
      onPress={onPress}
      disabled={!onPress}
      style={styles.dashboardCard}
      accessibilityLabel={`${title}: ${value}`}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <View style={[styles.dashboardCardIcon, { backgroundColor: withAlpha(color, 0.13) }]}>
          <Ionicons name={icon} size={17} color={color} />
        </View>
        {onPress && (
          <Ionicons name="chevron-forward" size={15} color={theme.placeholder} />
        )}
      </View>

      {loading ? (
        <SkeletonBlock width="45%" height={28} radius={8} />
      ) : (
        <Text style={styles.dashboardCardValue}>{value}</Text>
      )}

      <Text style={styles.dashboardCardTitle} numberOfLines={2}>
        {title}
      </Text>

      {hint && !loading ? (
        <Text style={[styles.caption, { color, marginTop: 6 }]} numberOfLines={1}>
          {hint}
        </Text>
      ) : null}
    </PressableScale>
  );
}
