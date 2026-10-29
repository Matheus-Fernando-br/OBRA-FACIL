import { Modal, View } from "react-native";
import { ObrasForm } from "@/components/forms/ObrasForms";
import { Obra } from "@/components/layout/interface";
import { useWorkPdf } from "./useWorkPdf";

interface Props {
  visible: boolean;
  work: Obra | null;
  onClose(): void;
  onEdit(): void;
}

export function DetailsObraModal({ visible, work, onClose, onEdit }: Props) {
  const { generatePdf, generateEapPdf, viewer } = useWorkPdf(work);

  if (!work) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={{ flex: 1 }}>
        <ObrasForm
          mode="details"
          initialData={work}
          onClose={onClose}
          onEdit={onEdit}
          onGeneratePdf={generatePdf}
          onGenerateEapPdf={generateEapPdf}
        />
        {viewer}
      </View>
    </Modal>
  );
}
