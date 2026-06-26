import { ScrollView, View, Text, TouchableOpacity, Image } from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";
import { logout } from "../../services/api";
import { globalStyles } from "../../styles/globalStyles";
import {EditUserModal} from "../../components/modals/EditUserModal";
import { ProfileCard } from "../../components/cards/ProfileCard";

const options = [
  "Configurações",
  "Financeiro",
  "Relatórios",
  "Equipe",
  "Notificações",
  "Ajuda",
  "Sobre o app",
];

export default function MaisScreen() {

  const { user, setToken } = useAuth();
  const [profileVisible, setProfileVisible] = useState(false);

  async function handleLogout() {
    try {
      await logout();
  
      setToken("");
  
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
          <TouchableOpacity
            key={item}
            activeOpacity={0.8}
            style={globalStyles.menuCard}
          >
            <Text style={globalStyles.menuText}>{item}</Text>

            <Ionicons name="chevron-forward" size={20} color="#64748B" />
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          activeOpacity={0.8}
          style={[globalStyles.menuCard, { backgroundColor: "#841313" }]}
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
