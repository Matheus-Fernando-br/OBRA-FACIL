import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";


interface PaymentMethodCardProps {
  paymentMethod?: string;
  onPress: () => void;
}

export function PaymentMethodCard({
  paymentMethod,
  onPress,
}: PaymentMethodCardProps) {
  const { styles, theme } = useTheme();
  return (
    <Pressable
      style={({ pressed }) => [
        styles.paymentMethodCard,
        pressed && styles.pressOpacity,
      ]}
      onPress={onPress}
    >
      <View style={styles.paymentMethodIcon}>
        <Ionicons name="card-outline" size={22} color={theme.primary} />
      </View>

      <View style={styles.paymentMethodContent}>
        <Text style={styles.paymentMethodTitle}>Forma de pagamento</Text>

        <Text style={styles.paymentMethodDescription}>
          {paymentMethod || "Nenhuma forma de pagamento cadastrada"}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
    </Pressable>
  );
}
