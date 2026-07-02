import {
  TextInput,
  TextInputProps,
} from "react-native";

interface Props extends TextInputProps {}

export function AppInput({
  ...rest
}: Props) {
  return (
    <TextInput
      style={{
        width: "100%",
        height: 55,
        backgroundColor: "#FFF",
        borderRadius: 14,
        paddingHorizontal: 30,
        marginBottom: 16,
      }}
      placeholderTextColor="#94A3B8"
      {...rest}
    />
  );
}