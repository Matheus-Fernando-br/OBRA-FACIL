import { useState } from "react";
import { TextInput, TextInputProps } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";

interface Props extends TextInputProps {}

export function AppInput({ editable = true, style, ...rest }: Props) {
  const [focused, setFocused] = useState(false);
  const { theme } = useTheme();

  return (
    <TextInput
      {...rest}
      editable={editable}
      placeholderTextColor={theme.placeholder}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={[
        {
          width: "100%",
          minHeight: 58,

          backgroundColor: editable ? theme.white : theme.border,

          color: editable ? theme.text : theme.placeholder,

          borderWidth: 1.2,

          borderColor: editable
            ? focused
              ? theme.primary
              : theme.border
            : theme.borderNull,

          borderRadius: 10,

          paddingHorizontal: 18,
          paddingVertical: 14,

          marginBottom: 16,

          shadowColor: editable ? theme.text : "transparent",
          shadowOpacity: editable ? 0.08 : 0,
          shadowRadius: editable ? 4 : 0,
          shadowOffset: {
            width: 0,
            height: 2,
          },
          elevation: editable ? 2 : 0,
        },
        style,
      ]}
    />
  );
}
