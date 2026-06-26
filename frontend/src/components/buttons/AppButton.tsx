import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from "react-native";

import { COLORS, globalStyles } from "../../styles/globalStyles";

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
      disabled={loading}
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        width: "100%",
        height: 50,
        marginTop: 10,
        backgroundColor: color,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        opacity: loading ? 0.8 : 1,
      }}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#FFF" />
      ) : (
        <Text style={globalStyles.appButtonText}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}