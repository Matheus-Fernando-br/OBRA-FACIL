import { ScrollView, Alert, Text, View } from "react-native";

import { globalStyles, COLORS } from "@/styles/globalStyles";

import { PageHeader } from "@/components/layout/PageHeader";
import { SettingsSection } from "@/components/settings/SettingsSection";
import { AppButton } from "@/components/buttons/AppButton";

export default function SobreScreen() {
  return (
    <ScrollView
      style={globalStyles.container}
      showsVerticalScrollIndicator={false}
    >
      <PageHeader
        title="Sobre o OBRA-FÁCIL"
        subtitle="Conheça o aplicativo"
      />

      <SettingsSection title="O Projeto">

        <Text
          style={{
            color: COLORS.textSecondary,
            fontSize: 15,
            lineHeight: 24,
          }}
        >
          O OBRA-FÁCIL é um sistema de gestão desenvolvido para facilitar o
          gerenciamento de obras, clientes, orçamentos e serviços da construção
          civil.

          {"\n\n"}

          A proposta é substituir planilhas, anotações e processos manuais por
          uma plataforma simples, rápida e intuitiva, permitindo acompanhar todo
          o negócio em um único lugar.

        </Text>

      </SettingsSection>

      <SettingsSection title="Para quem foi desenvolvido">

        <Text
          style={{
            color: COLORS.textSecondary,
            fontSize: 15,
            lineHeight: 24,
          }}
        >
          • Construtoras

          {"\n"}

          • Engenheiros

          {"\n"}

          • Arquitetos

          {"\n"}

          • Empreiteiros

          {"\n"}

          • Prestadores de serviço

          {"\n"}

          • Profissionais da construção civil

        </Text>

      </SettingsSection>

      <SettingsSection title="Principais recursos">

        <Text
          style={{
            color: COLORS.textSecondary,
            fontSize: 15,
            lineHeight: 24,
          }}
        >
          ✓ Gestão de Clientes

          {"\n"}

          ✓ Orçamentos

          {"\n"}

          ✓ Obras

          {"\n"}

          ✓ Serviços

          {"\n"}

          ✓ Relatórios

          {"\n"}

          ✓ Controle Financeiro (em desenvolvimento)

        </Text>

      </SettingsSection>

      <SettingsSection title="Tecnologias">

        <Text
          style={{
            color: COLORS.textSecondary,
            fontSize: 15,
            lineHeight: 24,
          }}
        >
          React Native

          {"\n"}

          Expo

          {"\n"}

          TypeScript

          {"\n"}

          FastAPI

          {"\n"}

          PostgreSQL

          {"\n"}

          JWT Authentication

        </Text>

      </SettingsSection>

      <SettingsSection title="Aplicativo">

        <View
          style={{
            marginBottom: 18,
          }}
        >

          <Text
            style={{
              color: COLORS.text,
              fontWeight: "700",
              fontSize: 16,
            }}
          >
            Versão
          </Text>

          <Text
            style={{
              color: COLORS.textSecondary,
              marginTop: 5,
            }}
          >
            1.0.0
          </Text>

        </View>

        <View
          style={{
            marginBottom: 18,
          }}
        >

          <Text
            style={{
              color: COLORS.text,
              fontWeight: "700",
              fontSize: 16,
            }}
          >
            Desenvolvedor
          </Text>

          <Text
            style={{
              color: COLORS.textSecondary,
              marginTop: 5,
            }}
          >
            Matheus Fernando Ribeiro Martins
          </Text>

        </View>

      </SettingsSection>

      <SettingsSection title="Sugestões">

        <Text
          style={{
            color: COLORS.textSecondary,
            marginBottom: 18,
            lineHeight: 22,
          }}
        >
          Encontrou algum problema ou possui uma sugestão de melhoria?
          Sua opinião é importante para evoluirmos o aplicativo.
        </Text>

        <AppButton
          title="Enviar Feedback"
          onPress={() =>
            Alert.alert(
              "Em breve",
              "O envio de feedback estará disponível nas próximas versões."
            )
          }
        />

      </SettingsSection>

    </ScrollView>
  );
}