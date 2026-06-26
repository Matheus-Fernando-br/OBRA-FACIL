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

import { login } from "@/services/api";
import { AppButton } from "@/components/buttons/AppButton";

export default function LoginScreen() {
  const { setToken } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  

  async function handleLogin() {
    try {
      setLoading(true);
  
      const response = await login(email, password);
  
      console.log("LOGIN API:", response);
  
      setToken(response.accessToken);
  
      router.replace("/(tabs)");
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={globalStyles.loginContainer}>
      <Text style={globalStyles.loginTitle}>OBRA-FÁCIL</Text>
      <Text style={globalStyles.label}>E-mail</Text>
      <TextInput
        placeholder="Informe seu email"
        placeholderTextColor="#94A3B8"
        value={email}
        onChangeText={setEmail}
        style={globalStyles.loginInput}
      />
      <Text style={globalStyles.label}>Senha</Text>
      <TextInput
        placeholder="Informe sua senha"
        placeholderTextColor="#94A3B8"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={globalStyles.loginInput}
      />

      <TouchableOpacity
        onPress={handleLogin}
        style={[
          globalStyles.loginButton,
          loading && { opacity: 0.7 },
        ]}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#FFF" />
        ) : (
          <Text style={globalStyles.loginButtonText}>
            Entrar
          </Text>
        )}
      </TouchableOpacity>
      <Text style={globalStyles.loginText}>
        Ainda não tem conta?{" "}
      </Text>
        <TouchableOpacity style={globalStyles.loginButtonCadastro} onPress={() => router.push("/cadastro")}>{loading ? (
          <ActivityIndicator size="small" color="#FFF" />
        ) : (
          <Text style={globalStyles.loginButtonText}>
            Cadastre-se
          </Text>
        )}</TouchableOpacity>
    </View>
  );
}
