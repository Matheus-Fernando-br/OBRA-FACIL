import { TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { globalStyles, COLORS } from "../../styles/globalStyles";

interface Props {
  title: string;
  icon: any;
  onPress: () => void;
}

export function QuickAccessCard({ title, icon, onPress }: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={globalStyles.quickButton}
    >
      <Ionicons name={icon} size={28} color={COLORS.primary} />

      <Text style={globalStyles.quickButtonText}>{title}</Text>
    </TouchableOpacity>
  );
}
