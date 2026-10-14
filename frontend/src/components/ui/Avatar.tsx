import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";
import { withAlpha } from "@/styles/globalStyles";
import { getInitials } from "@/utils/format";

/* Tons fixos por nome: a mesma pessoa sempre tem a mesma cor. */
const AVATAR_HUES = [
  "#0A72D6",
  "#13876F",
  "#C2570C",
  "#8E44AD",
  "#D43C5C",
  "#00838F",
  "#5E5CE6",
  "#B7791F",
];

function hueFor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_HUES[Math.abs(hash) % AVATAR_HUES.length];
}

interface Props {
  name?: string;
  size?: number;
  /** Sem nome: mostra ícone de pessoa. */
  placeholderIcon?: keyof typeof Ionicons.glyphMap;
}

export function Avatar({ name, size = 44, placeholderIcon = "person" }: Props) {
  const { theme } = useTheme();
  const hasName = Boolean(name?.trim());
  const hue = hasName ? hueFor(name!) : theme.textSecondary;

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: withAlpha(hue, 0.14),
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {hasName ? (
        <Text
          style={{
            color: hue,
            fontSize: size * 0.38,
            fontWeight: "700",
            letterSpacing: 0.3,
          }}
        >
          {getInitials(name)}
        </Text>
      ) : (
        <Ionicons name={placeholderIcon} size={size * 0.45} color={hue} />
      )}
    </View>
  );
}
