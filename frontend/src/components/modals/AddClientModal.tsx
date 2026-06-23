import { Modal, View, Text, Pressable } from "react-native";

import { useState } from "react";

import { globalStyles } from "../../styles/globalStyles";

import { AppInput } from "../forms/AppInput";

import { AppButton } from "../buttons/AppButton";

import { Ionicons } from "@expo/vector-icons";

interface Props {
  visible: boolean;

  onClose: () => void;
}

export function AddClientModal({ visible, onClose }: Props) {
  const [name, setName] = useState("");

  const [phone, setPhone] = useState("");

  const [cpf, setCpf] = useState("");

  function handleSave() {
    alert("Cliente adicionado");

    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <Pressable
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.6)",
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
            <AppInput placeholder="Nome" value={name} onChangeText={setName} />

            <Text style={globalStyles.label}>Telefone</Text>
            <AppInput
              placeholder="Telefone"
              value={phone}
              onChangeText={setPhone}
            />
            <Text style={globalStyles.label}>CPF</Text>
            <AppInput placeholder="CPF" value={cpf} onChangeText={setCpf} />
            <View style={globalStyles.divider} />

            <AppButton title="Salvar cliente" onPress={handleSave} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
