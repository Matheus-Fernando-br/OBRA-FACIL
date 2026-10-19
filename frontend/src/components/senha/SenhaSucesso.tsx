import { ActivityIndicator, Text, View } from "react-native";
import { Check, ShieldCheck } from "@/components/ui/icons";
import { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";

interface Props {
  /** Volta para o login (também chamado automaticamente pela tela). */
  onGoToLogin: () => void;
}

/** Etapa 3: senha redefinida — redireciona para o login. */
export function SenhaSucesso({ onGoToLogin }: Props) {
  const { styles, theme } = useTheme();
  const [loading, setLoading] = useState(false);

  return (
    <View style={styles.successWrap}>
      <View style={styles.successBadge}>
        <Check size={48} color={theme.success} strokeWidth={3} />
      </View>
      <Text style={styles.successTitle}>Senha redefinida!</Text>
      <Text style={styles.successText}>
        Sua nova senha já está valendo.{"\n\n"}
        Entre com seu e-mail e a nova senha para continuar.
      </Text>
      <View style={styles.successSecurityIcon}>
        <ShieldCheck size={28} color={theme.success} />
      </View>
      <Text style={styles.successHint}>Redirecionando para a tela de login...</Text>
      <View style={styles.successAction}>
        {loading ? (
          <ActivityIndicator color={theme.title} />
        ) : (
          <Text
            style={styles.successActionText}
            onPress={() => {
              setLoading(true);
              onGoToLogin();
            }}
          >
            Ir para o login agora
          </Text>
        )}
      </View>
    </View>
  );
}
