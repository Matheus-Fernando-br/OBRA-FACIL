import { useEffect, useRef, useState } from "react";
import { Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { SlideInUp, SlideOutUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { onNetworkError } from "@/services/networkEvents";
import { useTheme } from "@/contexts/ThemeContext";

/** Faixa no topo quando uma requisição falha por falta de conexão. */
export function ConnectionBanner() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return onNetworkError(() => {
      setVisible(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setVisible(false), 5000);
    });
  }, []);

  if (!visible) return null;

  return (
    <Animated.View
      entering={SlideInUp.duration(250)}
      exiting={SlideOutUp.duration(200)}
      accessibilityLiveRegion="polite"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        paddingTop: insets.top + 8,
        paddingBottom: 10,
        paddingHorizontal: 16,
        backgroundColor: theme.danger,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
      }}
    >
      <Ionicons name="cloud-offline-outline" size={18} color="#FFFFFF" />
      <Text style={{ color: "#FFFFFF", fontWeight: "600", fontSize: 13, flex: 1 }}>
        Sem conexão com o servidor. Verifique sua internet e tente novamente.
      </Text>
    </Animated.View>
  );
}
