import { useState } from "react";
import CurrencyInput from "react-native-currency-input";
import { useTheme } from "@/contexts/ThemeContext";

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
  const { theme, styles } = useTheme();

  return (
    <CurrencyInput
      value={value}
      onChangeValue={onChangeValue}
      editable={editable}
      placeholder={placeholder}
      placeholderTextColor={theme.placeholder}
      prefix="R$ "
      delimiter="."
      separator=","
      precision={2}
      keyboardType="numeric"
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={[
        styles.appInput,
        editable ? styles.fieldEditable : styles.fieldReadOnly,
        editable && focused && { borderColor: theme.primary },
      ]}
    />
  );
}
