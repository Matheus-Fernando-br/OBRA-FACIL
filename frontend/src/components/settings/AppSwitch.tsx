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
    false: COLORS.border,
    true: COLORS.success,
  }}
  thumbColor={value && COLORS.primary || COLORS.white}
/>
  );
}