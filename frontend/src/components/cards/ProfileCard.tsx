import { View, Text, Image, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";

interface Props {
  nome: string;
  email: string;
  imagem?: any;
  onPress: () => void;
}

export function ProfileCard({ nome, email, imagem, onPress }: Props) {
  const { styles, theme } = useTheme();

  return (
    <Pressable style={styles.profileCard} onPress={onPress}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <View style={{ justifyContent: "center" }}>
          <Ionicons name="person-circle" size={70} color={theme.text} />
        </View>

        <View
          style={{
            flex: 1,
            marginLeft: 15,
          }}
        >
          <Text style={styles.profileName}>{nome}</Text>

          <Text style={styles.profileEmail}>E-mail: {email}</Text>
        </View>

        <Pressable
          onPress={onPress}
          hitSlop={10}
          style={{
            width: 38,
            height: 38,
            borderRadius: 19,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: theme.primary,
          }}
        >
          <Ionicons name="create-outline" size={20} color={theme.white} />
        </Pressable>
      </View>
    </Pressable>
  );
}
