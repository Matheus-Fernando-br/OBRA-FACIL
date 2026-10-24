import { Pressable, Text } from "react-native";
import { router } from "expo-router";
import { Checkbox } from "expo-checkbox";
import { useTheme } from "@/contexts/ThemeContext";

interface Props {
  value: boolean;
  onChange(value: boolean): void;
}

/** "Li e aceito os Termos de Uso e a Política de Privacidade" (obrigatório no cadastro). */
export function TermsCheckbox({ value, onChange }: Props) {
  const { styles, theme } = useTheme();

  return (
    <Pressable
      onPress={() => onChange(!value)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: value }}
      style={{ flexDirection: "row", gap: 12, alignItems: "flex-start", marginTop: 4, marginBottom: 8 }}
    >
      <Checkbox
        value={value}
        onValueChange={onChange}
        color={value ? theme.primary : undefined}
        style={styles.checkbox}
      />
      <Text style={[styles.menuCardDescription, { flex: 1, fontSize: 14, lineHeight: 20 }]}>
        Li e aceito os{" "}
        <Text
          style={{ color: theme.primary, fontWeight: "700" }}
          onPress={() => router.push({ pathname: "/legal", params: { doc: "termos" } })}
        >
          Termos de Uso
        </Text>{" "}
        e a{" "}
        <Text
          style={{ color: theme.primary, fontWeight: "700" }}
          onPress={() => router.push({ pathname: "/legal", params: { doc: "privacidade" } })}
        >
          Política de Privacidade
        </Text>
        .
      </Text>
    </Pressable>
  );
}
