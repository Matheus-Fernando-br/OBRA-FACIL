import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";

interface Props {
  title: string;
  subtitle?: string;
}

export function PageHeader({ title, subtitle }: Props) {
  const { styles, theme } = useTheme();

  return (
    <View>
      <View style={styles.divider} />
      <View
        style={{
          position: "relative",
          width: "100%",
          minHeight: 44,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* Seta fixa à esquerda */}
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

        {/* Título centralizado na tela */}
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

      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}
