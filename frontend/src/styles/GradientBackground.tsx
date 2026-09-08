import React from "react";
import { StyleSheet, ViewStyle, StyleProp } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/contexts/ThemeContext";

interface GradientBackgroundProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function GradientBackground({
  children,
  style,
}: GradientBackgroundProps) {
  const { theme } = useTheme();

  return (
    <LinearGradient
      colors={[theme.gradientStart, theme.gradientEnd]}
      locations={[0.4, 1.0]}
      start={{ x: 0, y: 0.0 }}
      end={{ x: 0, y: 1.0 }}
      style={[styles.defaultStyle, style]}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  defaultStyle: {
    flex: 1,
  },
});
