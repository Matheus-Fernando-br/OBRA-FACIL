import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Eye, EyeOff, Fingerprint, ShieldCheck } from "lucide-react-native";

import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { AppInput } from "@/components/forms/AppInput";
import { emailMask } from "@/components/forms/mask";
import { GradientBackground } from "../styles/GradientBackground";

function InitialSplash() {
  const { styles } = useTheme();

  return (
    <View style={styles.authSplash}>
      <View style={styles.authSplashMark}>
        <Image
          source={require("../assets/images/logo_titulo.png")}
          style={styles.authSplashLogo}
        />
      </View>
      <Text style={styles.authSplashTitle}>OBRA FÁCIL</Text>
      <Text style={styles.authSplashSubtitle}>
        gestão simples para obras melhores
      </Text>
      <ActivityIndicator color="#C45F00" style={styles.authSplashLoader} />
    </View>
  );
}

export default function LoginScreen() {
  const { styles, theme } = useTheme();
  const {
    login,
    loginWithBiometrics,
    loading,
    initializing,
    biometricAvailable,
    user,
  } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [feedback, setFeedback] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);

  useEffect(() => {
    if (!initializing && user) router.replace("/(tabs)");
  }, [initializing, user]);

  if (initializing) return <InitialSplash />;

  async function handleLogin() {
    if (!email.trim() || !password) {
      setFeedback("Informe seu e-mail e sua senha para continuar.");
      return;
    }

    try {
      setFeedback("");
      await login(email, password);
      router.replace("/(tabs)");
    } catch (error: any) {
      console.log(error);
      if (error.response?.status === 401) {
        setFeedback("E-mail ou senha incorretos.");
      } else if (error.response?.status === 400) {
        setFeedback(
          error.response.data?.message || "Confira os dados informados.",
        );
      } else {
        setFeedback("Não foi possível conectar ao servidor.");
      }
    }
  }

  async function handleBiometricLogin() {
    setFeedback("");
    setBiometricLoading(true);
    const authenticated = await loginWithBiometrics();
    setBiometricLoading(false);

    if (authenticated) {
      router.replace("/(tabs)");
    } else {
      setFeedback(
        "Não foi possível validar sua identidade. Entre com e-mail e senha.",
      );
    }
  }

  return (
    <GradientBackground style={styles.loginContainer}>
      <SafeAreaView style={styles.loginSafeArea}>
        <KeyboardAvoidingView
          style={styles.loginKeyboard}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.loginContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.loginBrandRow}>
              <View style={styles.loginBrandBadge}>
                <Image
                  source={require("../assets/images/icon.png")}
                  style={styles.loginBrandLogo}
                />
              </View>
              <View>
                <Text style={styles.loginBrandName}>OBRA FÁCIL</Text>
              </View>
            </View>
            <View style={styles.divider} />

            <View style={styles.loginHeadingBlock}>
              <Text style={styles.loginEyebrow}>BEM-VINDO DE VOLTA</Text>
              <Text style={styles.loginTitle}>Acesse sua conta</Text>
              <Text style={styles.loginDescription}>
                Organize seus projetos e acompanhe cada detalhe da sua obra.
              </Text>
            </View>

            <View style={styles.authFormCard}>
              <View style={styles.authFieldBlock}>
                <Text style={styles.authLabel}>E-mail</Text>
                <AppInput
                  placeholder="voce@exemplo.com"
                  value={email}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoCorrect={false}
                  onChangeText={(text) => {
                    setEmail(emailMask(text));
                    if (feedback) setFeedback("");
                  }}
                  style={styles.authInput}
                />
              </View>

              <View style={styles.authFieldBlock}>
                <View style={styles.authLabelRow}>
                  <Text style={styles.authLabel}>Senha</Text>
                  <Pressable
                    onPress={() =>
                      setFeedback(
                        "Para redefinir sua senha, fale com o suporte da sua conta.",
                      )
                    }
                  >
                    <Text style={styles.authForgot}>Esqueci a senha</Text>
                  </Pressable>
                </View>
                <View style={styles.authPasswordWrap}>
                  <AppInput
                    placeholder="Digite sua senha"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (feedback) setFeedback("");
                    }}
                    style={[styles.authInput, styles.authPasswordInput]}
                  />
                  <Pressable
                    style={styles.authEyeButton}
                    onPress={() => setShowPassword((current) => !current)}
                    accessibilityLabel={
                      showPassword ? "Ocultar senha" : "Mostrar senha"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={20} color={theme.placeholder} />
                    ) : (
                      <Eye size={20} color={theme.placeholder} />
                    )}
                  </Pressable>
                </View>
              </View>

              {!!feedback && (
                <Text style={styles.authFeedback}>{feedback}</Text>
              )}

              <Pressable
                onPress={handleLogin}
                disabled={loading || biometricLoading}
                style={({ pressed }) => [
                  styles.authPrimaryButton,
                  pressed && styles.authPressed,
                  (loading || biometricLoading) && styles.authDisabled,
                ]}
              >
                {loading ? (
                  <ActivityIndicator color={theme.white} />
                ) : (
                  <Text style={styles.authPrimaryButtonText}>Entrar</Text>
                )}
              </Pressable>

              {biometricAvailable && (
                <Pressable
                  onPress={handleBiometricLogin}
                  disabled={loading || biometricLoading}
                  style={({ pressed }) => [
                    styles.authBiometricButton,
                    pressed && styles.authPressed,
                    biometricLoading && styles.authDisabled,
                  ]}
                >
                  {biometricLoading ? (
                    <ActivityIndicator color={theme.title} />
                  ) : (
                    <Fingerprint size={20} color={theme.title} />
                  )}
                  <Text style={styles.authBiometricText}>
                    Entrar com biometria
                  </Text>
                </Pressable>
              )}

              <View style={styles.authSecurityNote}>
                <ShieldCheck size={16} color={theme.success} />
                <Text style={styles.authSecurityText}>
                  Sua sessão fica protegida neste dispositivo
                </Text>
              </View>
            </View>

            <View style={styles.authRegisterRow}>
              <Text style={styles.authRegisterText}>
                Ainda não tem uma conta?
              </Text>
              <Pressable onPress={() => router.push("/cadastro")}>
                <Text style={styles.authRegisterLink}>Cadastre-se</Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GradientBackground>
  );
}
