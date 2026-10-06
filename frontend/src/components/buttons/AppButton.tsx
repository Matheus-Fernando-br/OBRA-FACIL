import { ActivityIndicator, Pressable, Text } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";

interface Props {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  color?: string;
  textColor?: string;
  outline?: boolean;
}

export function AppButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  color,
  textColor,
  outline = false,
}: Props) {
  const { styles, theme } = useTheme();
  const isDisabled = loading || disabled;

  return (
    <Pressable
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.appButton,
        outline && styles.cadastroSecondaryOutlineButton,
        color && !outline && { backgroundColor: color },
        pressed && styles.authPressed,
        isDisabled && styles.authDisabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColor || theme.white} />
      ) : (
        <Text
          style={[
            styles.appButtonText,
            outline && styles.cadastroSecondaryOutlineButtonText,
            textColor && { color: textColor },
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}
