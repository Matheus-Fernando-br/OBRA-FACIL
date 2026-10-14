import { useTheme } from "@/contexts/ThemeContext";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";


interface Props {
  title: string;

  description: string;

  hour: string;

  read: boolean;

  onOpen: () => void;

  onDelete: () => void;
}

export function NotificationCard({
  title,

  description,

  hour,

  read,

  onOpen,

  onDelete,
}: Props) {
  const { theme } = useTheme();
  return (
    <View
      style={{
        backgroundColor: theme.card,
        borderRadius: 14,
        padding: 18,
        marginBottom: 14,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <View
          style={{
            width: 10,
            height: 10,
            borderRadius: 50,

            backgroundColor: read ? theme.border : theme.warning,

            marginRight: 12,
          }}
        />

        <View
          style={{
            flex: 1,
          }}
        >
          <Text
            style={{
              color: theme.text,
              fontWeight: "700",
              fontSize: 16,
            }}
          >
            {title}
          </Text>

          <Text
            style={{
              color: theme.textSecondary,
              marginTop: 4,
            }}
          >
            {description}
          </Text>

          <Text
            style={{
              color: theme.placeholder,
              marginTop: 8,
              fontSize: 12,
            }}
          >
            {hour}
          </Text>
        </View>
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "flex-end",
          marginTop: 15,
        }}
      >
        <Pressable
          onPress={onOpen}
          style={{
            marginRight: 20,
          }}
        >
          <Ionicons name="eye-outline" size={22} color={theme.primary} />
        </Pressable>

        <Pressable onPress={onDelete}>
          <Ionicons name="trash-outline" size={22} color={theme.danger} />
        </Pressable>
      </View>
    </View>
  );
}
