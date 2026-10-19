import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";

import { SenhaEmailStep } from "../components/senha/SenhaEmailStep";
import { SenhaCodigoStep } from "../components/senha/SenhaCodigoStep";
import { SenhaSucesso } from "../components/senha/SenhaSucesso";
import { StepIndicator, StepItem } from "../components/cadastro/StepIndicator";
import { Check, KeyRound, Mail } from "@/components/ui/icons";
import { useTheme } from "@/contexts/ThemeContext";
import { GradientBackground } from "../styles/GradientBackground";

const STEPS: StepItem[] = [
  { label: "E-mail", icon: Mail },
  { label: "Código", icon: KeyRound },
  { label: "Concluído", icon: Check },
];

/** Recuperação de senha: e-mail → código + nova senha → sucesso. */
export default function SenhaScreen() {
  const { styles } = useTheme();
  // O login pode enviar o e-mail já digitado: router.push({ pathname: "/senha", params: { email } })
  const params = useLocalSearchParams<{ email?: string }>();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState(params.email ?? "");
  const redirectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function goToLogin() {
    if (redirectTimer.current) clearTimeout(redirectTimer.current);
    router.replace("/login");
  }

  // Na tela de sucesso, volta sozinho para o login.
  useEffect(() => {
    if (step !== 3) return;
    redirectTimer.current = setTimeout(goToLogin, 3000);
    return () => {
      if (redirectTimer.current) clearTimeout(redirectTimer.current);
    };
  }, [step]);

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
            <Text style={styles.cadastroKicker}>OBRA FÁCIL • ACESSO</Text>
            <Text style={styles.cadastroTitle}>Recuperar senha</Text>
            <Text style={styles.cadastroSubtitle}>
              Em poucos passos você volta a acessar sua conta.
            </Text>
          </View>

          <StepIndicator step={step} steps={STEPS} />

          <View style={styles.cadastroCard}>
            {step === 1 && (
              <SenhaEmailStep
                email={email}
                setEmail={setEmail}
                onBack={goToLogin}
                onCodeSent={() => setStep(2)}
              />
            )}
            {step === 2 && (
              <SenhaCodigoStep
                email={email.trim()}
                onBack={() => setStep(1)}
                onSuccess={() => setStep(3)}
              />
            )}
            {step === 3 && <SenhaSucesso onGoToLogin={goToLogin} />}
          </View>
        </ScrollView>
      </GradientBackground>
    </KeyboardAvoidingView>
  );
}
