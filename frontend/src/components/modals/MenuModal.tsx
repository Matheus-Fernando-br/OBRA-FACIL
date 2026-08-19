import { useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Image,
  Pressable,
  ScrollView,
  Animated,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { COLORS, globalStyles } from "@/styles/globalStyles";

interface Props {
  visible: boolean;
  onClose: () => void;
  onOptionPress?: (option: string) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const MENU_WIDTH = Math.min(320, SCREEN_WIDTH * 0.82);

export function MenuModal({ visible, onClose, onOptionPress }: Props) {
  const { isDark, theme, toggleTheme } = useTheme();

  const { user } = useAuth();

  const slideAnim = useRef(new Animated.Value(-MENU_WIDTH)).current;

  const overlayAnim = useRef(new Animated.Value(0)).current;

  /*
   * ABRIR MENU
   */
  useEffect(() => {
    if (!visible) return;

    slideAnim.setValue(-MENU_WIDTH);
    overlayAnim.setValue(0);

    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 24,
        stiffness: 180,
        mass: 0.8,
      }),

      Animated.timing(overlayAnim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible]);

  /*
   * FECHAR MENU
   */
  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -MENU_WIDTH,
        duration: 220,
        useNativeDriver: true,
      }),

      Animated.timing(overlayAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        onClose();
      }
    });
  };

  /*
   * OPÇÃO DO MENU
   */
  const handleOptionPress = (option: string) => {
    onOptionPress?.(option);

    handleClose();
  };

  const menuTextColor = theme.text;

  const menuSecondaryColor = theme.textSecondary ?? COLORS.textSecondary;

  const iconColor = theme.text;

  /*
   * ITEM DO MENU
   */
  const renderMenuItem = (
    option: string,
    icon: keyof typeof Ionicons.glyphMap,
    label: string,
    subtitle?: string,
  ) => {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => handleOptionPress(option)}
        style={globalStyles.menuItem}
      >
        <View
          style={[
            globalStyles.menuIcon,
            {
              backgroundColor: isDark
                ? "rgba(255,255,255,0.07)"
                : "rgba(0,0,0,0.045)",
            },
          ]}
        >
          <Ionicons name={icon} size={21} color={iconColor} />
        </View>

        <View style={globalStyles.menuItemContent}>
          <Text
            style={[
              globalStyles.menuItemText,
              {
                color: menuTextColor,
              },
            ]}
          >
            {label}
          </Text>

          {subtitle && (
            <Text
              style={[
                globalStyles.menuItemSubtitle,
                {
                  color: menuSecondaryColor,
                },
              ]}
            >
              {subtitle}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  /*
   * TÍTULO DA SEÇÃO
   */
  const renderSectionTitle = (title: string) => {
    return (
      <Text
        style={[
          globalStyles.menuSectionTitle,
          {
            color: menuSecondaryColor,
          },
        ]}
      >
        {title}
      </Text>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View style={globalStyles.menuContainer}>
        {/* FUNDO ESCURO */}

        <Animated.View
          style={[
            globalStyles.menuOverlay,
            {
              opacity: overlayAnim,
            },
          ]}
        >
          <Pressable
            style={{
              flex: 1,
            }}
            onPress={handleClose}
          />
        </Animated.View>

        {/* MENU */}

        <Animated.View
          style={[
            globalStyles.menu,
            {
              width: MENU_WIDTH,
              backgroundColor: theme.white,
              transform: [
                {
                  translateX: slideAnim,
                },
              ],
            },
          ]}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={globalStyles.menuScroll}
            bounces={false}
          >
            {/* ============================== */}
            {/* CABEÇALHO */}
            {/* ============================== */}

            <View style={globalStyles.menuHeader}>
              {/* X */}

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleClose}
                style={[
                  globalStyles.menuCloseButton,
                  {
                    backgroundColor: isDark
                      ? "rgba(255,255,255,0.07)"
                      : "rgba(0,0,0,0.045)",
                  },
                ]}
              >
                <Ionicons name="close" size={23} color={menuTextColor} />
              </TouchableOpacity>

              {/* LOGO */}

              <Image
                source={require("../../assets/images/logo_titulo.png")}
                style={globalStyles.menuLogo}
              />

              {/* USUÁRIO */}

              <View style={globalStyles.menuUserInfo}>
                <Text
                  style={[
                    globalStyles.menuUserName,
                    {
                      color: menuTextColor,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {user?.nome || "Usuário"}
                </Text>

                <View style={globalStyles.menuUserRole}>
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={14}
                    color={menuSecondaryColor}
                  />

                  <Text
                    style={[
                      globalStyles.menuUserRoleText,
                      {
                        color: menuSecondaryColor,
                      },
                    ]}
                  >
                    Administrador
                  </Text>
                </View>
              </View>
            </View>

            {/* DIVISOR */}

            <View
              style={[
                globalStyles.menuDivider,
                {
                  backgroundColor: isDark
                    ? "rgba(255,255,255,0.10)"
                    : "rgba(0,0,0,0.08)",
                },
              ]}
            />

            {/* ============================== */}
            {/* PRINCIPAL */}
            {/* ============================== */}

            <View style={globalStyles.menuSection}>
              {renderSectionTitle("PRINCIPAL")}

              {renderMenuItem("inicio", "home-outline", "Início")}

              {renderMenuItem("clientes", "people-outline", "Clientes")}

              {renderMenuItem("obras", "business-outline", "Obras")}

              {renderMenuItem(
                "orcamentos",
                "document-text-outline",
                "Orçamentos",
              )}

              {renderMenuItem("servicos", "construct-outline", "Serviços")}
            </View>

            {/* ============================== */}
            {/* GESTÃO */}
            {/* ============================== */}

            <View style={globalStyles.menuSection}>
              {renderSectionTitle("GESTÃO")}

              {renderMenuItem("relatorios", "bar-chart-outline", "Relatórios")}

              {renderMenuItem(
                "documentos",
                "document-attach-outline",
                "Documentos / PDFs",
              )}

              {renderMenuItem("materiais", "cube-outline", "Materiais")}

              {renderMenuItem("financeiro", "wallet-outline", "Financeiro")}
            </View>

            {/* ============================== */}
            {/* SISTEMA */}
            {/* ============================== */}

            <View style={globalStyles.menuSection}>
              {renderSectionTitle("SISTEMA")}

              {renderMenuItem(
                "configuracoes",
                "settings-outline",
                "Configurações",
              )}

              {/* APARÊNCIA */}

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={toggleTheme}
                style={globalStyles.menuItem}
              >
                <View
                  style={[
                    globalStyles.menuIcon,
                    {
                      backgroundColor: isDark
                        ? "rgba(255,255,255,0.07)"
                        : "rgba(0,0,0,0.045)",
                    },
                  ]}
                >
                  <Ionicons
                    name={isDark ? "moon-outline" : "sunny-outline"}
                    size={21}
                    color={iconColor}
                  />
                </View>

                <View style={globalStyles.menuItemContent}>
                  <Text
                    style={[
                      globalStyles.menuItemText,
                      {
                        color: menuTextColor,
                      },
                    ]}
                  >
                    Aparência
                  </Text>

                  <Text
                    style={[
                      globalStyles.menuItemSubtitle,
                      {
                        color: menuSecondaryColor,
                      },
                    ]}
                  >
                    {isDark ? "Modo escuro" : "Modo claro"}
                  </Text>
                </View>

                <Ionicons
                  name="swap-horizontal-outline"
                  size={19}
                  color={menuSecondaryColor}
                />
              </TouchableOpacity>
            </View>

            {/* ============================== */}
            {/* OUTROS */}
            {/* ============================== */}

            <View style={globalStyles.menuSection}>
              {renderSectionTitle("OUTROS")}

              {renderMenuItem(
                "ajuda",
                "help-circle-outline",
                "Ajuda / Suporte",
              )}

              {renderMenuItem(
                "sobre",
                "information-circle-outline",
                "Sobre o Obra Fácil",
              )}
            </View>

            {/* ============================== */}
            {/* RODAPÉ */}
            {/* ============================== */}

            <View style={globalStyles.menuFooter}>
              <View
                style={[
                  globalStyles.menuFooterDivider,
                  {
                    backgroundColor: isDark
                      ? "rgba(255,255,255,0.10)"
                      : "rgba(0,0,0,0.08)",
                  },
                ]}
              />

              <Text
                style={[
                  globalStyles.menuFooterText,
                  {
                    color: menuSecondaryColor,
                  },
                ]}
              >
                Obra Fácil
              </Text>

              <Text
                style={[
                  globalStyles.menuVersionText,
                  {
                    color: menuSecondaryColor,
                  },
                ]}
              >
                Versão 1.0.0
              </Text>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}
