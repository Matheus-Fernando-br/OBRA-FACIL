import { useState } from "react";
import { Pressable, Text } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";
import { BottomSheetSelect } from "./BottomSheetSelect";

interface Props {
  title: string;

  value: string;

  options: string[];

  onChange: (value: string) => void;
}

export function SettingsSelect({ title, value, options, onChange }: Props) {
  const { theme } = useTheme();

  const [visible, setVisible] = useState(false);

  return (
    <>
      <Pressable
        style={{
          flexDirection: "row",

          alignItems: "center",
        }}
        onPress={() => setVisible(true)}
      >
        <Text
          style={{
            fontWeight: "700",

            color: theme.primary,

            marginRight: 8,
          }}
        >
          {value}
        </Text>

        <Ionicons name="chevron-down" size={18} color={theme.primary} />
      </Pressable>

      <BottomSheetSelect
        visible={visible}
        title={title}
        options={options}
        value={value}
        onClose={() => setVisible(false)}
        onSelect={onChange}
      />
    </>
  );
}
