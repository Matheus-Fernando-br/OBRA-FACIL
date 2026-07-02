import {
  TextInput,
  TextInputProps,
} from "react-native";
import { COLORS } from "../../styles/globalStyles";
interface Props extends TextInputProps {}

export function AppInput({
  ...rest
}: Props) {
  return (
    <TextInput
      style={{
        width: "100%",
        height: 55,
        backgroundColor: COLORS.backgroundSection,
        borderRadius: 14,
        paddingHorizontal: 30,
        marginBottom: 16,
        borderColor: COLORS.textSecondary,
        borderWidth: 1,
      }}
      placeholderTextColor="#94A3B8"
      {...rest}
    />
  );
}