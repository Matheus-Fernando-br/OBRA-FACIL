import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useState } from "react";
import { router } from "expo-router";

import { CadastroStep } from "../components/cadastro/CadastroStep";
import { PaymentStep } from "../components/cadastro/PaymentStep";
import { RegisterStepSuccess } from "../components/cadastro/RegisterStepSuccess";
import { StepIndicator } from "../components/cadastro/StepIndicator";

import { registerUser } from "../services/api";

import { globalStyles } from "../styles/globalStyles";

export default function CadastroScreen() {
  const [step, setStep] = useState(1);

  const [loading, setLoading] = useState(false);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");
  const [documentType, setDocumentType] =
    useState<"CPF" | "CNPJ">("CPF");

  const [document, setDocument] = useState("");

  async function handleRegister() {
    try {
      setLoading(true);

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
      console.log(error.response?.data || error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === "ios" ? "padding" : "height"}
  >
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
      }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={globalStyles.loginContainer}>
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
          onBack={() => setStep(1)}
          onContinue={handleRegister}
        />
      )}

      {step === 3 && (
        <RegisterStepSuccess />
      )}
      </View>
    </ScrollView>
  </KeyboardAvoidingView>
  );
}