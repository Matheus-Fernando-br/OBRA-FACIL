import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";
import { Avatar } from "@/components/ui/Avatar";
import { PressableScale } from "@/components/ui/PressableScale";

interface Props {
  nome: string;
  email: string;
  imagem?: any;
  onPress: () => void;
}

export function ProfileCard({ nome, email, onPress }: Props) {
  const { styles, theme } = useTheme();

  return (
    <PressableScale
      style={styles.profileCard}
      onPress={onPress}
      activeScale={0.985}
      accessibilityLabel="Editar perfil"
    >
      <Avatar name={nome} size={60} />

      <View style={{ flex: 1, marginLeft: 14 }}>
        <Text style={styles.profileName} numberOfLines={1}>
          {nome || "Usuário"}
        </Text>
        <Text style={styles.profileEmail} numberOfLines={1}>
          {email}
        </Text>
        <Text style={[styles.caption, { color: theme.primary, marginTop: 6 }]}>
          Editar perfil
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={18} color={theme.placeholder} />
    </PressableScale>
  );
}
