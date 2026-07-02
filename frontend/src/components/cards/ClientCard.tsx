import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { globalStyles, COLORS } from "../../styles/globalStyles";

interface Props {
  name: string;
  phone: string;
  cpf: string;

  onEdit: () => void;
  onDelete: () => void;
}

export function ClientCard({ name, phone, cpf, onEdit, onDelete }: Props) {
  return (
    <View style={globalStyles.clientCard}>
      <View style={{ flex: 1 }}>
        <Text style={globalStyles.clientCardName}>{name}</Text>
        <Text style={globalStyles.clientCardInfo}>{phone}</Text>
        <Text style={globalStyles.clientCardInfo}>{cpf}</Text>
      </View>
      <View style={globalStyles.clientIcons}>
        <Pressable onPress={onEdit}>
          <Ionicons name="pencil" size={30} color={COLORS.primary} />
        </Pressable>

        <Pressable onPress={onDelete}>
          <Ionicons name="trash" size={30} color={COLORS.danger} />
        </Pressable>
      </View>
    </View>
  );
}
