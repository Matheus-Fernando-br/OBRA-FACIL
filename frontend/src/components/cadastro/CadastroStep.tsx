import { Pressable, Text, View } from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { Eye, EyeOff } from "lucide-react-native";
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

      if (!nome.trim()) return setFeedback("Informe seu nome completo");
      if (!email.trim()) return setFeedback("Informe seu e-mail");
      if (!email.includes("@")) return setFeedback("Informe um e-mail válido.");
      if (!senha) return setFeedback("Informe uma senha");
      if (senha.length < 6)
        return setFeedback("A senha deve ter no mínimo 6 caracteres");
      if (senha !== confirmarSenha)
        return setFeedback("As senhas não coincidem");
      if (!documento.trim()) return setFeedback(`Informe seu ${tipoDocumento}`);

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
    setDocumento(tipoDocumento === "CPF" ? cpfMask(text) : cnpjMask(text));
  }

  return (
    <View>
      <Text style={styles.cadastroStepTitle}>Seus dados</Text>
      <Text style={styles.cadastroStepSubtitle}>
        Preencha suas informações para começar.
      </Text>

      <View style={styles.cadastroDocumentToggle}>
        <Pressable
          style={[
            styles.cadastroDocumentButton,
            tipoDocumento === "CPF" && styles.cadastroDocumentButtonActive,
          ]}
          onPress={() => {
            setTipoDocumento("CPF");
            setDocumento("");
          }}
        >
          <Text
            style={[
              styles.cadastroDocumentButtonText,
              tipoDocumento === "CPF" &&
                styles.cadastroDocumentButtonTextActive,
            ]}
          >
            Pessoa Física
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.cadastroDocumentButton,
            tipoDocumento === "CNPJ" && styles.cadastroDocumentButtonActive,
          ]}
          onPress={() => {
            setTipoDocumento("CNPJ");
            setDocumento("");
          }}
        >
          <Text
            style={[
              styles.cadastroDocumentButtonText,
              tipoDocumento === "CNPJ" &&
                styles.cadastroDocumentButtonTextActive,
            ]}
          >
            Pessoa Jurídica
          </Text>
        </Pressable>
      </View>

      <Text style={styles.cadastroLabel}>Nome completo</Text>
      <AppInput
        placeholder="Informe seu nome completo"
        value={nome}
        onChangeText={setNome}
        style={styles.cadastroInput}
      />

      <Text style={styles.cadastroLabel}>E-mail</Text>
      <AppInput
        placeholder="voce@exemplo.com"
        value={email}
        autoCapitalize="none"
        keyboardType="email-address"
        onChangeText={(text) => setEmail(emailMask(text))}
        style={styles.cadastroInput}
      />

      <Text style={styles.cadastroLabel}>{tipoDocumento}</Text>
      <AppInput
        placeholder={`Informe seu ${tipoDocumento}`}
        value={documento}
        keyboardType="number-pad"
        onChangeText={handleDocumento}
        style={styles.cadastroInput}
      />

      <Text style={styles.cadastroLabel}>Senha</Text>
      <View style={styles.cadastroPasswordWrap}>
        <AppInput
          placeholder="Crie uma senha com 6 caracteres ou mais"
          secureTextEntry={!showPassword}
          value={senha}
          onChangeText={setSenha}
          style={[styles.cadastroInput, styles.cadastroPasswordInput]}
        />
        <Pressable
          onPress={() => setShowPassword((current) => !current)}
          style={styles.cadastroEyeButton}
          accessibilityLabel={showPassword ? "Ocultar senha" : "Mostrar senha"}
        >
          {showPassword ? (
            <EyeOff size={20} color={theme.placeholder} />
          ) : (
            <Eye size={20} color={theme.placeholder} />
          )}
        </Pressable>
      </View>

      <Text style={styles.cadastroLabel}>Confirmar senha</Text>
      <View style={styles.cadastroPasswordWrap}>
        <AppInput
          placeholder="Digite sua senha novamente"
          secureTextEntry={!showConfirmPassword}
          value={confirmarSenha}
          onChangeText={setConfirmarSenha}
          style={[styles.cadastroInput, styles.cadastroPasswordInput]}
        />
        <Pressable
          onPress={() => setShowConfirmPassword((current) => !current)}
          style={styles.cadastroEyeButton}
          accessibilityLabel={
            showConfirmPassword ? "Ocultar confirmação" : "Mostrar confirmação"
          }
        >
          {showConfirmPassword ? (
            <EyeOff size={20} color={theme.placeholder} />
          ) : (
            <Eye size={20} color={theme.placeholder} />
          )}
        </Pressable>
      </View>

      {!!feedback && <Text style={styles.cadastroFeedback}>{feedback}</Text>}
      <AppButton
        title={checkingEmail ? "Verificando..." : "Continuar"}
        onPress={continuar}
        loading={checkingEmail}
        color={theme.title}
      />
      <AppButton
        title="Voltar para o login"
        onPress={voltar}
        color={theme.placeholder}
      />
    </View>
  );
}
