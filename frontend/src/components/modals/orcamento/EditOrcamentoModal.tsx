import { Modal, View, Text, Alert, ScrollView } from "react-native";

import { useEffect, useState } from "react";
import { Picker } from "@react-native-picker/picker";

import { useAuth } from "@/contexts/AuthContext";

import { getClients, updateBudget } from "@/services/api";

import { COLORS, globalStyles } from "@/styles/globalStyles";

import { AppInput } from "@/components/forms/AppInput";
import { AppButton } from "@/components/buttons/AppButton";

import { Cliente, Orcamento } from "@/components/layout/interface";

interface Props {
  visible: boolean;

  budget: Orcamento | null;

  onClose(): void;

  onSuccess(): void;
}

export function EditOrcamentoModal({
  visible,
  budget,
  onClose,
  onSuccess,
}: Props) {
  const { token, user } = useAuth();
  const [clients, setClients] = useState<Cliente[]>([]);

  const [nome, setNome] = useState("");

  const [descricao, setDescricao] = useState("");

  const [cliente, setCliente] = useState("");

  const [cep, setCep] = useState("");

  const [estado, setEstado] = useState("");

  const [cidade, setCidade] = useState("");

  const [bairro, setBairro] = useState("");

  const [rua, setRua] = useState("");

  const [numero, setNumero] = useState("");

  const [complemento, setComplemento] = useState("");

  const [categoria, setCategoria] = useState<any[]>([]);

  const [preco, setPreco] = useState("");

  const [bdi, setBdi] = useState("");

  const [precoComBDI, setPrecoComBDI] = useState("");

  const [status, setStatus] = useState("PENDENTE");

  const [validade, setValidade] = useState("");

  const [loading, setLoading] = useState(false);

  async function loadClients() {
    if (!token) return;

    const data = await getClients(token);

    setClients(data);
  }

  useEffect(() => {
    if (!visible || !budget) return;

    loadClients();

    setNome(budget.nome);

    setDescricao(budget.descricao);

    setCliente(budget.cliente._id);

    setCep(budget.endereco.CEP);

    setEstado(budget.endereco.estado);

    setCidade(budget.endereco.cidade);

    setBairro(budget.endereco.bairro);

    setRua(budget.endereco.rua);

    setNumero(budget.endereco.numero);

    setComplemento(budget.endereco.complemento);

    setCategoria(budget.categoria);

    setPreco(budget.preco.toString());

    setBdi(budget.bdi.toString());

    setPrecoComBDI(budget.preco_com_bdi.toString());

    setStatus(budget.status);

    setValidade(budget.valido_durante.toString());
  }, [budget, visible]);

  async function handleSave() {
    try {
      if (!budget || !token || !user) return;

      setLoading(true);

      await updateBudget(
        budget._id,
        {
          nome,

          descricao,

          cliente,

          responsavel: user._id,

          endereco: {
            CEP: cep,
            estado,
            cidade,
            bairro,
            rua,
            numero,
            complemento,
          },

          categoria,

          preco: Number(preco),

          bdi: Number(bdi),

          preco_com_bdi: Number(precoComBDI),

          status,

          valido_durante: Number(validade),

          data_validade: new Date(),
        },
        token,
      );

      Alert.alert("Sucesso", "Orçamento atualizado.");

      onSuccess();

      onClose();
    } catch (error: any) {
      Alert.alert(
        "Erro",
        error?.response?.data?.message ?? "Erro ao atualizar orçamento.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (!budget) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,.6)",
          justifyContent: "flex-end",
        }}
      >
        <View
          style={{
            backgroundColor: COLORS.white,
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
            padding: 25,
            maxHeight: "90%",
          }}
        >
          <Text
            style={{
              fontSize: 24,
              fontWeight: "700",
              marginBottom: 20,
            }}
          >
            Editar Orçamento
          </Text>

          <ScrollView>
            <Text style={globalStyles.label}>Nome</Text>

            <AppInput value={nome} onChangeText={setNome} />

            <Text style={globalStyles.label}>Cliente</Text>

            <Picker
              selectedValue={cliente}
              onValueChange={(itemValue) => setCliente(itemValue)}
            >
              <Picker.Item label="Selecione um cliente" value="" />
              {clients.map((client: any) => (
                <Picker.Item
                  key={client._id}
                  label={client.nome}
                  value={client._id}
                />
              ))}
            </Picker>

            <Text style={globalStyles.label}>Descrição</Text>

            <AppInput value={descricao} onChangeText={setDescricao} multiline />

            <AppButton
              title="Salvar Alterações"
              loading={loading}
              onPress={handleSave}
            />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
