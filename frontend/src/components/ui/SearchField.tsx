import { Pressable, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

/** Campo de busca no padrão iOS: lupa, texto e botão de limpar. */
export function SearchField({ value, onChangeText, placeholder = "Buscar" }: Props) {
  const { styles, theme } = useTheme();

  return (
    <View style={styles.searchField}>
      <Ionicons name="search" size={17} color={theme.placeholder} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.placeholder}
        selectionColor={theme.primary}
        style={styles.searchInput}
        returnKeyType="search"
        autoCorrect={false}
        accessibilityLabel={placeholder}
      />
      {value.length > 0 && (
        <Pressable
          onPress={() => onChangeText("")}
          hitSlop={10}
          accessibilityLabel="Limpar busca"
        >
          <Ionicons name="close-circle" size={18} color={theme.placeholder} />
        </Pressable>
      )}
    </View>
  );
}
