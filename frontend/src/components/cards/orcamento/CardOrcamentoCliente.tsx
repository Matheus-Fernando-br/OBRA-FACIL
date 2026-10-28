import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";
import { withAlpha } from "@/styles/globalStyles";

interface Props {
  name: string;
  value: number;
  status: string;
  onClick: () => void;
}

export function CardOrcamentoCliente({ name, value, status, onClick }: Props) {
  const { styles, theme } = useTheme();

  function getInitials(nome: string) {
    const nomes = nome.trim().split(/\s+/).filter(Boolean);
    if (!nomes.length) return "?";
    if (nomes.length === 1) return nomes[0][0].toUpperCase();
    return (nomes[0][0] + nomes[1][0]).toUpperCase();
  }

  // Tons do tema (funcionam no claro e no escuro).
  function getAvatarColor(nome: string) {
    const palette = [theme.primary, theme.info, theme.success, theme.warning, theme.secondary, theme.danger];
    let hash = 0;
    for (let i = 0; i < nome.length; i++) hash = nome.charCodeAt(i) + ((hash << 5) - hash);
    return withAlpha(palette[Math.abs(hash) % palette.length], 0.16);
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
