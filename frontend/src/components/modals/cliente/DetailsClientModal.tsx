import { Modal, View } from "react-native";
import { useState, useEffect } from "react";
import { ClientForm } from "@/components/forms/ClienteForms";
import { Cliente } from "@/components/layout/interface";
import { getClients } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  visible: boolean;
  client: Cliente | null;
  onClose(): void;
}

export function ClientDetailsModal({ visible, client, onClose }: Props) {
  const { token } = useAuth();
  const [clientsList, setClientsList] = useState<Cliente[]>([]);

  useEffect(() => {
    if (visible && token) getClients(token).then(setClientsList);
  }, [visible, token]);

  if (!client) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
    >
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)" }}>
        <ClientForm mode="details" initialData={client} onClose={onClose} />
      </View>
    </Modal>
  );
}
