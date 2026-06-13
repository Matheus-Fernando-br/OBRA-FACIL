import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { globalStyles } from "../../styles/globalStyles";

interface Props {
  onPress: () => void;
}

export function FabButton({ onPress }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={globalStyles.fabButton}
    >
      <Ionicons name="add" size={30} color="#FFF" />
    </TouchableOpacity>
  );
}
