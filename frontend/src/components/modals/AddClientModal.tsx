import { Modal, View, Text } from "react-native";

import { useState } from "react";

import { AppInput } from "../forms/AppInput";

import { AppButton } from "../buttons/AppButton";

interface Props {
  visible: boolean;

  onClose: () => void;
}

export function AddClientModal({ visible, onClose }: Props) {
  const [name, setName] = useState("");

  const [phone, setPhone] = useState("");

  const [city, setCity] = useState("");

  function handleSave() {
    alert("Cliente adicionado");

    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.4)",
          justifyContent: "flex-end",
        }}
      >
        <View
          style={{
            backgroundColor: "#FFF",
            padding: 24,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
          }}
        >
          <Text
            style={{
              fontSize: 24,
              fontWeight: "bold",
              marginBottom: 20,
            }}
          >
            Novo cliente
          </Text>

          <AppInput placeholder="Nome" value={name} onChangeText={setName} />

          <AppInput
            placeholder="Telefone"
            value={phone}
            onChangeText={setPhone}
          />

          <AppInput placeholder="Cidade" value={city} onChangeText={setCity} />

          <AppButton title="Salvar cliente" onPress={handleSave} />
        </View>
      </View>
    </Modal>
  );
}
