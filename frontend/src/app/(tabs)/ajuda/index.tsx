import { ScrollView, Alert } from "react-native";

import { globalStyles } from "@/styles/globalStyles";

import { PageHeader } from "@/components/layout/PageHeader";
import { SettingsSection } from "@/components/settings/SettingsSection";
import { SettingsItem } from "@/components/settings/SettingsItem";

export default function AjudaScreen() {

  return (

    <ScrollView
      style={globalStyles.container}
      showsVerticalScrollIndicator={false}
    >

      <PageHeader
        title="Ajuda"
        subtitle="Tire dúvidas sobre o sistema"
      />

      <SettingsSection title="Central de Ajuda">

        <SettingsItem
          icon="book"
          title="Manual do Sistema"
          description="Aprenda como utilizar o Obra Fácil"
          onPress={() => Alert.alert("Em breve")}
        />

        <SettingsItem
          icon="help-circle"
          title="Perguntas Frequentes"
          description="Dúvidas mais comuns"
          onPress={() => Alert.alert("Em breve")}
        />

        <SettingsItem
          icon="chatbubble"
          title="Falar com o suporte"
          description="Abrir atendimento"
          onPress={() => Alert.alert("Em breve")}
        />

        <SettingsItem
          icon="bug"
          title="Reportar problema"
          description="Enviar um erro encontrado"
          onPress={() => Alert.alert("Em breve")}
        />

        <SettingsItem
          icon="mail"
          title="Contato"
          description="suporte@obrafacil.com.br"
        />

      </SettingsSection>

    </ScrollView>

  );

}