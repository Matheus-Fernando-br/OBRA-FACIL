import { Modal } from "react-native";

import { ObrasForm } from "../../forms/ObrasForms";

import { Cliente, Obra, Orcamento } from "@/components/layout/interface";

interface Props {
  visible: boolean;

  work: Obra | null;

  budget: Orcamento | null;

  clientsList: Cliente[];

  onClose(): void;
}

export function DetailsObraModal({
  visible,
  work,
  budget,
  clientsList,
  onClose,
}: Props) {
  if (!work || !budget) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <ObrasForm
        mode="details"
        budget={budget}
        work={work}
        clientsList={clientsList}
        onClose={onClose}
        onSave={async () => {}}
      />
    </Modal>
  );
}