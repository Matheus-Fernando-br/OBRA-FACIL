import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { COLORS } from "../../styles/globalStyles";

interface Props {
  step: number;
}

export function StepIndicator({ step }: Props) {
  function iconColor(index: number) {
    return step >= index ? COLORS.success : COLORS.textSecondary;
  }

  function lineColor(index: number) {
    return step > index ? COLORS.success : COLORS.border;
  }

  return (
    <View
      style={{
        flexDirection: "column",
        justifyContent: "center",
        marginTop: 10,
        marginBottom: 35,
      }}
    >
      {/* ÍCONES E LINHAS */}

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        {/* PASSO 1 - DADOS */}

        <View
          style={{
            flex: 1,
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: 55,
              height: 55,
              borderRadius: 30,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: step >= 1 ? COLORS.success : COLORS.card,
            }}
          >
            <Ionicons name="person" size={28} color={COLORS.white} />
          </View>
        </View>

        <View
          style={{
            flex: 1,
            height: 4,
            borderRadius: 20,
            backgroundColor: lineColor(1),
          }}
        />

        {/* PASSO 2 - E-MAIL */}

        <View
          style={{
            flex: 1,
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: 55,
              height: 55,
              borderRadius: 30,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: step >= 2 ? COLORS.success : COLORS.card,
            }}
          >
            <Ionicons name="mail" size={28} color={COLORS.white} />
          </View>
        </View>

        <View
          style={{
            flex: 1,
            height: 4,
            borderRadius: 20,
            backgroundColor: lineColor(2),
          }}
        />

        {/* PASSO 3 - PLANO */}

        <View
          style={{
            flex: 1,
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: 55,
              height: 55,
              borderRadius: 30,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: step >= 3 ? COLORS.success : COLORS.card,
            }}
          >
            <Ionicons name="card" size={28} color={COLORS.white} />
          </View>
        </View>

        <View
          style={{
            flex: 1,
            height: 4,
            borderRadius: 20,
            backgroundColor: lineColor(3),
          }}
        />

        {/* PASSO 4 - FINALIZADO */}

        <View
          style={{
            flex: 1,
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: 55,
              height: 55,
              borderRadius: 30,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: step >= 4 ? COLORS.success : COLORS.card,
            }}
          >
            <Ionicons name="checkmark" size={30} color={COLORS.white} />
          </View>
        </View>
      </View>

      {/* TEXTOS */}

      <View
        style={{
          flexDirection: "row",
          marginTop: 12,
        }}
      >
        {/* DADOS */}

        <View
          style={{
            flex: 1,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: iconColor(1),
              fontWeight: "600",
              fontSize: 12,
            }}
          >
            Dados
          </Text>
        </View>

        {/* E-MAIL */}

        <View
          style={{
            flex: 1,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: iconColor(2),
              fontWeight: "600",
              fontSize: 12,
            }}
          >
            E-mail
          </Text>
        </View>

        {/* PLANO */}

        <View
          style={{
            flex: 1,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: iconColor(3),
              fontWeight: "600",
              fontSize: 12,
            }}
          >
            Plano
          </Text>
        </View>

        {/* FINALIZADO */}

        <View
          style={{
            flex: 1,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: iconColor(4),
              fontWeight: "600",
              fontSize: 12,
            }}
          >
            Finalizado
          </Text>
        </View>
      </View>
    </View>
  );
}
