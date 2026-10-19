import { useState } from "react";
import { Modal, Pressable, Text, View, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { AppButton } from "../buttons/AppButton";
import { AppInput } from "../forms/AppInput";
import { deleteUser } from "@/services/api";
import { withAlpha } from "@/styles/globalStyles";

interface Props {
  visible: boolean;
  onClose: () => void;
}

/**
 * Exclusão de conta (exigência do Google Play): confirmação por texto e
 * senha; ao concluir, encerra a sessão e volta para o login.
 */
export function DeleteAccountModal({ visible, onClose }: Props) {
  const { styles, theme } = useTheme();
  const { user, token, logout } = useAuth();
  const insets = useSafeAreaInsets();

  const [confirmacao, setConfirmacao] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");

  function close() {
    if (loading) return;
    setConfirmacao("");
    setSenha("");
    setFeedback("");
    onClose();
  }

  async function handleDelete() {
    setFeedback("");

    if (!user || !token) return setFeedback("Sessão expirada. Entre novamente.");
    if (confirmacao.trim().toUpperCase() !== "EXCLUIR")
      return setFeedback('Digite "EXCLUIR" para confirmar.');
    if (!senha) return setFeedback("Informe sua senha para confirmar.");

    try {
      setLoading(true);
      await deleteUser(user._id, token, senha);
      await logout();
      onClose();
      router.replace({ pathname: "/login", params: { conta: "excluida" } });
    } catch (error: any) {
      const status = error?.response?.status;
      setFeedback(
        status === 401 || status === 403
          ? "Senha incorreta."
          : (error?.response?.data?.message ?? "Não foi possível excluir a conta. Tente novamente."),
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close} statusBarTranslucent>
      <Pressable
        onPress={close}
        style={{ flex: 1, justifyContent: "flex-end", backgroundColor: theme.backgroundDestaque }}
      >
        <Pressable onPress={(e) => e.stopPropagation()}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            style={[styles.addCard, { maxHeight: 640 }]}
            contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
          >
            <View style={styles.modalHeader}>
              <View style={{ width: 36 }} />
              <Text style={styles.addTitle}>Excluir conta</Text>
              <Pressable onPress={close} style={styles.menuCloseButton} accessibilityLabel="Fechar">
                <Ionicons name="close" size={18} color={theme.text} />
              </Pressable>
            </View>

            <View
              style={{
                flexDirection: "row",
                gap: 10,
                padding: 14,
                borderRadius: 14,
                marginTop: 12,
                backgroundColor: withAlpha(theme.danger, 0.1),
              }}
            >
              <Ionicons name="warning" size={20} color={theme.danger} />
              <Text style={{ flex: 1, color: theme.danger, fontWeight: "600", lineHeight: 20 }}>
                Esta ação é permanente. Sua conta e todos os clientes, orçamentos e obras
                serão apagados. Se quiser guardar algo, exporte antes em Relatórios.
              </Text>
            </View>

            <Text style={styles.label}>Digite EXCLUIR para confirmar</Text>
            <AppInput
              placeholder="EXCLUIR"
              value={confirmacao}
              onChangeText={setConfirmacao}
              autoCapitalize="characters"
            />

            <Text style={styles.label}>Sua senha</Text>
            <AppInput
              placeholder="Senha atual"
              secureTextEntry
              value={senha}
              onChangeText={setSenha}
              autoComplete="current-password"
            />

            {!!feedback && <Text style={styles.feedback}>{feedback}</Text>}

            <AppButton
              title="Excluir minha conta"
              icon="trash-outline"
              color={theme.danger}
              loading={loading}
              onPress={handleDelete}
            />
            <AppButton variant="secondary" title="Cancelar" onPress={close} />
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
