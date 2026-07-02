import { View, Text } from "react-native";
import { ReactNode } from "react";

import { COLORS } from "@/styles/globalStyles";

interface Props {
  title: string;
  children?: ReactNode;
}

export function SettingsSection({
  title,
  children,
}: Props) {
  return (
    <View
      style={{
        marginTop: 28,
        marginBottom: 10,
      }}
    >
      <Text
        style={{
          color: COLORS.text,
          fontSize: 21,
          fontWeight: "700",
          marginBottom: 12,
        }}
      >
        {title}
      </Text>

      {children}
    </View>
  );
}