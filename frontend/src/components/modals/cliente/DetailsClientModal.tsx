import { Modal, View } from "react-native";
import { ClientForm } from "@/components/forms/ClienteForms";
import { Cliente } from "@/components/layout/interface";
import { useTheme } from "@/contexts/ThemeContext";

interface Props {
  visible: boolean;
  client: Cliente | null;
  onClose: () => void;
  onEdit: () => void;
}

export function DetailsClientModal({
  visible,
  client,
  onClose,
  onEdit,
}: Props) {
  const { theme } = useTheme();
  if (!client) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
    >
      <View
        style={{
          flex: 1,
          backgroundColor: theme.backgroundDestaque,
        }}
      >
        <ClientForm
          mode="details"
          initialData={client}
          onClose={onClose}
          onEdit={onEdit}
        />
      </View>
    </Modal>
  );
}
