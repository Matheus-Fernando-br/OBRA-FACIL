import { useState } from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

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
    const apenasNumeros = text.replace(/\D/g, "");

    setCodigo(apenasNumeros.slice(0, 6));

    if (feedback) {
      setFeedback("");
    }
  }

  async function verificarCodigo() {
    if (!codigo) {
      setFeedback("Informe o código enviado para seu e-mail.");
      return;
    }

    if (codigo.length !== 6) {
      setFeedback("O código deve possuir 6 dígitos.");
      return;
    }

    try {
      setLoading(true);
      setFeedback("");

      await verifyEmailCode({
        email,
        codigo,
      });

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

      await resendVerificationCode({
        email,
      });

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
      <View
        style={{
          alignItems: "center",
          marginBottom: 25,
        }}
      >
        <Ionicons name="mail-outline" size={65} color={theme.primary} />
      </View>

      <Text style={styles.title}>Verifique seu e-mail</Text>

      <Text
        style={[
          styles.subtitle,
          {
            marginTop: 10,
            marginBottom: 25,
          },
        ]}
      >
        Enviamos um código de verificação de 6 dígitos para:
      </Text>

      <View
        style={{
          backgroundColor: theme.card,
          borderRadius: 12,
          padding: 15,
          marginBottom: 25,
          alignItems: "center",
        }}
      >
        <Text
          style={{
            color: theme.white,
            fontSize: 16,
            fontWeight: "600",
          }}
        >
          {email}
        </Text>
      </View>

      <Text style={styles.label}>Código de verificação</Text>

      <AppInput
        placeholder="Digite o código de 6 dígitos"
        value={codigo}
        onChangeText={handleCodigo}
        keyboardType="number-pad"
        maxLength={6}
      />

      {feedback !== "" && <Text style={styles.feedback}>{feedback}</Text>}

      <AppButton
        title={loading ? "Verificando..." : "Verificar e-mail"}
        onPress={verificarCodigo}
        loading={loading}
        color={theme.primary}
      />

      <AppButton
        title={resending ? "Reenviando..." : "Reenviar código"}
        onPress={reenviarCodigo}
        loading={resending}
        color={theme.success}
      />

      <AppButton title="Voltar" onPress={onBack} color={theme.title} />
    </View>
  );
}
