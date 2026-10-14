import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "@/contexts/ThemeContext";
import { PressableScale } from "@/components/ui/PressableScale";

interface PageHeaderProps {
  title: string;
  /** Linha de apoio, ex.: "12 orçamentos". */
  subtitle?: string;

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

/** Cabeçalho das listas: título grande + ações circulares. */
export function Header({
  title,
  subtitle,
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
      <View style={{ flex: 1 }}>
        <Text style={styles.pageHeaderTitle} accessibilityRole="header">
          {title}
        </Text>
        {subtitle ? <Text style={styles.pageHeaderSubtitle}>{subtitle}</Text> : null}
      </View>

      <View style={styles.pageHeaderActions}>
        {showFilter && (
          <PressableScale
            onPress={onFilterPress}
            activeScale={0.9}
            accessibilityLabel={
              hasActiveFilters
                ? `Filtros, ${activeFiltersCount} ativos`
                : "Filtros"
            }
            style={[
              styles.pageHeaderAction,
              styles.pageHeaderFilterButton,
              hasActiveFilters && styles.pageHeaderFilterActive,
            ]}
          >
            <Ionicons
              name="options-outline"
              size={19}
              color={hasActiveFilters ? theme.primary : theme.text}
            />

            {hasActiveFilters && (
              <View style={styles.pageHeaderFilterBadge}>
                <Text style={styles.pageHeaderFilterBadgeText}>
                  {activeFiltersCount > 99 ? "99+" : activeFiltersCount}
                </Text>
              </View>
            )}
          </PressableScale>
        )}

        {showAdd && (
          <PressableScale
            onPress={onAddPress}
            activeScale={0.9}
            accessibilityLabel="Adicionar"
            style={[styles.pageHeaderAction, styles.pageHeaderAddButton]}
          >
            <Ionicons name={addIcon} size={22} color={theme.onAccent} />
          </PressableScale>
        )}
      </View>
    </View>
  );
}
