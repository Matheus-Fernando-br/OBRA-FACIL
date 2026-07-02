import {
  Alert,
  ScrollView,
  View,
  Text,
  TextInput,
  Pressable,
} from "react-native";

import { useState } from "react";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/layout/PageHeader";

import { updateUser } from "@/services/api";

import {
  COLORS,
  globalStyles,
} from "@/styles/globalStyles";

import { SettingsSection } from "@/components/settings/SettingsSection";
import { AppSwitch } from "@/components/settings/AppSwitch";
import { AppButton } from "@/components/buttons/AppButton";

export default function SegurancaScreen() {
  const { user, token } = useAuth();

  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] =
    useState("");

  const [biometria, setBiometria] =
    useState(false);

  const [autenticacao2F, setAutenticacao2F] =
    useState(false);

  const [lembrarLogin, setLembrarLogin] =
    useState(true);

  const [loading, setLoading] = useState(false);

  async function handleChangePassword() {
    try {
      if (!user || !token) return;

      if (novaSenha !== confirmarSenha) {
        Alert.alert(
          "Erro",
          "As senhas não coincidem."
        );
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
        token
      );

      Alert.alert(
        "Sucesso",
        "Senha alterada."
      );

      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarSenha("");
    } catch {
      Alert.alert(
        "Erro",
        "Não foi possível alterar a senha."
      );
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

        <TextInput
          secureTextEntry
          placeholder="Senha Atual"
          placeholderTextColor="#94A3B8"
          value={senhaAtual}
          onChangeText={setSenhaAtual}
          style={{
            width: "100%",
            height: 55,
            backgroundColor: "#FFF",
            borderRadius: 14,
            paddingHorizontal: 30,
            marginBottom: 16,
          }}
        />

        <TextInput
          secureTextEntry
          placeholder="Nova Senha"
          placeholderTextColor="#94A3B8"
          value={novaSenha}
          onChangeText={setNovaSenha}
          style={{
            width: "100%",
            height: 55,
            backgroundColor: "#FFF",
            borderRadius: 14,
            paddingHorizontal: 30,
            marginBottom: 16,
          }}
        />

        <TextInput
          secureTextEntry
          placeholder="Confirmar Nova Senha"
          placeholderTextColor="#94A3B8"
          value={confirmarSenha}
          onChangeText={setConfirmarSenha}
          style={{
            width: "100%",
            height: 55,
            backgroundColor: "#FFF",
            borderRadius: 14,
            paddingHorizontal: 30,
            marginBottom: 16,
          }}
        />

        <AppButton
          title="Alterar Senha"
          loading={loading}
          onPress={handleChangePassword}
        />

      </SettingsSection>

      <SettingsSection title="Proteção">

        <View style={globalStyles.menuCard}>
          <Text style={globalStyles.menuText}>
            Login com biometria
          </Text>

          <AppSwitch
            value={biometria}
            onValueChange={setBiometria}
          />
        </View>

        <View style={globalStyles.menuCard}>
          <Text style={globalStyles.menuText}>
            Autenticação em duas etapas
          </Text>

          <AppSwitch
            value={autenticacao2F}
            onValueChange={setAutenticacao2F}
          />
        </View>

        <View style={globalStyles.menuCard}>
          <Text style={globalStyles.menuText}>
            Manter conectado
          </Text>

          <AppSwitch
            value={lembrarLogin}
            onValueChange={setLembrarLogin}
          />
        </View>

      </SettingsSection>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}