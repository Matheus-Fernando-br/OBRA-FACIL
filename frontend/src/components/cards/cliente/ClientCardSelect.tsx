import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { phoneMask } from "@/components/forms/mask";
import { useTheme } from "@/contexts/ThemeContext";
import { Avatar } from "@/components/ui/Avatar";

interface Props {
  name: string;
  phone: string;
  onClick: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
}

/** Linha de cliente usada nos formulários (seleção / visualização). */
export function ClientCardSelect({
  name,
  phone,
  onClick,
  icon = "chevron-down",
}: Props) {
  const { styles, theme } = useTheme();
  const isPlaceholder = !name || name === "Selecionar Cliente";
  const telefone = phoneMask(phone || "");

  return (
    <Pressable
      onPress={onClick}
      style={({ pressed }) => [styles.clientCard, pressed && { opacity: 0.85 }]}
      accessibilityRole="button"
      accessibilityLabel={isPlaceholder ? "Selecionar cliente" : `Cliente ${name}`}
    >
      <View style={{ marginRight: 14 }}>
        <Avatar name={isPlaceholder ? undefined : name} size={44} placeholderIcon="person-add" />
      </View>

      <View style={{ flex: 1 }}>
        <Text
          style={[styles.clientCardName, isPlaceholder && { color: theme.primary }]}
          numberOfLines={1}
        >
          {isPlaceholder ? "Selecionar cliente" : name}
        </Text>
        {telefone ? <Text style={styles.clientCardInfo}>{telefone}</Text> : null}
      </View>

      <View style={styles.iconButton}>
        <Ionicons name={icon} size={17} color={theme.primary} />
      </View>
    </Pressable>
  );
}
