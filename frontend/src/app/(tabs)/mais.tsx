import { ScrollView, View, Text, TouchableOpacity } from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { useAuth } from "@/contexts/AuthContext";

import { globalStyles, COLORS } from "../../styles/globalStyles";
import { OptionsCard } from "../../components/cards/OptionsCard";
import { EditUserModal } from "../../components/modals/EditUserModal";
import { ProfileCard } from "../../components/cards/ProfileCard";

const options = [

  {
    title: "Configurações Gerais",
    icon: "settings",
    route: "/configuracoes",
    description: "Preferências do aplicativo",
  },

  {
    title: "Privacidade e Segurança",
    icon: "shield-checkmark",
    route: "/seguranca",
    description: "Senha e segurança",
  },

  {
    title: "Relatórios",
    icon: "document-text",
    route: "/relatorios",
    description: "Exportações e estatísticas",
  },

  {
    title: "Notificações",
    icon: "notifications",
    route: "/notificacoes",
    description: "Alertas do sistema",
  },

  {
    title: "Ajuda",
    icon: "help-circle",
    route: "/ajuda",
    description: "FAQ e suporte",
  },

  {
    title: "Sobre o app",
    icon: "information-circle",
    route: "/sobre",
    description: "Versão e informações",
  },
];

export default function MaisScreen() {
  const [profileVisible, setProfileVisible] = useState(false);
  const { logout, user } = useAuth();

  async function handleLogout() {
    try {
      await logout();
      router.replace("/");
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <View style={globalStyles.screen}>
      <ScrollView style={globalStyles.maisContainer}>
        <ProfileCard
          nome={user?.nome || ""}
          email={user?.email || ""}
          onPress={() => setProfileVisible(true)}
        />

        {options.map((item) => (
          <OptionsCard
            key={item.title}
            title={item.title}
            description={item.description}
            icon={item.icon as any}
            onPress={() => router.push(item.route as any)}
          />
        ))}
        <TouchableOpacity
          activeOpacity={0.8}
          style={[globalStyles.menuCard, { backgroundColor: COLORS.danger }]}
          onPress={handleLogout}
        >
          <Text style={globalStyles.menuText}>Logout</Text>

          <Ionicons name="exit" size={20} color="#f2edec" />
        </TouchableOpacity>
      </ScrollView>
      <EditUserModal
        visible={profileVisible}
        onClose={() => setProfileVisible(false)}
        user={user}
      />
    </View>
  );
}
