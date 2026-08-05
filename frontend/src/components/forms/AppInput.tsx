import { useState } from "react";
import { TextInput, TextInputProps } from "react-native";
import { COLORS } from "../../styles/globalStyles";

interface Props extends TextInputProps {}

export function AppInput({ editable = true, style, ...rest }: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <TextInput
      {...rest}
      editable={editable}
      placeholderTextColor={COLORS.placeholder}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={[
        {
          width: "100%",
          minHeight: 58,

          backgroundColor: editable ? COLORS.white : COLORS.border,

          color: editable ? COLORS.text : COLORS.placeholder,

          borderWidth: 1.2,

          borderColor: editable
            ? focused
              ? COLORS.primary
              : COLORS.border
            : COLORS.borderNull,

          borderRadius: 10,

          paddingHorizontal: 18,
          paddingVertical: 14,

          marginBottom: 16,

          shadowColor: editable ? COLORS.text : "transparent",
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
