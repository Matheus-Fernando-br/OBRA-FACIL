import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useRouter } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";

export function RegisterStepSuccess() {
  const { styles, theme } = useTheme();

  const [loading, setLoading] = useState(false);
  const router = useRouter();
  async function handleGoToLogin() {
    try {
      setLoading(true);

      router.replace("/");
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 30,
      }}
    >
      <Ionicons name="checkmark-circle" size={90} color={theme.success} />

      <Text style={styles.title}>Cadastro realizado!</Text>

      <Text style={styles.subtitle}>
        Sua conta foi criada com sucesso.
        {"\n\n"}
        Agora você já pode acessar o sistema utilizando seu e-mail e senha.
      </Text>

      <View
        style={{
          marginTop: 30,
          width: 100,
          height: 100,
          borderRadius: 50,
          backgroundColor: theme.success,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Ionicons name="shield-checkmark" size={50} color={theme.success} />
      </View>

      <Text
        style={{
          color: theme.placeholder,
          marginTop: 25,
          textAlign: "center",
        }}
      >
        Redirecionando para a tela de login...
      </Text>
    </View>
  );
}
