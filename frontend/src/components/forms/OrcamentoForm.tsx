import { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { globalStyles, COLORS } from "@/styles/globalStyles";
import { AppInput } from "@/components/forms/AppInput";
import { AppCurrencyInput } from "./AppCurrencyInput";
import { AppButton } from "@/components/buttons/AppButton";
import * as Linking from "expo-linking";
import { useAuth } from "@/contexts/AuthContext";
import {
  Cliente,
  Servico,
  Categoria,
  Orcamento,
} from "@/components/layout/interface";

interface ServicoForm extends Servico {
  id: number;
}

interface CategoriaForm extends Categoria {
  id: number;
  servicos: ServicoForm[];
}

interface OrcamentoFormProps {
  mode: "add" | "edit" | "details";
  initialData?: Orcamento | null;
  onClose: () => void;
  onSave?: (data: any) => Promise<void>;
  onGeneratePdf?: () => void;
  clientsList: Cliente[];
  feedbackMessage?: string;
  loading?: boolean;
  onSuccess?: () => void;
}

export function OrcamentoForm({
  mode,
  initialData,
  onClose,
  onSave,
  onGeneratePdf,
  clientsList,
  feedbackMessage,
  loading,
  onSuccess,
}: OrcamentoFormProps) {
  const { token, user } = useAuth();
  const isReadOnly = mode === "details";
  const [nome, setNome] = useState(initialData?.nome || "");
  const [status, setStatus] = useState(initialData?.status || "");
  const [descricao, setDescricao] = useState(initialData?.descricao || "");
  const [selectedClient, setSelectedClient] = useState(() => {
    if (!initialData?.cliente) return "";

    return typeof initialData.cliente === "string"
      ? initialData.cliente
      : initialData.cliente._id;
  });
  useEffect(() => {
    if (!initialData?.cliente) return;

    setSelectedClient(
      typeof initialData.cliente === "string"
        ? initialData.cliente
        : initialData.cliente._id,
    );
  }, [initialData]);

  const [validade, setValidade] = useState<number>(
    initialData?.valido_durante || 0,
  );
  const [cep, setCep] = useState(initialData?.endereco.CEP || "");
  const [estado, setEstado] = useState(initialData?.endereco.estado || "");
  const [cidade, setCidade] = useState(initialData?.endereco.cidade || "");
  const [bairro, setBairro] = useState(initialData?.endereco.bairro || "");
  const [logradouro, setLogradouro] = useState(initialData?.endereco.rua || "");
  const [numero, setNumero] = useState(initialData?.endereco.numero || "");
  const [complemento, setComplemento] = useState(
    initialData?.endereco.complemento || "",
  );
  const [categorias, setCategorias] = useState<CategoriaForm[]>(
    initialData?.categoria.map((cat) => ({
      ...cat,
      id: Date.now() + Math.random(),
      servicos: cat.servicos.map((serv) => ({
        ...serv,
        id: Date.now() + Math.random(),
      })),
    })) || [
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
    ],
  );
  const [bdi, setBdi] = useState(initialData?.bdi.toString() || "");
  const [feedback, setFeedback] = useState("");
  const [feedbackSinapi, setFeedbackSinapi] = useState("");
  const dataPublicacao = initialData
    ? new Date(initialData.data_publicacao)
    : new Date();
  const dataValidade =
    validade > 0
      ? new Date(dataPublicacao.getTime() + validade * 24 * 60 * 60 * 1000)
      : null;

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

  function updateCategoria(id: number, field: keyof CategoriaForm, value: any) {
    setCategorias((prev) =>
      prev.map((categoria) =>
        categoria.id === id ? { ...categoria, [field]: value } : categoria,
      ),
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

  function updateServico(
    categoriaId: number,
    servicoId: number,
    field: keyof ServicoForm,
    value: string | number,
  ) {
    setCategorias((prev) =>
      prev.map((categoria) => {
        if (categoria.id !== categoriaId) return categoria;
        const servicos = categoria.servicos.map((servico) => {
          if (servico.id !== servicoId) return servico;
          const novoServico = { ...servico, [field]: value };
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

  async function handleSubmit() {
    if (isReadOnly) {
      return onGeneratePdf?.();
    }

    setFeedback("");

    if (!token || !user) {
      setFeedback("Sessão expirada.");
      return;
    }

    if (!nome.trim()) {
      setFeedback("Informe o nome do orçamento.");
      return;
    }

    if (!selectedClient) {
      setFeedback("Selecione um cliente.");
      return;
    }

    if (!status) {
      setFeedback("Selecione o status do orçamento.");
      return;
    }

    if (!dataPublicacao) {
      setFeedback("Informe a data de publicação.");
      return;
    }

    if (!validade) {
      setFeedback("Informe a validade do orçamento.");
      return;
    }

    if (!cep.trim()) {
      setFeedback("Informe o CEP.");
      return;
    }

    if (!estado) {
      setFeedback("Selecione o estado.");
      return;
    }

    if (!cidade.trim()) {
      setFeedback("Informe a cidade.");
      return;
    }

    if (!bairro.trim()) {
      setFeedback("Informe o bairro.");
      return;
    }

    if (!logradouro.trim()) {
      setFeedback("Informe o logradouro.");
      return;
    }

    for (let i = 0; i < categorias.length; i++) {
      const categoria = categorias[i];

      if (!categoria.nome.trim()) {
        setFeedback(`Informe o nome da categoria ${i + 1}.`);
        return;
      }

      for (let j = 0; j < categoria.servicos.length; j++) {
        const servico = categoria.servicos[j];

        if (!servico.nome.trim()) {
          setFeedback(
            `Informe o nome do serviço ${j + 1} da categoria ${i + 1}.`,
          );
          return;
        }

        if (!servico.unidade) {
          setFeedback(
            `Selecione a unidade do serviço ${j + 1} da categoria ${i + 1}.`,
          );
          return;
        }

        if (servico.quantidade_unidade <= 0) {
          setFeedback(
            `Informe uma quantidade válida para o serviço ${j + 1} da categoria ${i + 1}.`,
          );
          return;
        }

        if (servico.preco_da_unidade <= 0) {
          setFeedback(
            `Informe um valor unitário válido para o serviço ${j + 1} da categoria ${i + 1}.`,
          );
          return;
        }
      }
    }

    if (!bdi) {
      setFeedback("Informe o BDI.");
      return;
    }

    const budgetData = {
      nome,
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
        servicos: cat.servicos.map((s) => ({
          nome: s.nome,
          descricao: s.descricao,
          unidade: s.unidade,
          quantidade_unidade: s.quantidade_unidade,
          preco_da_unidade: s.preco_da_unidade,
          preco_total: s.preco_total,
        })),
      })),
      status,
      preco: custoObraCalculado,
      bdi: Number(bdi),
      preco_com_bdi: custoTotalComBDI,
      data_publicacao: dataPublicacao,
      valido_durante: validade,
      data_validade: dataValidade!,
    };
    if (onSave) await onSave(budgetData);
  }

  const handleOpenSinapiLink = async () => {
    const url =
      "https://www.caixa.gov.br/Downloads/sinapi-relatorios-mensais/SINAPI-2026-05-formato-pdf.zip";
    if (await Linking.canOpenURL(url)) await Linking.openURL(url);
    else setFeedbackSinapi("Erro ao abrir link.");
  };

  const scrollRef = useRef<ScrollView>(null);
  const irParaSalvar = () => {
    scrollRef.current?.scrollToEnd({
      animated: true,
    });
  };

  return (
    <View style={globalStyles.container}>
      <View style={globalStyles.modalHeader}>
        <Pressable onPress={onClose} style={globalStyles.leftAction}>
          <Ionicons name="arrow-back" size={25} color={COLORS.text} />
        </Pressable>
        <Text style={globalStyles.addTitle}>
          {mode === "add"
            ? "Novo Orçamento"
            : mode === "edit"
              ? "Editar Orçamento"
              : "Detalhes"}
        </Text>

        <Pressable onPress={irParaSalvar} style={globalStyles.rightAction}>
          <Text style={globalStyles.saveText}>
            {mode === "details" ? "Gerar PDF" : "Salvar"}
          </Text>
          <Ionicons name="download" size={25} color={COLORS.title} />
        </Pressable>
      </View>
      <ScrollView ref={scrollRef} style={{ flex: 1 }}>
        <Text style={globalStyles.subtitle}>Informações Gerais</Text>
        <View style={globalStyles.divider} />
        <View style={globalStyles.card}>
          <Text style={globalStyles.label}>Nome do orçamento:</Text>
          <AppInput
            placeholder="Nome do orçamento"
            value={nome}
            onChangeText={setNome}
            editable={!isReadOnly}
          />

          <Text style={globalStyles.label}>Cliente:</Text>
          <Picker
            selectedValue={selectedClient}
            onValueChange={(itemValue) => setSelectedClient(itemValue)}
            style={globalStyles.picker}
            enabled={!isReadOnly}
          >
            <Picker.Item label="Selecione um cliente" value="" />
            {clientsList.map((c) => (
              <Picker.Item key={c._id} label={c.nome} value={c._id} />
            ))}
          </Picker>
          <Text style={globalStyles.label}>Descrição:</Text>

          <AppInput
            placeholder="Descrição"
            value={descricao}
            onChangeText={setDescricao}
            editable={!isReadOnly}
            multiline
            numberOfLines={3}
          />

          <Text style={globalStyles.label}>Status de Orçamento:</Text>
          <Picker
            selectedValue={status}
            onValueChange={(itemValue) => setStatus(itemValue)}
            style={{
              padding: 15,
              borderRadius: 10,
              width: "100%",
              backgroundColor: COLORS.backgroundSection,
            }}
          >
            <Picker.Item
              label={"Selecione o Status do Orçamento " + nome}
              value=""
            />
            <Picker.Item label="PENDENTE" value="PENDENTE" />
            <Picker.Item label="APROVADO" value="APROVADO" />
            <Picker.Item label="RECUSADO" value="RECUSADO" />
          </Picker>

          <View style={globalStyles.row}>
            <View style={globalStyles.column}>
              <Text style={globalStyles.label}>Data de Publicação:</Text>
              <AppInput
                value={dataPublicacao.toLocaleDateString("pt-BR")}
                editable={false}
              />
            </View>
            <View style={globalStyles.column}>
              <Text style={globalStyles.label}>Validade (dias):</Text>
              <Picker
                selectedValue={validade}
                onValueChange={(v) => setValidade(Number(v))}
                style={globalStyles.picker}
                enabled={!isReadOnly}
              >
                {Array.from({ length: 15 }, (_, i) => (
                  <Picker.Item key={i} label={`${i} dias`} value={i} />
                ))}
              </Picker>
            </View>
          </View>
          <Text style={[globalStyles.label, { marginBottom: 15 }]}>
            Válido até:{" "}
            {dataValidade
              ? dataValidade.toLocaleDateString("pt-BR")
              : "Selecione a validade acima"}
          </Text>
        </View>
        <Text style={globalStyles.subtitle}>Endereço:</Text>
        <View style={globalStyles.divider} />
        <View style={globalStyles.card}>
          <View style={globalStyles.row}>
            <View style={globalStyles.column}>
              <Text style={globalStyles.label}>CEP</Text>
              <AppInput
                placeholder="CEP"
                value={cep}
                onChangeText={(t) => {
                  setCep(t);
                  buscarCep(t);
                }}
                editable={!isReadOnly}
                keyboardType="numeric"
              />
            </View>
            <View style={globalStyles.column}>
              <View style={globalStyles.column}>
                <Text style={globalStyles.label}>Estado:</Text>

                <Picker
                  selectedValue={estado}
                  onValueChange={(value) => setEstado(value)}
                  style={globalStyles.picker}
                  enabled={!isReadOnly}
                >
                  <Picker.Item label="Selecione o Estado" value="" />
                  <Picker.Item label="AC - Acre" value="AC" />
                  <Picker.Item label="AL - Alagoas" value="AL" />
                  <Picker.Item label="AP - Amapá" value="AP" />
                  <Picker.Item label="AM - Amazonas" value="AM" />
                  <Picker.Item label="BA - Bahia" value="BA" />
                  <Picker.Item label="CE - Ceará" value="CE" />
                  <Picker.Item label="DF - Distrito Federal" value="DF" />
                  <Picker.Item label="ES - Espírito Santo" value="ES" />
                  <Picker.Item label="GO - Goiás" value="GO" />
                  <Picker.Item label="MA - Maranhão" value="MA" />
                  <Picker.Item label="MT - Mato Grosso" value="MT" />
                  <Picker.Item label="MS - Mato Grosso do Sul" value="MS" />
                  <Picker.Item label="MG - Minas Gerais" value="MG" />
                  <Picker.Item label="PA - Pará" value="PA" />
                  <Picker.Item label="PB - Paraíba" value="PB" />
                  <Picker.Item label="PR - Paraná" value="PR" />
                  <Picker.Item label="PE - Pernambuco" value="PE" />
                  <Picker.Item label="PI - Piauí" value="PI" />
                  <Picker.Item label="RJ - Rio de Janeiro" value="RJ" />
                  <Picker.Item label="RN - Rio Grande do Norte" value="RN" />
                  <Picker.Item label="RS - Rio Grande do Sul" value="RS" />
                  <Picker.Item label="RO - Rondônia" value="RO" />
                  <Picker.Item label="RR - Roraima" value="RR" />
                  <Picker.Item label="SC - Santa Catarina" value="SC" />
                  <Picker.Item label="SP - São Paulo" value="SP" />
                  <Picker.Item label="SE - Sergipe" value="SE" />
                  <Picker.Item label="TO - Tocantins" value="TO" />
                </Picker>
              </View>
            </View>
          </View>
          <View style={globalStyles.row}>
            <View style={globalStyles.column}>
              <Text style={globalStyles.label}>Cidade:</Text>

              <AppInput
                placeholder="Cidade"
                value={cidade}
                onChangeText={setCidade}
                editable={!isReadOnly}
              />
            </View>
            <View style={globalStyles.column}>
              <Text style={globalStyles.label}>Bairro:</Text>

              <AppInput
                placeholder="Bairro"
                value={bairro}
                onChangeText={setBairro}
                editable={!isReadOnly}
              />
            </View>
          </View>
          <Text style={globalStyles.label}>Logradouro:</Text>
          <View style={globalStyles.row}>
            <AppInput
              placeholder="Rua"
              value={logradouro}
              onChangeText={setLogradouro}
              editable={!isReadOnly}
            />
          </View>
          <View style={globalStyles.row}>
            <View style={globalStyles.column}>
              <Text style={globalStyles.label}>Número:</Text>

              <AppInput
                placeholder="Nº"
                value={numero}
                onChangeText={setNumero}
                editable={!isReadOnly}
                keyboardType="numeric"
              />
            </View>
            <View style={globalStyles.column}>
              <Text style={globalStyles.label}>Complemento:</Text>

              <AppInput
                placeholder="Compl."
                value={complemento}
                onChangeText={setComplemento}
                editable={!isReadOnly}
              />
            </View>
          </View>
        </View>
        <Text style={globalStyles.subtitle}>Categorias e Serviços</Text>
        <View style={globalStyles.divider} />
        <Text style={globalStyles.label}>Link da tabela SINAPI:</Text>
        <AppButton
          title="Baixar Tabela SINAPI"
          onPress={handleOpenSinapiLink}
        />
        {feedbackSinapi !== "" && (
          <Text style={globalStyles.feedback}>{feedbackSinapi}</Text>
        )}
        {categorias.map((cat, idx) => (
          <View key={cat.id} style={[globalStyles.card, { marginTop: 20 }]}>
            <Text style={globalStyles.label}>Nome da Categoria {idx + 1}:</Text>
            <AppInput
              placeholder="Nome da Categoria"
              value={cat.nome}
              onChangeText={(t) => updateCategoria(cat.id, "nome", t)}
              editable={!isReadOnly}
            />
            {cat.servicos.map((s, sIdx) => (
              <View key={s.id} style={globalStyles.serviceContainer}>
                <Text style={globalStyles.serviceTitle}>
                  Nome do Serviço {sIdx + 1}:
                </Text>
                <AppInput
                  placeholder="Nome do Serviço"
                  value={s.nome}
                  onChangeText={(t) => updateServico(cat.id, s.id, "nome", t)}
                  editable={!isReadOnly}
                />
                <View style={globalStyles.row}>
                  <View style={globalStyles.column}>
                    <Text style={globalStyles.label}>Unidade do Serviço:</Text>

                    <Picker
                      selectedValue={s.unidade}
                      onValueChange={(value) =>
                        updateServico(cat.id, s.id, "unidade", value)
                      }
                      style={globalStyles.picker}
                      enabled={!isReadOnly}
                    >
                      <Picker.Item label="Selecione a Unid. " value="" />
                      <Picker.Item label="Metro (m)" value="m" />
                      <Picker.Item label="Metro quadrado (m²)" value="m²" />
                      <Picker.Item label="Metro cúbico (m³)" value="m³" />
                      <Picker.Item label="Unidade (UN)" value="UN" />
                      <Picker.Item label="Quilograma (kg)" value="kg" />
                      <Picker.Item label="Tonelada (t)" value="t" />
                      <Picker.Item label="Hora (h)" value="h" />
                      <Picker.Item label="Dia (dia)" value="dia" />
                      <Picker.Item label="Mês (mês)" value="mês" />
                      <Picker.Item label="Verba (VB)" value="VB" />
                    </Picker>
                  </View>

                  <View style={globalStyles.column}>
                    <Text style={globalStyles.label}>Valor Unitário:</Text>

                    <AppCurrencyInput
                      value={s.preco_da_unidade}
                      onChangeValue={(value) =>
                        updateServico(
                          cat.id,
                          s.id,
                          "preco_da_unidade",
                          value ?? 0,
                        )
                      }
                      editable={!isReadOnly}
                    />
                  </View>
                </View>
                <View style={globalStyles.row}>
                  <View style={globalStyles.column}>
                    <Text style={globalStyles.label}>Quantidade:</Text>

                    <AppInput
                      placeholder="Qtd"
                      value={String(s.quantidade_unidade)}
                      onChangeText={(t) =>
                        updateServico(
                          cat.id,
                          s.id,
                          "quantidade_unidade",
                          Number(t),
                        )
                      }
                      editable={!isReadOnly}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
                <Text style={globalStyles.serviceTotalText}>
                  Subtotal do Serviço {sIdx + 1}: R$ {s.preco_total.toFixed(2)}
                </Text>
              </View>
            ))}
            <Text
              style={[
                globalStyles.serviceTotalText,
                { fontSize: 15, color: COLORS.primary },
              ]}
            >
              Subtotal da Categoria {idx + 1}: R$
              {cat.preco_total_da_categoria.toFixed(2)}
            </Text>
            <View style={globalStyles.divider} />

            {!isReadOnly && (
              <AppButton title="+ Serviço" onPress={() => addServico(cat.id)} />
            )}
          </View>
        ))}

        {!isReadOnly && (
          <AppButton
            title="+ Categoria"
            onPress={addCategoria}
            color={COLORS.primary}
          />
        )}

        <Text style={[globalStyles.subtitle, { marginTop: 20 }]}>
          Valores Financeiros
        </Text>
        <View style={globalStyles.divider} />
        <View style={globalStyles.card}>
          <View style={globalStyles.row}>
            <View style={globalStyles.column}>
              <Text style={globalStyles.label}>Custo Obra:</Text>

              <AppInput
                value={custoObraCalculado.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
                editable={false}
              />
            </View>
            <View style={globalStyles.column}>
              <Text style={globalStyles.label}>BDI (%):</Text>

              <AppInput
                placeholder="BDI (%)"
                value={bdi}
                onChangeText={setBdi}
                editable={!isReadOnly}
                keyboardType="numeric"
              />
            </View>
          </View>

          <Text style={globalStyles.label}>Custo Total da Obra com BDI:</Text>
          <AppInput
            value={custoTotalComBDI.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
            editable={false}
          />
        </View>
        {feedback !== "" && (
          <Text style={globalStyles.feedback}>{feedback}</Text>
        )}
        {feedbackMessage !== "" && (
          <Text style={globalStyles.feedback}>{feedbackMessage}</Text>
        )}
        <View style={globalStyles.divider}></View>
        <AppButton
          title={
            mode === "add"
              ? "Salvar Novo Orçamento"
              : mode === "edit"
                ? "Salvar Alterações"
                : "Gerar PDF"
          }
          onPress={handleSubmit}
          color={COLORS.primary}
        />
      </ScrollView>
    </View>
  );
}
