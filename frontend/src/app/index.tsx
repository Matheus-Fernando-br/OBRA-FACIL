import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

import { router } from "expo-router";
import { useState } from "react";

import { globalStyles } from "../styles/globalStyles";

import { useAuth } from "../contexts/AuthContext";

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
        setFeedback(
          error.response.data?.message ||
            "Dados inválidos."
        );
      } else {
        setFeedback(
          "Erro ao conectar com o servidor."
        );
      }

      setTimeout(() => {
        setFeedback("");
      }, 5000);
    }
  }

  return (
    <View style={globalStyles.loginContainer}>
      <Text style={globalStyles.loginTitle}>
        OBRA-FÁCIL
      </Text>

      <Text style={globalStyles.label}>
        E-mail
      </Text>

      <TextInput
        placeholder="Informe seu email"
        placeholderTextColor="#94A3B8"
        value={email}
        onChangeText={(text) => {
          setEmail(text);

          if (feedback) setFeedback("");
        }}
        style={globalStyles.loginInput}
      />

      <Text style={globalStyles.label}>
        Senha
      </Text>

      <TextInput
        placeholder="Informe sua senha"
        placeholderTextColor="#94A3B8"
        secureTextEntry
        value={password}
        onChangeText={(text) => {
          setPassword(text);

          if (feedback) setFeedback("");
        }}
        style={globalStyles.loginInput}
      />

      {feedback !== "" && (
        <Text style={globalStyles.feedback}>
          {feedback}
        </Text>
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
          <ActivityIndicator
            size="small"
            color="#FFF"
          />
        ) : (
          <Text style={globalStyles.loginButtonText}>
            Entrar
          </Text>
        )}
      </TouchableOpacity>

      <Text style={globalStyles.loginText}>
        Ainda não tem conta?
      </Text>

      <TouchableOpacity
        style={globalStyles.loginButtonCadastro}
        onPress={() => router.push("/cadastro")}
      >
        {loadingRegister ? (
          <ActivityIndicator
            size="small"
            color="#FFF"
          />
        ) : (
          <Text style={globalStyles.loginButtonText}>
            Cadastre-se
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}