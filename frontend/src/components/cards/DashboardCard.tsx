import { View, Text } from "react-native";

import { globalStyles } from "../../styles/globalStyles";

interface Props {
  title: string;
  value: string;
}

export function DashboardCard({ title, value }: Props) {
  return (
    <View style={globalStyles.dashboardCard}>
      <Text style={globalStyles.dashboardCardTitle}>{title}</Text>

      <Text style={globalStyles.dashboardCardValue}>{value}</Text>
    </View>
  );
}
