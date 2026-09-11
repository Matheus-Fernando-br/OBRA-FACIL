import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";

interface Props {
  title: string;
  description?: string;

  icon: keyof typeof Ionicons.glyphMap;

  iconColor?: string;

  value?: string;

  disabled?: boolean;

  danger?: boolean;

  rightComponent?: React.ReactNode;

  onPress?: () => void;
}

export function SettingsItem({
  title,
  description,
  icon,
  iconColor,
  value,
  disabled = false,
  danger = false,
  rightComponent,
  onPress,
}: Props) {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled={disabled || !onPress}
      onPress={onPress}
      style={{
        backgroundColor: theme.white,
        borderRadius: 18,
        padding: 18,
        marginBottom: 14,

        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          backgroundColor: `${iconColor}20`,
          justifyContent: "center",
          alignItems: "center",
          marginRight: 15,
        }}
      >
        <Ionicons name={icon} size={24} color={iconColor} />
      </View>

      <View
        style={{
          flex: 1,
        }}
      >
        <Text
          style={{
            color: danger ? theme.danger : theme.text,
            fontWeight: "700",
            fontSize: 16,
          }}
        >
          {title}
        </Text>

        {!!description && (
          <Text
            style={{
              color: theme.textSecondary,
              marginTop: 4,
              fontSize: 13,
            }}
          >
            {description}
          </Text>
        )}
      </View>

      {rightComponent ? (
        rightComponent
      ) : value ? (
        <Text
          style={{
            color: theme.primary,
            fontWeight: "700",
            marginRight: 10,
          }}
        >
          {value}
        </Text>
      ) : null}

      {!disabled && !rightComponent && (
        <Ionicons
          name="chevron-forward"
          color={theme.textSecondary}
          size={20}
        />
      )}
    </TouchableOpacity>
  );
}
