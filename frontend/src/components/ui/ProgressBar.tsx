import { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useTheme } from "@/contexts/ThemeContext";

interface Props {
  value: number;
  color?: string;
  showLabel?: boolean;
  height?: number;
}

/** Barra de progresso com preenchimento animado (0–100). */
export function ProgressBar({ value, color, showLabel = true, height = 6 }: Props) {
  const { styles, theme } = useTheme();
  const clamped = Math.min(100, Math.max(0, Math.round(value || 0)));
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(clamped, {
      duration: 700,
      easing: Easing.out(Easing.cubic),
    });
  }, [clamped, progress]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${progress.value}%`,
  }));

  return (
    <View
      style={styles.progressContainer}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: clamped }}
    >
      <View style={[styles.progressBarBackground, { height }]}>
        <Animated.View
          style={[
            styles.progressBarFill,
            { backgroundColor: color ?? theme.primary },
            fillStyle,
          ]}
        />
      </View>
      {showLabel && <Text style={styles.workCardProgress}>{clamped}%</Text>}
    </View>
  );
}
