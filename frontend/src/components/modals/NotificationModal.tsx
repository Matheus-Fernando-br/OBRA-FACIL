import {
  Modal,
  View,
  Text,
  Pressable,
  ScrollView,
  Alert,
  Animated,
  Dimensions,
} from "react-native";

import { useEffect, useMemo, useRef, useState } from "react";

import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { COLORS, globalStyles } from "@/styles/globalStyles";

import { Notification, notificationsMock } from "@/data/notifications";

import { NotificationCard } from "@/components/cards/NotificationCard";

import { useTheme } from "@/contexts/ThemeContext";

interface Props {
  visible: boolean;
  onClose: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const NOTIFICATION_WIDTH = Math.min(390, SCREEN_WIDTH * 0.86);

export function NotificationModal({ visible, onClose }: Props) {
  const { isDark, theme } = useTheme();

  const [notifications, setNotifications] =
    useState<Notification[]>(notificationsMock);

  const slideAnim = useRef(new Animated.Value(NOTIFICATION_WIDTH)).current;

  const overlayAnim = useRef(new Animated.Value(0)).current;

  /*
   * QUANTIDADE DE NÃO LIDAS
   */
  const unreadCount = useMemo(() => {
    return notifications.filter((item) => !item.read).length;
  }, [notifications]);

  /*
   * AGRUPAMENTO
   */
  const grouped = useMemo(() => {
    return {
      Hoje: notifications.filter((n) => n.date === "Hoje"),

      Ontem: notifications.filter((n) => n.date === "Ontem"),

      "Esta semana": notifications.filter((n) => n.date === "Esta semana"),
    };
  }, [notifications]);

  /*
   * ABRIR
   */
  useEffect(() => {
    if (!visible) return;

    slideAnim.setValue(NOTIFICATION_WIDTH);

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
   * FECHAR
   */
  function handleClose() {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: NOTIFICATION_WIDTH,
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
  }

  /*
   * ABRIR NOTIFICAÇÃO
   */
  function openNotification(notification: Notification) {
    setNotifications((old) =>
      old.map((item) =>
        item.id === notification.id
          ? {
              ...item,
              read: true,
            }
          : item,
      ),
    );

    handleClose();

    setTimeout(() => {
      router.push(notification.route as any);
    }, 230);
  }

  /*
   * REMOVER
   */
  function removeNotification(id: string) {
    setNotifications((old) => old.filter((item) => item.id !== id));
  }

  /*
   * LIMPAR TODAS
   */
  function clearAll() {
    Alert.alert(
      "Limpar notificações",
      "Deseja remover todas as notificações?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Limpar",
          style: "destructive",
          onPress: () => setNotifications([]),
        },
      ],
    );
  }

  /*
   * LER TODAS
   */
  function readAll() {
    if (unreadCount === 0) return;

    setNotifications((old) =>
      old.map((item) => ({
        ...item,
        read: true,
      })),
    );
  }

  const textColor = theme.text;

  const secondaryColor = theme.textSecondary ?? COLORS.textSecondary;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View style={globalStyles.notificationModalContainer}>
        {/* ================================= */}
        {/* FUNDO ESCURO */}
        {/* ================================= */}

        <Animated.View
          style={[
            globalStyles.notificationModalOverlay,
            {
              opacity: overlayAnim,
            },
          ]}
        >
          <Pressable style={{ flex: 1 }} onPress={handleClose} />
        </Animated.View>

        {/* ================================= */}
        {/* PAINEL */}
        {/* ================================= */}

        <Animated.View
          style={[
            globalStyles.notificationModal,
            {
              width: NOTIFICATION_WIDTH,
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
            contentContainerStyle={globalStyles.notificationModalScroll}
            bounces={false}
          >
            {/* ================================= */}
            {/* HEADER */}
            {/* ================================= */}

            <View style={globalStyles.notificationHeader}>
              {/* ÍCONE */}

              <View
                style={[
                  globalStyles.notificationHeaderIcon,
                  {
                    backgroundColor: isDark
                      ? "rgba(255,255,255,0.08)"
                      : "rgba(0,0,0,0.05)",
                  },
                ]}
              >
                <Ionicons
                  name="notifications"
                  size={23}
                  color={COLORS.primary}
                />
              </View>

              {/* TÍTULO */}

              <View style={globalStyles.notificationHeaderContent}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={[
                      globalStyles.notificationTitle,
                      {
                        color: textColor,
                      },
                    ]}
                  >
                    Notificações
                  </Text>

                  {unreadCount > 0 && (
                    <View
                      style={[
                        globalStyles.notificationBadge,
                        {
                          backgroundColor: COLORS.primary,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          globalStyles.notificationBadgeText,
                          {
                            color: COLORS.white,
                          },
                        ]}
                      >
                        {unreadCount}
                      </Text>
                    </View>
                  )}
                </View>

                <Text
                  style={[
                    globalStyles.notificationSubtitle,
                    {
                      color: secondaryColor,
                    },
                  ]}
                >
                  {unreadCount > 0
                    ? `${unreadCount} ${
                        unreadCount === 1
                          ? "notificação não lida"
                          : "notificações não lidas"
                      }`
                    : "Tudo em dia"}
                </Text>
              </View>

              {/* FECHAR */}

              <Pressable
                onPress={handleClose}
                style={[
                  globalStyles.notificationCloseButton,
                  {
                    backgroundColor: isDark
                      ? "rgba(255,255,255,0.07)"
                      : "rgba(0,0,0,0.045)",
                  },
                ]}
              >
                <Ionicons name="close" size={22} color={textColor} />
              </Pressable>
            </View>

            {/* DIVISOR */}

            <View
              style={[
                globalStyles.notificationDivider,
                {
                  backgroundColor: isDark
                    ? "rgba(255,255,255,0.10)"
                    : "rgba(0,0,0,0.08)",
                },
              ]}
            />

            {/* ================================= */}
            {/* AÇÕES */}
            {/* ================================= */}

            {notifications.length > 0 && (
              <View style={globalStyles.notificationActions}>
                <Pressable
                  onPress={readAll}
                  disabled={unreadCount === 0}
                  style={[
                    globalStyles.notificationAction,
                    {
                      backgroundColor:
                        unreadCount > 0
                          ? isDark
                            ? "rgba(255,255,255,0.07)"
                            : "rgba(0,0,0,0.045)"
                          : "transparent",
                    },
                  ]}
                >
                  <Ionicons
                    name="checkmark-done-outline"
                    size={17}
                    color={unreadCount > 0 ? COLORS.primary : secondaryColor}
                  />

                  <Text
                    style={[
                      globalStyles.notificationActionText,
                      {
                        color:
                          unreadCount > 0 ? COLORS.primary : secondaryColor,
                      },
                    ]}
                  >
                    Ler todas
                  </Text>
                </Pressable>

                <Pressable
                  onPress={clearAll}
                  style={[
                    globalStyles.notificationAction,
                    {
                      backgroundColor: isDark
                        ? "rgba(255,255,255,0.07)"
                        : "rgba(0,0,0,0.045)",
                    },
                  ]}
                >
                  <Ionicons
                    name="trash-outline"
                    size={16}
                    color={COLORS.danger}
                  />

                  <Text
                    style={[
                      globalStyles.notificationActionText,
                      {
                        color: COLORS.danger,
                      },
                    ]}
                  >
                    Limpar
                  </Text>
                </Pressable>
              </View>
            )}

            {/* ================================= */}
            {/* NOTIFICAÇÕES */}
            {/* ================================= */}

            {Object.entries(grouped).map(([section, list]) => {
              if (list.length === 0) return null;

              return (
                <View key={section} style={globalStyles.notificationSection}>
                  <Text
                    style={[
                      globalStyles.notificationSectionTitle,
                      {
                        color: secondaryColor,
                      },
                    ]}
                  >
                    {section.toUpperCase()}
                  </Text>

                  {list.map((item) => (
                    <NotificationCard
                      key={item.id}
                      title={item.title}
                      description={item.description}
                      hour={item.hour}
                      read={item.read}
                      onOpen={() => openNotification(item)}
                      onDelete={() => removeNotification(item.id)}
                    />
                  ))}
                </View>
              );
            })}

            {/* ================================= */}
            {/* VAZIO */}
            {/* ================================= */}

            {notifications.length === 0 && (
              <View style={globalStyles.notificationEmpty}>
                <View
                  style={[
                    globalStyles.notificationEmptyIcon,
                    {
                      backgroundColor: isDark
                        ? "rgba(255,255,255,0.07)"
                        : "rgba(0,0,0,0.045)",
                    },
                  ]}
                >
                  <Ionicons
                    name="notifications-off-outline"
                    size={38}
                    color={secondaryColor}
                  />
                </View>

                <Text
                  style={[
                    globalStyles.notificationEmptyTitle,
                    {
                      color: textColor,
                    },
                  ]}
                >
                  Tudo tranquilo!
                </Text>

                <Text
                  style={[
                    globalStyles.notificationEmptyText,
                    {
                      color: secondaryColor,
                    },
                  ]}
                >
                  Você não possui nenhuma notificação no momento.
                </Text>
              </View>
            )}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}
