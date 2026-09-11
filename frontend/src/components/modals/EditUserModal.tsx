import { Modal, View, Text, Pressable, ScrollView } from "react-native";
import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";

import { AppInput } from "../forms/AppInput";
import { AppButton } from "../buttons/AppButton";
import { documentMask, emailMask } from "@/components/forms/mask";
import { useAuth } from "@/contexts/AuthContext";
import { updateUser } from "../../services/api";

interface Props {
  visible: boolean;
  onClose: () => void;

  user: {
    _id: string;
    nome: string;
    email: string;
    CPF?: string;
    CNPJ?: string;
  } | null;
}

export function EditUserModal({ visible, onClose, user }: Props) {
  const { styles, theme } = useTheme();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [documento, setDocumento] = useState("");
  const [loading, setLoading] = useState(false);
  const { token, setUser } = useAuth();
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (!user) return;

    setNome(user.nome);
    setEmail(user.email);
    setDocumento(user.CPF || user.CNPJ || "");
  }, [user]);

  async function handleSave() {
    try {
      setFeedback("");

      if (!user || !token) {
        setFeedback("Usuário não encontrado.");
        return;
      }

      if (!nome.trim()) {
        setFeedback("Informe seu nome Completo");
        return;
      }

      if (!email.trim()) {
        setFeedback("Informe seu e-mail");
        return;
      }

      if (!email.includes("@")) {
        setFeedback("Informe um e-mail válido.");
        return;
      }

      if (!documento.trim()) {
        setFeedback("Informe seu CPF/CNPJ");
        return;
      }

      setLoading(true);

      const updatedUser = await updateUser(
        user._id,
        {
          nome: nome.trim(),
          email: email.trim(),
          CPF: user.CPF ? documento.trim() : undefined,
          CNPJ: user.CNPJ ? documento.trim() : undefined,
        },
        token,
      );

      setUser(updatedUser);

      setFeedback("Dados atualizados com sucesso!");
      setNome("");
      setEmail("");
      setDocumento("");
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (error: any) {
      console.log(error.response?.data);

      setFeedback("Erro ao atualizar usuário.");
    } finally {
      setLoading(false);
      setTimeout(() => {
        setFeedback("");
      }, 5000);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <Pressable
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,.65)",
          justifyContent: "flex-end",
        }}
        onPress={onClose}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            maxHeight: "100%", // <-- importante
          }}
        >
          <View style={[styles.addCard]}>
            <View style={styles.modalHeader}>
            <Pressable onPress={onClose} style={styles.leftAction}>
                <Ionicons name="arrow-back" size={25} color={theme.text} />
              </Pressable>
              <Text style={styles.addTitle}>Meu Perfil</Text>

              <Pressable onPress={handleSave} style={styles.rightAction}>
                <View style={styles.saveTextStack}>
                  <Text style={styles.saveText}>Atualizar</Text>
                  <Text style={styles.saveText}>Perfil</Text>
                </View>
                <Ionicons name="download" size={20} color={theme.title} />
              </Pressable>
            </View>

            <View style={styles.divider} />

            <ScrollView
              showsVerticalScrollIndicator
              contentContainerStyle={{
                paddingBottom: 20,
              }}
            >
              <Text style={styles.label}>Nome</Text>

              <AppInput
                value={nome}
                onChangeText={setNome}
                placeholder="Nome"
              />

              <Text style={styles.label}>Email</Text>

              <AppInput
                value={email}
                onChangeText={(text) => setEmail(emailMask(text))}
                placeholder="Email"
              />

              <Text style={styles.label}>CPF / CNPJ</Text>

              <AppInput
                value={documento}
                onChangeText={(text) => setDocumento(documentMask(text))}
                placeholder="CPF/CNPJ"
              />

              <View style={styles.divider} />

              {feedback !== "" && (
                <Text style={styles.feedback}>{feedback}</Text>
              )}

              <AppButton
                title={loading ? "Salvando..." : "Salvar alterações"}
                onPress={handleSave}
                color={theme.primary}
              />

              <AppButton
                title="Cancelar"
                color={theme.danger}
                onPress={onClose}
              />
            </ScrollView>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
