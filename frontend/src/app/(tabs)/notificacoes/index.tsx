import { ScrollView } from "react-native";
import { useState } from "react";

import { globalStyles } from "@/styles/globalStyles";

import { PageHeader } from "@/components/layout/PageHeader";
import { SettingsSection } from "@/components/settings/SettingsSection";
import { SettingsItem } from "@/components/settings/SettingsItem";
import { AppSwitch } from "@/components/settings/AppSwitch";

export default function NotificacoesScreen() {

  const [push, setPush] =
    useState(true);

  const [email, setEmail] =
    useState(true);

  const [clientes, setClientes] =
    useState(true);

  const [orcamentos, setOrcamentos] =
    useState(true);

  const [obras, setObras] =
    useState(true);

  const [atualizacoes, setAtualizacoes] =
    useState(false);

  return (

    <ScrollView
      style={globalStyles.container}
      showsVerticalScrollIndicator={false}
    >

      <PageHeader
        title="Notificações"
        subtitle="Ajuste as notificações que deseja receber"
      />

      <SettingsSection title="Alertas">

        <SettingsItem
          icon="notifications"
          title="Push"
          description="Receber notificações"
          rightComponent={
            <AppSwitch
              value={push}
              onValueChange={setPush}
            />
          }
        />

        <SettingsItem
          icon="mail"
          title="E-mail"
          description="Receber notificações por e-mail"
          rightComponent={
            <AppSwitch
              value={email}
              onValueChange={setEmail}
            />
          }
        />

        <SettingsItem
          icon="people"
          title="Clientes"
          description="Novos clientes"
          rightComponent={
            <AppSwitch
              value={clientes}
              onValueChange={setClientes}
            />
          }
        />

        <SettingsItem
          icon="document-text"
          title="Orçamentos"
          description="Atualizações"
          rightComponent={
            <AppSwitch
              value={orcamentos}
              onValueChange={setOrcamentos}
            />
          }
        />

        <SettingsItem
          icon="hammer"
          title="Obras"
          description="Mudanças nas obras"
          rightComponent={
            <AppSwitch
              value={obras}
              onValueChange={setObras}
            />
          }
        />

        <SettingsItem
          icon="download"
          title="Atualizações"
          description="Novas versões do aplicativo"
          rightComponent={
            <AppSwitch
              value={atualizacoes}
              onValueChange={setAtualizacoes}
            />
          }
        />

      </SettingsSection>

    </ScrollView>

  );

}