import { Modal, View, Text, Pressable, ScrollView } from "react-native";
import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { globalStyles, COLORS } from "@/styles/globalStyles";
import { AppInput } from "@/components/forms/AppInput";
import { AppButton } from "@/components/buttons/AppButton";
import { getClients, createBudget } from "@/services/api";
import * as Linking from "expo-linking";
import { useAuth } from "@/contexts/AuthContext";
import {
  Cliente,
  Servico,
  Categoria,
  Orcamento,
} from "@/components/layout/interface";
interface Props {
  visible: boolean;
  onClose: () => void;
}

export function AddOrcamentoModal({ visible, onClose }: Props) {
  const [name, setName] = useState("");
  const [descricao, setDescricao] = useState("");
  const [validade, setValidade] = useState<number>(0);
  const dataPublicacao = new Date();

  const dataValidade =
    validade > 0
      ? new Date(dataPublicacao.getTime() + validade * 24 * 60 * 60 * 1000)
      : null;
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
      preco_total_da_categoria: 0,
      servicos: [
        {
          id: Date.now() + 1,
          nome: "",
          descricao: "",
          unidade: "",
          quantidade_unidade: 0,
          preco_da_unidade: 0,
          preco_total: 0,
        },
      ],
    },
  ]);

  const [bdi, setBdi] = useState("");
  const [clientsList, setClientsList] = useState<Cliente[]>([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [loading, setLoading] = useState(false);
  const { token, user } = useAuth();
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

  function addCategoria() {
    setCategorias((prev) => [
      ...prev,
      {
        id: Date.now(),
        nome: "",
        preco_total_da_categoria: 0,
        servicos: [
          {
            id: Date.now() + 1,
            nome: "",
            descricao: "",
            unidade: "",
            quantidade_unidade: 0,
            preco_da_unidade: 0,
            preco_total: 0,
          },
        ],
      },
    ]);
  }

  function updateCategoria(id: number, field: keyof Categoria, value: any) {
    setCategorias((prev) =>
      prev.map((categoria) =>
        categoria.id === id
          ? {
              ...categoria,
              [field]: value,
            }
          : categoria,
      ),
    );
  }

  function updateServico(
    categoriaId: number,
    servicoId: number,
    field: keyof Servico,
    value: string | number,
  ) {
    setCategorias((prev) =>
      prev.map((categoria) => {
        if (categoria.id !== categoriaId) return categoria;

        const servicos = categoria.servicos.map((servico) => {
          if (servico.id !== servicoId) return servico;

          const novoServico = {
            ...servico,
            [field]: value,
          };

          novoServico.preco_total =
            Number(novoServico.quantidade_unidade) *
            Number(novoServico.preco_da_unidade);

          return novoServico;
        });

        return {
          ...categoria,
          servicos,
          preco_total_da_categoria: servicos.reduce(
            (acc, s) => acc + s.preco_total,
            0,
          ),
        };
      }),
    );
  }

  function addServico(categoriaId: number) {
    setCategorias((prev) =>
      prev.map((categoria) =>
        categoria.id === categoriaId
          ? {
              ...categoria,
              servicos: [
                ...categoria.servicos,
                {
                  id: Date.now(),
                  nome: "",
                  descricao: "",
                  unidade: "",
                  quantidade_unidade: 0,
                  preco_da_unidade: 0,
                  preco_total: 0,
                },
              ],
            }
          : categoria,
      ),
    );
  }

  const custoObraCalculado = categorias.reduce(
    (acc, categoria) => acc + categoria.preco_total_da_categoria,
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

  async function handleSave() {
    try {
      if (!token) {
        setFeedback("Sessão expirada.");
        return;
      }

      setLoading(true);
      setFeedback("");

      await createBudget(
        {
          nome: name,

          endereco: {
            CEP: cep,
            estado,
            cidade,
            bairro,
            rua: logradouro,
            numero,
            complemento,
          },

          descricao,

          cliente: selectedClient,

          responsavel: user!._id, 

          categoria: categorias.map((cat) => ({
            nome: cat.nome,
            preco_total_da_categoria: cat.preco_total_da_categoria,

            servicos: cat.servicos.map((servico) => ({
              nome: servico.nome,
              descricao: servico.descricao,
              unidade: servico.unidade,
              quantidade_unidade: servico.quantidade_unidade,
              preco_da_unidade: servico.preco_da_unidade,
              preco_total: servico.preco_total,
            })),
          })),

          status: "PENDENTE",

          preco: custoObraCalculado,

          bdi: Number(bdi),

          preco_com_bdi: custoTotalComBDI,

          data_publicacao: dataPublicacao,

          valido_durante: validade,
        
          data_validade: dataValidade!,
        },
        token,
      );

      setFeedback("Orçamento cadastrado com sucesso!");

      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error: any) {
      console.log("ERRO COMPLETO:");
      console.log(error.response?.data);
      console.log(error.response?.status);
      console.log(error.response?.data?.error);
      setFeedback("Erro ao cadastrar orçamento.");
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
              <Pressable onPress={onClose} style={globalStyles.leftAction}>
                <Ionicons name="arrow-back" size={25} color={COLORS.text} />
              </Pressable>

              <Text style={globalStyles.addTitle}>Novo Orçamento</Text>

              <Pressable onPress={handleSave} style={globalStyles.rightAction}>
                <View style={globalStyles.saveTextStack}>
                  <Text style={globalStyles.saveText}>Salvar</Text>
                  <Text style={globalStyles.saveText}>Orçamento</Text>
                </View>
                <Ionicons name="add-circle" size={20} color={COLORS.title} />
              </Pressable>
            </View>

            {/* CONTEÚDO ROLÁVEL */}
            <ScrollView
              style={{ flex: 1 }}
              showsVerticalScrollIndicator={true}
              contentContainerStyle={{
                paddingRight: 20,
              }}
            >
              <Text style={globalStyles.subtitle}>Informações Gerais</Text>
              <View style={globalStyles.divider} />
              <Text style={globalStyles.label}>Nome do orçamento</Text>
              <AppInput
                placeholder="Nome do orçamento"
                value={name}
                onChangeText={setName}
              />

              <Text style={globalStyles.label}>Cliente</Text>

              <Picker
                selectedValue={selectedClient}
                onValueChange={(itemValue) => setSelectedClient(itemValue)}
                style={{
                  padding: 15,
                  borderRadius: 10,
                  width: "100%",
                  backgroundColor: COLORS.backgroundSection,
                }}
              >
                <Picker.Item
                  label="Selecione um cliente"
                  value=""
                  style={{ color: COLORS.textSecondary }}
                />

                {clientsList.map((cliente: any) => (
                  <Picker.Item
                    key={cliente._id}
                    label={cliente.nome}
                    value={cliente._id}
                  />
                ))}
              </Picker>

              {feedbackClient !== "" && (
                <Text style={globalStyles.feedback}>{feedbackClient}</Text>
              )}

              <Text style={globalStyles.label}>Descrição</Text>
              <AppInput
                placeholder="Descrição"
                value={descricao}
                onChangeText={setDescricao}
              />

              <Text style={globalStyles.label}>Data de publicação: {dataPublicacao.toLocaleDateString("pt-BR")}</Text>

              <Text style={globalStyles.label}>Validade do orçamento</Text>

              <Picker
                selectedValue={validade}
                onValueChange={(itemValue) => setValidade(Number(itemValue))}
                style={{
                  padding: 15,
                  borderRadius: 10,
                  width: "100%",
                  backgroundColor: COLORS.backgroundSection,
                }}
              >
                <Picker.Item
                  label="Selecione a validade"
                  value={0}
                  style={{ color: COLORS.textSecondary }}
                />

                {Array.from({ length: 14 }, (_, i) => (
                  <Picker.Item
                    key={i + 1}
                    label={`${i + 1} ${i === 0 ? "dia" : "dias"}`}
                    value={i + 1}
                  />
                ))}
              </Picker>

              <Text style={[globalStyles.label, {marginBottom:15}]}>Válido até: {dataValidade ? dataValidade.toLocaleDateString("pt-BR") : 
                "Selecione a validade acima"}</Text>

              <Text style={globalStyles.subtitle}>Endereço da obra</Text>
              <View style={globalStyles.divider} />

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

              <Text style={globalStyles.subtitle}>Categorias e Serviços</Text>
              <View style={globalStyles.divider} />

              {categorias.map((cat,index) => (
                <View key={cat.id}>
                  <Text style={globalStyles.label}> Nome da Categoria {index}</Text>
                  <AppInput
                    placeholder="Informe o nome da categoria"
                    value={cat.nome}
                    onChangeText={(t) => updateCategoria(cat.id, "nome", t)}
                  />

                  {cat.servicos.map((s, index) => (
                    <View
                      key={s.id}
                      style={{
                        width: "100%",
                        marginBottom: 20,
                        padding: 10,
                        borderWidth: 1,
                        borderColor: "#334155",
                        borderRadius: 12,
                      }}
                    >
                      <Text
                        style={{
                          color: COLORS.text,
                          marginBottom: 12,
                          fontWeight: "bold",
                        }}
                      >
                        Serviço {index + 1}
                      </Text>
                      <Text style={globalStyles.label}>Nome do Serviço</Text>
                      <AppInput
                        placeholder="Informe o Nome do Serviço"
                        value={s.nome}
                        onChangeText={(text) =>
                          updateServico(cat.id, s.id, "nome", text)
                        }
                      />
                      <Text style={globalStyles.label}>
                        Unidade do Serviço (Unid. , m, m², m³, HR, etc...){" "}
                      </Text>
                      <AppInput
                        placeholder="Unidade"
                        value={s.unidade}
                        onChangeText={(text) =>
                          updateServico(cat.id, s.id, "unidade", text)
                        }
                      />
                      <Text style={globalStyles.label}>Quantidade</Text>
                      <AppInput
                        placeholder="Informe a Quantidade"
                        value={String(s.quantidade_unidade)}
                        onChangeText={(text) =>
                          updateServico(
                            cat.id,
                            s.id,
                            "quantidade_unidade",
                            Number(text),
                          )
                        }
                      />
                      <Text style={globalStyles.label}>Valor Unitário</Text>
                      <AppInput
                        placeholder="Informe o valor unitário do serviço"
                        value={String(s.preco_da_unidade)}
                        onChangeText={(text) =>
                          updateServico(
                            cat.id,
                            s.id,
                            "preco_da_unidade",
                            Number(text),
                          )
                        }
                      />

                      <Text
                        style={{
                          color: COLORS.success,
                          fontWeight: "bold",
                        }}
                      >
                        Total de todos os Serviços: R$
                        {s.preco_total.toFixed(2)}
                      </Text>
                    </View>
                  ))}
                  <Text
                    style={{
                      color: COLORS.primary,
                      fontWeight: "bold",
                    }}
                  >
                    Total da Categoria {cat.nome}: R$
                    {cat.preco_total_da_categoria.toFixed(2)}
                  </Text>
                  <View style={globalStyles.divider} />
                  <AppButton
                    title="+ Adicionar Serviço"
                    onPress={() => addServico(cat.id)}
                  />
                  <View style={globalStyles.divider} />
                </View>
              ))}
              <AppButton
                title="+ Nova Categoria"
                onPress={addCategoria}
                color={COLORS.primary}
              />
              <View style={globalStyles.divider} />
              <Text style={globalStyles.label}>Link da tabela SINAPI</Text>
              <AppButton
                title="Baixar Tabela SINAPI"
                onPress={handleOpenSinapiLink}
              />
              {feedbackSinapi !== "" && (
                <Text style={globalStyles.feedback}>{feedbackSinapi}</Text>
              )}
              <Text style={[globalStyles.subtitle, { marginTop: 10 }]}>
                Valores Financeiros
              </Text>
              <View style={globalStyles.divider} />

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
