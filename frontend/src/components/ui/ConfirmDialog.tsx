import { Modal, Text, View } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { AppButton } from "@/components/buttons/AppButton";

interface Props {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm(): void;
  onCancel(): void;
}

/** Confirmação simples (funciona igual no app e no site; Esc/voltar cancela). */
export function ConfirmDialog({ visible, title, message, confirmLabel, cancelLabel = "Cancelar", onConfirm, onCancel }: Props) {
  const { styles, theme } = useTheme();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={{ flex: 1, backgroundColor: theme.backgroundDestaque, justifyContent: "center", padding: 24 }}>
        <View style={[styles.card, { gap: 10, maxWidth: 440, width: "100%", alignSelf: "center" }]}>
          <Text style={styles.subtitle}>{title}</Text>
          <Text style={styles.label}>{message}</Text>
          <AppButton title={confirmLabel} icon="checkmark" onPress={onConfirm} />
          <AppButton title={cancelLabel} variant="secondary" onPress={onCancel} />
        </View>
      </View>
    </Modal>
  );
}
