import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { COLORS } from "@/styles/globalStyles";

interface Props {
  title: string;
  subtitle?: string;
}

export function PageHeader({
  title,
  subtitle,
}: Props) {
  return (
    <View
      style={{
        marginTop: 10,
        marginBottom: 25,
      }}
    >
      <Pressable
        onPress={() => router.replace("/(tabs)/mais")}
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 18,
        }}
      >
        <Ionicons
          name="arrow-back"
          size={24}
          color={COLORS.primary}
        />

        <Text
          style={{
            color: COLORS.primary,
            marginLeft: 8,
            fontWeight: "600",
            fontSize: 16,
          }}
        >
          Voltar
        </Text>
      </Pressable>

      <Text
        style={{
          color: COLORS.text,
          fontSize: 30,
          fontWeight: "700",
        }}
      >
        {title}
      </Text>

      {subtitle && (
        <Text
          style={{
            color: COLORS.textSecondary,
            marginTop: 6,
            fontSize: 15,
          }}
        >
          {subtitle}
        </Text>
      )}
    </View>
  );
}