import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useState } from "react";
import { router } from "expo-router";

import { CadastroStep } from "../components/cadastro/CadastroStep";
import { VerificarEmail } from "../components/cadastro/VerificarEmail";
import { PaymentStep } from "../components/cadastro/PaymentStep";
import { RegisterStepSuccess } from "../components/cadastro/RegisterStepSuccess";
import { StepIndicator } from "../components/cadastro/StepIndicator";
import { registerUser } from "../services/api";
import { useTheme } from "@/contexts/ThemeContext";
import { GradientBackground } from "../styles/GradientBackground";

export default function CadastroScreen() {
  const { styles } = useTheme();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [documentType, setDocumentType] = useState<"CPF" | "CNPJ">("CPF");
  const [document, setDocument] = useState("");

  async function handleRegister() {
    try {
      setLoading(true);
      setFeedback("");
      await registerUser({
        nome,
        email,
        senha,
        CPF: documentType === "CPF" ? document : "",
        CNPJ: documentType === "CNPJ" ? document : "",
      });
      setStep(4);
      setTimeout(() => router.replace("/"), 2500);
    } catch (error: any) {
      console.log(error);
      if (error.response?.status === 409) {
        setFeedback("Já existe um usuário cadastrado com este e-mail.");
      } else if (error.response?.status === 400) {
        setFeedback(error.response?.data?.message || "Dados inválidos.");
      } else if (error.response?.status >= 500) {
        setFeedback("Erro interno do servidor. Tente novamente mais tarde.");
      } else {
        setFeedback(
          error.response?.data?.message ||
            "Não foi possível realizar o cadastro.",
        );
      }
      setTimeout(() => setFeedback(""), 5000);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.cadastroScreen}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <GradientBackground style={styles.cadastroScreen}>
        <ScrollView
          contentContainerStyle={styles.cadastroContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.cadastroHeader}>
            <Text style={styles.cadastroKicker}>OBRA FÁCIL • NOVA CONTA</Text>
            <Text style={styles.cadastroTitle}>Crie sua conta</Text>
            <Text style={styles.cadastroSubtitle}>
              Vamos configurar seu acesso em poucos passos.
            </Text>
          </View>

          <StepIndicator step={step} />

          <View style={styles.cadastroCard}>
            {step === 1 && (
              <CadastroStep
                nome={nome}
                setNome={setNome}
                email={email}
                setEmail={setEmail}
                senha={senha}
                setSenha={setSenha}
                confirmarSenha={confirmarSenha}
                setConfirmarSenha={setConfirmarSenha}
                documento={document}
                setDocumento={setDocument}
                tipoDocumento={documentType}
                setTipoDocumento={setDocumentType}
                onNext={() => setStep(2)}
              />
            )}
            {step === 2 && (
              <VerificarEmail
                email={email}
                onBack={() => setStep(1)}
                onVerified={() => setStep(3)}
              />
            )}
            {step === 3 && (
              <PaymentStep
                loading={loading}
                feedback={feedback}
                onBack={() => setStep(2)}
                onContinue={handleRegister}
              />
            )}
            {step === 4 && <RegisterStepSuccess />}
          </View>

          {step < 4 && (
            <Text style={styles.cadastroFooterHint}>
              Você poderá revisar suas informações antes de finalizar.
            </Text>
          )}
        </ScrollView>
      </GradientBackground>
    </KeyboardAvoidingView>
  );
}
