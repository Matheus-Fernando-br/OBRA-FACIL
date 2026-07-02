import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { globalStyles } from "../../styles/globalStyles";

interface Props {
  title: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

export function DashboardCard({ title, value, icon, color }: Props) {
  return (
    <View style={globalStyles.dashboardCard}>
      <Ionicons name={icon} size={24} color={color} />
      <Text style={globalStyles.dashboardCardTitle}>{title}</Text>

      <Text style={globalStyles.dashboardCardValue}>{value}</Text>
    </View>
  );
}
