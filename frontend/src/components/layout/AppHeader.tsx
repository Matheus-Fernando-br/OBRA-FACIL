import { View } from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NotificationModal } from "../modals/NotificationModal";
import { MenuModal } from "../modals/MenuModal";
import { PressableScale } from "@/components/ui/PressableScale";
import { BrandMark } from "@/components/ui/BrandMark";
import { useTheme } from "@/contexts/ThemeContext";

/** Barra superior das abas: menu lateral · marca · notificações. */
export function AppHeader() {
  const { styles, theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <View style={[styles.appHeader, { paddingTop: insets.top + 6 }]}>
      <PressableScale
        onPress={() => setMenuVisible(true)}
        style={styles.appHeaderButton}
        accessibilityLabel="Abrir menu"
        activeScale={0.9}
      >
        <Ionicons name="menu" size={20} color={theme.text} />
      </PressableScale>

      <BrandMark size={28} />

      <PressableScale
        onPress={() => setNotificationVisible(true)}
        style={styles.appHeaderButton}
        accessibilityLabel="Notificações"
        activeScale={0.9}
      >
        <Ionicons name="notifications-outline" size={19} color={theme.text} />
      </PressableScale>

      <MenuModal visible={menuVisible} onClose={() => setMenuVisible(false)} />

      <NotificationModal
        visible={notificationVisible}
        onClose={() => setNotificationVisible(false)}
      />
    </View>
  );
}
