import { ScrollView, View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { globalStyles } from "../../styles/globalStyles";

const options = [
  "Perfil",
  "Configurações",
  "Financeiro",
  "Relatórios",
  "Equipe",
  "Notificações",
  "Ajuda",
  "Sobre o app",
];

export default function MaisScreen() {
  return (
    <View style={globalStyles.screen}>
      <ScrollView style={globalStyles.maisContainer}>
        <View style={globalStyles.profileCard}>
          <Image
            source={require("../../assets/images/profile.jpg")}
            style={globalStyles.profileImage}
          />
          <Text style={globalStyles.profileName}>Matheus</Text>

          <Text style={globalStyles.profileEmail}>matheus@email.com</Text>
        </View>

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
        >
          <Text style={globalStyles.menuText}>Logout</Text>

          <Ionicons name="exit" size={20} color="#f2edec" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
