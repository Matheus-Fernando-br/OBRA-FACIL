import { ScrollView, View, Text } from "react-native";
import { useState } from "react";
import { router } from "expo-router";

import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { EditUserModal } from "@/components/modals/EditUserModal";
import { ProfileCard } from "@/components/cards/mais/ProfileCard";
import { SettingsSection } from "@/components/settings/SettingsSection";
import { SettingsItem } from "@/components/settings/SettingsItem";
import { AppSwitch } from "@/components/settings/AppSwitch";
import { FadeInView } from "@/components/ui/FadeInView";

export default function MaisScreen() {
  const [profileVisible, setProfileVisible] = useState(false);
  const { logout, user } = useAuth();
  const { styles, theme, isDark, setTheme } = useTheme();

  async function handleLogout() {
    try {
      await logout();
      router.replace("/");
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.maisContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.pageHeaderTitle, { marginTop: 8, marginBottom: 16 }]}>
          Mais
        </Text>

        <FadeInView>
          <ProfileCard
            nome={user?.nome || ""}
            email={user?.email || ""}
            onPress={() => setProfileVisible(true)}
          />
        </FadeInView>

        <FadeInView index={1}>
          <SettingsSection title="Trabalho">
            <SettingsItem
              icon="bar-chart"
              iconColor={theme.secondary}
              title="Relatórios e PDFs"
              description="Relatório geral e exportações"
              onPress={() => router.push("/relatorios")}
            />
            <SettingsItem
              icon="notifications"
              iconColor={theme.danger}
              title="Notificações"
              description="Alertas do sistema"
              onPress={() => router.push("/notificacoes")}
            />
          </SettingsSection>

          <SettingsSection title="Conta">
            <SettingsItem
              icon="card"
              iconColor={theme.success}
              title="Planos e assinatura"
              description="Gerencie seu plano"
              onPress={() => router.push("/planos")}
            />
            <SettingsItem
              icon="shield-checkmark"
              iconColor={theme.info}
              title="Privacidade e segurança"
              description="Senha e acesso"
              onPress={() => router.push("/seguranca")}
            />
          </SettingsSection>

          <SettingsSection title="Aplicativo">
            <SettingsItem
              icon="moon"
              iconColor="#5E5CE6"
              title="Modo escuro"
              rightComponent={
                <AppSwitch
                  value={isDark}
                  onValueChange={(v) => setTheme(v ? "dark" : "light")}
                />
              }
            />
            <SettingsItem
              icon="settings"
              iconColor={theme.textSecondary}
              title="Configurações gerais"
              description="Preferências do aplicativo"
              onPress={() => router.push("/configuracoes")}
            />
            <SettingsItem
              icon="help-circle"
              iconColor={theme.primary}
              title="Ajuda"
              description="FAQ e suporte"
              onPress={() => router.push("/ajuda")}
            />
            <SettingsItem
              icon="information-circle"
              iconColor={theme.info}
              title="Sobre o Obra Fácil"
              onPress={() => router.push("/sobre")}
            />
          </SettingsSection>

          <SettingsSection title="Sessão">
            <SettingsItem icon="log-out-outline" title="Sair da conta" danger onPress={handleLogout} />
          </SettingsSection>
        </FadeInView>
      </ScrollView>

      <EditUserModal
        visible={profileVisible}
        onClose={() => setProfileVisible(false)}
        user={user}
      />
    </View>
  );
}
