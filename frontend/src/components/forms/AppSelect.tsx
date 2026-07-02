import { Pressable, Text } from "react-native";

interface Props {
  label: string;
  value: string;
  onPress: () => void;
}

export function AppSelect({ label, value, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        width: "100%",
        height: 55,
        backgroundColor: "#FFF",
        borderRadius: 14,
        paddingHorizontal: 20,

        justifyContent: "center",

        marginBottom: 16,
      }}
    >
      <Text
        style={{
          color: value ? "#000" : "#94A3B8",
        }}
      >
        {value || label}
      </Text>
    </Pressable>
  );
}
