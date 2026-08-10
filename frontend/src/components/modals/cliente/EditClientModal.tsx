
import { Modal, View } from "react-native";

import { ClientForm } from "@/components/forms/ClienteForms";
import { Cliente } from "@/components/layout/interface";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  client: Cliente | null;
}

export function EditClientModal({
  visible,
  onClose,
  onSuccess,
  client,
}: Props) {
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
      <View style={{ flex: 1 }}>
        <ClientForm
          mode="edit"
          initialData={client}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      </View>
    </Modal>
  );
}
