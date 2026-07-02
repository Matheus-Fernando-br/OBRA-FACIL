import { Modal, View, Text, Pressable, ScrollView, Alert } from "react-native";

import { useMemo, useState } from "react";

import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { COLORS } from "@/styles/globalStyles";

import { Notification, notificationsMock } from "@/data/notifications";

import { NotificationCard } from "@/components/cards/NotificationCard";

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function NotificationModal({ visible, onClose }: Props) {
  const [notifications, setNotifications] =
    useState<Notification[]>(notificationsMock);

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

    onClose();

    router.push(notification.route as any);
  }

  function removeNotification(id: string) {
    setNotifications((old) => old.filter((item) => item.id !== id));
  }

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

  function readAll() {
    setNotifications((old) =>
      old.map((item) => ({
        ...item,
        read: true,
      })),
    );
  }

  const grouped = useMemo(() => {
    return {
      Hoje: notifications.filter((n) => n.date === "Hoje"),

      Ontem: notifications.filter((n) => n.date === "Ontem"),

      "Esta semana": notifications.filter((n) => n.date === "Esta semana"),
    };
  }, [notifications]);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,.6)",
          justifyContent: "flex-start",
          alignItems: "flex-end",
        }}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            width: "80%",
            height: "100%",
            backgroundColor: COLORS.background,
            paddingTop: 60,
            paddingHorizontal: 20,
          }}
        >
          {/* HEADER */}

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 30,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Pressable onPress={onClose}>
                <Ionicons name="arrow-back" size={28} color={COLORS.text} />
              </Pressable>
              <View style={{marginLeft: 40, flexDirection: "row"}}>
                <Ionicons name="notifications" size={28} color={COLORS.text} />
                <Text
                  style={{
                    color: COLORS.text,
                    fontSize: 24,
                    fontWeight: "700",
                    marginLeft: 5,
                  }}
                >
                  Notificações
                </Text>
              </View>
            </View>
          </View>

          {/* BOTÕES */}

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 25,
            }}
          >
            <Pressable onPress={readAll}>
              <Text
                style={{
                  color: COLORS.primary,
                  fontWeight: "700",
                }}
              >
                Ler todas
              </Text>
            </Pressable>

            <Pressable onPress={clearAll}>
              <Text
                style={{
                  color: COLORS.danger,
                  fontWeight: "700",
                }}
              >
                Limpar todas
              </Text>
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {Object.entries(grouped).map(([section, list]) => {
              if (list.length === 0) return null;

              return (
                <View key={section}>
                  <Text
                    style={{
                      color: COLORS.textSecondary ,
                      fontWeight: "700",
                      fontSize: 18,
                      marginBottom: 15,
                      marginTop: 5,
                    }}
                  >
                    {section}
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

            {notifications.length === 0 && (
              <View
                style={{
                  alignItems: "center",
                  marginTop: 100,
                }}
              >
                <Ionicons name="notifications-off" size={70} color="#64748B" />

                <Text
                  style={{
                    color: "#94A3B8",
                    marginTop: 15,
                    fontSize: 16,
                  }}
                >
                  Nenhuma notificação.
                </Text>
              </View>
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
