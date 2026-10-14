import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";
import { withAlpha } from "@/styles/globalStyles";
import { PressableScale } from "@/components/ui/PressableScale";

interface Props {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress: () => void;
}

export function QuickAccessCard({ title, icon, color, onPress }: Props) {
  const { styles } = useTheme();

  return (
    <PressableScale onPress={onPress} style={styles.quickButton} accessibilityLabel={title}>
      <View style={[styles.quickButtonIcon, { backgroundColor: withAlpha(color, 0.13) }]}>
        <Ionicons name={icon} size={21} color={color} />
      </View>
      <Text style={styles.quickButtonText} numberOfLines={2}>
        {title}
      </Text>
    </PressableScale>
  );
}
