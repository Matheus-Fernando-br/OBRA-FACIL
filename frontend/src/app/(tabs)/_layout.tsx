import { Redirect, Tabs } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppTabBar } from "@/components/layout/AppTabBar";
import { useTheme } from "@/contexts/ThemeContext";
import { pageTitle } from "@/config/brand";

/*
 * Telas internas (abertas pelo menu / tela "Mais"): sem header e fora da
 * barra — a AppTabBar só desenha as abas de VISIBLE_TABS. Não use
 * `href: null`: no expo-router 58 isso esconde a rota e redireciona
 * para a primeira aba.
 */
const INTERNAL_SCREENS: [string, string][] = [
  ["configuracoes", "Configurações"],
  ["seguranca", "Segurança"],
  ["relatorios", "Relatórios"],
  ["planos", "Planos"],
  ["catalogo", "Catálogo"],
  ["notificacoes", "Notificações"],
  ["ajuda", "Ajuda"],
  ["sobre", "Sobre"],
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
      {/* title = título da aba do navegador no site; os rótulos da barra ficam na AppTabBar. */}
      <Tabs.Screen name="index" options={{ title: pageTitle("Início") }} />
      <Tabs.Screen name="clientes" options={{ title: pageTitle("Clientes") }} />
      <Tabs.Screen name="orcamentos" options={{ title: pageTitle("Orçamentos") }} />
      <Tabs.Screen name="obras" options={{ title: pageTitle("Obras") }} />
      <Tabs.Screen name="mais" options={{ title: pageTitle("Mais") }} />

      {INTERNAL_SCREENS.map(([name, title]) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{ headerShown: false, animation: "fade", title: pageTitle(title) }}
        />
      ))}
    </Tabs>
  );
}
