import { Stack, type ErrorBoundaryProps } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, Text, View } from "react-native";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { ConnectionBanner } from "@/components/layout/ConnectionBanner";
import { COLORS } from "@/styles/globalStyles";

/*
 * Tipografia: o app usa a fonte do sistema (San Francisco no iOS,
 * Roboto no Android) com a escala definida em TYPE (globalStyles).
 * Isso dispensa o download de fontes na inicialização.
 */

// Em produção (build da loja), os console.log não são exibidos: evita
// vazar dados de erros da API e melhora o desempenho.
if (!__DEV__) {
  console.log = () => {};
  console.debug = () => {};
  console.info = () => {};
}

/** Tela exibida se algum erro inesperado derrubar uma tela. */
export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  if (__DEV__) console.warn(error);

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
        backgroundColor: COLORS.background,
      }}
    >
      <Text style={{ fontSize: 22, fontWeight: "700", color: COLORS.text, textAlign: "center" }}>
        Algo deu errado
      </Text>
      <Text
        style={{
          fontSize: 15,
          color: COLORS.textSecondary,
          textAlign: "center",
          marginTop: 8,
          lineHeight: 21,
        }}
      >
        Não se preocupe, seus dados estão salvos. Tente novamente; se o problema
        continuar, fale com o suporte.
      </Text>
      <Pressable
        onPress={retry}
        accessibilityRole="button"
        style={{
          marginTop: 24,
          backgroundColor: COLORS.primary,
          paddingHorizontal: 28,
          paddingVertical: 14,
          borderRadius: 14,
        }}
      >
        <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 16 }}>Tentar novamente</Text>
      </Pressable>
    </View>
  );
}

function RootStack() {
  const { isDark, theme } = useTheme();

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade",
          contentStyle: { backgroundColor: theme.background },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="cadastro" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="senha" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="legal" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="(tabs)" />
      </Stack>
      <ConnectionBanner />
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <SubscriptionProvider>
          <RootStack />
        </SubscriptionProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
