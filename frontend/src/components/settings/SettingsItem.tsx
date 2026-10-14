import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";
import { withAlpha } from "@/styles/globalStyles";

interface Props {
  title: string;
  description?: string;

  icon: keyof typeof Ionicons.glyphMap;

  iconColor?: string;

  value?: string;

  disabled?: boolean;

  danger?: boolean;

  rightComponent?: React.ReactNode;

  onPress?: () => void;
}

/** Linha de configuração: ícone tonal, título/descrição e acessório. */
export function SettingsItem({
  title,
  description,
  icon,
  iconColor,
  value,
  disabled = false,
  danger = false,
  rightComponent,
  onPress,
}: Props) {
  const { theme, styles } = useTheme();
  const tint = danger ? theme.danger : (iconColor ?? theme.primary);
  const interactive = !disabled && Boolean(onPress);

  return (
    <Pressable
      disabled={!interactive}
      onPress={onPress}
      accessibilityRole={interactive ? "button" : undefined}
      style={({ pressed }) => [
        styles.menuCard,
        pressed && { backgroundColor: theme.surfaceMuted },
        disabled && { opacity: 0.5 },
      ]}
    >
      <View style={[styles.menuCardIcon, { backgroundColor: withAlpha(tint, 0.14) }]}>
        <Ionicons name={icon} size={17} color={tint} />
      </View>

      <View style={{ flex: 1, marginRight: 8 }}>
        <Text style={[styles.menuText, danger && { color: theme.danger }]}>{title}</Text>

        {!!description && <Text style={styles.menuCardDescription}>{description}</Text>}
      </View>

      {rightComponent ? (
        rightComponent
      ) : value ? (
        <Text style={[styles.menuCardDescription, { marginRight: 6 }]}>{value}</Text>
      ) : null}

      {interactive && !rightComponent && (
        <Ionicons name="chevron-forward" color={theme.placeholder} size={17} />
      )}
    </Pressable>
  );
}
