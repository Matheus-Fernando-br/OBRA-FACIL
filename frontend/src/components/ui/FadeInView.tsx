import { ReactNode } from "react";
import { StyleProp, ViewStyle } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

interface Props {
  children: ReactNode;
  /** Posição na lista — escalona a entrada (limitado para não atrasar). */
  index?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Entrada suave (fade + leve subida) para cards e seções.
 * Respeita a preferência "Reduzir movimento" do sistema.
 */
export function FadeInView({ children, index = 0, style }: Props) {
  return (
    <Animated.View
      style={style}
      entering={FadeInDown.duration(360)
        .delay(Math.min(index, 8) * 45)
        .springify()
        .damping(22)
        .stiffness(180)}
    >
      {children}
    </Animated.View>
  );
}
