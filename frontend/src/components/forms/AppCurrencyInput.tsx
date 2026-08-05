import { useState } from "react";
import CurrencyInput from "react-native-currency-input";
import { COLORS } from "@/styles/globalStyles";
import { Color } from "expo-router";

interface Props {
  value: number | null;
  onChangeValue: (value: number | null) => void;
  editable?: boolean;
  placeholder?: string;
}

export function AppCurrencyInput({
  value,
  onChangeValue,
  editable = true,
  placeholder,
}: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <CurrencyInput
      value={value}
      onChangeValue={onChangeValue}
      editable={editable}
      placeholder={placeholder}
      placeholderTextColor={COLORS.placeholder}
      prefix="R$ "
      delimiter="."
      separator=","
      precision={2}
      keyboardType="numeric"
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
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
      }}
    />
  );
}
