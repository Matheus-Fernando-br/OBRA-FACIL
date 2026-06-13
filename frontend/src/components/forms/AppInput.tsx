import { TextInput } from "react-native";

interface Props {
  placeholder: string;

  value: string;

  onChangeText: (text: string) => void;
}

export function AppInput({ placeholder, value, onChangeText }: Props) {
  return (
    <TextInput
      placeholder={placeholder}
      placeholderTextColor="#94A3B8"
      value={value}
      onChangeText={onChangeText}
      style={{
        height: 55,
        backgroundColor: "#FFF",
        borderRadius: 14,
        paddingHorizontal: 16,
        marginBottom: 16,
      }}
    />
  );
}
