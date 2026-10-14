import { Platform, Switch } from "react-native";
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
      trackColor={{ false: theme.borderNull, true: theme.success }}
      thumbColor={Platform.OS === "android" ? "#FFFFFF" : undefined}
      ios_backgroundColor={theme.borderNull}
    />
  );
}
