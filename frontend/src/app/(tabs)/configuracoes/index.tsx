import { View, ScrollView, Text } from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { useTheme, ThemePreference } from "@/contexts/ThemeContext";
import { PageHeader } from "@/components/layout/PageHeader";
import { SettingsSection } from "@/components/settings/SettingsSection";
import { SettingsItem } from "@/components/settings/SettingsItem";
import { StatusSegment } from "@/components/ui/StatusSegment";
import { DeleteAccountModal } from "@/components/modals/DeleteAccountModal";

/*
 * Apenas opções que funcionam de fato. Chaves antigas (animações,
 * backup, sincronização, inicialização rápida, salvar filtros,
 * última tela) não estavam ligadas a nenhum comportamento e foram
 * retiradas para não induzir o usuário a erro.
 */
export default function ConfiguracoesScreen() {
  const { styles, theme, preference, setTheme } = useTheme();
  const [deleteVisible, setDeleteVisible] = useState(false);

  return (
    <View style={styles.screen}>
      <PageHeader title="Configurações" subtitle="Preferências do aplicativo" />

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        <Text style={styles.subtitle}>Aparência</Text>
        <StatusSegment<ThemePreference>
          value={preference}
          onChange={setTheme}
          options={[
            { value: "light", label: "Claro" },
            { value: "dark", label: "Escuro" },
            { value: "system", label: "Sistema" },
          ]}
        />
        <Text style={[styles.caption, { marginHorizontal: 4, marginBottom: 12 }]}>
          “Sistema” acompanha o modo claro/escuro do aparelho automaticamente.
        </Text>

        <SettingsSection title="Documentos">
          <SettingsItem
            icon="document-text"
            iconColor={theme.primary}
            title="Relatórios e PDFs"
            description="Formato, marca, assinatura e valores"
            onPress={() => router.push("/relatorios")}
          />
        </SettingsSection>

        <SettingsSection title="Conta">
          <SettingsItem
            icon="shield-checkmark"
            iconColor={theme.info}
            title="Segurança"
            description="Senha e acesso"
            onPress={() => router.push("/seguranca")}
          />
          <SettingsItem
            icon="information-circle"
            iconColor={theme.textSecondary}
            title="Sobre o app"
            description="Versão e informações"
            onPress={() => router.push("/sobre")}
          />
          <SettingsItem
            icon="document-lock"
            iconColor={theme.textSecondary}
            title="Termos e privacidade"
            description="Política de privacidade e termos de uso"
            onPress={() => router.push("/legal")}
          />
          <SettingsItem
            icon="trash"
            title="Excluir conta"
            description="Remove permanentemente seus dados"
            danger
            onPress={() => setDeleteVisible(true)}
          />
        </SettingsSection>
      </ScrollView>

      <DeleteAccountModal visible={deleteVisible} onClose={() => setDeleteVisible(false)} />
    </View>
  );
}
