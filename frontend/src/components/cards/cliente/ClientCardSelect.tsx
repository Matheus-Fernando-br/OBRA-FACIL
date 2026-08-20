import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { phoneMask } from "@/components/forms/mask";
import { useTheme } from "@/contexts/ThemeContext";

interface Props {
  name: string;
  phone: string;
  onClick: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
}

export function ClientCardSelect({
  name,
  phone,
  onClick,
  icon = "chevron-down",
}: Props) {
  const { styles, theme } = useTheme();

  function getInitials(nome: string) {
    const nomes = nome.trim().split(" ");

    if (!nome.trim()) {
      return "?";
    }

    if (nomes.length === 1) {
      return nomes[0][0].toUpperCase();
    }

    return (nomes[0][0] + nomes[1][0]).toUpperCase();
  }

  function getAvatarColor(nome: string) {
    const theme = [
      "#DBEAFE",
      "#DCFCE7",
      "#FEF3C7",
      "#FCE7F3",
      "#EDE9FE",
      "#FFE4E6",
      "#E0F2FE",
      "#F3E8FF",
      "#ECFCCB",
      "#FDE68A",
    ];

    let hash = 0;

    for (let i = 0; i < nome.length; i++) {
      hash = nome.charCodeAt(i) + ((hash << 5) - hash);
    }

    return theme[Math.abs(hash) % theme.length];
  }

  const telefone = phoneMask(phone || "");

  return (
    <View style={styles.clientCard}>
      {/* Avatar */}
      <View
        style={{
          width: 55,
          height: 55,
          borderRadius: 100,
          backgroundColor: getAvatarColor(name),
          justifyContent: "center",
          alignItems: "center",
          marginRight: 15,
        }}
      >
        {name === "Selecionar Cliente" ? (
          <Ionicons name="person-outline" size={28} color={theme.primary} />
        ) : (
          <Text
            style={{
              fontSize: 18,
              fontWeight: "700",
              color: theme.primary,
            }}
          >
            {getInitials(name)}
          </Text>
        )}
      </View>

      {/* Informações */}
      <View style={{ flex: 1 }}>
        <Text style={styles.clientCardName}>{name}</Text>

        <Text style={styles.clientCardInfo}>{telefone}</Text>
      </View>

      {/* Ação */}
      <Pressable onPress={onClick} style={styles.clientIcons}>
        <Ionicons name={icon} size={30} color={theme.primary} />
      </Pressable>
    </View>
  );
}
