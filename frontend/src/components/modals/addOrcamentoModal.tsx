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

export function AddOrcamentoModal({ visible, onClose }: Props) {
  const [name, setName] = useState("");
  const [clienteId, setClienteId] = useState("");
  const [descricao, setDescricao] = useState("");
  const [validade, setValidade] = useState("");
  const [endereco, setEndereco] = useState("");
  const [categoria, setCategoria] = useState("");
  const [sinapiLink, setSinapiLink] = useState("");
  const [custoObra, setCustoObra] = useState("");
  const [bdi, setBdi] = useState("");
  const [custoTotal, setCustoTotal] = useState("");

  function handleSave() {
    alert("Orçamento adicionado");

    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <Pressable
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.4)",
          justifyContent: "flex-end",
        }}
        onPress={onClose}
      >
        <Pressable onPress={(e) => e.stopPropagation()}>
          <View style={globalStyles.addCard}>
            <View style={globalStyles.modalHeader}>
              <Text style={globalStyles.addTitle}>Novo Orçamento</Text>

              <Pressable onPress={onClose}>
                <Ionicons name="close" size={28} color="#FFF" />
              </Pressable>
            </View>
            <AppInput
              placeholder="Nome do orçamento"
              value={name}
              onChangeText={setName}
            />

            <AppInput
              placeholder="ID do Cliente"
              value={clienteId}
              onChangeText={setClienteId}
            />

            <AppInput
              placeholder="Descrição"
              value={descricao}
              onChangeText={setDescricao}
            />

            <AppInput
              placeholder="Validade do orçamento"
              value={validade}
              onChangeText={setValidade}
            />

            <AppInput
              placeholder="Endereço da obra"
              value={endereco}
              onChangeText={setEndereco}
            />

            <AppInput
              placeholder="Categoria"
              value={categoria}
              onChangeText={setCategoria}
            />

            <AppInput
              placeholder="Link da tabela SINAPI"
              value={sinapiLink}
              onChangeText={setSinapiLink}
            />

            <Text
              style={{
                color: "#FFF",
                fontWeight: "bold",
                marginTop: 20,
                marginBottom: 10,
              }}
            >
              Custos
            </Text>

            <AppInput
              placeholder="Custo da obra"
              value={custoObra}
              onChangeText={setCustoObra}
            />

            <AppInput placeholder="BDI (%)" value={bdi} onChangeText={setBdi} />

            <AppInput
              placeholder="Custo total com BDI"
              value={custoTotal}
              onChangeText={setCustoTotal}
            />

            <AppButton title="Salvar orçamento" onPress={handleSave} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
