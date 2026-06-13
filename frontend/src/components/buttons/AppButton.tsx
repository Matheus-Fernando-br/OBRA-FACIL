import { TouchableOpacity, Text, ActivityIndicator } from "react-native";

import { globalStyles, COLORS } from "../../styles/globalStyles";

interface Props {
  title: string;
  onPress: () => void;
  loading?: boolean;
  color?: string;
}

export function AppButton({
  title,
  onPress,
  loading = false,
  color = COLORS.primary,
}: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[globalStyles.appButton, { backgroundColor: color }]}
    >
      {loading ? (
        <ActivityIndicator color="#FFF" />
      ) : (
        <Text style={globalStyles.appButtonText}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}
