import { ComponentProps, useEffect, useState } from "react";
import { LayoutChangeEvent, Pressable, Text, View } from "react-native";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useTheme } from "@/contexts/ThemeContext";

type TabBarProps = Parameters<
  NonNullable<ComponentProps<typeof Tabs>["tabBar"]>
>[0];

type IconName = keyof typeof Ionicons.glyphMap;

/* Abas visíveis — as demais telas do grupo (tabs) ficam ocultas. */
export const VISIBLE_TABS: Record<
  string,
  { label: string; icon: IconName; iconActive: IconName }
> = {
  index: { label: "Início", icon: "home-outline", iconActive: "home" },
  clientes: { label: "Clientes", icon: "people-outline", iconActive: "people" },
  orcamentos: {
    label: "Orçamentos",
    icon: "document-text-outline",
    iconActive: "document-text",
  },
  obras: { label: "Obras", icon: "construct-outline", iconActive: "construct" },
  mais: {
    label: "Mais",
    icon: "ellipsis-horizontal-circle-outline",
    iconActive: "ellipsis-horizontal-circle",
  },
};

const TAB_ORDER = Object.keys(VISIBLE_TABS);

/**
 * Barra de abas flutuante: cápsula com indicador que desliza entre as
 * abas e ícones que alternam entre contorno e preenchido.
 */
export function AppTabBar({ state, emitter, navigateToTab, insets }: TabBarProps) {
  const { styles, theme } = useTheme();
  const [barWidth, setBarWidth] = useState(0);

  const routes = state.routes.filter((r) => TAB_ORDER.includes(r.name));
  const activeName = state.routes[state.index]?.name;
  const activeIndex = routes.findIndex((r) => r.name === activeName);
  const itemWidth = routes.length ? (barWidth - 8) / routes.length : 0;

  const x = useSharedValue(0);

  useEffect(() => {
    if (activeIndex < 0 || !itemWidth) return;
    x.value = withSpring(activeIndex * itemWidth, {
      damping: 22,
      stiffness: 220,
      mass: 0.7,
    });
  }, [activeIndex, itemWidth, x]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
  }));

  return (
    <View
      style={[styles.tabBarWrap, { paddingBottom: Math.max(insets.bottom, 12) }]}
      pointerEvents="box-none"
    >
      <View
        style={styles.tabBar}
        onLayout={(e: LayoutChangeEvent) => setBarWidth(e.nativeEvent.layout.width)}
        accessibilityRole="tablist"
      >
        {activeIndex >= 0 && itemWidth > 0 && (
          <Animated.View
            style={[styles.tabBarIndicator, { width: itemWidth }, indicatorStyle]}
          />
        )}

        {routes.map((route) => {
          const config = VISIBLE_TABS[route.name];
          const focused = route.name === activeName;
          const color = focused ? theme.primary : theme.textSecondary;

          return (
            <Pressable
              key={route.key}
              style={styles.tabBarItem}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={config.label}
              onPress={() => {
                const event = emitter.emit({
                  type: "tabPress",
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!focused && !event.defaultPrevented) {
                  navigateToTab(route.key);
                }
              }}
            >
              <Ionicons
                name={focused ? config.iconActive : config.icon}
                size={22}
                color={color}
              />
              <Text style={[styles.tabBarLabel, { color }]} numberOfLines={1}>
                {config.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
