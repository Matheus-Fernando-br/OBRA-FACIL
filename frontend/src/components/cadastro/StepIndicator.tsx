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
        marginTop: 40,
        marginBottom: 35,
      }}
    >
      {/* Linha Superior */}

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        {/* PASSO 1 */}

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
              backgroundColor:
                step >= 1
                  ? COLORS.success
                  : COLORS.card,
            }}
          >
            <Ionicons
              name="person"
              size={28}
              color="#FFF"
            />
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

        {/* PASSO 2 */}

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
              backgroundColor:
                step >= 2
                  ? COLORS.success
                  : COLORS.card,
            }}
          >
            <Ionicons
              name="card"
              size={28}
              color="#FFF"
            />
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

        {/* PASSO 3 */}

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
              backgroundColor:
                step >= 3
                  ? COLORS.success
                  : COLORS.card,
            }}
          >
            <Ionicons
              name="checkmark"
              size={30}
              color="#FFF"
            />
          </View>
        </View>
      </View>

      {/* Textos */}

      <View
        style={{
          flexDirection: "row",
          marginTop: 12,
        }}
      >
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
            }}
          >
            Dados
          </Text>
        </View>

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
            }}
          >
            Plano
          </Text>
        </View>

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
            }}
          >
            Finalizado
          </Text>
        </View>
      </View>
    </View>
  );
}