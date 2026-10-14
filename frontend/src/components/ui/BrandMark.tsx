import { Image, Text, View } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";

interface Props {
  /** Altura do símbolo (px). */
  size?: number;
}

/**
 * Marca Obra Fácil adaptável ao tema: o símbolo fica sobre um "tile"
 * claro (como um ícone de app) e o nome usa as cores do tema, para
 * manter legibilidade no modo escuro.
 */
export function BrandMark({ size = 30 }: Props) {
  const { theme } = useTheme();
  // O PNG tem margem transparente: o símbolo ocupa ~40% da imagem.
  const imageSize = size * 2.3;

  return (
    <View
      style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
      accessibilityRole="image"
      accessibilityLabel="Obra Fácil"
    >
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.28,
          backgroundColor: "#FFFFFF",
          overflow: "hidden",
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1,
          borderColor: theme.separator,
        }}
      >
        <Image
          source={require("../../assets/images/icon.png")}
          style={{ width: imageSize, height: imageSize, position: "absolute" }}
        />
      </View>
      <Text style={{ fontSize: size * 0.62, fontWeight: "800", letterSpacing: -0.4, color: theme.text }}>
        Obra
        <Text style={{ color: theme.primary }}>Fácil</Text>
      </Text>
    </View>
  );
}
