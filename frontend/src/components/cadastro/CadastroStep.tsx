import { View, Text, TextInput, TouchableOpacity } from "react-native";

import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { COLORS, globalStyles } from "../../styles/globalStyles";
import { cpfMask, cnpjMask, emailMask } from "@/components/forms/mask";
import { AppInput } from "@/components/forms/AppInput";
import { AppButton } from "../buttons/AppButton";

interface Props {
  nome: string;
  setNome: (text: string) => void;

  email: string;
  setEmail: (text: string) => void;

  senha: string;
  setSenha: (text: string) => void;

  confirmarSenha: string;
  setConfirmarSenha: (text: string) => void;

  documento: string;
  setDocumento: (text: string) => void;

  tipoDocumento: "CPF" | "CNPJ";
  setTipoDocumento: (tipo: "CPF" | "CNPJ") => void;

  onNext: () => void;
}

export function CadastroStep({
  nome,
  setNome,

  email,
  setEmail,

  senha,
  setSenha,

  confirmarSenha,
  setConfirmarSenha,

  documento,
  setDocumento,

  tipoDocumento,
  setTipoDocumento,

  onNext,
}: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [feedback, setFeedback] = useState("");

  async function continuar() {
    try {
      setFeedback("");
      if (!nome.trim()) {
        setFeedback("Informe seu nome completo");
        return;
      }

      if (!email.trim()) {
        setFeedback("Informe seu e-mail");
        return;
      }

      if (!email.includes("@")) {
        setFeedback("Informe um e-mail válido.");
        return;
      }

      if (!senha) {
        setFeedback("Informe uma senha");
        return;
      }

      if (senha.length < 6) {
        setFeedback("A senha deve ter no mínimo 6 caracteres");
        return;
      }

      if (senha !== confirmarSenha) {
        setFeedback("As senhas não coincidem");
        return;
      }

      if (!documento.trim()) {
        setFeedback("Informe seu " + { tipoDocumento });
        return;
      }

      onNext();
    } catch (error) {
      console.log(error);
    } finally {
      setTimeout(() => {
        setFeedback("");
      }, 5000);
    }
  }

  function voltar() {
    setNome("");
    setEmail("");
    setSenha("");
    setConfirmarSenha("");
    setDocumento("");

    router.replace("/");
  }

  function handleDocumento(text: string) {
    if (tipoDocumento === "CPF") {
      setDocumento(cpfMask(text));
      return;
    }

    setDocumento(cnpjMask(text));
  }

  return (
    <View>
      <Text style={globalStyles.title}>Criar Conta</Text>

      <Text
        style={{
          color: COLORS.textSecondary,
          marginBottom: 25,
        }}
      >
        Preencha seus dados para continuar.
      </Text>

      {/* CPF / CNPJ */}

      <View
        style={{
          flexDirection: "row",
          marginBottom: 18,
        }}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            padding: 14,
            borderRadius: 12,
            marginRight: 5,
            alignItems: "center",
            backgroundColor:
              tipoDocumento === "CPF" ? COLORS.primary : COLORS.card,
          }}
          onPress={() => {
            setTipoDocumento("CPF");
            setDocumento("");
          }}
        >
          <Text
            style={{
              color: COLORS.text,
              fontWeight: "600",
            }}
          >
            Pessoa Física
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            flex: 1,
            padding: 14,
            borderRadius: 12,
            marginLeft: 5,
            alignItems: "center",
            backgroundColor:
              tipoDocumento === "CNPJ" ? COLORS.primary : COLORS.card,
          }}
          onPress={() => {
            setTipoDocumento("CNPJ");
            setDocumento("");
          }}
        >
          <Text
            style={{
              color: COLORS.text,
              fontWeight: "600",
            }}
          >
            Pessoa Jurídica
          </Text>
        </TouchableOpacity>
      </View>
      <Text style={globalStyles.label}>Nome:</Text>
      <AppInput
        placeholder="Informe seu Nome Completo"
        value={nome}
        onChangeText={setNome}
      />
      <Text style={globalStyles.label}>E-mail:</Text>
      <AppInput
        placeholder="Informe seu Email"
        value={email}
        onChangeText={(text) => setEmail(emailMask(text))}
      />
      <Text style={globalStyles.label}>{tipoDocumento}:</Text>
      <AppInput
        placeholder={"Informe o seu " + tipoDocumento}
        value={documento}
        onChangeText={handleDocumento}
      />

      {/* Senha */}

      <Text style={globalStyles.label}>Senha</Text>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={{
            position: "absolute",
            right: 10,
            top: 15,
          }}
        >
          <Ionicons
            size={24}
            color="#000"
            name={showPassword ? "eye" : "eye-off"}
          />
        </TouchableOpacity>
        <TextInput
          placeholder="Senha"
          secureTextEntry={!showPassword}
          placeholderTextColor={COLORS.textSecondary}
          style={{
            width: "100%",
            height: 55,
            backgroundColor: COLORS.white,
            borderRadius: 14,
            paddingHorizontal: 30,
            marginBottom: 16,
          }}
          value={senha}
          onChangeText={setSenha}
        />
      </View>
      <Text style={globalStyles.label}>Confirme a Senha</Text>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <TouchableOpacity
          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          style={{
            position: "absolute",
            right: 10,
            top: 15,
          }}
        >
          <Ionicons
            size={24}
            color="#000"
            name={showConfirmPassword ? "eye" : "eye-off"}
          />
        </TouchableOpacity>
        <TextInput
          placeholder="Confirmar Senha"
          secureTextEntry={!showConfirmPassword}
          placeholderTextColor={COLORS.textSecondary}
          style={{
            width: "100%",
            height: 55,
            backgroundColor: COLORS.white,
            borderRadius: 14,
            paddingHorizontal: 30,
            marginBottom: 16,
          }}
          value={confirmarSenha}
          onChangeText={setConfirmarSenha}
        />
      </View>
      <View style={globalStyles.divider} />
      {feedback !== "" && <Text style={globalStyles.feedback}>{feedback}</Text>}
      <AppButton title="Continuar →" onPress={continuar} />
      <AppButton
        title="Voltar para tela de Login←"
        onPress={voltar}
        color={COLORS.danger}
      />
    </View>
  );
}
