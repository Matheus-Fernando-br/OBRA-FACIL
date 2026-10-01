import { router, Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { AppHeader } from "@/components/layout/AppHeader";
import { useTheme } from "@/contexts/ThemeContext";

export default function TabsLayout() {
  const { styles, theme } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.title,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: styles.tabBar,
      }}
    >
      {/* TELA COM APP HEADER */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Início",

          header: () => (
            <AppHeader
              onMenu={() => {
                console.log("Menu");
              }}
            />
          ),

          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" color={color} size={size} />
          ),
        }}
      />

      {/* TELA COM APP HEADER */}
      <Tabs.Screen
        name="clientes"
        options={{
          title: "Clientes",

          header: () => (
            <AppHeader
              onMenu={() => {
                console.log("Menu");
              }}
            />
          ),

          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" color={color} size={size} />
          ),
        }}
      />

      {/* TELA COM APP HEADER */}
      <Tabs.Screen
        name="orcamentos"
        options={{
          title: "Orçamentos",

          header: () => <AppHeader />,

          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text" color={color} size={size} />
          ),
        }}
      />

      {/* TELA SEM APP HEADER */}
      <Tabs.Screen
        name="obras"
        options={{
          title: "Serviços",
          headerShown: false,

          tabBarIcon: ({ color, size }) => (
            <Ionicons name="hammer" color={color} size={size} />
          ),
        }}
      />

      {/* TELA COM APP HEADER */}
      <Tabs.Screen
        name="mais"
        options={{
          title: "Mais",

          header: () => <AppHeader />,

          tabBarIcon: ({ color, size }) => (
            <Ionicons name="menu" color={color} size={size} />
          ),
        }}
      />

      {/* TELAS INTERNAS */}

      <Tabs.Screen
        name="configuracoes"
        options={{
          href: null,
          headerShown: false,
        }}
      />

      <Tabs.Screen
        name="seguranca"
        options={{
          href: null,
          headerShown: false,
        }}
      />

      <Tabs.Screen
        name="relatorios"
        options={{
          href: null,
          headerShown: false,
        }}
      />

      <Tabs.Screen
        name="planos"
        options={{
          href: null,
          headerShown: false,
        }}
      />

      <Tabs.Screen
        name="notificacoes"
        options={{
          href: null,
          headerShown: false,
        }}
      />

      <Tabs.Screen
        name="ajuda"
        options={{
          href: null,
          headerShown: false,
        }}
      />

      <Tabs.Screen
        name="sobre"
        options={{
          href: null,
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
