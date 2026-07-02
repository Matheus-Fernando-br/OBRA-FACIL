import { Switch } from "react-native";

import { COLORS } from "@/styles/globalStyles";

interface Props {
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export function AppSwitch({
  value,
  onValueChange,
}: Props) {
  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{
        false: "#374151",
        true: COLORS.primary,
      }}
      thumbColor="#FFFFFF"
    />
  );
}