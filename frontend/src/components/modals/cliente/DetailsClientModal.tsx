import { Modal, View } from "react-native";
import { ClientForm } from "@/components/forms/ClienteForms";
import { Cliente } from "@/components/layout/interface";

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
          backgroundColor: "rgba(0,0,0,0.6)",
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
