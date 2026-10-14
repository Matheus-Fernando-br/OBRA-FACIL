import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";
import { withAlpha } from "@/styles/globalStyles";
import type { StatusMeta } from "@/utils/status";

interface Props {
  meta: StatusMeta;
  /** Mostra ícone em vez do ponto. */
  withIcon?: boolean;
}

export function StatusPill({ meta, withIcon = false }: Props) {
  const { styles } = useTheme();

  return (
    <View
      style={[styles.statusPill, { backgroundColor: withAlpha(meta.color, 0.13) }]}
      accessibilityLabel={`Status: ${meta.label}`}
    >
      {withIcon ? (
        <Ionicons name={meta.icon} size={12} color={meta.color} />
      ) : (
        <View style={[styles.statusPillDot, { backgroundColor: meta.color }]} />
      )}
      <Text style={[styles.statusPillText, { color: meta.color }]}>
        {meta.label}
      </Text>
    </View>
  );
}
