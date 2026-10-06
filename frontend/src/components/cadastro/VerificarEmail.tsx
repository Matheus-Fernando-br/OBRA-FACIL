import { useState } from "react";
import { Text, View } from "react-native";
import { MailCheck } from "lucide-react-native";
import { AppInput } from "@/components/forms/AppInput";
import { AppButton } from "../buttons/AppButton";
import { useTheme } from "@/contexts/ThemeContext";
import { verifyEmailCode, resendVerificationCode } from "../../services/api";

interface Props {
  email: string;
  onBack: () => void;
  onVerified: () => void;
}

export function VerificarEmail({ email, onBack, onVerified }: Props) {
  const { styles, theme } = useTheme();
  const [codigo, setCodigo] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [feedback, setFeedback] = useState("");

  function handleCodigo(text: string) {
    setCodigo(text.replace(/\D/g, "").slice(0, 6));
    if (feedback) setFeedback("");
  }

  async function verificarCodigo() {
    if (!codigo)
      return setFeedback("Informe o código enviado para seu e-mail.");
    if (codigo.length !== 6)
      return setFeedback("O código deve possuir 6 dígitos.");

    try {
      setLoading(true);
      setFeedback("");
      await verifyEmailCode({ email, codigo });
      onVerified();
    } catch (error: any) {
      console.log(error);
      setFeedback(
        error.response?.data?.message || "Código inválido ou expirado.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function reenviarCodigo() {
    try {
      setResending(true);
      setFeedback("");
      await resendVerificationCode({ email });
      setFeedback("Um novo código foi enviado para seu e-mail.");
    } catch (error: any) {
      console.log(error);
      setFeedback(
        error.response?.data?.message || "Não foi possível reenviar o código.",
      );
    } finally {
      setResending(false);
    }
  }

  return (
    <View>
      <View style={styles.emailIconWrap}>
        <MailCheck size={32} color={theme.title} />
      </View>
      <Text style={styles.cadastroStepTitle}>Confirme seu e-mail</Text>
      <Text style={styles.cadastroStepSubtitle}>
        Enviamos um código de 6 dígitos para o endereço abaixo.
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
        maxLength={6}
        style={[styles.cadastroInput, styles.emailCodeInput]}
      />
      {!!feedback && <Text style={styles.cadastroFeedback}>{feedback}</Text>}
      <AppButton
        title={loading ? "Verificando..." : "Verificar e-mail"}
        onPress={verificarCodigo}
        loading={loading}
        color={theme.title}
      />
      <AppButton
        title={resending ? "Reenviando..." : "Reenviar código"}
        onPress={reenviarCodigo}
        loading={resending}
        color={theme.primary}
      />
      <AppButton title="Voltar" onPress={onBack} color={theme.placeholder} />
    </View>
  );
}
