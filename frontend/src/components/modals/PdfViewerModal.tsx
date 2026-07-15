import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import * as WebBrowser from 'expo-web-browser';
import { globalStyles, COLORS } from '@/styles/globalStyles';
import { AppButton } from '@/components/buttons/AppButton';

export function PdfViewerModal({ visible, onClose, pdfUri, budgetTitle }: { visible: boolean; onClose: () => void; pdfUri: string | null; budgetTitle: string }) {
  const handleShare = async () => { if (pdfUri) await Sharing.shareAsync(pdfUri); };
  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={s.overlay}>
        <View style={s.container}>
          <View style={s.header}><Text style={s.title}>Visualização</Text><Pressable onPress={onClose}><Ionicons name="close" size={28} /></Pressable></View>
          <Text style={s.msg}>PDF gerado com sucesso!</Text>
          <View style={s.content}><Text>{budgetTitle}</Text><AppButton title="Abrir PDF" onPress={() => pdfUri && WebBrowser.openBrowserAsync(pdfUri)} /></View>
          <View style={s.actions}><AppButton title="Compartilhar" onPress={handleShare} /><AppButton title="Fechar" onPress={onClose} /></View>
        </View>
      </View>
    </Modal>
  );
}
const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  container: { width: '85%', backgroundColor: '#fff', borderRadius: 20, padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  title: { fontSize: 20, fontWeight: 'bold' }, msg: { color: COLORS.success, textAlign: 'center', marginBottom: 20 },
  content: { height: 150, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0', borderRadius: 10, marginBottom: 20 },
  actions: { flexDirection: 'row', gap: 10 }, btn: { flex: 1 }
});
