import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { COLORS, globalStyles } from "@/styles/globalStyles";

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
  iconColor = COLORS.primary,
  value,
  disabled = false,
  danger = false,
  rightComponent,
  onPress,
}: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled={disabled || !onPress}
      onPress={onPress}
      style={{
        backgroundColor: COLORS.card,
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
        <Ionicons
          name={icon}
          size={24}
          color={iconColor}
        />
      </View>

      <View
        style={{
          flex: 1,
        }}
      >
        <Text
          style={{
            color: danger ? COLORS.danger : COLORS.text,
            fontWeight: "700",
            fontSize: 16,
          }}
        >
          {title}
        </Text>

        {!!description && (
          <Text
            style={{
              color: COLORS.textSecondary,
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
            color: COLORS.primary,
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
          color={COLORS.textSecondary}
          size={20}
        />
      )}
    </TouchableOpacity>
  );
}