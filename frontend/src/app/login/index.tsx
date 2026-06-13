import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

import { router } from "expo-router";
import { useState } from "react";

import { globalStyles } from "../../styles/globalStyles";

import { useAuth } from "../../contexts/AuthContext";

export default function LoginScreen() {
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    try {
      setLoading(true);

      await signIn(email, password);

      router.replace("/(tabs)");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={globalStyles.loginContainer}>
      <Text style={globalStyles.loginTitle}>OBRA-FÁCIL</Text>

      <TextInput
        placeholder="Seu email"
        placeholderTextColor="#94A3B8"
        value={email}
        onChangeText={setEmail}
        style={globalStyles.loginInput}
      />

      <TextInput
        placeholder="Sua senha"
        placeholderTextColor="#94A3B8"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={globalStyles.loginInput}
      />

      <TouchableOpacity onPress={handleLogin} style={globalStyles.loginButton}>
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={globalStyles.loginButtonText}>Entrar</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
