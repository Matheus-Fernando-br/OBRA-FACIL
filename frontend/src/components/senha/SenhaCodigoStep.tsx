import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Eye, EyeOff, KeyRound } from "@/components/ui/icons";
import { AppInput } from "@/components/forms/AppInput";
import { AppButton } from "@/components/buttons/AppButton";
import { useTheme } from "@/contexts/ThemeContext";
import { requestPasswordReset, resetPassword } from "@/services/api";

interface Props {
  email: string;
  onBack: () => void;
  onSuccess: () => void;
}

const MIN_PASSWORD = 6; // mesma regra do cadastro
const RESEND_SECONDS = 60;

/** Etapa 2: código recebido por e-mail + nova senha. */
export function SenhaCodigoStep({ email, onBack, onSuccess }: Props) {
  const { styles, theme } = useTheme();
  const [codigo, setCodigo] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [cooldown, setCooldown] = useState(RESEND_SECONDS);

  // Contagem regressiva para liberar o reenvio do código.
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  function handleCodigo(text: string) {
    setCodigo(text.replace(/\D/g, "").slice(0, 6));
    if (feedback) setFeedback(null);
  }

  async function redefinirSenha() {
    if (codigo.length !== 6)
      return setFeedback({ ok: false, text: "Informe o código de 6 dígitos enviado ao seu e-mail." });
    if (novaSenha.length < MIN_PASSWORD)
      return setFeedback({ ok: false, text: `A nova senha deve ter no mínimo ${MIN_PASSWORD} caracteres.` });
    if (novaSenha !== confirmarSenha)
      return setFeedback({ ok: false, text: "As senhas não coincidem." });

    try {
      setLoading(true);
      setFeedback(null);
      await resetPassword({ email, codigo, novaSenha });
      onSuccess();
    } catch (error: any) {
      console.log(error);
      const status = error.response?.status;
      setFeedback({
        ok: false,
        text:
          status === 400 || status === 401
            ? error.response?.data?.message || "Código inválido ou expirado."
            : !error.response
              ? "Sem conexão com o servidor. Verifique sua internet."
              : error.response?.data?.message || "Não foi possível redefinir a senha.",
      });
    } finally {
      setLoading(false);
    }
  }

  async function reenviarCodigo() {
    if (cooldown > 0) return;
    try {
      setResending(true);
      setFeedback(null);
      await requestPasswordReset({ email });
      setCooldown(RESEND_SECONDS);
      setFeedback({ ok: true, text: "Enviamos um novo código para seu e-mail." });
    } catch (error: any) {
      console.log(error);
      setFeedback({
        ok: false,
        text: error.response?.data?.message || "Não foi possível reenviar o código.",
      });
    } finally {
      setResending(false);
    }
  }

  return (
    <View>
      <View style={styles.emailIconWrap}>
        <KeyRound size={32} color={theme.title} />
      </View>

      <Text style={styles.cadastroStepTitle}>Crie uma nova senha</Text>
      <Text style={styles.cadastroStepSubtitle}>
        Digite o código que enviamos para o e-mail abaixo e escolha sua nova
        senha. Confira também a caixa de spam.
      </Text>

      <View style={styles.emailCard}>
        <Text style={styles.emailCardText}>{email}</Text>
      </View>

      <Text style={styles.cadastroLabel}>Código de verificação</Text>
      <AppInput
        placeholder="000000"
        value={codigo}
        onChangeText={handleCodigo}
        keyboardType="number-pad"
        autoComplete="one-time-code"
        textContentType="oneTimeCode"
        maxLength={6}
        style={[styles.cadastroInput, styles.emailCodeInput]}
      />

      <Text style={styles.cadastroLabel}>Nova senha</Text>
      <View style={styles.cadastroPasswordWrap}>
        <AppInput
          placeholder={`Mínimo de ${MIN_PASSWORD} caracteres`}
          secureTextEntry={!showPassword}
          value={novaSenha}
          onChangeText={(text) => {
            setNovaSenha(text);
            if (feedback) setFeedback(null);
          }}
          autoComplete="new-password"
          textContentType="newPassword"
          style={[styles.cadastroInput, styles.cadastroPasswordInput]}
        />
        <Pressable
          onPress={() => setShowPassword((v) => !v)}
          style={styles.cadastroEyeButton}
          accessibilityLabel={showPassword ? "Ocultar senha" : "Mostrar senha"}
        >
          {showPassword ? (
            <EyeOff size={20} color={theme.placeholder} />
          ) : (
            <Eye size={20} color={theme.placeholder} />
          )}
        </Pressable>
      </View>

      <Text style={styles.cadastroLabel}>Confirmar nova senha</Text>
      <View style={styles.cadastroPasswordWrap}>
        <AppInput
          placeholder="Digite a nova senha novamente"
          secureTextEntry={!showConfirm}
          value={confirmarSenha}
          onChangeText={(text) => {
            setConfirmarSenha(text);
            if (feedback) setFeedback(null);
          }}
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="done"
          onSubmitEditing={redefinirSenha}
          style={[styles.cadastroInput, styles.cadastroPasswordInput]}
        />
        <Pressable
          onPress={() => setShowConfirm((v) => !v)}
          style={styles.cadastroEyeButton}
          accessibilityLabel={showConfirm ? "Ocultar confirmação" : "Mostrar confirmação"}
        >
          {showConfirm ? (
            <EyeOff size={20} color={theme.placeholder} />
          ) : (
            <Eye size={20} color={theme.placeholder} />
          )}
        </Pressable>
      </View>

      {feedback && (
        <Text style={[styles.cadastroFeedback, feedback.ok && { color: theme.success }]}>
          {feedback.text}
        </Text>
      )}

      <AppButton
        title={loading ? "Salvando..." : "Redefinir senha"}
        onPress={redefinirSenha}
        loading={loading}
        color={theme.title}
      />
      <AppButton
        variant="tinted"
        title={cooldown > 0 ? `Reenviar código em ${cooldown}s` : "Reenviar código"}
        onPress={reenviarCodigo}
        loading={resending}
        disabled={cooldown > 0}
      />
      <AppButton variant="secondary" title="Alterar e-mail" onPress={onBack} />
    </View>
  );
}
