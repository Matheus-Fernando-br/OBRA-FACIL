import { useTheme } from "@/contexts/ThemeContext";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Image,
  Pressable,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, globalStyles } from "@/styles/globalStyles";

interface Props {
  visible: boolean;
  onClose: () => void;
  onOptionPress?: (option: string) => void;
}

export function MenuModal({ visible, onClose, onOptionPress }: Props) {
  const { isDark, theme, toggleTheme } = useTheme();

  const handleOptionPress = (option: string) => {
    onOptionPress?.(option);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.45)",
        }}
      >
        {/* Área para fechar clicando fora */}
        <Pressable
          onPress={onClose}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        />
        <ScrollView>
          {/* MENU */}
          <View
            style={{
              width: 300,
              minHeight: "100%",
              backgroundColor: theme.white,
              paddingHorizontal: 20,
              paddingTop: 45,
              paddingBottom: 25,
              elevation: 10,
              shadowColor: COLORS.text,
              shadowOffset: {
                width: 2,
                height: 0,
              },
              shadowOpacity: 0.2,
              shadowRadius: 8,
            }}
          >
            {/* LOGO */}
            <View
              style={{
                alignItems: "center",
                marginBottom: 25,
              }}
            >
              <Image
                source={require("../../assets/images/logo_titulo.png")}
                style={{
                  width: 200,
                  height: 90,
                  resizeMode: "contain",
                }}
              />
            </View>

            {/* DIVISOR */}
            <View style={globalStyles.divider} />

            {/* OPÇÕES */}
            <View
              style={{
                marginTop: 15,
              }}
            >
              {/* OPÇÃO 1 */}
              <TouchableOpacity
                onPress={() => handleOptionPress("inicio")}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 16,
                }}
              >
                <Ionicons
                  name="home-outline"
                  size={23}
                  color={isDark ? COLORS.white : COLORS.text}
                />

                <Text
                  style={{
                    marginLeft: 15,
                    fontSize: 16,
                    color: isDark ? COLORS.white : COLORS.text,
                    fontWeight: "500",
                  }}
                >
                  Início
                </Text>
              </TouchableOpacity>

              {/* OPÇÃO 2 */}
              <TouchableOpacity
                onPress={() => handleOptionPress("clientes")}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 16,
                }}
              >
                <Ionicons
                  name="people-outline"
                  size={23}
                  color={isDark ? COLORS.white : COLORS.text}
                />

                <Text
                  style={{
                    marginLeft: 15,
                    fontSize: 16,
                    color: isDark ? COLORS.white : COLORS.text,
                    fontWeight: "500",
                  }}
                >
                  Clientes
                </Text>
              </TouchableOpacity>

              {/* OPÇÃO 3 */}
              <TouchableOpacity
                onPress={() => handleOptionPress("servicos")}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 16,
                }}
              >
                <Ionicons
                  name="construct-outline"
                  size={23}
                  color={isDark ? COLORS.white : COLORS.text}
                />

                <Text
                  style={{
                    marginLeft: 15,
                    fontSize: 16,
                    color: isDark ? COLORS.white : COLORS.text,
                    fontWeight: "500",
                  }}
                >
                  Serviços
                </Text>
              </TouchableOpacity>

              {/* OPÇÃO 4 */}
              <TouchableOpacity
                onPress={() => handleOptionPress("configuracoes")}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 16,
                }}
              >
                <Ionicons
                  name="settings-outline"
                  size={23}
                  color={isDark ? COLORS.white : COLORS.text}
                />

                <Text
                  style={{
                    marginLeft: 15,
                    fontSize: 16,
                    color: isDark ? COLORS.white : COLORS.text,
                    fontWeight: "500",
                  }}
                >
                  Configurações
                </Text>
              </TouchableOpacity>
            </View>

            {/* ESPAÇO */}
            <View style={{ flex: 1 }} />

            {/* DIVISOR */}
            <View style={globalStyles.divider} />

            {/* TEMA */}
            <TouchableOpacity
              onPress={toggleTheme}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingVertical: 16,
                paddingHorizontal: 12,
                borderRadius: 12,
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.06)"
                  : "rgba(0,0,0,0.04)",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Ionicons
                  name={isDark ? "moon" : "sunny"}
                  size={22}
                  color={theme.text}
                />

                <Text
                  style={{
                    marginLeft: 14,
                    fontSize: 15,
                    fontWeight: "600",
                    color: theme.text,
                  }}
                >
                  {isDark ? "Modo escuro" : "Modo claro"}
                </Text>
              </View>

              <Ionicons
                name="swap-horizontal"
                size={20}
                color={theme.textSecondary}
              />
            </TouchableOpacity>

            {/* FECHAR */}
            <TouchableOpacity
              onPress={onClose}
              style={{
                marginTop: 5,
                paddingVertical: 12,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: COLORS.danger,
                  fontSize: 14,
                  fontWeight: "600",
                }}
              >
                Fechar
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}
