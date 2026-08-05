import { TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { globalStyles } from "../../styles/globalStyles";

interface Props {
  title: string;
  icon: any;
  color:string;
  onPress: () => void;
}

export function QuickAccessCard({ title, icon, color, onPress }: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={globalStyles.quickButton}
    >
      <Ionicons name={icon} size={28} color={color} />

      <Text style={globalStyles.quickButtonText}>{title}</Text>
    </TouchableOpacity>
  );
}
