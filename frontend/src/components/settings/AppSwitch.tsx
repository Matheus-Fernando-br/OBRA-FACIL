import { Switch } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";

interface Props {
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export function AppSwitch({ value, onValueChange }: Props) {
  const { theme } = useTheme();

  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{
        false: theme.border,
        true: theme.success,
      }}
      thumbColor={(value && theme.primary) || theme.white}
    />
  );
}
