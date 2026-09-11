import { View, Text, TouchableOpacity } from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";

import { cpfMask, cnpjMask, emailMask } from "@/components/forms/mask";
import { AppInput } from "@/components/forms/AppInput";
import { AppButton } from "../buttons/AppButton";
import { checkEmailExists } from "../../services/api";

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
  const { styles, theme } = useTheme();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [feedback, setFeedback] = useState("");

  async function continuar() {
    try {
      setFeedback("");
      setCheckingEmail(true);

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
        setFeedback(`Informe seu ${tipoDocumento}`);
        return;
      }

      const response = await checkEmailExists(email);

      if (response.exists) {
        setFeedback("Já existe um usuário cadastrado com este e-mail.");
        return;
      }

      onNext();
    } catch (error: any) {
      console.log(error);

      setFeedback(
        error.response?.data?.message ||
          "Não foi possível verificar o e-mail. Tente novamente.",
      );
    } finally {
      setCheckingEmail(false);

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
      <Text style={styles.title}>Criar Conta</Text>

      <Text
        style={{
          color: theme.textSecondary,
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
            marginRight: 10,
            alignItems: "center",
            backgroundColor:
              tipoDocumento === "CPF" ? theme.primary : theme.card,
          }}
          onPress={() => {
            setTipoDocumento("CPF");
            setDocumento("");
          }}
        >
          <Text
            style={{
              color: tipoDocumento === "CPF" ? theme.white : theme.text,
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
              tipoDocumento === "CNPJ" ? theme.primary : theme.card,
          }}
          onPress={() => {
            setTipoDocumento("CNPJ");
            setDocumento("");
          }}
        >
          <Text
            style={{
              color: tipoDocumento === "CNPJ" ? theme.white : theme.text,
              fontWeight: "600",
            }}
          >
            Pessoa Jurídica
          </Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.label}>Nome:</Text>
      <AppInput
        placeholder="Informe seu Nome Completo"
        value={nome}
        onChangeText={setNome}
      />
      <Text style={styles.label}>E-mail:</Text>
      <AppInput
        placeholder="Informe seu Email"
        value={email}
        onChangeText={(text) => setEmail(emailMask(text))}
      />
      <Text style={styles.label}>{tipoDocumento}:</Text>
      <AppInput
        placeholder={"Informe o seu " + tipoDocumento}
        value={documento}
        onChangeText={handleDocumento}
      />

      {/* Senha */}

      <Text style={styles.label}>Senha</Text>
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
            color={theme.text}
            name={showPassword ? "eye" : "eye-off"}
          />
        </TouchableOpacity>
        <AppInput
          placeholder="Senha"
          secureTextEntry={!showPassword}
          placeholderTextColor={theme.textSecondary}
          value={senha}
          onChangeText={setSenha}
        />
      </View>
      <Text style={styles.label}>Confirme a Senha</Text>
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
            color={theme.text}
            name={showConfirmPassword ? "eye" : "eye-off"}
          />
        </TouchableOpacity>
        <AppInput
          placeholder="Confirmar Senha"
          secureTextEntry={!showConfirmPassword}
          placeholderTextColor={theme.textSecondary}
          value={confirmarSenha}
          onChangeText={setConfirmarSenha}
        />
      </View>
      <View style={styles.divider} />
      {feedback !== "" && <Text style={styles.feedback}>{feedback}</Text>}
      <AppButton
        title={checkingEmail ? "Verificando..." : "Continuar →"}
        onPress={continuar}
        loading={checkingEmail}
        color={theme.primary}
      />
      <AppButton
        title="Voltar para tela de Login←"
        onPress={voltar}
        color={theme.title}
      />
    </View>
  );
}
