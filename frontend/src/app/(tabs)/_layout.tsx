import { Redirect, Tabs } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppTabBar } from "@/components/layout/AppTabBar";
import { useTheme } from "@/contexts/ThemeContext";

/*
 * Telas internas (abertas pelo menu / tela "Mais"): sem header e fora da
 * barra — a AppTabBar só desenha as abas de VISIBLE_TABS. Não use
 * `href: null`: no expo-router 58 isso esconde a rota e redireciona
 * para a primeira aba.
 */
const INTERNAL_SCREENS = [
  "configuracoes",
  "seguranca",
  "relatorios",
  "planos",
  "catalogo",
  "notificacoes",
  "ajuda",
  "sobre",
];

export default function TabsLayout() {
  const { theme } = useTheme();
  const { token, initializing } = useAuth();

  // Sem sessão (logout, sessão expirada, conta excluída): volta ao login.
  if (!initializing && !token) return <Redirect href="/login" />;

  return (
    <Tabs
      tabBar={(props) => <AppTabBar {...props} />}
      backBehavior="history"
      screenOptions={{
        header: () => <AppHeader />,
        animation: "shift",
        sceneStyle: { backgroundColor: theme.background },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Início" }} />
      <Tabs.Screen name="clientes" options={{ title: "Clientes" }} />
      <Tabs.Screen name="orcamentos" options={{ title: "Orçamentos" }} />
      <Tabs.Screen name="obras" options={{ title: "Obras" }} />
      <Tabs.Screen name="mais" options={{ title: "Mais" }} />

      {INTERNAL_SCREENS.map((name) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{ headerShown: false, animation: "fade" }}
        />
      ))}
    </Tabs>
  );
}
