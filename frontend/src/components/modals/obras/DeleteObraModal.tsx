import { Modal, View, Text, Pressable, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { COLORS, globalStyles } from "@/styles/globalStyles";

import { Obra } from "@/components/layout/interface";

import { deleteWork } from "@/services/api";

import { useAuth } from "@/contexts/AuthContext";

import { useState } from "react";

interface Props {
  visible: boolean;

  work: Obra | null;

  onClose(): void;

  onSuccess(): void;
}

export function DeleteObraModal({
  visible,
  work,
  onClose,
  onSuccess,
}: Props) {
  const { token } = useAuth();

  const [loading, setLoading] = useState(false);

  if (!work) return null;

  async function handleDelete() {
    try {
      if (!token) return;

      setLoading(true);

      await deleteWork(token, work._id);

      onSuccess();
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
    >
      <View
        style={[
          globalStyles.overlay,
          {
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <View
          style={[
            globalStyles.modalContainer,
            {
              width: "90%",
              maxWidth: 420,
            },
          ]}
        >
          <View
            style={{
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <Ionicons
              name="warning"
              size={60}
              color={COLORS.danger}
            />

            <Text
              style={[
                globalStyles.title,
                {
                  marginTop: 15,
                  textAlign: "center",
                },
              ]}
            >
              Excluir Obra
            </Text>

            <Text
              style={[
                globalStyles.subtitle,
                {
                  textAlign: "center",
                  marginTop: 10,
                },
              ]}
            >
              Tem certeza que deseja excluir esta obra?
            </Text>

            <Text
              style={[
                globalStyles.orcamentoInfo,
                {
                  textAlign: "center",
                  marginTop: 8,
                },
              ]}
            >
              Esta ação não poderá ser desfeita.
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              gap: 10,
            }}
          >
            <Pressable
              style={[
                globalStyles.cancelButton,
                {
                  flex: 1,
                },
              ]}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={globalStyles.cancelButtonText}>
                Cancelar
              </Text>
            </Pressable>

            <Pressable
              style={[
                globalStyles.deleteButton,
                {
                  flex: 1,
                },
              ]}
              onPress={handleDelete}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Ionicons
                    name="trash"
                    size={18}
                    color="#FFF"
                  />

                  <Text style={globalStyles.deleteButtonText}>
                    Excluir
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}