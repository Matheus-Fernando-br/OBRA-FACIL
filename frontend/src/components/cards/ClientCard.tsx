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

export function ClientCard({
  name,
  phone,
  cpf,
  onEdit,
  onDelete,
}: Props) {
  return (
    <View style={globalStyles.clientCard}>
      <Text style={globalStyles.clientCardName}>{name}</Text>

      <Text style={globalStyles.clientCardInfo}>{phone}</Text>

      <Text style={globalStyles.clientCardCity}>{cpf}</Text>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "flex-end",
          gap: 15,
          marginTop: 15,
        }}
      >
        <Pressable onPress={onEdit}>
          <Ionicons
            name="pencil"
            size={22}
            color={COLORS.primary}
          />
        </Pressable>

        <Pressable onPress={onDelete}>
          <Ionicons
            name="trash"
            size={22}
            color={COLORS.danger}
          />
        </Pressable>
      </View>
    </View>
  );
}