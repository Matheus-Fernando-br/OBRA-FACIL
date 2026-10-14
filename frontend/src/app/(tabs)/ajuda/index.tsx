import { View, ScrollView, Text, Pressable } from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeIn } from "react-native-reanimated";

import { useTheme } from "@/contexts/ThemeContext";
import { PageHeader } from "@/components/layout/PageHeader";
import { SettingsSection } from "@/components/settings/SettingsSection";
import { SettingsItem } from "@/components/settings/SettingsItem";

const STEPS = [
  { icon: "person-add", title: "Cadastre o cliente", text: "Em Clientes, toque em + e informe nome, CPF/CNPJ, e-mail e telefone." },
  { icon: "document-text", title: "Monte o orçamento", text: "Crie etapas e serviços com unidade, quantidade e valor unitário. Informe o BDI e a validade." },
  { icon: "share-social", title: "Envie o PDF", text: "Abra o orçamento, toque em PDF e compartilhe pelo WhatsApp ou e-mail." },
  { icon: "checkmark-circle", title: "Registre a decisão", text: "Edite o orçamento e mude o status para Aprovado ou Recusado." },
  { icon: "construct", title: "Acompanhe a obra", text: "Em Obras, toque em + e escolha o orçamento aprovado. Atualize dias e serviços concluídos." },
] as const;

const FAQ = [
  {
    q: "Por que não consigo editar um orçamento aprovado?",
    a: "Orçamentos aprovados ou recusados ficam bloqueados para preservar o que foi combinado com o cliente. Você ainda pode visualizar, gerar o PDF e arquivar.",
  },
  {
    q: "Como o progresso da obra é calculado?",
    a: "Cada serviço tem dias previstos. A conclusão é a soma dos dias previstos dos serviços marcados como concluídos dividida pelo total previsto da obra.",
  },
  {
    q: "Quando uma obra aparece como atrasada?",
    a: "Quando a data de término prevista já passou e ainda há serviços em aberto, ou quando a obra terminou com mais dias reais do que o previsto.",
  },
  {
    q: "O que é o BDI?",
    a: "Benefícios e Despesas Indiretas: percentual aplicado sobre o custo direto para cobrir administração, impostos, riscos e lucro. Use 0 se não houver.",
  },
  {
    q: "Posso usar quantidades com casas decimais?",
    a: "Sim. Digite com vírgula, por exemplo 12,5 m² ou 0,75 m³.",
  },
  {
    q: "Como exporto meus dados para o Excel?",
    a: "Em Relatórios, escolha o formato Planilha e toque em Clientes, Orçamentos ou Obras. O arquivo CSV abre no Excel e no Google Planilhas.",
  },
  {
    q: "Para que serve arquivar?",
    a: "Arquivar tira da lista principal os orçamentos decididos e as obras concluídas, sem apagar nada. Use o filtro “Arquivados” para vê-los.",
  },
];

export default function AjudaScreen() {
  const { styles, theme } = useTheme();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <View style={styles.screen}>
      <PageHeader title="Ajuda" subtitle="Primeiros passos e dúvidas frequentes" />

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        <SettingsSection title="Primeiros passos">
          {STEPS.map((step, i) => (
            <SettingsItem
              key={step.title}
              icon={step.icon}
              iconColor={theme.primary}
              title={`${i + 1}. ${step.title}`}
              description={step.text}
            />
          ))}
        </SettingsSection>

        <Text style={styles.subtitle}>Perguntas frequentes</Text>
        <View style={styles.groupedList}>
          {FAQ.map((item, i) => {
            const expanded = open === i;
            return (
              <View key={item.q}>
                {i > 0 && <View style={[styles.menuCardDivider, { marginLeft: 16 }]} />}
                <Pressable
                  onPress={() => setOpen(expanded ? null : i)}
                  accessibilityRole="button"
                  accessibilityState={{ expanded }}
                  style={({ pressed }) => [
                    { padding: 16, flexDirection: "row", gap: 12, alignItems: "center" },
                    pressed && { backgroundColor: theme.surfaceMuted },
                  ]}
                >
                  <Text style={[styles.menuText, { flex: 1, fontWeight: "600" }]}>{item.q}</Text>
                  <Ionicons
                    name={expanded ? "chevron-up" : "chevron-down"}
                    size={16}
                    color={theme.placeholder}
                  />
                </Pressable>
                {expanded && (
                  <Animated.Text
                    entering={FadeIn.duration(200)}
                    style={[styles.menuCardDescription, { paddingHorizontal: 16, paddingBottom: 16, lineHeight: 19 }]}
                  >
                    {item.a}
                  </Animated.Text>
                )}
              </View>
            );
          })}
        </View>

        <SettingsSection title="Suporte">
          <SettingsItem
            icon="chatbubbles"
            iconColor={theme.textSecondary}
            title="Falar com o suporte"
            description="Em breve"
            disabled
          />
          <SettingsItem
            icon="bug"
            iconColor={theme.textSecondary}
            title="Reportar problema"
            description="Em breve"
            disabled
          />
        </SettingsSection>
      </ScrollView>
    </View>
  );
}
