import { useEffect, useState } from "react";
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
import { AppButton } from "@/components/buttons/AppButton";
import { useAuth } from "@/contexts/AuthContext";

import {
  Cliente,
  Obra,
  Orcamento,
  CategoriaObra,
  ServicoObra,
} from "@/components/layout/interface";

/////////////////////////////
// Interfaces Locais
/////////////////////////////

interface ServicoObraForm extends ServicoObra {
  id: string;
  // Campos adicionais de controle de datas como string para o form
  data_inicio_prevista_str?: string;
  data_fim_prevista_str?: string;
  data_inicio_real_str?: string;
  data_fim_real_str?: string;
  qt_dias_prevista?: number;
  qt_dias_real?: number;
}

interface CategoriaObraForm extends CategoriaObra {
  id: string;
  servicos: ServicoObraForm[];
}

interface ObrasFormProps {
  mode: "create" | "edit" | "details";
  initialData?: Obra | null;
  onClose: () => void;
  onSave?: (data: any) => Promise<void>;
  clientsList: Cliente[];
  feedbackMessage?: string;
  loading?: boolean;
}

export function ObrasForm({
  mode,
  initialData,
  onClose,
  onSave,
  clientsList,
  feedbackMessage,
  loading,
}: ObrasFormProps) {
  const { token, user } = useAuth();
  
  const isCreate = mode === "create";
  const isEdit = mode === "edit";
  const isDetails = mode === "details";
  const isReadOnly = mode === "details";

  // O orçamento atrelado à obra
  const orcamento = initialData?.orcamento as Orcamento | undefined;
  
  // Encontrar o cliente na lista
  const clienteObra = clientsList.find((c) => {
    if (!orcamento?.cliente) return false;
    return c._id === (typeof orcamento.cliente === "string" ? orcamento.cliente : orcamento.cliente._id);
  });

  /////////////////////////////
  // Estados da Obra
  /////////////////////////////
  
  const [status, setStatus] = useState(initialData?.status || "NOPRAZO");
  
  // Datas globais da obra
  const [dataInicioPrevista, setDataInicioPrevista] = useState("");
  const [dataFimPrevista, setDataFimPrevista] = useState("");
  const [dataInicioReal, setDataInicioReal] = useState("");
  const [dataFimReal, setDataFimReal] = useState("");

  // Progresso global
  const [porcentagemConclusaoGeral, setPorcentagemConclusaoGeral] = useState(
    initialData?.porcentagem_de_conclusao || 0
  );

  // Categorias e Serviços
  const [categorias, setCategorias] = useState<CategoriaObraForm[]>([]);

  const [feedback, setFeedback] = useState("");

  /////////////////////////////
  // Inicialização de Dados
  /////////////////////////////
  
  useEffect(() => {
    if (!initialData) return;

    // Configura as datas globais da obra
    if (initialData.data_inicio_prevista) {
      setDataInicioPrevista(new Date(initialData.data_inicio_prevista).toISOString().split("T")[0]);
    }
    if (initialData.data_fim_prevista) {
      setDataFimPrevista(new Date(initialData.data_fim_prevista).toISOString().split("T")[0]);
    }
    if (initialData.data_inicio_real) {
      setDataInicioReal(new Date(initialData.data_inicio_real).toISOString().split("T")[0]);
    }
    if (initialData.data_fim_real) {
      setDataFimReal(new Date(initialData.data_fim_real).toISOString().split("T")[0]);
    }

    // Se for modo CREATE, precisamos montar as categorias da obra baseadas nas categorias do orçamento
    if (isCreate && orcamento) {
      const categoriasIniciais: CategoriaObraForm[] = orcamento.categoria.map((cat, catIdx) => ({
        id: `cat-${catIdx}-${Date.now()}`,
        nome: cat.nome,
        porcentagem_de_conclusao: 0,
        qt_dias_prevista: 0,
        qt_dias_real: 0,
        servicos: cat.servicos.map((serv, servIdx) => ({
          id: `serv-${catIdx}-${servIdx}-${Date.now()}`,
          nome: serv.nome,
          descricao: serv.descricao,
          porcentagem_de_conclusao: 0,
          qt_dias_prevista: 0,
          qt_dias_real: 0,
          data_inicio_prevista_str: "",
          data_fim_prevista_str: "",
          data_inicio_real_str: "",
          data_fim_real_str: "",
        })),
      }));
      setCategorias(categoriasIniciais);
    } 
    // Se for EDIT ou DETAILS, carregamos os dados que já existem na obra
    else if (initialData.categoria) {
      const categoriasCarregadas: CategoriaObraForm[] = initialData.categoria.map((cat, catIdx) => ({
        ...cat,
        id: `cat-${catIdx}-${Date.now()}`,
        servicos: cat.servicos.map((serv, servIdx) => ({
          ...serv,
          id: `serv-${catIdx}-${servIdx}-${Date.now()}`,
          // Assumindo que os serviços da Obra já possuem campos de data no backend, mapeamos para string
          // Se não existirem, iniciamos vazios
          data_inicio_prevista_str: "", 
          data_fim_prevista_str: "",
          data_inicio_real_str: "",
          data_fim_real_str: "",
        })),
      }));
      setCategorias(categoriasCarregadas);
      setPorcentagemConclusaoGeral(initialData.porcentagem_de_conclusao || 0);
    }
  }, [initialData, isCreate, orcamento]);

  /////////////////////////////
  // Cálculos Automáticos
  /////////////////////////////

  function updateServico(
    categoriaId: string,
    servicoId: string,
    field: keyof ServicoObraForm,
    value: string | number
  ) {
    setCategorias((prevCategorias) => {
      const novasCategorias = prevCategorias.map((cat) => {
        if (cat.id !== categoriaId) return cat;

        const novosServicos = cat.servicos.map((serv) => {
          if (serv.id !== servicoId) return serv;
          return { ...serv, [field]: value };
        });

        // Se o campo alterado foi a porcentagem, recalcula a média da categoria
        let novaPorcentagemCat = cat.porcentagem_de_conclusao;
        if (field === "porcentagem_de_conclusao") {
          const somaPorcentagem = novosServicos.reduce(
            (acc, s) => acc + (Number(s.porcentagem_de_conclusao) || 0),
            0
          );
          novaPorcentagemCat =
            novosServicos.length > 0
              ? Math.round(somaPorcentagem / novosServicos.length)
              : 0;
        }

        // Se alterou os dias reais ou previstos, você pode querer recalcular os totais da categoria aqui
        // Para simplificar, focaremos na porcentagem conforme seu requisito, 
        // mas você pode expandir a lógica para dias_previstos_categoria = soma(dias_previstos_servicos)

        return {
          ...cat,
          servicos: novosServicos,
          porcentagem_de_conclusao: novaPorcentagemCat,
        };
      });

      // Se atualizamos a porcentagem, recalcula a geral da obra
      if (field === "porcentagem_de_conclusao") {
        const somaGeral = novasCategorias.reduce(
          (acc, c) => acc + (c.porcentagem_de_conclusao || 0),
          0
        );
        const mediaGeral =
          novasCategorias.length > 0
            ? Math.round(somaGeral / novasCategorias.length)
            : 0;
        setPorcentagemConclusaoGeral(mediaGeral);
      }

      return novasCategorias;
    });
  }

  /////////////////////////////
  // Handlers
  /////////////////////////////

  async function handleSave() {
    if (isReadOnly) return;
    setFeedback("");

    if (!token || !user) {
      setFeedback("Sessão expirada.");
      return;
    }

    // Prepara o payload seguindo a estrutura da interface Obra
    const workData = {
      status,
      data_inicio_prevista: dataInicioPrevista ? new Date(dataInicioPrevista) : undefined,
      data_fim_prevista: dataFimPrevista ? new Date(dataFimPrevista) : undefined,
      data_inicio_real: dataInicioReal ? new Date(dataInicioReal) : undefined,
      data_fim_real: dataFimReal ? new Date(dataFimReal) : undefined,
      porcentagem_de_conclusao: porcentagemConclusaoGeral,
      categoria: categorias.map((cat) => ({
        nome: cat.nome,
        porcentagem_de_conclusao: cat.porcentagem_de_conclusao,
        qt_dias_prevista: cat.qt_dias_prevista,
        qt_dias_real: cat.qt_dias_real,
        servicos: cat.servicos.map((s) => ({
          nome: s.nome,
          descricao: s.descricao,
          porcentagem_de_conclusao: s.porcentagem_de_conclusao,
          qt_dias_prevista: s.qt_dias_prevista,
          qt_dias_real: s.qt_dias_real,
          // Dependendo do seu backend, você pode precisar converter as datas de string para Date aqui também
        })),
      })),
    };

    if (onSave) await onSave(workData);
  }

  const headerTitle = isCreate
    ? "Nova Obra"
    : isEdit
      ? "Editar Obra"
      : "Detalhes da Obra";

  const buttonText = isCreate ? "Iniciar Obra" : "Salvar Alterações";

  return (
    <View style={globalStyles.container}>
      
      {/* ========================= */}
      {/* 1. Cabeçalho */}
      {/* ========================= */}

      <View style={globalStyles.modalHeader}>
        <Pressable onPress={onClose} style={globalStyles.leftAction}>
          <Ionicons name="arrow-back" size={25} color={COLORS.text} />
        </Pressable>
        
        <Text style={globalStyles.addTitle}>{headerTitle}</Text>

        {!isDetails && (
          <Pressable onPress={handleSave} style={globalStyles.rightAction}>
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <View style={globalStyles.saveTextStack}>
                <Text style={globalStyles.saveText}>{buttonText}</Text>
              </View>
            )}
            {!loading && (
              <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
            )}
          </Pressable>
        )}
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingRight: 20,
        }}
      >
        {/* ========================= */}
        {/* 2. Informações Gerais */}
        {/* ========================= */}

        <Text style={globalStyles.subtitle}>Informações Gerais</Text>
        <View style={globalStyles.divider} />

        <View style={globalStyles.card}>
          <Text style={globalStyles.label}>Nome da Obra / Orçamento:</Text>
          <AppInput 
            value={orcamento?.nome ?? ""} 
            editable={false} 
          />

          <Text style={globalStyles.label}>Cliente:</Text>
          <AppInput 
            value={clienteObra?.nome ?? ""} 
            editable={false} 
          />

          <Text style={globalStyles.label}>Responsável:</Text>
          <AppInput 
            value={typeof initialData?.responsavel === "object" ? initialData.responsavel.nome : "Responsável atual"} 
            editable={false} 
          />

          <Text style={globalStyles.label}>Status da Obra:</Text>
          <Picker
            selectedValue={status}
            onValueChange={(itemValue) => setStatus(itemValue)}
            style={{
              padding: 15,
              borderRadius: 10,
              width: "100%",
              backgroundColor: COLORS.backgroundSection,
            }}
            enabled={!isReadOnly}
          >
            <Picker.Item label="NO PRAZO" value="NOPRAZO" />
            <Picker.Item label="ATRASADO" value="ATRASADO" />
            <Picker.Item label="ADIANTADO" value="ADIANTADO" />
            <Picker.Item label="ENTREGUE" value="ENTREGUE" />
            <Picker.Item label="CANCELADO" value="CANCELADO" />
          </Picker>

          <Text style={globalStyles.label}>Valor do Orçamento Aprovado:</Text>
          <AppInput
            value={`R$ ${(orcamento?.preco_com_bdi ?? 0).toFixed(2)}`}
            editable={false}
          />
        </View>

        {/* ========================= */}
        {/* 3. Endereço */}
        {/* ========================= */}

        <Text style={globalStyles.subtitle}>Endereço da Obra</Text>
        <View style={globalStyles.divider} />

        <View style={globalStyles.card}>
          <View style={globalStyles.row}>
            <View style={globalStyles.column}>
              <Text style={globalStyles.label}>CEP</Text>
              <AppInput 
                value={orcamento?.endereco?.CEP ?? ""} 
                editable={false} 
              />
            </View>
            <View style={globalStyles.column}>
              <Text style={globalStyles.label}>Estado:</Text>
              <AppInput
                value={orcamento?.endereco?.estado ?? ""}
                editable={false}
              />
            </View>
          </View>
          <View style={globalStyles.row}>
            <View style={globalStyles.column}>
              <Text style={globalStyles.label}>Cidade:</Text>
              <AppInput
                value={orcamento?.endereco?.cidade ?? ""}
                editable={false}
              />
            </View>
            <View style={globalStyles.column}>
              <Text style={globalStyles.label}>Bairro:</Text>
              <AppInput
                value={orcamento?.endereco?.bairro ?? ""}
                editable={false}
              />
            </View>
          </View>
          <View style={globalStyles.row}>
            <Text style={globalStyles.label}>Logradouro:</Text>
            <AppInput 
              value={orcamento?.endereco?.rua ?? ""} 
              editable={false} 
            />
          </View>
          <View style={globalStyles.row}>
            <View style={globalStyles.column}>
              <Text style={globalStyles.label}>Número:</Text>
              <AppInput
                value={orcamento?.endereco?.numero ?? ""}
                editable={false}
              />
            </View>
            <View style={globalStyles.column}>
              <Text style={globalStyles.label}>Complemento:</Text>
              <AppInput
                value={orcamento?.endereco?.complemento ?? ""}
                editable={false}
              />
            </View>
          </View>
        </View>

        {/* ========================= */}
        {/* 4. Cronograma Geral */}
        {/* ========================= */}

        <Text style={globalStyles.subtitle}>Cronograma Geral</Text>
        <View style={globalStyles.divider} />

        <View style={globalStyles.card}>
          <View style={globalStyles.row}>
            <View style={globalStyles.column}>
              <Text style={globalStyles.label}>Data Prevista de Início</Text>
              <AppInput
                placeholder="dd/mm/aaaa ou aaaa-mm-dd"
                value={dataInicioPrevista}
                editable={!isReadOnly}
                onChangeText={setDataInicioPrevista}
              />
            </View>
            <View style={globalStyles.column}>
              <Text style={globalStyles.label}>Data Prevista de Término</Text>
              <AppInput
                placeholder="dd/mm/aaaa ou aaaa-mm-dd"
                value={dataFimPrevista}
                editable={!isReadOnly}
                onChangeText={setDataFimPrevista}
              />
            </View>
          </View>

          <View style={globalStyles.row}>
            <View style={globalStyles.column}>
              <Text style={globalStyles.label}>Data Real de Início</Text>
              <AppInput
                placeholder="dd/mm/aaaa ou aaaa-mm-dd"
                value={dataInicioReal}
                editable={!isReadOnly}
                onChangeText={setDataInicioReal}
              />
            </View>
            <View style={globalStyles.column}>
              <Text style={globalStyles.label}>Data Real de Término</Text>
              <AppInput
                placeholder="dd/mm/aaaa ou aaaa-mm-dd"
                value={dataFimReal}
                editable={!isReadOnly}
                onChangeText={setDataFimReal}
              />
            </View>
          </View>

          <Text style={globalStyles.label}>Status de Execução</Text>
          <AppInput value={status} editable={false} />
        </View>

        {/* ========================= */}
        {/* 5. Resumo */}
        {/* ========================= */}

        <Text style={globalStyles.subtitle}>Resumo da Obra</Text>
        <View style={globalStyles.divider} />

        <View style={globalStyles.card}>
          <Text style={globalStyles.label}>Valor da Obra</Text>
          <Text style={globalStyles.categoryTotalText}>
            R$ {(orcamento?.preco_com_bdi ?? 0).toFixed(2)}
          </Text>

          <View style={globalStyles.row}>
            <View style={globalStyles.column}>
              <Text style={globalStyles.label}>Categorias</Text>
              <Text style={globalStyles.orcamentoInfo}>
                {categorias.length}
              </Text>
            </View>
            <View style={globalStyles.column}>
              <Text style={globalStyles.label}>Serviços</Text>
              <Text style={globalStyles.orcamentoInfo}>
                {categorias.reduce((acc, cat) => acc + cat.servicos.length, 0)}
              </Text>
            </View>
          </View>

          <View style={globalStyles.row}>
            <View style={globalStyles.column}>
              <Text style={globalStyles.label}>Dias Previstos Totais</Text>
              <Text style={globalStyles.orcamentoInfo}>
                {categorias.reduce((acc, cat) => acc + (cat.qt_dias_prevista || 0), 0)}
              </Text>
            </View>
            <View style={globalStyles.column}>
              <Text style={globalStyles.label}>Dias Executados Totais</Text>
              <Text style={globalStyles.orcamentoInfo}>
                {categorias.reduce((acc, cat) => acc + (cat.qt_dias_real || 0), 0)}
              </Text>
            </View>
          </View>

          <Text style={[globalStyles.label, { marginTop: 10 }]}>Progresso Geral da Obra</Text>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 5 }}>
            <Text style={{ color: COLORS.primary, fontWeight: "bold", fontSize: 24, flex: 1 }}>
              {porcentagemConclusaoGeral}%
            </Text>
          </View>
          <View
            style={{
              height: 12,
              backgroundColor: "#E5E7EB",
              borderRadius: 20,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                width: `${Math.min(Math.max(porcentagemConclusaoGeral, 0), 100)}%`,
                height: "100%",
                backgroundColor: COLORS.primary,
              }}
            />
          </View>
        </View>

        {/* ========================= */}
        {/* 6. Categorias e 7. Serviços */}
        {/* ========================= */}

        <Text style={globalStyles.subtitle}>Planejamento e Execução</Text>
        <View style={globalStyles.divider} />

        {categorias.map((categoria, catIndex) => (
          <View
            key={categoria.id}
            style={[globalStyles.card, { marginBottom: 20 }]}
          >
            {/* ========================= */}
            {/* Categoria Header */}
            {/* ========================= */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 15,
              }}
            >
              <Text style={[globalStyles.title, { flex: 1 }]}>
                {catIndex + 1}. {categoria.nome}
              </Text>

              <View
                style={{
                  backgroundColor: "#EEF2FF",
                  paddingHorizontal: 12,
                  paddingVertical: 5,
                  borderRadius: 20,
                }}
              >
                <Text style={{ color: COLORS.primary, fontWeight: "700" }}>
                  {categoria.porcentagem_de_conclusao ?? 0}%
                </Text>
              </View>
            </View>

            {/* Barra de Progresso da Categoria */}
            <View
              style={{
                height: 8,
                backgroundColor: "#E5E7EB",
                borderRadius: 20,
                overflow: "hidden",
                marginBottom: 15,
              }}
            >
              <View
                style={{
                  width: `${Math.min(Math.max(categoria.porcentagem_de_conclusao || 0, 0), 100)}%`,
                  height: "100%",
                  backgroundColor: COLORS.primary, // ou "#22C55E" para verde
                }}
              />
            </View>

            <View style={[globalStyles.row, { marginBottom: 15 }]}>
              <Text style={globalStyles.orcamentoInfo}>
                Serviços: {categoria.servicos.length}
              </Text>
              <Text style={globalStyles.orcamentoInfo}>
                Dias Previstos: {categoria.qt_dias_prevista || 0}
              </Text>
              <Text style={globalStyles.orcamentoInfo}>
                Dias Executados: {categoria.qt_dias_real || 0}
              </Text>
            </View>

            <View style={globalStyles.divider} />
            <Text style={[globalStyles.label, { marginBottom: 10, fontSize: 16 }]}>
              Serviços da Categoria
            </Text>

            {/* ========================= */}
            {/* Serviços da Categoria */}
            {/* ========================= */}
            {categoria.servicos.map((servico, servIndex) => (
              <View key={servico.id} style={globalStyles.serviceContainer}>
                
                <Text style={globalStyles.serviceTitle}>
                  {catIndex + 1}.{servIndex + 1} {servico.nome}
                </Text>
                
                {!!servico.descricao && (
                  <Text style={{ color: "#6B7280", marginBottom: 15 }}>
                    {servico.descricao}
                  </Text>
                )}

                <View style={globalStyles.row}>
                  <View style={[globalStyles.column, { flex: 2 }]}>
                    <Text style={globalStyles.label}>Progresso do Serviço (%)</Text>
                    <AppInput
                      placeholder="0 a 100"
                      value={String(servico.porcentagem_de_conclusao ?? 0)}
                      onChangeText={(val) => {
                        const num = Number(val);
                        if (!isNaN(num) && num >= 0 && num <= 100) {
                          updateServico(categoria.id, servico.id, "porcentagem_de_conclusao", num);
                        } else if (val === "") {
                          updateServico(categoria.id, servico.id, "porcentagem_de_conclusao", 0);
                        }
                      }}
                      editable={!isReadOnly}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                {/* Barra de Progresso do Serviço */}
                <View
                  style={{
                    height: 6,
                    backgroundColor: "#E5E7EB",
                    borderRadius: 20,
                    overflow: "hidden",
                    marginBottom: 20,
                    marginTop: 5,
                  }}
                >
                  <View
                    style={{
                      width: `${Math.min(Math.max(servico.porcentagem_de_conclusao || 0, 0), 100)}%`,
                      height: "100%",
                      backgroundColor: "#22C55E",
                    }}
                  />
                </View>

                <View style={globalStyles.row}>
                  <View style={globalStyles.column}>
                    <Text style={globalStyles.label}>Início Previsto</Text>
                    <AppInput
                      placeholder="dd/mm/aaaa"
                      value={servico.data_inicio_prevista_str || ""}
                      onChangeText={(val) => updateServico(categoria.id, servico.id, "data_inicio_prevista_str", val)}
                      editable={!isReadOnly}
                    />
                  </View>
                  <View style={globalStyles.column}>
                    <Text style={globalStyles.label}>Término Previsto</Text>
                    <AppInput
                      placeholder="dd/mm/aaaa"
                      value={servico.data_fim_prevista_str || ""}
                      onChangeText={(val) => updateServico(categoria.id, servico.id, "data_fim_prevista_str", val)}
                      editable={!isReadOnly}
                    />
                  </View>
                </View>

                <View style={globalStyles.row}>
                  <View style={globalStyles.column}>
                    <Text style={globalStyles.label}>Início Real</Text>
                    <AppInput
                      placeholder="dd/mm/aaaa"
                      value={servico.data_inicio_real_str || ""}
                      onChangeText={(val) => updateServico(categoria.id, servico.id, "data_inicio_real_str", val)}
                      editable={!isReadOnly}
                    />
                  </View>
                  <View style={globalStyles.column}>
                    <Text style={globalStyles.label}>Término Real</Text>
                    <AppInput
                      placeholder="dd/mm/aaaa"
                      value={servico.data_fim_real_str || ""}
                      onChangeText={(val) => updateServico(categoria.id, servico.id, "data_fim_real_str", val)}
                      editable={!isReadOnly}
                    />
                  </View>
                </View>

                <View style={globalStyles.row}>
                  <View style={globalStyles.column}>
                    <Text style={globalStyles.label}>Dias Previstos</Text>
                    <AppInput
                      placeholder="Qtd"
                      value={String(servico.qt_dias_prevista ?? 0)}
                      onChangeText={(val) => updateServico(categoria.id, servico.id, "qt_dias_prevista", Number(val))}
                      editable={!isReadOnly}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={globalStyles.column}>
                    <Text style={globalStyles.label}>Dias Executados</Text>
                    <AppInput
                      placeholder="Qtd"
                      value={String(servico.qt_dias_real ?? 0)}
                      onChangeText={(val) => updateServico(categoria.id, servico.id, "qt_dias_real", Number(val))}
                      editable={!isReadOnly}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

              </View>
            ))}
          </View>
        ))}

        {feedback !== "" && (
          <Text style={globalStyles.feedback}>{feedback}</Text>
        )}
        {feedbackMessage !== "" && (
          <Text style={globalStyles.feedback}>{feedbackMessage}</Text>
        )}
        
        {/* Espaço extra no final para scroll confortável */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}