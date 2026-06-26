import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    } from "react-native";
  
  import { useState } from "react";
  import { Ionicons } from "@expo/vector-icons";
  
  import { COLORS, globalStyles } from "../../styles/globalStyles";
  
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
  
    function continuar() {
      if (!nome.trim())
        return Alert.alert(
          "Erro",
          "Informe seu nome."
        );
  
      if (!email.trim())
        return Alert.alert(
          "Erro",
          "Informe seu email."
        );
  
      if (!senha)
        return Alert.alert(
          "Erro",
          "Informe uma senha."
        );
  
      if (senha.length < 6)
        return Alert.alert(
          "Erro",
          "A senha deve possuir pelo menos 6 caracteres."
        );
  
      if (senha !== confirmarSenha)
        return Alert.alert(
          "Erro",
          "As senhas não conferem."
        );
  
      if (!documento.trim())
        return Alert.alert(
          "Erro",
          `Informe seu ${tipoDocumento}.`
        );
  
      onNext();
    }
  
    return (
      <View>
  
        <Text style={globalStyles.title}>
          Criar Conta
        </Text>
  
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
                tipoDocumento === "CPF"
                  ? COLORS.primary
                  : COLORS.card,
            }}
            onPress={() => {
              setTipoDocumento("CPF");
              setDocumento("");
            }}
          >
            <Text
              style={{
                color: "#FFF",
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
                tipoDocumento === "CNPJ"
                  ? COLORS.primary
                  : COLORS.card,
            }}
            onPress={() => {
              setTipoDocumento("CNPJ");
              setDocumento("");
            }}
          >
            <Text
              style={{
                color: "#FFF",
                fontWeight: "600",
              }}
            >
              Pessoa Jurídica
            </Text>
          </TouchableOpacity>
        </View>
  
        <TextInput
          placeholder="Nome Completo"
          placeholderTextColor={COLORS.textSecondary}
          style={globalStyles.loginInput}
          value={nome}
          onChangeText={setNome}
        />
  
        <TextInput
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor={COLORS.textSecondary}
          style={globalStyles.loginInput}
          value={email}
          onChangeText={setEmail}
        />
  
        <TextInput
          placeholder={tipoDocumento}
          keyboardType="numeric"
          placeholderTextColor={COLORS.textSecondary}
          style={globalStyles.loginInput}
          value={documento}
          onChangeText={setDocumento}
        />
  
        {/* Senha */}
  
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: COLORS.card,
            borderRadius: 12,
            paddingHorizontal: 15,
            marginBottom: 15,
          }}
        >
          <TextInput
            placeholder="Senha"
            secureTextEntry={!showPassword}
            placeholderTextColor={COLORS.textSecondary}
            style={{
              flex: 1,
              color: "#FFF",
              height: 55,
            }}
            value={senha}
            onChangeText={setSenha}
          />
  
          <TouchableOpacity
            onPress={() =>
              setShowPassword(!showPassword)
            }
          >
            <Ionicons
              size={24}
              color="#FFF"
              name={
                showPassword
                  ? "eye-off"
                  : "eye"
              }
            />
          </TouchableOpacity>
        </View>
  
        <TextInput
          placeholder="Confirmar Senha"
          secureTextEntry={!showPassword}
          placeholderTextColor={COLORS.textSecondary}
          style={globalStyles.loginInput}
          value={confirmarSenha}
          onChangeText={setConfirmarSenha}
        />
  
        <TouchableOpacity
          style={globalStyles.loginButton}
          onPress={continuar}
        >
          <Text style={globalStyles.loginButtonText}>
            Continuar →
          </Text>
        </TouchableOpacity>
  
      </View>
    );
  }