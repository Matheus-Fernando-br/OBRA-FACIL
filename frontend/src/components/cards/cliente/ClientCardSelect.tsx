import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { phoneMask } from "@/components/forms/mask";
import { globalStyles, COLORS } from "@/styles/globalStyles";

interface Props {
  name: string;
  phone: string;
  abrirModal: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
}

export function ClientCardSelect({
  name,
  phone,
  abrirModal,
  
  icon = "chevron-down",
}: Props) {
  function getInitials(nome: string) {
    const nomes = nome.trim().split(" ");

    if (nomes.length === 1) {
      return nomes[0][0].toUpperCase();
    }

    return (nomes[0][0] + nomes[1][0]).toUpperCase();
  }

  function getAvatarColor(nome: string) {
    const colors = [
      "#DBEAFE",
      "#DCFCE7",
      "#FEF3C7",
      "#FCE7F3",
      "#EDE9FE",
      "#FFE4E6",
      "#E0F2FE",
      "#F3E8FF",
      "#ECFCCB",
      "#FDE68A",
    ];

    let hash = 0;

    for (let i = 0; i < nome.length; i++) {
      hash = nome.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
  }

  const telefone = phoneMask(phone || "");

  return (
    <Pressable style={globalStyles.clientCard} onPress={abrirModal}>
      {/* Avatar */}

      <View
        style={{
          width: 55,
          height: 55,
          borderRadius: 100,
          backgroundColor: getAvatarColor(name),
          justifyContent: "center",
          alignItems: "center",
          marginRight: 15,
        }}
      >
        {name === "Selecionar Cliente" ? (
          <Ionicons name="person-outline" size={28} color={COLORS.primary} />
        ) : (
          <Text
            style={{
              fontSize: 18,
              fontWeight: "700",
              color: COLORS.primary,
            }}
          >
            {getInitials(name)}
          </Text>
        )}
      </View>

      {/* Informações */}

      <View style={{ flex: 1 }}>
        <Text style={globalStyles.clientCardName}>{name}</Text>

        <Text style={globalStyles.clientCardInfo}>{telefone}</Text>
      </View>

         {/* Ação */}

         <View style={globalStyles.clientIcons}>
        <Ionicons
          name={icon}
          size={30}
          color={COLORS.primary}
        />
      </View>
    </Pressable>
  );
}
