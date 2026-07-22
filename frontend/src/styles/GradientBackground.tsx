import React from 'react';
import { StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from './globalStyles';

interface GradientBackgroundProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function GradientBackground({ children, style }: GradientBackgroundProps) {
  return (
    <LinearGradient
      // Transição sutil da cor principal até a cor de fundo/destaque
      colors={[COLORS.white, COLORS.titleBackground]}
      
      // Controla a suavidade da transição (começa a transição suave em 40% e fecha em 100%)
      locations={[0.4, 1.0]}
      
      // Diagonal elegante: Começa no canto superior esquerdo e vai até o inferior direito
      start={{ x: 0.1, y: 0.0 }}
      end={{ x: 0.9, y: 1.0 }}
      
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