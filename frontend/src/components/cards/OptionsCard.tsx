import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";

interface Props {
  title: string;

  description?: string;

  value?: string;

  icon?: keyof typeof Ionicons.glyphMap;

  iconColor?: string;

  badge?: string;

  disabled?: boolean;

  onPress?: () => void;
}

export function OptionsCard({
  title,
  description,
  value,
  icon = "chevron-forward",
  iconColor,
  badge,
  disabled = false,
  onPress,
}: Props) {
  const { styles, theme } = useTheme();

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.menuCard,
        disabled && {
          opacity: .45,
        },
      ]}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          flex: 1,
        }}
      >
        <View
          style={{
            width: 42,
            height: 42,
            borderRadius: 10,
            backgroundColor: theme.title,
            justifyContent: "center",
            alignItems: "center",
            marginRight: 15,
          }}
        >
          <Ionicons
            name={icon}
            size={20}
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
              color: theme.text,
              fontSize: 16,
              fontWeight: "600",
            }}
          >
            {title}
          </Text>

          {description && (
            <Text
              style={{
                color: theme.textSecondary,
                marginTop: 3,
                fontSize: 13,
              }}
            >
              {description}
            </Text>
          )}
        </View>

        {badge && (
          <View
            style={{
              backgroundColor: theme.primary,
              paddingHorizontal: 8,
              paddingVertical: 3,
              borderRadius: 8,
              marginRight: 10,
            }}
          >
            <Text
              style={{
                color: theme.white,
                fontSize: 11,
                fontWeight: "700",
              }}
            >
              {badge}
            </Text>
          </View>
        )}

        {value && (
          <Text
            style={{
              color: theme.textSecondary,
              marginRight: 10,
            }}
          >
            {value}
          </Text>
        )}

        <Ionicons
          name="chevron-forward"
          color={theme.placeholder}
          size={20}
        />
      </View>
    </Pressable>
  );
}