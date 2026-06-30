import { Modal, View, Text, Pressable, Alert } from "react-native";
import { useState } from "react";

import { globalStyles } from "../../../styles/globalStyles";
import { AppInput } from "../../forms/AppInput";
import { AppButton } from "../../buttons/AppButton";
import { Ionicons } from "@expo/vector-icons";

import { createClient } from "../../../services/api";

import { useAuth } from "@/contexts/AuthContext";

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function AddClientModal({ visible, onClose }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  async function handleSave() {
    try {
      if (!token) {
        Alert.alert("Erro", "Sessão expirada. Faça login novamente.");
        return;
      }
  
      if (!name.trim()) {
        Alert.alert("Erro", "Informe o nome do cliente");
        return;
      }
  
      if (!email.trim()) {
        Alert.alert("Erro", "Informe o e-mail do cliente");
        return;
      }
  
      setLoading(true);
  
      await createClient(
        {
          nome: name.trim(),
          email: email.trim(),
          CPF: cpf.trim(),
        },
        token
      );
  
      Alert.alert(
        "Sucesso",
        "Cliente cadastrado com sucesso!"
      );
  
      setName("");
      setEmail("");
      setCpf("");
  
      onClose();
    } catch (error: any) {
      console.log("CREATE CLIENT:", error?.response?.data);
  
      Alert.alert(
        "Erro",
        error?.response?.data?.message ??
          "Erro ao cadastrar cliente."
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
          backgroundColor: "rgba(0,0,0,0.6)",
          justifyContent: "flex-end",
        }}
        onPress={onClose}
      >
        <Pressable onPress={(e) => e.stopPropagation()}>
          <View style={globalStyles.addCard}>
            <View style={globalStyles.modalHeader}>
              <Text style={globalStyles.addTitle}>Novo cliente</Text>

              <Pressable onPress={onClose}>
                <Ionicons name="close" size={30} color="#FFF" />
              </Pressable>
            </View>

            <View style={globalStyles.divider} />

            <Text style={globalStyles.label}>Nome</Text>
            <AppInput
              placeholder="Nome"
              value={name}
              onChangeText={setName}
            />

            <Text style={globalStyles.label}>E-mail</Text>
            <AppInput
              placeholder="cliente@email.com"
              value={email}
              onChangeText={setEmail}
            />

            <Text style={globalStyles.label}>CPF</Text>
            <AppInput
              placeholder="CPF"
              value={cpf}
              onChangeText={setCpf}
            />

            <View style={globalStyles.divider} />

            <AppButton
              title="Salvar cliente"
              loading={loading}
              onPress={handleSave}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}