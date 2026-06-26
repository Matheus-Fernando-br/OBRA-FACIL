import { Modal, View, Text, Pressable, Alert, ScrollView } from "react-native";
import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";

import { globalStyles, COLORS } from "../../styles/globalStyles";
import { AppInput } from "../forms/AppInput";
import { AppButton } from "../buttons/AppButton";

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

  onSave?: (data: {
    nome: string;
    email: string;
    CPF?: string;
    CNPJ?: string;
    senha?: string;
  }) => Promise<void>;
}

export function EditUserModal({
  visible,
  onClose,
  user,
  onSave,
}: Props) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [documento, setDocumento] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    setNome(user.nome);
    setEmail(user.email);
    setDocumento(user.CPF || user.CNPJ || "");
    setSenha("");
  }, [user]);

  async function handleSave() {
    try {
      setLoading(true);

      await onSave?.({
        nome,
        email,
        CPF: user?.CPF ? documento : undefined,
        CNPJ: user?.CNPJ ? documento : undefined,
        senha: senha || undefined,
      });

      Alert.alert(
        "Sucesso",
        "Dados atualizados com sucesso!"
      );

      onClose();
    } catch (error: any) {
      Alert.alert(
        "Erro",
        error?.response?.data?.message ||
          "Erro ao atualizar usuário."
      );
    } finally {
      setLoading(false);
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
      <View
        style={[
          globalStyles.addCard,

        ]}
      >
        <View style={globalStyles.modalHeader}>
          <Text style={globalStyles.addTitle}>
            Meu Perfil
          </Text>

          <Pressable onPress={onClose}>
            <Ionicons
              name="close"
              color="#FFF"
              size={28}
            />
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
            onChangeText={setEmail}
            placeholder="Email"
          />

          <Text style={globalStyles.label}>Documento</Text>

          <AppInput
            value={documento}
            onChangeText={setDocumento}
            placeholder="CPF/CNPJ"
          />

          <Text style={globalStyles.label}>
            Nova senha (opcional)
          </Text>

          <AppInput
            value={senha}
            onChangeText={setSenha}
            placeholder="Nova senha"
          />

          <View style={globalStyles.divider} />

          <AppButton
            title={
              loading
                ? "Salvando..."
                : "Salvar alterações"
            }
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