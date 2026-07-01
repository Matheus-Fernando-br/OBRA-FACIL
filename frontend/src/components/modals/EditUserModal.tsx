import { Modal, View, Text, Pressable, ScrollView } from "react-native";
import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";

import { globalStyles, COLORS } from "../../styles/globalStyles";
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
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [documento, setDocumento] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const { token, setUser } = useAuth();
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (!user) return;

    setNome(user.nome);
    setEmail(user.email);
    setDocumento(user.CPF || user.CNPJ || "");
    setSenha("");
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
          senha: senha.trim() || undefined,
        },
        token,
      );

      setUser(updatedUser);

      setFeedback("Dados atualizados com sucesso!");
      setNome("");
      setEmail("");
      setDocumento("");
      setSenha("");
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
          <View style={[globalStyles.addCard]}>
            <View style={globalStyles.modalHeader}>
              <Text style={globalStyles.addTitle}>Meu Perfil</Text>

              <Pressable onPress={onClose}>
                <Ionicons name="close" color="#FFF" size={28} />
              </Pressable>
            </View>

            <View style={globalStyles.divider} />

            <ScrollView
              showsVerticalScrollIndicator
              contentContainerStyle={{
                paddingBottom: 20,
              }}
            >
              <Text style={globalStyles.label}>Nome</Text>

              <AppInput
                value={nome}
                onChangeText={setNome}
                placeholder="Nome"
              />

              <Text style={globalStyles.label}>Email</Text>

              <AppInput
                value={email}
                onChangeText={(text) => setEmail(emailMask(text))}
                placeholder="Email"
              />

              <Text style={globalStyles.label}>CPF / CNPJ</Text>

              <AppInput
                value={documento}
                onChangeText={(text) => setDocumento(documentMask(text))}
                placeholder="CPF/CNPJ"
              />

              <Text style={globalStyles.label}>Nova senha (opcional)</Text>

              <AppInput
                value={senha}
                onChangeText={setSenha}
                placeholder="Nova senha"
              />

              <View style={globalStyles.divider} />

              {feedback !== "" && (
                <Text style={globalStyles.feedback}>{feedback}</Text>
              )}

              <AppButton
                title={loading ? "Salvando..." : "Salvar alterações"}
                onPress={handleSave}
              />

              <AppButton
                title="Cancelar"
                color={COLORS.danger}
                onPress={onClose}
              />
            </ScrollView>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
