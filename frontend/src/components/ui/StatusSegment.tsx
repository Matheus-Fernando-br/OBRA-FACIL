import { useEffect, useState } from "react";
import { LayoutChangeEvent, Pressable, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useTheme } from "@/contexts/ThemeContext";
import { RADIUS } from "@/styles/globalStyles";

interface Option<T extends string> {
  value: T;
  label: string;
}

interface Props<T extends string> {
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
}

/** Controle segmentado (estilo iOS) com indicador deslizante. */
export function StatusSegment<T extends string>({ value, options, onChange }: Props<T>) {
  const { theme, styles } = useTheme();
  const [width, setWidth] = useState(0);
  const index = Math.max(0, options.findIndex((o) => o.value === value));
  const itemWidth = width ? (width - 6) / options.length : 0;

  const x = useSharedValue(0);

  useEffect(() => {
    x.value = withSpring(index * itemWidth, { damping: 22, stiffness: 260 });
  }, [index, itemWidth, x]);

  const indicator = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  return (
    <View
      onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}
      accessibilityRole="tablist"
      style={{
        flexDirection: "row",
        padding: 3,
        borderRadius: RADIUS.md,
        backgroundColor: theme.surfaceMuted,
        marginBottom: 12,
      }}
    >
      {itemWidth > 0 && (
        <Animated.View
          style={[
            {
              position: "absolute",
              top: 3,
              bottom: 3,
              left: 3,
              width: itemWidth,
              borderRadius: 11,
              backgroundColor: theme.white,
              shadowColor: "#000",
              shadowOpacity: 0.08,
              shadowRadius: 6,
              shadowOffset: { width: 0, height: 2 },
              elevation: 1,
            },
            indicator,
          ]}
        />
      )}

      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            style={{ flex: 1, minHeight: 32, alignItems: "center", justifyContent: "center" }}
          >
            <Text
              style={[
                styles.caption,
                {
                  fontSize: 13,
                  fontWeight: selected ? "700" : "500",
                  color: selected ? theme.text : theme.textSecondary,
                },
              ]}
              numberOfLines={1}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
