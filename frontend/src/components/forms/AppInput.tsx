import { TextInput, TextInputProps } from "react-native";
import { COLORS } from "../../styles/globalStyles";

interface Props extends TextInputProps {}

export function AppInput({ editable = true, style, ...rest }: Props) {
  // Se editable for passado como false, consideramos o campo desabilitado
  const isDisabled = editable === false;

  return (
    <TextInput
      editable={editable}
      placeholderTextColor="#94A3B8"
      style={[
        {
          width: "100%",
          height: 60,
          backgroundColor: COLORS.backgroundSection,
          borderRadius: 8,
          paddingHorizontal: 20,
          marginBottom: 16,
          shadowColor: "#000",
          shadowOpacity: 0.3,
          shadowRadius: 5,
          shadowOffset: {
            width: 0,
            height: 3,
          },
          // APLICA O VISUAL APAGADO CONDICIONALMENTE AQUI:
          opacity: isDisabled ? 0.6 : 1, // 0.5 deixa "apagado", 1 deixa normal
        },
        style, // Permite passar estilos extras na tela, se precisar
      ]}
      {...rest}
    />
  );
}
