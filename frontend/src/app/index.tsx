import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

import { router } from "expo-router";
import { useState } from "react";
import { globalStyles, COLORS } from "../styles/globalStyles";
import { useAuth } from "@/contexts/AuthContext";
import { AppInput } from "@/components/forms/AppInput";
import { emailMask } from "@/components/forms/mask";
import { GradientBackground } from "../styles/GradientBackground";

export default function LoginScreen() {
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
    <GradientBackground style={globalStyles.loginContainer}>
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Image
          source={require("../assets/images/logo_titulo_frase.png")}
          style={globalStyles.loginImage}
        />
      </View>
      <View style={{ marginTop: -20 }}>
        <Text style={globalStyles.label}>E-mail</Text>

        <AppInput
          placeholder="Informe seu e-mail"
          value={email}
          onChangeText={(text) => {
            setEmail(emailMask(text));

            if (feedback) setFeedback("");
          }}
        />

        <Text style={globalStyles.label}>Senha</Text>

        <AppInput
          placeholder="Informe sua senha"
          placeholderTextColor={COLORS.placeholder}
          secureTextEntry
          value={password}
          onChangeText={(text) => {
            setPassword(text);

            if (feedback) setFeedback("");
          }}
        />
        <View style={globalStyles.divider} />

        {feedback !== "" && (
          <Text style={globalStyles.feedback}>{feedback}</Text>
        )}

        <TouchableOpacity
          onPress={handleLogin}
          style={[
            globalStyles.loginButton,
            loading && {
              opacity: 0.7,
            },
          ]}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Text style={globalStyles.loginButtonText}>Entrar</Text>
          )}
        </TouchableOpacity>

        <Text style={globalStyles.loginText}>Ainda não tem conta?</Text>

        <TouchableOpacity
          style={globalStyles.loginButtonCadastro}
          onPress={() => router.push("/cadastro")}
        >
          {loadingRegister ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Text style={globalStyles.loginButtonText}>Cadastre-se</Text>
          )}
        </TouchableOpacity>
      </View>
    </GradientBackground>
  );
}
