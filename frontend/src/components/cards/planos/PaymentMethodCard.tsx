import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { COLORS, globalStyles } from "@/styles/globalStyles";

interface PaymentMethodCardProps {
  paymentMethod?: string;
  onPress: () => void;
}

export function PaymentMethodCard({
  paymentMethod,
  onPress,
}: PaymentMethodCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        globalStyles.paymentMethodCard,
        pressed && globalStyles.pressOpacity,
      ]}
      onPress={onPress}
    >
      <View style={globalStyles.paymentMethodIcon}>
        <Ionicons name="card-outline" size={22} color={COLORS.primary} />
      </View>

      <View style={globalStyles.paymentMethodContent}>
        <Text style={globalStyles.paymentMethodTitle}>Forma de pagamento</Text>

        <Text style={globalStyles.paymentMethodDescription}>
          {paymentMethod || "Nenhuma forma de pagamento cadastrada"}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
    </Pressable>
  );
}
