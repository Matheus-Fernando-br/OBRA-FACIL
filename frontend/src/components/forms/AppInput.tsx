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
      placeholderTextColor="#94A3B8"
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={[
        {
          width: "100%",
          minHeight: 58,

          backgroundColor: editable ? COLORS.backgroundSection : "#D5D6DB",

          color: editable ? COLORS.text : "#575B69",

          borderWidth: 1.2,

          borderColor: editable
            ? focused
              ? COLORS.primary
              : "#D9E2EC"
            : "#D7DEE8",

          borderRadius: 10,

          paddingHorizontal: 18,
          paddingVertical: 14,

          marginBottom: 16,

          shadowColor: editable ? "#000" : "transparent",
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
