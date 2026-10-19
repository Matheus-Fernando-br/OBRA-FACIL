import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  title: string;
  subtitle?: string;
}

/**
 * Cabeçalho das telas internas: "Voltar" no topo e título grande.
 * Volta para a tela anterior (histórico das abas) ou para "Ajustes".
 */
export function PageHeader({ title, subtitle }: Props) {
  const { styles, theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { token } = useAuth();

  function goBack() {
    if (router.canGoBack()) router.back();
    else router.navigate(token ? "/mais" : "/login");
  }

  return (
    <View
      style={{
        backgroundColor: theme.background,
        paddingTop: insets.top + 4,
        paddingHorizontal: 16,
        paddingBottom: 8,
      }}
    >
      <Pressable
        onPress={goBack}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="Voltar"
        style={({ pressed }) => ({
          flexDirection: "row",
          alignItems: "center",
          alignSelf: "flex-start",
          minHeight: 40,
          marginLeft: -6,
          opacity: pressed ? 0.5 : 1,
        })}
      >
        <Ionicons name="chevron-back" size={24} color={theme.primary} />
        <Text style={[styles.body, { color: theme.primary }]}>Voltar</Text>
      </Pressable>

      <Text style={styles.pageHeaderTitle} accessibilityRole="header">
        {title}
      </Text>
      {subtitle ? <Text style={styles.pageHeaderSubtitle}>{subtitle}</Text> : null}
    </View>
  );
}
