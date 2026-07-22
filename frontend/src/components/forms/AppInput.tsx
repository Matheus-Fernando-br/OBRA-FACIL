import { TextInput, TextInputProps } from "react-native";
import { COLORS } from "../../styles/globalStyles";
interface Props extends TextInputProps {}

export function AppInput({ ...rest }: Props) {
  return (
    <TextInput
      style={{
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
      }}
      placeholderTextColor="#94A3B8"
      {...rest}
    />
  );
}
