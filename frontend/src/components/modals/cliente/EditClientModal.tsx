import { Modal, View } from "react-native";
import { ClientForm } from "@/components/forms/ClienteForms";
import { Cliente } from "@/components/layout/interface";
import { updateClient } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

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
  const { token } = useAuth();

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
          onSave={async (data) => {
            if (!token) {
              throw new Error("Sessão expirada. Faça login novamente.");
            }

            if (!client._id) {
              throw new Error("ID do cliente não encontrado.");
            }

            console.log("🔄 ATUALIZANDO CLIENTE");
            console.log("ID:", client._id);
            console.log("Dados:", data);

            await updateClient(
              client._id,
              {
                _id: client._id,
                ...data,
              },
              token,
            );

            console.log("✅ CLIENTE ATUALIZADO COM SUCESSO");
          }}
        />
      </View>
    </Modal>
  );
}
