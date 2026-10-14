import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";

/*
 * Tipografia: o app usa a fonte do sistema (San Francisco no iOS,
 * Roboto no Android) com a escala definida em TYPE (globalStyles).
 * Isso dispensa o download de fontes na inicialização.
 */

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
        <Stack.Screen name="cadastro" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <RootStack />
      </ThemeProvider>
    </AuthProvider>
  );
}
