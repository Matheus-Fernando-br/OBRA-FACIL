import { Modal, View } from "react-native";

import { createClient } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { ClientForm } from "@/components/forms/ClienteForms";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

/** Cadastro de cliente: a validação e o layout ficam no ClientForm. */
export function AddClientModal({ visible, onClose, onSuccess }: Props) {
  const { token } = useAuth();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={{ flex: 1 }}>
        <ClientForm
          mode="add"
          onClose={onClose}
          onSuccess={onSuccess}
          onSave={async (data) => {
            if (!token) throw new Error("Sessão expirada. Entre novamente.");
            await createClient(data, token);
          }}
        />
      </View>
    </Modal>
  );
}
