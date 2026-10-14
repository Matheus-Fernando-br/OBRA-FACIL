import { useState } from "react";
import { TextInput, TextInputProps } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";

interface Props extends TextInputProps {}

/**
 * Campo de texto padrão do app: preenchido (estilo iOS), com borda de
 * acento apenas quando focado. Campos somente-leitura ficam sem fundo,
 * para que a leitura de detalhes seja limpa.
 */
export function AppInput({ editable = true, style, onFocus, onBlur, ...rest }: Props) {
  const [focused, setFocused] = useState(false);
  const { theme, styles } = useTheme();

  return (
    <TextInput
      {...rest}
      editable={editable}
      placeholderTextColor={theme.placeholder}
      selectionColor={theme.primary}
      onFocus={(e) => {
        setFocused(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        onBlur?.(e);
      }}
      style={[
        styles.appInput,
        {
          backgroundColor: editable ? theme.surfaceMuted : "transparent",
          color: editable ? theme.text : theme.textSecondary,
          borderColor: editable && focused ? theme.primary : editable ? "transparent" : theme.border,
        },
        style,
      ]}
    />
  );
}
