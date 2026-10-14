import { useTheme } from "@/contexts/ThemeContext";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";


interface Props {
  onPress: () => void;
}

export function FabButton({ onPress }: Props) {
  const { styles, theme } = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={styles.fabButton}
    >
      <Ionicons name="add" size={30} color={theme.white} />
    </TouchableOpacity>
  );
}
