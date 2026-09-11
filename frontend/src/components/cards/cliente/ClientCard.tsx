import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { phoneMask } from "@/components/forms/mask";
import { useTheme } from "@/contexts/ThemeContext";

interface Props {
  name: string;
  phone: string;
  email: string;
  onDetails: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function ClientCard({
  name,
  phone,
  email,
  onDetails,
  onEdit,
  onDelete,
}: Props) {
  const { styles, theme } = useTheme();

  function getInitials(nome: string) {
    const nomes = nome.trim().split(" ");

    if (nomes.length === 1) {
      return nomes[0][0].toUpperCase();
    }

    return (nomes[0][0] + nomes[1][0]).toUpperCase();
  }

  function getAvatarColor(nome: string) {
    const colors = [
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

    return colors[Math.abs(hash) % colors.length];
  }

  const telefone = phoneMask(phone || "");

  return (
    <Pressable onPress={onDetails} style={styles.clientCard}>
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
        <Text
          style={{
            fontSize: 18,
            fontWeight: "700",
            color: theme.primary,
          }}
        >
          {getInitials(name)}
        </Text>
      </View>

      {/* Informações */}

      <View style={{ flex: 1 }}>
        <Text style={styles.clientCardName}>{name}</Text>

        <Text style={styles.clientCardInfo}>{email}</Text>

        <Text style={styles.clientCardInfo}>{telefone}</Text>
      </View>

      <View style={styles.dividerVertical} />

      {/* Ações */}

      <View style={styles.clientIcons}>
        <Pressable onPress={onEdit}>
          <Ionicons name="pencil" size={30} color={theme.primary} />
        </Pressable>

        <Pressable onPress={onDelete}>
          <Ionicons name="trash-outline" size={30} color={theme.danger} />
        </Pressable>
      </View>
    </Pressable>
  );
}
