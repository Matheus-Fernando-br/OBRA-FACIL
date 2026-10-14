import { Tabs } from "expo-router";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppTabBar } from "@/components/layout/AppTabBar";
import { useTheme } from "@/contexts/ThemeContext";

/* Telas internas (abertas pelo menu / tela "Mais"): sem aba e sem header. */
const INTERNAL_SCREENS = [
  "configuracoes",
  "seguranca",
  "relatorios",
  "planos",
  "notificacoes",
  "ajuda",
  "sobre",
];

export default function TabsLayout() {
  const { theme } = useTheme();

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
          options={{ href: null, headerShown: false, animation: "fade" }}
        />
      ))}
    </Tabs>
  );
}
