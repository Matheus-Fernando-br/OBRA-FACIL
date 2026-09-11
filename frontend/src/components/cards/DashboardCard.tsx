import { ReactNode } from "react";
import { View, Text, TextStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";

interface Props {
  title: string;
  value: ReactNode;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  valueStyle?: TextStyle;
}

export function DashboardCard({
  title,
  value,
  icon,
  color,
  valueStyle,
}: Props) {
  const { styles } = useTheme();

  return (
    <View style={styles.dashboardCard}>
      <Ionicons name={icon} size={20} color={color} />

      {typeof value === "string" || typeof value === "number" ? (
        <Text style={[styles.dashboardCardValue, valueStyle]}>{value}</Text>
      ) : (
        value
      )}

      <Text style={styles.dashboardCardTitle}>{title}</Text>
    </View>
  );
}
