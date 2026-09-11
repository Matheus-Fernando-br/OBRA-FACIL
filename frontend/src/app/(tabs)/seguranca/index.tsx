import {
  Alert,
  ScrollView,
  View,
  Text,
  TextInput,
  Pressable,
} from "react-native";

import { useState } from "react";
import { AppInput } from "@/components/forms/AppInput";

import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/layout/PageHeader";

import { updateUser } from "@/services/api";

import { COLORS, globalStyles } from "@/styles/globalStyles";
import { useTheme } from "@/contexts/ThemeContext";
import { SettingsSection } from "@/components/settings/SettingsSection";
import { AppSwitch } from "@/components/settings/AppSwitch";
import { AppButton } from "@/components/buttons/AppButton";

export default function SegurancaScreen() {
  const { user, token } = useAuth();
  const { styles } = useTheme();

  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const [biometria, setBiometria] = useState(false);

  const [autenticacao2F, setAutenticacao2F] = useState(false);

  const [lembrarLogin, setLembrarLogin] = useState(true);

  const [loading, setLoading] = useState(false);

  async function handleChangePassword() {
    try {
      if (!user || !token) return;

      if (novaSenha !== confirmarSenha) {
        Alert.alert("Erro", "As senhas não coincidem.");
        return;
      }

      setLoading(true);

      await updateUser(
        user._id,
        {
          nome: user.nome,
          email: user.email,
          CPF: user.CPF,
          CNPJ: user.CNPJ,
          senha: novaSenha,
        },
        token,
      );

      Alert.alert("Sucesso", "Senha alterada.");

      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarSenha("");
    } catch {
      Alert.alert("Erro", "Não foi possível alterar a senha.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView
      style={globalStyles.container}
      showsVerticalScrollIndicator={false}
    >
      <PageHeader
        title="Privacidade e Segurança"
        subtitle="Acesse suas configurações de segurança"
      />

      <SettingsSection title="Alterar Senha">
        <Text style={styles.label}>Senha Atual:</Text>
        <AppInput
          secureTextEntry
          placeholder="Informe a sua Senha Atual"
          placeholderTextColor={COLORS.placeholder}
          value={senhaAtual}
          onChangeText={setSenhaAtual}
        />
        <Text style={styles.label}>Nova Senha:</Text>

        <AppInput
          secureTextEntry
          placeholder="Informe a Nova Senha"
          placeholderTextColor={COLORS.placeholder}
          value={novaSenha}
          onChangeText={setNovaSenha}
        />
        <Text style={styles.label}>Confirmar Senha Atual:</Text>

        <AppInput
          secureTextEntry
          placeholder="Confirme a Nova Senha"
          placeholderTextColor={COLORS.placeholder}
          value={confirmarSenha}
          onChangeText={setConfirmarSenha}
        />

        <AppButton
          title="Alterar Senha"
          loading={loading}
          onPress={handleChangePassword}
        />
      </SettingsSection>

      <SettingsSection title="Proteção">
        <View style={globalStyles.menuCard}>
          <Text style={globalStyles.menuText}>Login com biometria</Text>

          <AppSwitch value={biometria} onValueChange={setBiometria} />
        </View>

        <View style={globalStyles.menuCard}>
          <Text style={globalStyles.menuText}>Autenticação em duas etapas</Text>

          <AppSwitch value={autenticacao2F} onValueChange={setAutenticacao2F} />
        </View>

        <View style={globalStyles.menuCard}>
          <Text style={globalStyles.menuText}>Manter conectado</Text>

          <AppSwitch value={lembrarLogin} onValueChange={setLembrarLogin} />
        </View>
      </SettingsSection>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}
