import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";

interface Props {
  title: string;
}

export function PageHeader({ title }: Props) {
  const { styles, theme } = useTheme();

  return (
    <View
      style={{
        backgroundColor: theme.white,
        padding: 10,
      }}
    >
      <View
        style={{
          position: "relative",
          width: "100%",
          minHeight: 44,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 50,
        }}
      >
        <Pressable
          onPress={() => router.replace("/(tabs)/mais")}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 44,
            height: 44,
            alignItems: "flex-start",
            justifyContent: "center",
          }}
        >
          <Ionicons name="arrow-back" size={24} color={theme.title} />
        </Pressable>

        <Text
          style={[
            styles.title,
            {
              textAlign: "center",
            },
          ]}
        >
          {title}
        </Text>
      </View>

      <View style={styles.divider} />
    </View>
  );
}
