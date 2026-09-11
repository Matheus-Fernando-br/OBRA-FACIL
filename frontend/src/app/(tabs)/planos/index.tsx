import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";

import { Assinatura, Plano } from "@/components/layout/interface";
import { PageHeader } from "@/components/layout/PageHeader";
import { SettingsItem } from "@/components/settings/SettingsItem";
import { SettingsSection } from "@/components/settings/SettingsSection";
import { AppSwitch } from "@/components/settings/AppSwitch";

import { CurrentPlanCard } from "@/components/cards/planos/CurrentPlanCard";
import { PlanUsageCard } from "@/components/cards/planos/PlanUsageCard";
import { PlanOptionCard } from "@/components/cards/planos/PlanOptionCard";
import { PaymentMethodCard } from "@/components/cards/planos/PaymentMethodCard";

import { COLORS, globalStyles } from "@/styles/globalStyles";

const planos: Plano[] = [
  {
    id: "basico",
    nome: "Básico",
    descricao: "Para profissionais que estão começando.",
    preco: 19.9,
    periodo: "mensal",
    limites: {
      clientes: 30,
      orcamentos: 50,
      obras: 10,
      usuarios: 1,
      armazenamento: 2,
    },
    recursos: ["Cadastro de clientes", "Orçamentos", "Controle de obras"],
  },

  {
    id: "profissional",
    nome: "Profissional",
    descricao: "Para profissionais e pequenas equipes.",
    preco: 39.9,
    periodo: "mensal",
    destaque: true,
    limites: {
      clientes: 200,
      orcamentos: 200,
      obras: 50,
      usuarios: 3,
      armazenamento: 10,
    },
    recursos: [
      "Todos os recursos do Básico",
      "Mais clientes e obras",
      "Até 3 usuários",
      "10 GB de armazenamento",
      "Recursos avançados",
    ],
  },

  {
    id: "empresarial",
    nome: "Empresarial",
    descricao: "Para empresas com equipes maiores.",
    preco: 79.9,
    periodo: "mensal",
    limites: {
      clientes: 1000,
      orcamentos: 1000,
      obras: 250,
      usuarios: 10,
      armazenamento: 50,
    },
    recursos: [
      "Todos os recursos do Profissional",
      "Até 10 usuários",
      "50 GB de armazenamento",
      "Maior capacidade de operação",
      "Recursos empresariais",
    ],
  },
];

export default function PlanosScreen() {
  const [renovacaoAutomatica, setRenovacaoAutomatica] = useState(true);

  const [notificacaoCobranca, setNotificacaoCobranca] = useState(true);

  const planoAtual =
    planos.find((plano) => plano.id === "profissional") || planos[0];

  const [assinatura] = useState<Assinatura>({
    plano: planoAtual,
    status: "ATIVA",
    inicio: "2026-08-10",
    proxima_cobranca: "2026-10-10",
    forma_pagamento: "Cartão de crédito",
    uso: {
      clientes: 32,
      orcamentos: 78,
      obras: 12,
      usuarios: 2,
      armazenamento: 3,
    },
  });

  function handleChangePlan() {
    Alert.alert("Alterar plano", "Escolha um dos planos disponíveis abaixo.");
  }

  function handleSelectPlan(plano: Plano) {
    if (plano.id === assinatura.plano.id) {
      return;
    }

    Alert.alert("Alterar plano", `Deseja selecionar o plano ${plano.nome}?`, [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Continuar",
        onPress: () => {
          Alert.alert(
            "Plano selecionado",
            `O plano ${plano.nome} foi selecionado. A integração com o pagamento será feita posteriormente.`,
          );
        },
      },
    ]);
  }

  function handlePaymentMethod() {
    Alert.alert(
      "Forma de pagamento",
      "A configuração da forma de pagamento será integrada posteriormente.",
    );
  }

  function handleBillingHistory() {
    Alert.alert(
      "Histórico de cobranças",
      "O histórico de cobranças será disponibilizado aqui.",
    );
  }

  function handleCancelSubscription() {
    Alert.alert(
      "Cancelar assinatura",
      "Tem certeza que deseja cancelar sua assinatura?",
      [
        {
          text: "Voltar",
          style: "cancel",
        },
        {
          text: "Cancelar assinatura",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Assinatura",
              "O cancelamento será integrado posteriormente.",
            );
          },
        },
      ],
    );
  }

  return (
    <ScrollView
      style={globalStyles.container}
      contentContainerStyle={globalStyles.planPageContent}
      showsVerticalScrollIndicator={false}
    >
      <PageHeader
        title="Planos e assinatura"
        subtitle="Gerencie seu plano, pagamentos e recursos."
      />

      <CurrentPlanCard
        assinatura={assinatura}
        onChangePlan={handleChangePlan}
      />

      <PlanUsageCard plano={assinatura.plano} uso={assinatura.uso} />

      <SettingsSection title="Pagamento">
        <PaymentMethodCard
          paymentMethod={assinatura.forma_pagamento}
          onPress={handlePaymentMethod}
        />

        <SettingsItem
          icon="receipt-outline"
          title="Histórico de cobranças"
          description="Consulte suas cobranças e pagamentos"
          onPress={handleBillingHistory}
        />
      </SettingsSection>

      <SettingsSection title="Opções da assinatura">
        <SettingsItem
          icon="refresh-outline"
          title="Renovação automática"
          description="Renovar o plano automaticamente"
          rightComponent={
            <AppSwitch
              value={renovacaoAutomatica}
              onValueChange={setRenovacaoAutomatica}
            />
          }
        />

        <SettingsItem
          icon="notifications-outline"
          title="Notificações de cobrança"
          description="Receber avisos antes das cobranças"
          rightComponent={
            <AppSwitch
              value={notificacaoCobranca}
              onValueChange={setNotificacaoCobranca}
            />
          }
        />
      </SettingsSection>

      <SettingsSection title="Planos disponíveis">
        <View style={globalStyles.planOptionsHeader}>
          <Text style={globalStyles.planSectionDescription}>
            Compare os planos e escolha a opção mais adequada para sua operação.
          </Text>
        </View>

        {planos.map((plano) => (
          <PlanOptionCard
            key={plano.id}
            plano={plano}
            atual={plano.id === assinatura.plano.id}
            onSelect={() => handleSelectPlan(plano)}
          />
        ))}
      </SettingsSection>

      <SettingsSection title="Gerenciamento">
        <SettingsItem
          icon="help-circle-outline"
          title="Precisa de ajuda?"
          description="Entre em contato com o suporte"
          onPress={() =>
            Alert.alert(
              "Suporte",
              "O canal de suporte será integrado posteriormente.",
            )
          }
        />

        <Pressable
          style={({ pressed }) => [
            globalStyles.planCancelButton,
            pressed && globalStyles.pressOpacity,
          ]}
          onPress={handleCancelSubscription}
        >
          <Ionicons
            name="close-circle-outline"
            size={20}
            color={COLORS.danger}
          />

          <View style={globalStyles.planCancelContent}>
            <Text style={globalStyles.planCancelTitle}>
              Cancelar assinatura
            </Text>

            <Text style={globalStyles.planCancelDescription}>
              Encerrar sua assinatura do OBRA-FÁCIL
            </Text>
          </View>

          <Ionicons name="chevron-forward" size={20} color={COLORS.danger} />
        </Pressable>
      </SettingsSection>
    </ScrollView>
  );
}
