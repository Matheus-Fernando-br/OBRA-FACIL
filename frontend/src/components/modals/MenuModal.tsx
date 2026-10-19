import { useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  ScrollView,
  Animated,
  Easing,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar } from "@/components/ui/Avatar";
import { BrandMark } from "@/components/ui/BrandMark";
import { APP_VERSION } from "@/utils/appInfo";

interface Props {
  visible: boolean;
  onClose: () => void;
}

type IconName = keyof typeof Ionicons.glyphMap;

interface MenuEntry {
  label: string;
  icon: IconName;
  /** Sem rota = recurso ainda não disponível ("Em breve"). */
  route?: string;
  /** Prefixo usado para destacar a tela ativa. */
  match?: string;
  subtitle?: string;
}

const SECTIONS: { title: string; items: MenuEntry[] }[] = [
  {
    title: "Principal",
    items: [
      { label: "Início", icon: "home-outline", route: "/(tabs)", match: "/" },
      { label: "Clientes", icon: "people-outline", route: "/clientes", match: "/clientes" },
      {
        label: "Orçamentos",
        icon: "document-text-outline",
        route: "/orcamentos",
        match: "/orcamentos",
      },
      { label: "Obras", icon: "construct-outline", route: "/obras", match: "/obras" },
    ],
  },
  {
    title: "Gestão",
    items: [
      {
        label: "Relatórios e PDFs",
        icon: "bar-chart-outline",
        route: "/relatorios",
        match: "/relatorios",
        subtitle: "Exportar dados e documentos",
      },
      { label: "Materiais", icon: "cube-outline" },
      { label: "Financeiro", icon: "wallet-outline" },
    ],
  },
  {
    title: "Conta",
    items: [
      {
        label: "Configurações",
        icon: "settings-outline",
        route: "/configuracoes",
        match: "/configuracoes",
      },
      {
        label: "Planos e assinatura",
        icon: "card-outline",
        route: "/planos",
        match: "/planos",
      },
      { label: "Ajuda e suporte", icon: "help-circle-outline", route: "/ajuda", match: "/ajuda" },
      {
        label: "Sobre o Obra Fácil",
        icon: "information-circle-outline",
        route: "/sobre",
        match: "/sobre",
      },
    ],
  },
];

/**
 * Menu lateral: desliza da esquerda com mola, destaca a tela atual e
 * permite alternar o tema sem sair do fluxo.
 */
export function MenuModal({ visible, onClose }: Props) {
  const { isDark, theme, styles, setTheme } = useTheme();
  const { user } = useAuth();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const menuWidth = Math.min(340, width * 0.84);

  const slide = useRef(new Animated.Value(-menuWidth)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;

    slide.setValue(-menuWidth);
    fade.setValue(0);

    Animated.parallel([
      Animated.spring(slide, {
        toValue: 0,
        useNativeDriver: true,
        damping: 26,
        stiffness: 220,
        mass: 0.9,
      }),
      Animated.timing(fade, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible, menuWidth, slide, fade]);

  function close(after?: () => void) {
    Animated.parallel([
      Animated.timing(slide, {
        toValue: -menuWidth,
        duration: 200,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(fade, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
      after?.();
    });
  }

  function isActive(entry: MenuEntry) {
    if (!entry.match) return false;
    if (entry.match === "/") return pathname === "/" || pathname === "/index";
    return pathname.startsWith(entry.match);
  }

  function renderItem(entry: MenuEntry) {
    const active = isActive(entry);
    const available = Boolean(entry.route);
    const tint = active ? theme.primary : theme.text;

    return (
      <Pressable
        key={entry.label}
        disabled={!available}
        accessibilityRole="button"
        accessibilityState={{ selected: active, disabled: !available }}
        onPress={() =>
          close(() => {
            if (!active && entry.route) router.navigate(entry.route as any);
          })
        }
        style={({ pressed }) => [
          styles.menuItem,
          active && styles.menuItemActive,
          pressed && !active && { backgroundColor: theme.surfaceMuted },
          !available && { opacity: 0.55 },
        ]}
      >
        <View style={styles.menuIcon}>
          <Ionicons name={entry.icon} size={18} color={tint} />
        </View>

        <View style={styles.menuItemContent}>
          <Text style={[styles.menuItemText, active && styles.menuItemTextActive]}>
            {entry.label}
          </Text>
          {entry.subtitle && (
            <Text style={styles.menuItemSubtitle}>{entry.subtitle}</Text>
          )}
        </View>

        {!available ? (
          <View style={styles.menuSoonBadge}>
            <Text style={styles.menuSoonBadgeText}>EM BREVE</Text>
          </View>
        ) : (
          !active && (
            <Ionicons name="chevron-forward" size={16} color={theme.placeholder} />
          )
        )}
      </Pressable>
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={() => close()}
      statusBarTranslucent
    >
      <View style={styles.menuContainer}>
        <Animated.View style={[styles.menuOverlay, { opacity: fade }]}>
          <Pressable
            style={{ flex: 1 }}
            onPress={() => close()}
            accessibilityLabel="Fechar menu"
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.menu,
            { width: menuWidth, transform: [{ translateX: slide }] },
          ]}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.menuScroll,
              { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 },
            ]}
            bounces={false}
          >
            <View style={styles.menuHeader}>
              <BrandMark size={30} />
              <Pressable
                onPress={() => close()}
                style={styles.menuCloseButton}
                accessibilityLabel="Fechar menu"
                hitSlop={8}
              >
                <Ionicons name="close" size={18} color={theme.text} />
              </Pressable>
            </View>

            <Pressable
              style={styles.menuUserCard}
              onPress={() =>
                close(() => {
                  if (!pathname.startsWith("/mais")) router.navigate("/mais");
                })
              }
              accessibilityLabel="Ver perfil"
            >
              <Avatar name={user?.nome} size={42} />
              <View style={{ flex: 1 }}>
                <Text style={styles.menuUserName} numberOfLines={1}>
                  {user?.nome || "Usuário"}
                </Text>
                <Text style={styles.menuUserRoleText} numberOfLines={1}>
                  {user?.email || "Conta Obra Fácil"}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={theme.placeholder} />
            </Pressable>

            {SECTIONS.map((section) => (
              <View key={section.title} style={styles.menuSection}>
                <Text style={styles.menuSectionTitle}>{section.title}</Text>
                {section.items.map(renderItem)}
              </View>
            ))}

            <View style={styles.menuSection}>
              <Text style={styles.menuSectionTitle}>Aparência</Text>
              <View style={styles.themeSegment} accessibilityRole="radiogroup">
                {(
                  [
                    { mode: "light", label: "Claro", icon: "sunny-outline" },
                    { mode: "dark", label: "Escuro", icon: "moon-outline" },
                  ] as const
                ).map((option) => {
                  const selected = (option.mode === "dark") === isDark;
                  return (
                    <Pressable
                      key={option.mode}
                      onPress={() => setTheme(option.mode)}
                      accessibilityRole="radio"
                      accessibilityState={{ selected }}
                      style={[
                        styles.themeSegmentItem,
                        selected && styles.themeSegmentItemActive,
                      ]}
                    >
                      <Ionicons
                        name={option.icon}
                        size={15}
                        color={selected ? theme.text : theme.textSecondary}
                      />
                      <Text
                        style={[
                          styles.themeSegmentText,
                          selected && styles.themeSegmentTextActive,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.menuFooter}>
              <Text style={styles.menuFooterText}>Obra Fácil</Text>
              <Text style={styles.menuVersionText}>Versão {APP_VERSION}</Text>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}
