import { TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";

interface Props {
  title: string;
  icon: any;
  color:string;
  onPress: () => void;
}

export function QuickAccessCard({ title, icon, color, onPress }: Props) {
  const { styles } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={styles.quickButton}
    >
      <Ionicons name={icon} size={28} color={color} />

      <Text style={styles.quickButtonText}>{title}</Text>
    </TouchableOpacity>
  );
}
