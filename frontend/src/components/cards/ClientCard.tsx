import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { globalStyles } from "../../styles/globalStyles";

interface Props {
  name: string;
  phone: string;
  cpf: string;

  onEdit: () => void;
}

export function ClientCard({
  name,
  phone,
  cpf,
  onEdit,
}: Props) {
    return (
      <View style={globalStyles.clientCard}>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={globalStyles.clientCardName}>
            {name}
          </Text>

          <Pressable onPress={onEdit}>
            <Ionicons
              name="pencil"
              size={22}
              color="#F59E0B"
            />
          </Pressable>
        </View>

        <Text style={globalStyles.clientCardInfo}>
          {phone}
        </Text>

        <Text style={globalStyles.clientCardCity}>
          {cpf}
        </Text>
      </View>
    );
  }
