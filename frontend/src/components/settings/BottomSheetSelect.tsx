import { Modal, Pressable, ScrollView, Text, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";

interface Props {
  visible: boolean;

  title: string;

  options: string[];

  value: string;

  onSelect: (value: string) => void;

  onClose: () => void;
}

export function BottomSheetSelect({
  visible,
  title,
  options,
  value,
  onSelect,
  onClose,
}: Props) {
  const { styles, theme } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable
        style={{
          flex: 1,
          justifyContent: "flex-end",
          backgroundColor: "rgba(0,0,0,.55)",
        }}
        onPress={onClose}
      >
        <Pressable onPress={(e) => e.stopPropagation()}>
          <View style={styles.addCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.addTitle}>{title}</Text>

              <Pressable onPress={onClose}>
                <Ionicons name="close" size={28} color={theme.white} />
              </Pressable>
            </View>

            <View style={styles.divider} />

            <ScrollView>
              {options.map((item) => (
                <Pressable
                  key={item}
                  style={{
                    paddingVertical: 18,

                    borderBottomWidth: 1,

                    borderColor: theme.border,
                  }}
                  onPress={() => {
                    onSelect(item);

                    onClose();
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,

                      fontWeight: item === value ? "700" : "500",

                      color: item === value ? theme.primary : theme.text,
                    }}
                  >
                    {item}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
