import { Pressable, ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useTheme } from "@/contexts/ThemeContext";

interface Props {
  labels: string[];
  onClear: () => void;
}

/** Chips dos filtros ativos + ação "Limpar" (Clientes, Orçamentos, Obras). */
export function FilterChips({ labels, onClear }: Props) {
  const { styles, theme } = useTheme();

  if (labels.length === 0) return null;

  return (
    <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterActiveScrollContent}
        style={{ marginBottom: 8, marginTop: -4 }}
      >
        {labels.map((label) => (
          <View key={label} style={styles.filterChip}>
            <Text style={styles.filterChipText} numberOfLines={1}>
              {label}
            </Text>
          </View>
        ))}

        <Pressable
          onPress={onClear}
          style={styles.clearFilterButton}
          accessibilityLabel="Limpar filtros"
        >
          <Ionicons name="close-circle" size={16} color={theme.textSecondary} />
          <Text style={styles.clearFilterButtonText}>Limpar</Text>
        </Pressable>
      </ScrollView>
    </Animated.View>
  );
}
