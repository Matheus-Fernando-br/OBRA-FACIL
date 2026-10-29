import { useState } from "react";
import { TextInput, TextInputProps, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";

interface Props extends TextInputProps {}

/**
 * Campo de texto padrão. Dois estados bem diferentes (claro e escuro):
 * - editável: caixa clara com borda (borda de acento ao focar);
 * - somente leitura: faixa cinza sem borda, texto secundário e cadeado.
 * Cores em theme.field*, tamanhos em styles.appInput (globalStyles).
 */
export function AppInput({ editable = true, style, onFocus, onBlur, ...rest }: Props) {
  const [focused, setFocused] = useState(false);
  const { theme, styles } = useTheme();

  const input = (
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
        editable ? styles.fieldEditable : [styles.fieldReadOnly, { paddingRight: 40 }],
        editable && focused && { borderColor: theme.primary },
        style,
      ]}
    />
  );

  if (editable) return input;

  return (
    <View style={{ position: "relative", width: "100%" }} accessibilityHint="Somente leitura">
      {input}
      <Ionicons name="lock-closed" size={14} color={theme.fieldReadOnlyText} style={styles.fieldLockIcon} pointerEvents="none" />
    </View>
  );
}
