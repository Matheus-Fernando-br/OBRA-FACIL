import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useTheme } from "@/contexts/ThemeContext";
import { withAlpha } from "@/styles/globalStyles";
import type { Orcamento } from "@/components/layout/interface";
import { formatCompactCurrency, formatCurrency, toDate } from "@/utils/format";

const MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const CHART_HEIGHT = 120;

interface Props {
  budgets: Orcamento[];
  months?: number;
}

/**
 * Valor orçado (com BDI) por mês de emissão — série única na cor de
 * acento. Tocar numa barra mostra o valor e a quantidade do mês.
 */
export function MonthlyBudgetChart({ budgets, months = 6 }: Props) {
  const { styles, theme } = useTheme();

  const data = useMemo(() => {
    const now = new Date();
    const buckets = Array.from({ length: months }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (months - 1 - i), 1);
      return {
        key: `${d.getFullYear()}-${d.getMonth()}`,
        label: MONTHS[d.getMonth()],
        year: d.getFullYear(),
        value: 0,
        count: 0,
      };
    });

    const index = new Map(buckets.map((b, i) => [b.key, i]));

    budgets.forEach((budget) => {
      const date = toDate(budget.data_publicacao);
      if (!date) return;
      const i = index.get(`${date.getFullYear()}-${date.getMonth()}`);
      if (i === undefined) return;
      buckets[i].value += budget.preco_com_bdi ?? budget.preco ?? 0;
      buckets[i].count += 1;
    });

    return buckets;
  }, [budgets, months]);

  const [selected, setSelected] = useState(data.length - 1);
  const max = Math.max(...data.map((d) => d.value), 1);
  const current = data[selected] ?? data[data.length - 1];
  const periodTotal = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <View style={styles.card}>
      <Animated.View key={selected} entering={FadeIn.duration(180)}>
        <Text style={styles.caption}>
          {current.label.charAt(0).toUpperCase() + current.label.slice(1)} de {current.year}
        </Text>
        <Text style={styles.dashboardCardValue}>{formatCurrency(current.value, 0)}</Text>
        <Text style={styles.caption}>
          {current.count} orçamento{current.count === 1 ? "" : "s"} emitido
          {current.count === 1 ? "" : "s"}
        </Text>
      </Animated.View>

      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-end",
          height: CHART_HEIGHT,
          marginTop: 16,
          gap: 8,
          borderBottomWidth: 1,
          borderBottomColor: theme.separator,
        }}
        accessibilityLabel={`Valor orçado nos últimos ${months} meses: ${formatCurrency(periodTotal, 0)}`}
      >
        {data.map((d, i) => {
          const isSelected = i === selected;
          const h = d.value > 0 ? Math.max(4, (d.value / max) * (CHART_HEIGHT - 8)) : 2;

          return (
            <Pressable
              key={d.key}
              onPress={() => setSelected(i)}
              style={{ flex: 1, height: "100%", justifyContent: "flex-end" }}
              accessibilityRole="button"
              accessibilityLabel={`${d.label}: ${formatCurrency(d.value, 0)}, ${d.count} orçamentos`}
              hitSlop={4}
            >
              <View
                style={{
                  height: h,
                  borderTopLeftRadius: 4,
                  borderTopRightRadius: 4,
                  backgroundColor: isSelected
                    ? theme.primary
                    : withAlpha(theme.primary, d.value > 0 ? 0.35 : 0.15),
                }}
              />
            </Pressable>
          );
        })}
      </View>

      <View style={{ flexDirection: "row", gap: 8, marginTop: 6 }}>
        {data.map((d, i) => (
          <Text
            key={d.key}
            style={[
              styles.caption,
              {
                flex: 1,
                textAlign: "center",
                color: i === selected ? theme.text : theme.textSecondary,
                fontWeight: i === selected ? "700" : "500",
              },
            ]}
          >
            {d.label}
          </Text>
        ))}
      </View>

      <Text style={[styles.caption, { marginTop: 12 }]}>
        Total no período: {formatCompactCurrency(periodTotal)} · toque numa barra para ver o mês
      </Text>
    </View>
  );
}
