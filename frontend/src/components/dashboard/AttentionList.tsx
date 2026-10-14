import { Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";
import { withAlpha } from "@/styles/globalStyles";
import type { Obra, Orcamento } from "@/components/layout/interface";
import { PressableScale } from "@/components/ui/PressableScale";
import { FadeInView } from "@/components/ui/FadeInView";
import { getBudgetDaysLeft } from "@/utils/status";

interface Props {
  expired: Orcamento[];
  expiringSoon: Orcamento[];
  lateWorks: Obra[];
  getWorkName: (work: Obra) => string;
  getClientLabel: (budget: Orcamento) => string;
}

interface Item {
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  title: string;
  detail: string;
  route: "/orcamentos" | "/obras";
}

/**
 * "Precisa de atenção": orçamentos pendentes vencidos ou perto de vencer
 * e obras atrasadas — o que o técnico deve resolver primeiro.
 */
export function AttentionList({
  expired,
  expiringSoon,
  lateWorks,
  getWorkName,
  getClientLabel,
}: Props) {
  const { styles, theme } = useTheme();

  const items: Item[] = [
    ...expired.map((b) => ({
      key: `exp-${b._id}`,
      icon: "hourglass-outline" as const,
      color: theme.danger,
      title: b.nome,
      detail: `Validade vencida · ${getClientLabel(b)}`,
      route: "/orcamentos" as const,
    })),
    ...expiringSoon.map((b) => {
      const days = getBudgetDaysLeft(b) ?? 0;
      return {
        key: `soon-${b._id}`,
        icon: "time-outline" as const,
        color: theme.warning,
        title: b.nome,
        detail: `${days === 0 ? "Vence hoje" : `Vence em ${days} dia${days === 1 ? "" : "s"}`} · ${getClientLabel(b)}`,
        route: "/orcamentos" as const,
      };
    }),
    ...lateWorks.map((w) => ({
      key: `late-${w._id}`,
      icon: "alert-circle-outline" as const,
      color: theme.danger,
      title: getWorkName(w),
      detail: `Obra atrasada · ${w.porcentagem_de_conclusao ?? 0}% concluída`,
      route: "/obras" as const,
    })),
  ].slice(0, 5);

  if (items.length === 0) return null;

  return (
    <FadeInView index={3}>
      <Text style={styles.sectionTitle}>Precisa de atenção</Text>
      <View style={styles.groupedList}>
        {items.map((item, i) => (
          <View key={item.key}>
            {i > 0 && <View style={styles.menuCardDivider} />}
            <PressableScale
              activeScale={0.99}
              onPress={() => router.navigate(item.route)}
              style={styles.menuCard}
              accessibilityLabel={`${item.title}. ${item.detail}`}
            >
              <View
                style={[styles.menuCardIcon, { backgroundColor: withAlpha(item.color, 0.13) }]}
              >
                <Ionicons name={item.icon} size={17} color={item.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.menuText} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.menuCardDescription} numberOfLines={1}>
                  {item.detail}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={theme.placeholder} />
            </PressableScale>
          </View>
        ))}
      </View>
    </FadeInView>
  );
}
