import { View, Text, TouchableOpacity } from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { NotificationModal } from "../modals/NotificationModal";
import { COLORS } from "@/styles/globalStyles";

interface Props {
  onMenu?: () => void;
  onNotifications?: () => void;
}

export function AppHeader({ onMenu }: Props) {
  const [notificationVisible, setNotificationVisible] = useState(false);
  return (
    <View
      style={{
        height: 80,
        backgroundColor: COLORS.background,
        paddingRight: 20,
        paddingLeft: 5,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      {/* Esquerda */}

      <TouchableOpacity onPress={onMenu}>
        <Ionicons name="menu" size={35} color={COLORS.text} />
      </TouchableOpacity>

      {/* Centro */}

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Ionicons name="construct" size={24} color={COLORS.primary} />

        <Text
          style={{
            color: COLORS.text,
            fontSize: 22,
            fontWeight: "800",
            marginLeft: 8,
          }}
        >
          OBRAfácil
        </Text>
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
      <NotificationModal
        visible={notificationVisible}
        onClose={() => setNotificationVisible(false)}
      />
    </View>
  );
}
