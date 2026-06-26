import { View, Text, Image, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { COLORS, globalStyles } from "../../styles/globalStyles";

interface Props {
  nome: string;
  email: string;
  imagem?: any;
  onPress: () => void;
}

export function ProfileCard({
  nome,
  email,
  imagem,
  onPress,
}: Props) {
  return (
    <Pressable
      style={globalStyles.profileCard}
      onPress={onPress}
    >
        <View
    style={{
        flexDirection: "row",
        alignItems: "center",
    }}
>
      <Image
        source={
          imagem ??
          require("../../assets/images/profile.png")
        }
        style={globalStyles.profileImage}
      />

      <View
        style={{
          flex: 1,
          marginLeft: 15,
        }}
      >
        <Text style={globalStyles.profileName}>
          {nome}
        </Text>

        <Text style={globalStyles.profileEmail}>
          {email}
        </Text>
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
          backgroundColor: COLORS.primary,
        }}
      >
        <Ionicons
          name="create-outline"
          size={20}
          color="#FFF"
        />
      </Pressable>
    </View>
    </Pressable>
  );
}