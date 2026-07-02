import { Modal, View, Text, Pressable, ScrollView } from "react-native";
import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { globalStyles, COLORS } from "../../styles/globalStyles";
import { AppInput } from "../forms/AppInput";
import { AppButton } from "../buttons/AppButton";
import { getClients } from "../../services/api";
import * as Linking from "expo-linking";
import { useAuth } from "@/contexts/AuthContext";
interface Props {
  visible: boolean;
  onClose: () => void;
}

interface Client {
  _id: string;
  nome: string;
  email: string;
  CPF: string;
}
interface Servico {
  id: number;

  nome: string;

  unidade: string;

  quantidade: string;

  valorUnitario: string;
}

interface Categoria {
  id: number;

  nome: string;

  servicos: Servico[];
}

export function AddOrcamentoModal({ visible, onClose }: Props) {
  const [name, setName] = useState("");
  const [descricao, setDescricao] = useState("");
  const [validade, setValidade] = useState("");
  const [cep, setCep] = useState("");
  const [estado, setEstado] = useState("");
  const [cidade, setCidade] = useState("");
  const [bairro, setBairro] = useState("");
  const [logradouro, setLogradouro] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [categorias, setCategorias] = useState<Categoria[]>([
    {
      id: Date.now(),
      nome: "",
      servicos: [
        {
          id: Date.now() + 1,
          nome: "",
          unidade: "",
          quantidade: "",
          valorUnitario: "",
        },
      ],
    },
  ]);

  const [bdi, setBdi] = useState("");
  const [clientsList, setClientsList] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();
  const [feedback, setFeedback] = useState("");
  const [feedbackClient, setFeedbackClient] = useState("");
  const [feedbackSinapi, setFeedbackSinapi] = useState("");

  useEffect(() => {
    async function loadClients() {
      try {
        setFeedbackClient("");

        if (!token) {
          setFeedbackClient("Sessão expirada. Faça login novamente.");
          return;
        }

        const data = await getClients(token || "");

        setClientsList(data);
      } catch (error) {
        console.log(error);
        setFeedbackClient("Erro ao carregar clientes: ");
      }
    }

    loadClients();
  }, []);

  function updateCategoria(id: number, field: string, value: string) {
    setCategorias((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, [field]: value } : cat)),
    );
  }

  function updateServico(
    categoriaId: number,
    servicoId: number,
    field: string,
    value: string,
  ) {
    setCategorias((prev) =>
      prev.map((cat) =>
        cat.id === categoriaId
          ? {
              ...cat,
              servicos: cat.servicos.map((s) =>
                s.id === servicoId ? { ...s, [field]: value } : s,
              ),
            }
          : cat,
      ),
    );
  }

  function addServico(categoriaId: number) {
    setCategorias((prev) =>
      prev.map((cat) =>
        cat.id === categoriaId
          ? {
              ...cat,
              servicos: [
                ...cat.servicos,
                {
                  id: Date.now(),
                  nome: "",
                  unidade: "",
                  quantidade: "",
                  valorUnitario: "",
                },
              ],
            }
          : cat,
      ),
    );
  }

  function calcularServicoTotal(qtd: string, valor: string) {
    return Number(qtd || 0) * Number(valor || 0);
  }

  function totalCategoria(cat: Categoria) {
    return cat.servicos.reduce(
      (acc, s) => acc + calcularServicoTotal(s.quantidade, s.valorUnitario),
      0,
    );
  }

  const custoObraCalculado = categorias.reduce(
    (acc, c) => acc + totalCategoria(c),
    0,
  );

  const custoTotalComBDI =
    custoObraCalculado + custoObraCalculado * (Number(bdi || 0) / 100);

  async function buscarCep(cepDigitado: string) {
    const cepLimpo = cepDigitado.replace(/\D/g, "");

    if (cepLimpo.length !== 8) return;

    try {
      const response = await fetch(
        `https://viacep.com.br/ws/${cepLimpo}/json/`,
      );

      const data = await response.json();

      setEstado(data.uf || "");

      setCidade(data.localidade || "");

      setBairro(data.bairro || "");

      setLogradouro(data.logradouro || "");
    } catch {
      console.log("Erro CEP");
    }
  }

  function handleSave() {
    try {
      setFeedback("Orçamento adicionado");
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (error) {
      console.log(error);
      setFeedback("Erro ao adicionar orçamento: ");
    } finally {
      setLoading(false);
    }
  }
  const handleOpenSinapiLink = async () => {
    const url =
      "https://www.caixa.gov.br/Downloads/sinapi-relatorios-mensais/SINAPI-2026-05-formato-pdf.zip";

    // Verifica se o dispositivo consegue abrir a URL antes de tentar
    const supported = await Linking.canOpenURL(url);

    setFeedbackSinapi("");
    if (supported) {
      await Linking.openURL(url);
    } else {
      setFeedbackSinapi(
        "Erro ao abrir link da tabela SINAPI: Erro ao abrir link no seu dispositivo.",
      );
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
    >
      <Pressable
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.6)",
        }}
        onPress={onClose}
      >
        <Pressable style={{ flex: 1 }} onPress={(e) => e.stopPropagation()}>
          <View style={globalStyles.addCard}>
            {/* HEADER FIXO */}
            <View style={globalStyles.modalHeader}>
              <Text style={globalStyles.addTitle}>Novo Orçamento</Text>

              <Pressable onPress={onClose}>
                <Ionicons name="close" size={30} color={COLORS.text} />
              </Pressable>
            </View>
            <View style={globalStyles.divider} />

            {/* CONTEÚDO ROLÁVEL */}
            <ScrollView
              style={{ flex: 1 }}
              showsVerticalScrollIndicator={true}
              contentContainerStyle={{
                paddingRight: 20,
              }}
            >
              <Text style={globalStyles.label}>Nome do orçamento</Text>
              <AppInput
                placeholder="Nome do orçamento"
                value={name}
                onChangeText={setName}
              />

              <Text style={globalStyles.label}>Cliente</Text>
              <View
                style={{
                  width: "100%",
                  height: 55,
                  backgroundColor: "#FFF",
                  borderRadius: 14,
                  paddingHorizontal: 20,

                  justifyContent: "center",

                  marginBottom: 16,
                }}
              >
                <Picker
                  selectedValue={selectedClient}
                  onValueChange={(itemValue) => setSelectedClient(itemValue)}
                >
                  <Picker.Item label="Selecione um cliente" value="" />

                  {clientsList.map((client: any) => (
                    <Picker.Item
                      key={client._id}
                      label={client.nome}
                      value={client._id}
                    />
                  ))}
                </Picker>
              </View>

              {feedbackClient !== "" && (
                <Text style={globalStyles.feedback}>{feedbackClient}</Text>
              )}

              <Text style={globalStyles.label}>Descrição</Text>
              <AppInput
                placeholder="Descrição"
                value={descricao}
                onChangeText={setDescricao}
              />

              <Text style={globalStyles.label}>Validade do orçamento</Text>
              <AppInput
                placeholder="Validade do orçamento"
                value={validade}
                onChangeText={setValidade}
              />
              <View style={globalStyles.divider} />

              <Text style={globalStyles.label}>Endereço da obra</Text>
              <Text style={globalStyles.label}>CEP</Text>

              <AppInput
                placeholder="35180-000"
                value={cep}
                onChangeText={(text) => {
                  setCep(text);

                  buscarCep(text);
                }}
              />

              <Text style={globalStyles.label}>Estado</Text>

              <AppInput
                placeholder="Estado"
                value={estado}
                onChangeText={setEstado}
              />

              <Text style={globalStyles.label}>Cidade</Text>

              <AppInput
                placeholder="Cidade"
                value={cidade}
                onChangeText={setCidade}
              />

              <Text style={globalStyles.label}>Bairro</Text>

              <AppInput
                placeholder="Bairro"
                value={bairro}
                onChangeText={setBairro}
              />

              <Text style={globalStyles.label}>Logradouro</Text>

              <AppInput
                placeholder="Rua"
                value={logradouro}
                onChangeText={setLogradouro}
              />

              <Text style={globalStyles.label}>Número</Text>

              <AppInput
                placeholder="Número"
                value={numero}
                onChangeText={setNumero}
              />

              <Text style={globalStyles.label}>Complemento</Text>

              <AppInput
                placeholder="Complemento"
                value={complemento}
                onChangeText={setComplemento}
              />

              <View style={globalStyles.divider} />
              <Text style={globalStyles.label}>Categoria</Text>

              {categorias.map((cat) => (
                <View key={cat.id}>
                  <AppInput
                    placeholder="Categoria"
                    value={cat.nome}
                    onChangeText={(t) => updateCategoria(cat.id, "nome", t)}
                  />

                  {cat.servicos.map((s, index) => (
                    <View
                      key={s.id}
                      style={{
                        width: "100%",
                        marginBottom: 20,
                        padding: 12,
                        borderWidth: 1,
                        borderColor: "#334155",
                        borderRadius: 12,
                      }}
                    >
                      <Text
                        style={{
                          color: "#FFF",
                          marginBottom: 12,
                          fontWeight: "bold",
                        }}
                      >
                        Serviço {index + 1}
                      </Text>

                      <AppInput
                        placeholder="Nome do Serviço"
                        value={s.nome}
                        onChangeText={(text) =>
                          updateServico(cat.id, s.id, "nome", text)
                        }
                      />

                      <AppInput
                        placeholder="Unidade"
                        value={s.unidade}
                        onChangeText={(text) =>
                          updateServico(cat.id, s.id, "unidade", text)
                        }
                      />

                      <AppInput
                        placeholder="Quantidade"
                        value={s.quantidade}
                        onChangeText={(text) =>
                          updateServico(cat.id, s.id, "quantidade", text)
                        }
                      />

                      <AppInput
                        placeholder="Valor Unitário"
                        value={s.valorUnitario}
                        onChangeText={(text) =>
                          updateServico(cat.id, s.id, "valorUnitario", text)
                        }
                      />

                      <Text
                        style={{
                          color: "#22C55E",
                          fontWeight: "bold",
                        }}
                      >
                        Total: R$
                        {calcularServicoTotal(
                          s.quantidade,
                          s.valorUnitario,
                        ).toFixed(2)}
                      </Text>
                    </View>
                  ))}

                  <AppButton
                    title="+ Adicionar Serviço"
                    onPress={() => addServico(cat.id)}
                  />
                </View>
              ))}
              <View style={globalStyles.divider} />

              <Text
                style={{
                  color: "#FFF",
                  fontWeight: "bold",
                  fontSize: 18,
                  marginTop: 20,
                  marginBottom: 10,
                }}
              >
                Custos
              </Text>

              <Text style={globalStyles.label}>Link da tabela SINAPI</Text>
              <AppButton
                title="Baixar Tabela SINAPI"
                onPress={handleOpenSinapiLink}
              />
              {feedbackSinapi !== "" && (
                <Text style={globalStyles.feedback}>{feedbackSinapi}</Text>
              )}

              <Text style={globalStyles.label}>Custo da obra</Text>

              <AppInput
                placeholder="Custo da Obra"
                value={custoObraCalculado.toFixed(2)}
                onChangeText={() => {}}
              />

              <Text style={globalStyles.label}>BDI (%)</Text>
              <AppInput
                placeholder="BDI (%)"
                value={bdi}
                onChangeText={setBdi}
              />

              <Text style={globalStyles.label}>Custo total com BDI</Text>
              <AppInput
                placeholder="Custo total com BDI"
                value={custoTotalComBDI.toFixed(2)}
                onChangeText={() => {}}
              />
              <View style={globalStyles.divider} />

              {feedback !== "" && (
                <Text style={globalStyles.feedback}>{feedback}</Text>
              )}

              <AppButton
                title="Salvar orçamento"
                loading={loading}
                onPress={handleSave}
              />
            </ScrollView>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
