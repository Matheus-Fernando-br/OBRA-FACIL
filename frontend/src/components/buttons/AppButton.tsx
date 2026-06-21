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
      style={[
        {
          width: "100%",
          height: 50,
          marginTop: 10,
          backgroundColor: COLORS.primary,
          borderRadius: 12,
          justifyContent: "center",
          alignItems: "center",
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator color="#FFF" />
      ) : (
        <Text style={globalStyles.appButtonText}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}
