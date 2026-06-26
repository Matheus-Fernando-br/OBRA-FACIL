import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useRouter } from "expo-router";
import { globalStyles, COLORS } from "../../styles/globalStyles";

export function RegisterStepSuccess() {
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
      <Ionicons
        name="checkmark-circle"
        size={90}
        color={COLORS.success}
      />

      <Text
        style={{
          color: "#FFF",
          fontSize: 24,
          fontWeight: "bold",
          marginTop: 20,
        }}
      >
        Cadastro realizado!
      </Text>

      <Text
        style={{
          color: "#94A3B8",
          fontSize: 16,
          textAlign: "center",
          marginTop: 15,
          lineHeight: 24,
        }}
      >
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
          backgroundColor: "#22C55E22",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Ionicons
          name="shield-checkmark"
          size={50}
          color={COLORS.success}
        />
      </View>

      <Text
        style={{
          color: "#64748B",
          marginTop: 25,
          textAlign: "center",
        }}
      >
        Redirecionando para a tela de login...
      </Text>
    </View>
  );
}