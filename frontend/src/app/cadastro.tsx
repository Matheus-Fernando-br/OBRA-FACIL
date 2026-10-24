import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";

import { CadastroStep } from "../components/cadastro/CadastroStep";
import { VerificarEmail } from "../components/cadastro/VerificarEmail";
import { PlanoStep } from "../components/cadastro/PlanoStep";
import { RegisterStepSuccess } from "../components/cadastro/RegisterStepSuccess";
import { StepIndicator } from "../components/cadastro/StepIndicator";
import { registerUser } from "../services/api";
import { useTheme } from "@/contexts/ThemeContext";
import { GradientBackground } from "../styles/GradientBackground";
import legal from "@/content/legal.json";

/*
 * Cadastro em 3 etapas:
 * 1. dados + aceite dos termos → cria a conta (não verificada) e o
 *    servidor envia o código por e-mail;
 * 2. código de verificação;
 * 3. apresentação do plano inicial (Gratuito) → login.
 * "?verificar=<email>" abre direto na etapa 2 (vindo do login).
 */
export default function CadastroScreen() {
  const { styles } = useTheme();
  const { verificar } = useLocalSearchParams<{ verificar?: string }>();
  const [step, setStep] = useState(verificar ? 2 : 1);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState(verificar ?? "");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [documentType, setDocumentType] = useState<"CPF" | "CNPJ">("CPF");
  const [document, setDocument] = useState("");
  const [aceite, setAceite] = useState(false);

  async function handleRegister() {
    const normalizedEmail = email.trim().toLowerCase();
    await registerUser({
      nome: nome.trim(),
      email: normalizedEmail,
      senha,
      CPF: documentType === "CPF" ? document : "",
      CNPJ: documentType === "CNPJ" ? document : "",
      aceiteTermos: true,
      versaoTermos: legal.versao,
    });
    setEmail(normalizedEmail);
    setStep(2);
  }

  function finish() {
    setStep(4);
    setTimeout(() => router.replace("/login"), 2500);
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
            <Text style={styles.cadastroTitle}>
              {verificar ? "Confirme seu e-mail" : "Crie sua conta"}
            </Text>
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
                aceite={aceite}
                setAceite={setAceite}
                onNext={handleRegister}
              />
            )}
            {step === 2 && (
              <VerificarEmail
                email={email}
                onBack={() => (verificar ? router.replace("/login") : setStep(1))}
                onVerified={() => (verificar ? finish() : setStep(3))}
              />
            )}
            {step === 3 && <PlanoStep onContinue={finish} />}
            {step === 4 && <RegisterStepSuccess />}
          </View>

          {step < 4 && (
            <Text style={styles.cadastroFooterHint}>
              Seus dados são protegidos conforme a LGPD.
            </Text>
          )}
        </ScrollView>
      </GradientBackground>
    </KeyboardAvoidingView>
  );
}
