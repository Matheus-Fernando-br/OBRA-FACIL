import { useState } from "react";
import { Text, View } from "react-native";
import { Mail } from "@/components/ui/icons";
import { AppInput } from "@/components/forms/AppInput";
import { AppButton } from "@/components/buttons/AppButton";
import { emailMask } from "@/components/forms/mask";
import { useTheme } from "@/contexts/ThemeContext";
import { requestPasswordReset } from "@/services/api";

interface Props {
  email: string;
  setEmail: (email: string) => void;
  onBack: () => void;
  onCodeSent: () => void;
}

/** Etapa 1: o usuário informa o e-mail e recebe o código. */
export function SenhaEmailStep({ email, setEmail, onBack, onCodeSent }: Props) {
  const { styles, theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");

  function handleEmail(text: string) {
    setEmail(emailMask(text));
    if (feedback) setFeedback("");
  }

  async function enviarCodigo() {
    const value = email.trim();

    if (!value) return setFeedback("Informe o e-mail da sua conta.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
      return setFeedback("Informe um e-mail válido.");

    try {
      setLoading(true);
      setFeedback("");
      await requestPasswordReset({ email: value });
      onCodeSent();
    } catch (error: any) {
      console.log(error);
      const status = error.response?.status;

      if (status === 404) {
        setFeedback("Não encontramos uma conta com este e-mail.");
      } else if (status === 429) {
        setFeedback("Muitas tentativas. Aguarde alguns minutos e tente novamente.");
      } else if (!error.response) {
        setFeedback("Sem conexão com o servidor. Verifique sua internet.");
      } else {
        setFeedback(
          error.response?.data?.message || "Não foi possível enviar o código.",
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <View>
      <View style={styles.emailIconWrap}>
        <Mail size={32} color={theme.title} />
      </View>

      <Text style={styles.cadastroStepTitle}>Esqueceu a senha?</Text>
      <Text style={styles.cadastroStepSubtitle}>
        Informe o e-mail cadastrado. Vamos enviar um código de 6 dígitos para
        você criar uma nova senha.
      </Text>

      <Text style={styles.cadastroLabel}>E-mail</Text>
      <AppInput
        placeholder="seuemail@exemplo.com"
        value={email}
        onChangeText={handleEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        autoCorrect={false}
        returnKeyType="send"
        onSubmitEditing={enviarCodigo}
        style={styles.cadastroInput}
      />

      {!!feedback && <Text style={styles.cadastroFeedback}>{feedback}</Text>}

      <AppButton
        title={loading ? "Enviando..." : "Enviar código"}
        onPress={enviarCodigo}
        loading={loading}
        color={theme.title}
      />
      <AppButton variant="secondary" title="Voltar para o login" onPress={onBack} />
    </View>
  );
}
