import { ActivityIndicator, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";
import { withAlpha } from "@/styles/globalStyles";
import { PressableScale } from "@/components/ui/PressableScale";

type Variant = "primary" | "secondary" | "tinted" | "danger" | "ghost";

interface Props {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  /** Cor de fundo personalizada (mantido por compatibilidade). */
  color?: string;
  textColor?: string;
  outline?: boolean;
  variant?: Variant;
  icon?: keyof typeof Ionicons.glyphMap;
}

/**
 * Botão padrão do app. Variantes:
 * primary (acento) · secondary (neutro) · tinted (acento suave) ·
 * danger (destrutivo suave) · ghost (só texto).
 */
export function AppButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  color,
  textColor,
  outline = false,
  variant,
  icon,
}: Props) {
  const { styles, theme } = useTheme();
  const isDisabled = loading || disabled;

  const resolved: Variant = variant ?? (outline ? "secondary" : "primary");

  const palette: Record<Variant, { bg: string; fg: string; border?: string }> = {
    primary: { bg: color ?? theme.primary, fg: theme.onAccent },
    secondary: { bg: theme.white, fg: theme.text, border: theme.border },
    tinted: { bg: theme.titleBackground, fg: theme.primary },
    danger: { bg: withAlpha(theme.danger, 0.12), fg: theme.danger },
    ghost: { bg: "transparent", fg: theme.primary },
  };

  const { bg, fg, border } = palette[resolved];
  const foreground = textColor ?? fg;

  return (
    <PressableScale
      disabled={isDisabled}
      onPress={onPress}
      accessibilityLabel={title}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={[
        styles.appButton,
        {
          backgroundColor: bg,
          borderWidth: border ? 1 : 0,
          borderColor: border,
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={foreground} />
      ) : (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {icon && <Ionicons name={icon} size={18} color={foreground} />}
          <Text style={[styles.appButtonText, { color: foreground }]}>{title}</Text>
        </View>
      )}
    </PressableScale>
  );
}
