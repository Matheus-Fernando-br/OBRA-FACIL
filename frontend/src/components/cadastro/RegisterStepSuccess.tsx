import { ActivityIndicator, Text, View } from "react-native";
import { Check, ShieldCheck } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";

export function RegisterStepSuccess() {
  const { styles, theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleGoToLogin() {
    setLoading(true);
    router.replace("/");
  }

  return (
    <View style={styles.successWrap}>
      <View style={styles.successBadge}>
        <Check size={48} color={theme.success} strokeWidth={3} />
      </View>
      <Text style={styles.successTitle}>Cadastro realizado!</Text>
      <Text style={styles.successText}>
        Sua conta foi criada com sucesso.{"\n\n"}
        Agora você já pode acessar o sistema utilizando seu e-mail e senha.
      </Text>
      <View style={styles.successSecurityIcon}>
        <ShieldCheck size={28} color={theme.success} />
      </View>
      <Text style={styles.successHint}>
        Redirecionando para a tela de login...
      </Text>
      <View style={styles.successAction}>
        {loading ? (
          <ActivityIndicator color={theme.title} />
        ) : (
          <Text style={styles.successActionText} onPress={handleGoToLogin}>
            Ir para o login agora
          </Text>
        )}
      </View>
    </View>
  );
}
