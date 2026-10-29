import { Image, Text, View } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { APP_NAME } from "@/config/brand";

interface Props {
  /** Altura do símbolo (px). */
  size?: number;
}

/** Laranja da logo oficial (o "Fácil" e o capacete). */
const BRAND_ORANGE = "#FD8B06";

/**
 * Logo Obra Fácil: capacete + divisória + nome, como na logo oficial.
 * No tema escuro, a parte escura do símbolo e o "Obra" ficam claros
 * (logo-mark-dark.png), para continuar legível.
 */
export function BrandMark({ size = 30 }: Props) {
  const { theme, isDark } = useTheme();
  const [primeira, ...resto] = APP_NAME.split(" ");

  return (
    <View
      style={{ flexDirection: "row", alignItems: "center", gap: size * 0.3 }}
      accessibilityRole="image"
      accessibilityLabel={APP_NAME}
    >
      <Image
        source={
          isDark
            ? require("../../assets/images/logo-mark-dark.png")
            : require("../../assets/images/logo-mark.png")
        }
        style={{ width: size * 1.15, height: size * 1.15 }}
        resizeMode="contain"
      />
      <View style={{ width: 1, height: size * 0.95, backgroundColor: theme.text, opacity: 0.55 }} />
      <Text style={{ fontSize: size * 0.68, fontWeight: "800", letterSpacing: -0.4, color: theme.text }}>
        {primeira} <Text style={{ color: BRAND_ORANGE }}>{resto.join(" ")}</Text>
      </Text>
    </View>
  );
}
