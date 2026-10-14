import { View, Text, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { phoneMask } from "@/components/forms/mask";
import { useTheme } from "@/contexts/ThemeContext";
import { PressableScale } from "@/components/ui/PressableScale";
import { Avatar } from "@/components/ui/Avatar";

interface Props {
  name: string;
  phone: string;
  email: string;
  /** Quantidade de orçamentos do cliente (opcional). */
  budgetsCount?: number;
  onDetails: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function ClientCard({
  name,
  phone,
  email,
  budgetsCount,
  onDetails,
  onEdit,
  onDelete,
}: Props) {
  const { styles, theme } = useTheme();
  const digits = (phone || "").replace(/\D/g, "");
  const telefone = phoneMask(digits);

  return (
    <PressableScale
      onPress={onDetails}
      activeScale={0.985}
      style={styles.listCard}
      accessibilityLabel={`Cliente ${name}`}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
        <Avatar name={name} size={46} />

        <View style={{ flex: 1 }}>
          <Text style={styles.clientCardName} numberOfLines={1}>
            {name}
          </Text>
          {email ? (
            <Text style={styles.clientCardInfo} numberOfLines={1}>
              {email}
            </Text>
          ) : null}
          {telefone ? <Text style={styles.clientCardInfo}>{telefone}</Text> : null}
        </View>

        {typeof budgetsCount === "number" && (
          <View style={{ alignItems: "center" }}>
            <Text style={[styles.listCardTitle, { fontVariant: ["tabular-nums"] }]}>
              {budgetsCount}
            </Text>
            <Text style={styles.caption}>orç.</Text>
          </View>
        )}
      </View>

      <View style={styles.listCardActions}>
        {digits.length >= 10 && (
          <>
            <PressableScale
              onPress={() => Linking.openURL(`tel:${digits}`)}
              style={styles.iconButton}
              accessibilityLabel={`Ligar para ${name}`}
            >
              <Ionicons name="call" size={15} color={theme.info} />
            </PressableScale>
            <PressableScale
              onPress={() => Linking.openURL(`https://wa.me/55${digits}`)}
              style={styles.iconButton}
              accessibilityLabel={`Abrir WhatsApp de ${name}`}
            >
              <Ionicons name="logo-whatsapp" size={16} color={theme.success} />
            </PressableScale>
          </>
        )}

        <View style={{ flex: 1 }} />

        <PressableScale onPress={onEdit} style={styles.iconButton} accessibilityLabel="Editar cliente">
          <Ionicons name="pencil" size={15} color={theme.text} />
        </PressableScale>
        <PressableScale
          onPress={onDelete}
          style={styles.iconButton}
          accessibilityLabel="Excluir cliente"
        >
          <Ionicons name="trash-outline" size={16} color={theme.danger} />
        </PressableScale>
      </View>
    </PressableScale>
  );
}
