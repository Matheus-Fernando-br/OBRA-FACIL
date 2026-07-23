import { ReactNode } from "react";
import { View, Text, TextStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { globalStyles } from "../../styles/globalStyles";

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
  return (
    <View style={globalStyles.dashboardCard}>
      <Ionicons name={icon} size={20} color={color} />

      {typeof value === "string" || typeof value === "number" ? (
        <Text style={[globalStyles.dashboardCardValue, valueStyle]}>
          {value}
        </Text>
      ) : (
        value
      )}

      <Text style={globalStyles.dashboardCardTitle}>{title}</Text>
    </View>
  );
}