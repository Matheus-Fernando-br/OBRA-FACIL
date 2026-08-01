import CurrencyInput from "react-native-currency-input";
import { COLORS } from "@/styles/globalStyles";

interface Props {
  value: number | null;
  onChangeValue: (value: number | null) => void;
  editable?: boolean;
  placeholder?: string;
}

export function AppCurrencyInput({
  value,
  onChangeValue,
  editable = true,
  placeholder,
}: Props) {
  const isDisabled = editable === false;

  return (
    <CurrencyInput
      value={value}
      onChangeValue={onChangeValue}
      editable={editable}
      placeholder={placeholder}
      placeholderTextColor="#94A3B8"
      prefix="R$ "
      delimiter="."
      separator=","
      precision={2}
      keyboardType="numeric"
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
        opacity: isDisabled ? 0.6 : 1, // Mesmo comportamento do AppInput
      }}
    />
  );
}
