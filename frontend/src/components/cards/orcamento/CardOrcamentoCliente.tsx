import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";

interface Props {
  name: string;
  value: number;
  status: string;
  onClick: () => void;
}

export function CardOrcamentoCliente({ name, value, status, onClick }: Props) {
  const { styles, theme } = useTheme();

  function getInitials(nome: string) {
    const nomes = nome.trim().split(" ");

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

  function getStatusColor() {
    switch (status.toLowerCase()) {
      case "aprovado":
        return theme.success;

      case "recusado":
        return theme.danger;

      default:
        return theme.warning;
    }
  }

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
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text style={styles.clientCardName}>{name}</Text>
          <View
            style={[
              styles.orcamentoStatusBadge,
              {
                backgroundColor: `${getStatusColor()}20`,
              },
            ]}
          >
            <Text
              style={[
                styles.orcamentoStatusText,
                {
                  color: getStatusColor(),
                },
              ]}
            >
              {status}
            </Text>
          </View>
        </View>
        <Text style={styles.clientCardInfo}>R$ {Number(value).toFixed(2)}</Text>
      </View>

      <View style={styles.dividerVertical} />

      {/* Ações */}

      <View style={styles.clientIcons}>
        <Pressable onPress={onClick}>
          <Ionicons name="eye" size={30} color={theme.primary} />
        </Pressable>
      </View>
    </View>
  );
}
