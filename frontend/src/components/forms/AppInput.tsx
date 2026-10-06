import { useState } from "react";
import { TextInput, TextInputProps } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";

interface Props extends TextInputProps {}

export function AppInput({ editable = true, style, ...rest }: Props) {
  const [focused, setFocused] = useState(false);
  const { theme, styles } = useTheme();

  return (
    <TextInput
      {...rest}
      editable={editable}
      placeholderTextColor={theme.placeholder}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={[
        styles.appInput,
        {
          backgroundColor: editable ? theme.white : theme.border,
          color: editable ? theme.text : theme.placeholder,
          borderColor: editable
            ? focused
              ? theme.primary
              : theme.border
            : theme.borderNull,
          shadowColor: editable ? theme.text : "transparent",
          shadowOpacity: editable ? 0.08 : 0,
          elevation: editable ? 2 : 0,
        },
        style,
      ]}
    />
  );
}
