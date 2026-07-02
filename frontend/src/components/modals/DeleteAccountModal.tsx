import {
    Alert,
    Modal,
    Pressable,
    Text,
    TextInput,
    View,
  } from "react-native";
  
  import { useState } from "react";
  
  import { Ionicons } from "@expo/vector-icons";
  
  import { COLORS, globalStyles } from "@/styles/globalStyles";
  
  import { AppButton } from "../buttons/AppButton";
  import { AppInput } from "../forms/AppInput";
  
  import { useAuth } from "@/contexts/AuthContext";
  
  import { deleteUser } from "@/services/api";
  
  interface Props {
    visible: boolean;
    onClose: () => void;
  }
  
  export function DeleteAccountModal({
    visible,
    onClose,
  }: Props) {
    const { user, token, logout } = useAuth();
  
    const [confirmacao, setConfirmacao] = useState("");
    const [senha, setSenha] = useState("");
    const [loading, setLoading] = useState(false);
  
    async function handleDelete() {
      try {
        if (!user || !token) {
          Alert.alert(
            "Erro",
            "Usuário não encontrado."
          );
          return;
        }
  
        if (confirmacao.trim().toUpperCase() !== "EXCLUIR") {
          Alert.alert(
            "Confirmação inválida",
            'Digite "EXCLUIR" para continuar.'
          );
          return;
        }
  
        if (!senha.trim()) {
          Alert.alert(
            "Erro",
            "Informe sua senha."
          );
          return;
        }
  
        setLoading(true);
  
        /*
        Futuramente o backend poderá validar
        a senha antes da exclusão.
        */
  
        await deleteUser(user._id, token);
  
        Alert.alert(
          "Conta excluída",
          "Sua conta foi removida com sucesso."
        );
  
        await logout();
      } catch (error: any) {
        console.log(error.response?.data);
  
        Alert.alert(
          "Erro",
          error?.response?.data?.message ??
            "Erro ao excluir conta."
        );
      } finally {
        setLoading(false);
      }
    }
  
    return (
      <Modal
        visible={visible}
        transparent
        animationType="slide"
      >
        <Pressable
          onPress={onClose}
          style={{
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor: "rgba(0,0,0,.65)",
          }}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
          >
            <View style={globalStyles.addCard}>
              <View style={globalStyles.modalHeader}>
                <Text style={globalStyles.addTitle}>
                  Excluir Conta
                </Text>
  
                <Pressable onPress={onClose}>
                  <Ionicons
                    name="close"
                    size={28}
                    color="#FFF"
                  />
                </Pressable>
              </View>
  
              <View style={globalStyles.divider} />
  
              <Text
                style={{
                  color: COLORS.danger,
                  fontWeight: "700",
                  marginBottom: 20,
                  lineHeight: 22,
                }}
              >
                Esta ação é permanente.
                {"\n\n"}
                Todos os seus clientes,
                obras, orçamentos e dados
                poderão ser perdidos.
              </Text>
  
              <Text style={globalStyles.label}>
                Digite EXCLUIR
              </Text>
  
              <AppInput
                placeholder="EXCLUIR"
                value={confirmacao}
                onChangeText={setConfirmacao}
              />
  
              <Text style={globalStyles.label}>
                Confirme sua senha
              </Text>
  
              <TextInput
                placeholder="Senha"
                secureTextEntry
                value={senha}
                onChangeText={setSenha}
                style={{
                    width: "100%",
                    height: 55,
                    backgroundColor: "#FFF",
                    borderRadius: 14,
                    paddingHorizontal: 30,
                    marginBottom: 16,
                  }}
              />
  
              <View style={globalStyles.divider} />
  
              <AppButton
                title="Excluir Conta"
                color={COLORS.danger}
                loading={loading}
                onPress={handleDelete}
              />
  
              <AppButton
                title="Cancelar"
                onPress={onClose}
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    );
  }