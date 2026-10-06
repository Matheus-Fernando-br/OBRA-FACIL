import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "@/contexts/ThemeContext";

interface PageHeaderProps {
  title: string;

  // Filtro
  showFilter?: boolean;
  activeFiltersCount?: number;
  onFilterPress?: () => void;

  // Botão adicionar
  showAdd?: boolean;
  onAddPress?: () => void;

  // Personalização
  addIcon?: keyof typeof Ionicons.glyphMap;
}

export function Header({
  title,
  showFilter = false,
  activeFiltersCount = 0,
  onFilterPress,
  showAdd = false,
  onAddPress,
  addIcon = "add",
}: PageHeaderProps) {
  const { styles, theme } = useTheme();

  const hasActiveFilters = activeFiltersCount > 0;

  return (
    <View style={styles.pageHeaderRow}>
      {/* TÍTULO */}
      <Text style={styles.pageHeaderTitle}>{title}</Text>

      {/* AÇÕES */}
      <View style={styles.pageHeaderActions}>
        {/* FILTRO */}
        {showFilter && (
          <Pressable
            onPress={onFilterPress}
            style={({ pressed }) => [
              styles.pageHeaderAction,
              styles.pageHeaderFilterButton,
              hasActiveFilters && styles.pageHeaderFilterActive,
              pressed && styles.pageHeaderButtonPressed,
            ]}
          >
            <Ionicons
              name="filter-outline"
              size={20}
              color={hasActiveFilters ? theme.white : theme.text}
            />

            {hasActiveFilters && (
              <View style={styles.pageHeaderFilterBadge}>
                <Text style={styles.pageHeaderFilterBadgeText}>
                  {activeFiltersCount > 99 ? "99+" : activeFiltersCount}
                </Text>
              </View>
            )}
          </Pressable>
        )}

        {/* ADICIONAR */}
        {showAdd && (
          <Pressable
            onPress={onAddPress}
            style={({ pressed }) => [
              styles.pageHeaderAction,
              styles.pageHeaderAddButton,
              pressed && styles.pageHeaderButtonPressed,
            ]}
          >
            <Ionicons name={addIcon} size={22} color={theme.white} />
          </Pressable>
        )}
      </View>
    </View>
  );
}
