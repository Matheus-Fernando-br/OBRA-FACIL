import { View, Text } from "react-native";

import { globalStyles } from "../../styles/globalStyles";

interface Props {
  name: string;
  phone: string;
  city: string;
}

export function ClientCard({ name, phone, city }: Props) {
  return (
    <View style={globalStyles.clientCard}>
      <Text style={globalStyles.clientCardName}>{name}</Text>

      <Text style={globalStyles.clientCardInfo}>{phone}</Text>

      <Text style={globalStyles.clientCardCity}>{city}</Text>
    </View>
  );
}
