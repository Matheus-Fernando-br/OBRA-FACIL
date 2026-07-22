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
  disabled?: boolean;
  color?: string;
}

export function AppButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  color = COLORS.title,
}: Props) {
  const isDisabled = loading || disabled;

  return (
    <TouchableOpacity
      disabled={isDisabled}
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
        opacity: isDisabled ? 0.5 : 1,
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