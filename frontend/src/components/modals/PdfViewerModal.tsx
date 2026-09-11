import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Sharing from "expo-sharing";
import * as WebBrowser from "expo-web-browser";
import * as FileSystem from "expo-file-system";
import { COLORS } from "@/styles/globalStyles";
import { AppButton } from "@/components/buttons/AppButton";

interface Props {
  visible: boolean;
  onClose(): void;
  pdfUri: string | null;
  budgetTitle: string;
}

export function PdfViewerModal({
  visible,
  onClose,
  pdfUri,
  budgetTitle,
}: Props) {
  const [loading, setLoading] = useState(false);

  async function handleOpen() {
    if (!pdfUri) return;

    setLoading(true);

    try {
      await WebBrowser.openBrowserAsync(pdfUri);
    } finally {
      setLoading(false);
    }
  }

  async function handleShare() {
    if (!pdfUri) return;

    try {
      await Sharing.shareAsync(pdfUri);
    } catch (e) {
      console.log(e);
    }
  }

  async function handleDownload() {
    if (!pdfUri) return;

    if (Platform.OS === "web") {
      window.open(pdfUri, "_blank");
      return;
    }

    const info = await FileSystem.getInfoAsync(pdfUri);

    if (info.exists) {
      await Sharing.shareAsync(pdfUri);
    }
  }

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Orçamento Gerado</Text>

            <Pressable onPress={onClose}>
              <Ionicons name="close-circle" size={32} color={COLORS.primary} />
            </Pressable>
          </View>

          <Ionicons
            name="document-text"
            size={90}
            color={COLORS.primary}
            style={{ alignSelf: "center" }}
          />

          <Text style={styles.success}>PDF gerado com sucesso!</Text>

          <Text style={styles.subtitle}>{budgetTitle}</Text>

          <View style={styles.preview}>
            <Ionicons name="document" size={60} color={COLORS.primary} />

            <Text style={styles.previewText}>
              Seu orçamento já está pronto.
            </Text>

            <Text style={styles.previewSub}>
              Clique em "Abrir PDF" para visualizar.
            </Text>
          </View>

          {loading ? (
            <ActivityIndicator
              size="large"
              color={COLORS.primary}
              style={{ marginVertical: 20 }}
            />
          ) : (
            <>
              <AppButton title="Abrir PDF" onPress={handleOpen} />

              <View style={{ height: 12 }} />

              <AppButton title="Baixar PDF" onPress={handleDownload} />

              <View style={{ height: 12 }} />

              <AppButton title="Compartilhar" onPress={handleShare} />
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.backgroundDestaque,
    justifyContent: "center",
    alignItems: "center",
    padding: 25,
  },

  container: {
    width: "100%",
    maxWidth: 520,
    backgroundColor: COLORS.white,
    borderRadius: 25,
    padding: 25,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
  },

  success: {
    marginTop: 15,
    textAlign: "center",
    fontSize: 19,
    color: COLORS.success,
    fontWeight: "700",
  },

  subtitle: {
    marginTop: 8,
    marginBottom: 20,
    textAlign: "center",
    fontSize: 15,
    color: COLORS.placeholder,
  },

  preview: {
    padding: 25,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    alignItems: "center",
    marginBottom: 25,
  },

  previewText: {
    marginTop: 15,
    fontSize: 18,
    fontWeight: "600",
  },

  previewSub: {
    marginTop: 8,
    color: COLORS.border,
    textAlign: "center",
  },
});
