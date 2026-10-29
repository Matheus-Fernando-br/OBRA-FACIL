import { Modal, View } from "react-native";

import { createClient } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { ClientForm } from "@/components/forms/ClienteForms";
import { Cliente } from "@/components/layout/interface";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  /** Recebe o cliente criado (ex.: selecioná-lo no orçamento em andamento). */
  onCreated?: (client: Cliente) => void;
}

/** Cadastro de cliente: a validação e o layout ficam no ClientForm. */
export function AddClientModal({ visible, onClose, onSuccess, onCreated }: Props) {
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
            const created = await createClient(data, token);
            if (created?._id) onCreated?.(created);
          }}
        />
      </View>
    </Modal>
  );
}
