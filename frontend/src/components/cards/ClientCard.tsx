import { View, Text } from "react-native";

import { globalStyles } from "../../styles/globalStyles";

interface Props {
  name: string;
  phone: string;
  cpf: string;
}

export function ClientCard({ name, phone, cpf }: Props) {
  return (
    <View style={globalStyles.clientCard}>
      <Text style={globalStyles.clientCardName}>{name}</Text>

      <Text style={globalStyles.clientCardInfo}>{phone}</Text>

      <Text style={globalStyles.clientCardCity}>{cpf}</Text>
    </View>
  );
}
