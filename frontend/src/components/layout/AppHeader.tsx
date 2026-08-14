import { View, TouchableOpacity, Image } from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { NotificationModal } from "../modals/NotificationModal";
import { MenuModal } from "../modals/MenuModal";
import { COLORS, globalStyles } from "@/styles/globalStyles";

interface Props {
  onMenu?: () => void;
  onNotifications?: () => void;
}

export function AppHeader({ onMenu }: Props) {
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  return (
    <View
      style={{
        height: 80,
        backgroundColor: COLORS.white,
        paddingRight: 20,
        paddingLeft: 5,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      {/* Esquerda */}
      <TouchableOpacity
        onPress={() => {
          setMenuVisible(true);
          onMenu?.();
        }}
      >
        <Ionicons name="menu" size={35} color={COLORS.text} />
      </TouchableOpacity>

      {/* Centro */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Image
          source={require("../../assets/images/logo_titulo.png")}
          style={globalStyles.logoHeaderImg}
        />
      </View>

      {/* Direita */}
      <TouchableOpacity onPress={() => setNotificationVisible(true)}>
        <View>
          <Ionicons name="notifications" size={28} color={COLORS.text} />

          <View
            style={{
              position: "absolute",
              top: -2,
              right: -2,

              width: 10,
              height: 10,

              borderRadius: 20,

              backgroundColor: COLORS.title,
            }}
          />
        </View>
      </TouchableOpacity>
      {/* MODAL DO MENU */}
      <MenuModal
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onOptionPress={(option) => {
          console.log("Opção selecionada:", option);
        }}
      />

      {/* MODAL DE NOTIFICAÇÕES */}
      <NotificationModal
        visible={notificationVisible}
        onClose={() => setNotificationVisible(false)}
      />
    </View>
  );
}
