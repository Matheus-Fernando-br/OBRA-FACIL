import { ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { CadastroStep } from "../components/cadastro/CadastroStep";
import { PaymentStep } from "../components/cadastro/PaymentStep";
import { RegisterStepSuccess } from "../components/cadastro/RegisterStepSuccess";
import { StepIndicator } from "../components/cadastro/StepIndicator";
import { registerUser } from "../services/api";
import { globalStyles } from "../styles/globalStyles";
import { GradientBackground } from "../styles/GradientBackground";

export default function CadastroScreen() {
  const [step, setStep] = useState(1);

  const [loading, setLoading] = useState(false);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [documentType, setDocumentType] = useState<"CPF" | "CNPJ">("CPF");
  const [feedback, setFeedback] = useState("");

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

      setStep(3);

      setTimeout(() => {
        router.replace("/");
      }, 2500);
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
      setTimeout(() => {
        setFeedback("");
      }, 5000);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <GradientBackground style={globalStyles.loginContainer}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <StepIndicator step={step} />

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
            <PaymentStep
              loading={loading}
              feedback={feedback}
              onBack={() => setStep(1)}
              onContinue={handleRegister}
            />
          )}

          {step === 3 && <RegisterStepSuccess />}
        </ScrollView>
      </GradientBackground>
    </KeyboardAvoidingView>
  );
}
