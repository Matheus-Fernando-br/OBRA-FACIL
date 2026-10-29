import {
  Modal,
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Animated,
  Dimensions,
} from "react-native";

import { useEffect, useMemo, useRef } from "react";

import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";


import { Notification } from "@/data/notifications";
import { useAuth } from "@/contexts/AuthContext";
import { useAlerts } from "@/utils/alerts";

import { NotificationCard } from "@/components/cards/NotificationCard";

import { useTheme } from "@/contexts/ThemeContext";

interface Props {
  visible: boolean;
  onClose: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const NOTIFICATION_WIDTH = Math.min(390, SCREEN_WIDTH * 0.86);

export function NotificationModal({ visible, onClose }: Props) {
  const { isDark, theme, styles } = useTheme();

  const { token } = useAuth();
  // Alertas reais (orçamentos a vencer/vencidos, obras atrasadas ou com
  // entrega próxima) — antes eram exibidos dados fictícios.
  const { items: notifications, loading, markRead, dismiss } = useAlerts(token, visible);

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

      Anteriores: notifications.filter((n) => n.date === "Anteriores"),
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
    markRead([notification.id]);

    // Recado da equipe: só marca como lido (a mensagem já aparece inteira).
    if (!notification.route) return;

    handleClose();

    setTimeout(() => {
      router.navigate(notification.route as any);
    }, 230);
  }

  /*
   * REMOVER
   */
  function removeNotification(id: string) {
    dismiss([id]);
  }

  /*
   * LIMPAR TODAS (sem Alert: o Alert do React Native não funciona na web)
   */
  function clearAll() {
    dismiss(notifications.map((n) => n.id));
  }

  /*
   * LER TODAS
   */
  function readAll() {
    if (unreadCount === 0) return;
    markRead(notifications.map((n) => n.id));
  }

  const textColor = theme.text;

  const secondaryColor = theme.textSecondary ?? theme.textSecondary;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View style={styles.notificationModalContainer}>
        {/* ================================= */}
        {/* FUNDO ESCURO */}
        {/* ================================= */}

        <Animated.View
          style={[
            styles.notificationModalOverlay,
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
            styles.notificationModal,
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
            contentContainerStyle={styles.notificationModalScroll}
            bounces={false}
          >
            {/* ================================= */}
            {/* HEADER */}
            {/* ================================= */}

            <View style={styles.notificationHeader}>
              {/* ÍCONE */}

              <View
                style={[
                  styles.notificationHeaderIcon,
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
                  color={theme.primary}
                />
              </View>

              {/* TÍTULO */}

              <View style={styles.notificationHeaderContent}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={[
                      styles.notificationTitle,
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
                        styles.notificationBadge,
                        {
                          backgroundColor: theme.primary,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.notificationBadgeText,
                          {
                            color: theme.white,
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
                    styles.notificationSubtitle,
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
                  styles.notificationCloseButton,
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
                styles.notificationDivider,
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
              <View style={styles.notificationActions}>
                <Pressable
                  onPress={readAll}
                  disabled={unreadCount === 0}
                  style={[
                    styles.notificationAction,
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
                    color={unreadCount > 0 ? theme.primary : secondaryColor}
                  />

                  <Text
                    style={[
                      styles.notificationActionText,
                      {
                        color:
                          unreadCount > 0 ? theme.primary : secondaryColor,
                      },
                    ]}
                  >
                    Ler todas
                  </Text>
                </Pressable>

                <Pressable
                  onPress={clearAll}
                  style={[
                    styles.notificationAction,
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
                    color={theme.danger}
                  />

                  <Text
                    style={[
                      styles.notificationActionText,
                      {
                        color: theme.danger,
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
                <View key={section} style={styles.notificationSection}>
                  <Text
                    style={[
                      styles.notificationSectionTitle,
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

            {loading && notifications.length === 0 && (
              <ActivityIndicator style={{ marginTop: 60 }} color={theme.primary} />
            )}

            {!loading && notifications.length === 0 && (
              <View style={styles.notificationEmpty}>
                <View
                  style={[
                    styles.notificationEmptyIcon,
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
                    styles.notificationEmptyTitle,
                    {
                      color: textColor,
                    },
                  ]}
                >
                  Tudo tranquilo!
                </Text>

                <Text
                  style={[
                    styles.notificationEmptyText,
                    {
                      color: secondaryColor,
                    },
                  ]}
                >
                  Nenhum orçamento vencendo e nenhuma obra atrasada no momento.
                </Text>
              </View>
            )}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}
