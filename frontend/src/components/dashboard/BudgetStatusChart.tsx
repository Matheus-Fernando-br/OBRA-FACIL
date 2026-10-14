import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";
import { getBudgetStatusMeta } from "@/utils/status";

interface Props {
  approved: number;
  pending: number;
  rejected: number;
}

/**
 * Barra 100% empilhada com a distribuição dos orçamentos por status.
 * Ordem fixa Aprovado → Pendente → Recusado (verde e vermelho nunca
 * adjacentes); cada segmento tem rótulo, ícone e contagem na legenda.
 */
export function BudgetStatusChart({ approved, pending, rejected }: Props) {
  const { styles, theme } = useTheme();
  const total = approved + pending + rejected;

  const segments = [
    { key: "APROVADO", value: approved },
    { key: "PENDENTE", value: pending },
    { key: "RECUSADO", value: rejected },
  ].map((s) => ({ ...s, meta: getBudgetStatusMeta(s.key, theme) }));

  const visible = segments.filter((s) => s.value > 0);

  return (
    <View
      style={styles.card}
      accessibilityLabel={`Orçamentos: ${approved} aprovados, ${pending} pendentes, ${rejected} recusados`}
    >
      <View style={{ flexDirection: "row", alignItems: "baseline", gap: 6 }}>
        <Text style={styles.dashboardCardValue}>{total}</Text>
        <Text style={styles.caption}>orçamento{total === 1 ? "" : "s"} no total</Text>
      </View>

      <View
        style={{
          flexDirection: "row",
          height: 12,
          marginTop: 14,
          gap: 2,
          borderRadius: 4,
          overflow: "hidden",
          backgroundColor: theme.surfaceMuted,
        }}
      >
        {visible.map((s) => (
          <View
            key={s.key}
            style={{ flex: s.value, backgroundColor: s.meta.color }}
          />
        ))}
      </View>

      <View style={styles.chartLegendRow}>
        {segments.map((s) => {
          const pct = total ? Math.round((s.value / total) * 100) : 0;
          return (
            <View key={s.key} style={styles.chartLegendItem}>
              <Ionicons name={s.meta.icon} size={14} color={s.meta.color} />
              <Text style={styles.chartLegendText}>{s.meta.label}</Text>
              <Text style={styles.chartLegendValue}>{s.value}</Text>
              <Text style={styles.chartLegendText}>({pct}%)</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
