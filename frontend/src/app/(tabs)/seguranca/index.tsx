import { ScrollView, View, Text, Platform } from "react-native";
import { useState } from "react";

import { AppInput } from "@/components/forms/AppInput";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { PageHeader } from "@/components/layout/PageHeader";
import { SettingsSection } from "@/components/settings/SettingsSection";
import { SettingsItem } from "@/components/settings/SettingsItem";
import { AppButton } from "@/components/buttons/AppButton";
import { updateUser } from "@/services/api";

const MIN_PASSWORD = 6; // mesma regra do cadastro

export default function SegurancaScreen() {
  const { user, token, biometricAvailable, updateAccessToken } = useAuth();
  const { styles, theme } = useTheme();

  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  async function handleChangePassword() {
    setFeedback(null);

    if (!user || !token) {
      setFeedback({ ok: false, text: "Sessão expirada. Entre novamente." });
      return;
    }
    if (!senhaAtual) {
      setFeedback({ ok: false, text: "Informe a senha atual." });
      return;
    }
    if (novaSenha.length < MIN_PASSWORD) {
      setFeedback({ ok: false, text: `A nova senha deve ter no mínimo ${MIN_PASSWORD} caracteres.` });
      return;
    }
    if (novaSenha === senhaAtual) {
      setFeedback({ ok: false, text: "A nova senha deve ser diferente da atual." });
      return;
    }
    if (novaSenha !== confirmarSenha) {
      setFeedback({ ok: false, text: "A confirmação não confere com a nova senha." });
      return;
    }

    try {
      setLoading(true);

      const updated = await updateUser(user._id, { senha: novaSenha, senhaAtual }, token);
      // As outras sessões foram encerradas; este aparelho recebe tokens novos.
      if (updated?.accessToken) await updateAccessToken(updated.accessToken, updated.refreshToken);

      setFeedback({ ok: true, text: "Senha alterada com sucesso." });
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarSenha("");
    } catch (error: any) {
      setFeedback({
        ok: false,
        text: error?.response?.data?.message || "Não foi possível alterar a senha.",
      });
    } finally {
      setLoading(false);
    }
  }

  const biometricText =
    Platform.OS === "web"
      ? "Indisponível no navegador"
      : biometricAvailable
        ? "Ativo — solicitado ao abrir o app"
        : "Cadastre Face ID / digital no aparelho para usar";

  return (
    <View style={styles.screen}>
      <PageHeader title="Segurança" subtitle="Senha e acesso à sua conta" />

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
        keyboardShouldPersistTaps="handled"
      >
        <SettingsSection title="Alterar senha">
          <View>
            <Text style={[styles.label, { marginTop: 0 }]}>Senha atual</Text>
            <AppInput
              secureTextEntry
              placeholder="Sua senha atual"
              value={senhaAtual}
              onChangeText={setSenhaAtual}
              autoComplete="current-password"
            />
            <Text style={styles.label}>Nova senha</Text>
            <AppInput
              secureTextEntry
              placeholder={`Mínimo de ${MIN_PASSWORD} caracteres`}
              value={novaSenha}
              onChangeText={setNovaSenha}
              autoComplete="new-password"
            />
            <Text style={styles.label}>Confirmar nova senha</Text>
            <AppInput
              secureTextEntry
              placeholder="Repita a nova senha"
              value={confirmarSenha}
              onChangeText={setConfirmarSenha}
              autoComplete="new-password"
            />

            {feedback && (
              <Text style={[styles.feedback, feedback.ok && { color: theme.success }]}>
                {feedback.text}
              </Text>
            )}

            <AppButton title="Alterar senha" loading={loading} onPress={handleChangePassword} />
          </View>
        </SettingsSection>

        <SettingsSection
          title="Proteção"
          footer="A sessão fica guardada no armazenamento seguro do aparelho e é removida ao sair da conta."
        >
          <SettingsItem
            icon="finger-print"
            iconColor={theme.success}
            title="Desbloqueio por biometria"
            description={biometricText}
          />
          <SettingsItem
            icon="lock-closed"
            iconColor={theme.info}
            title="Sessão protegida"
            description="Token criptografado (Keychain / Keystore)"
          />
          <SettingsItem
            icon="key"
            iconColor={theme.textSecondary}
            title="Verificação em duas etapas"
            description="Em breve"
            disabled
          />
        </SettingsSection>
      </ScrollView>
    </View>
  );
}
