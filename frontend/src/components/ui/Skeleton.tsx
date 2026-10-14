import { useEffect } from "react";
import { DimensionValue, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useTheme } from "@/contexts/ThemeContext";

interface BlockProps {
  width?: DimensionValue;
  height?: number;
  radius?: number;
}

export function SkeletonBlock({ width = "100%", height = 14, radius = 8 }: BlockProps) {
  const { theme } = useTheme();
  const pulse = useSharedValue(0.55);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 850 }), -1, true);
  }, [pulse]);

  const style = useAnimatedStyle(() => ({ opacity: pulse.value }));

  return (
    <Animated.View
      style={[
        { width, height, borderRadius: radius, backgroundColor: theme.surfaceMuted },
        style,
      ]}
    />
  );
}

/** Placeholder de lista enquanto os dados carregam. */
export function ListSkeleton({ count = 3 }: { count?: number }) {
  const { styles } = useTheme();

  return (
    <View accessibilityLabel="Carregando">
      {Array.from({ length: count }, (_, i) => (
        <View key={i} style={styles.listCard}>
          <SkeletonBlock width="55%" height={16} />
          <View style={{ height: 10 }} />
          <SkeletonBlock width="35%" height={12} />
          <View style={{ height: 18 }} />
          <SkeletonBlock width="80%" height={12} />
        </View>
      ))}
    </View>
  );
}
