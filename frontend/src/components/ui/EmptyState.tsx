import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";
import { PressableScale } from "./PressableScale";

interface Props {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, message, actionLabel, onAction }: Props) {
  const { styles, theme } = useTheme();

  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyStateIcon}>
        <Ionicons name={icon} size={28} color={theme.primary} />
      </View>
      <Text style={styles.emptyStateTitle}>{title}</Text>
      {message ? <Text style={styles.emptyStateText}>{message}</Text> : null}
      {actionLabel && onAction ? (
        <PressableScale
          onPress={onAction}
          style={[styles.actionChip, { marginTop: 18, backgroundColor: theme.titleBackground }]}
        >
          <Ionicons name="add" size={16} color={theme.primary} />
          <Text style={[styles.actionChipText, { color: theme.primary }]}>
            {actionLabel}
          </Text>
        </PressableScale>
      ) : null}
    </View>
  );
}
