import {
  View,
  ScrollView,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

import { router } from "expo-router";
import { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { AppInput } from "@/components/forms/AppInput";
import { emailMask } from "@/components/forms/mask";
import { GradientBackground } from "../styles/GradientBackground";

export default function LoginScreen() {
  const { styles, theme } = useTheme();

  const { login, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loadingRegister] = useState(false);

  const [feedback, setFeedback] = useState("");

  async function handleLogin() {
    try {
      setFeedback("");

      await login(email, password);
      router.replace("/(tabs)");
      console.log("LOGIN REALIZADO COM SUCESSO!");
      console.log("----------------------------");
      console.log("Usuário: "+email)
    } catch (error: any) {
      console.log(error);

      if (error.response?.status === 401) {
        setFeedback("E-mail ou senha incorretos.");
      } else if (error.response?.status === 400) {
        setFeedback(error.response.data?.message || "Dados inválidos.");
      } else {
        setFeedback("Erro ao conectar com o servidor.");
      }

      setTimeout(() => {
        setFeedback("");
      }, 7000);
    }
  }

  return (
    <GradientBackground style={styles.loginContainer}>
      <ScrollView>
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Image
          source={require("../assets/images/logo_titulo_frase.png")}
          style={styles.loginImage}
        />
      </View>
      <View style={{ marginTop: -20 }}>
        <Text style={styles.label}>E-mail</Text>

        <AppInput
          placeholder="Informe seu e-mail"
          value={email}
          onChangeText={(text) => {
            setEmail(emailMask(text));

            if (feedback) setFeedback("");
          }}
        />

        <Text style={styles.label}>Senha</Text>

        <AppInput
          placeholder="Informe sua senha"
          placeholderTextColor={theme.placeholder}
          secureTextEntry
          value={password}
          onChangeText={(text) => {
            setPassword(text);

            if (feedback) setFeedback("");
          }}
        />
        <View style={styles.divider} />

        {feedback !== "" && (
          <Text style={styles.feedback}>{feedback}</Text>
        )}

        <TouchableOpacity
          onPress={handleLogin}
          style={[
            styles.loginButton,
            loading && {
              opacity: 0.7,
            },
          ]}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={theme.white} />
          ) : (
            <Text style={styles.loginButtonText}>Entrar</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.loginText}>Ainda não tem conta?</Text>

        <TouchableOpacity
          style={styles.loginButtonCadastro}
          onPress={() => router.push("/cadastro")}
        >
          {loadingRegister ? (
            <ActivityIndicator size="small" color={theme.white} />
          ) : (
            <Text style={styles.loginButtonText}>Cadastre-se</Text>
          )}
        </TouchableOpacity>
      </View>
      </ScrollView>
    </GradientBackground>
  );
}
