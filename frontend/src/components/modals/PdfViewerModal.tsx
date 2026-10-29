import { useState } from "react";
import { Modal, View, Text, Pressable, Platform, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeIn, ZoomIn } from "react-native-reanimated";
import { useTheme } from "@/contexts/ThemeContext";
import { AppButton } from "@/components/buttons/AppButton";
import { GeneratedPdf, printPdf, sharePdf } from "@/utils/pdf/output";

interface Props {
  visible: boolean;
  onClose(): void;
  pdf: GeneratedPdf | null;
  /** Nome do documento exibido no modal. */
  budgetTitle: string;
}

/**
 * Documento pronto: visualizar/imprimir (o diálogo do sistema também
 * permite "Salvar como PDF") ou compartilhar (WhatsApp, e-mail, Arquivos).
 */
export function PdfViewerModal({ visible, onClose, pdf, budgetTitle }: Props) {
  const { styles, theme } = useTheme();
  const [busy, setBusy] = useState<"print" | "share" | null>(null);
  const [error, setError] = useState("");
  const isWeb = Platform.OS === "web";

  async function run(kind: "print" | "share") {
    if (!pdf) return;
    setError("");
    setBusy(kind);
    try {
      if (kind === "print") await printPdf(pdf);
      else await sharePdf(pdf);
    } catch (e: any) {
      console.log(e);
      setError(e?.message || "Não foi possível concluir a ação.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Animated.View
        entering={FadeIn.duration(180)}
        style={{
          flex: 1,
          backgroundColor: theme.backgroundDestaque,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <Animated.View
          entering={ZoomIn.springify().damping(18)}
          style={[styles.card, { width: "100%", maxWidth: 440, maxHeight: "100%", padding: 0, marginBottom: 0 }]}
        >
          {/* Rolagem: em telas pequenas (ou com teclado/fonte grande) nada fica cortado. */}
          <ScrollView contentContainerStyle={{ padding: 22 }} bounces={false}>
          <Pressable
            onPress={onClose}
            style={[styles.menuCloseButton, { position: "absolute", top: 14, right: 14, zIndex: 2 }]}
            accessibilityLabel="Fechar"
            hitSlop={8}
          >
            <Ionicons name="close" size={18} color={theme.text} />
          </Pressable>

          <View style={{ alignItems: "center", marginTop: 6 }}>
            <View
              style={[
                styles.emptyStateIcon,
                { width: 72, height: 72, borderRadius: 22, marginBottom: 14 },
              ]}
            >
              <Ionicons name="document-text" size={34} color={theme.primary} />
            </View>
            <Text style={styles.title}>Documento pronto</Text>
            <Text style={[styles.emptyStateText, { marginTop: 6 }]} numberOfLines={2}>
              {budgetTitle}
            </Text>
            {pdf?.fileName ? (
              <View style={[styles.actionChip, { marginTop: 12 }]}>
                <Ionicons name="document-outline" size={14} color={theme.textSecondary} />
                <Text style={[styles.caption, { maxWidth: 260 }]} numberOfLines={1}>
                  {pdf.fileName}
                </Text>
              </View>
            ) : null}
          </View>

          <View style={{ marginTop: 18 }}>
            <AppButton
              title={isWeb ? "Abrir para imprimir ou salvar" : "Visualizar e imprimir"}
              icon="print-outline"
              onPress={() => run("print")}
              loading={busy === "print"}
              disabled={!pdf || busy !== null}
            />
            {!isWeb && (
              <AppButton
                title="Compartilhar ou salvar"
                icon="share-outline"
                variant="tinted"
                onPress={() => run("share")}
                loading={busy === "share"}
                disabled={!pdf || busy !== null}
              />
            )}
            <AppButton title="Fechar" variant="ghost" onPress={onClose} />
          </View>

          {error ? <Text style={styles.feedback}>{error}</Text> : null}

          <Text style={[styles.caption, { textAlign: "center", marginTop: 4 }]}>
            {isWeb
              ? "O documento abre em uma nova aba; toque em “Salvar PDF / Imprimir”."
              : "Envie pelo WhatsApp, e-mail ou salve em Arquivos/Drive."}
          </Text>
          </ScrollView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
