import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";

import legal from "@/content/legal.json";
import { useTheme } from "@/contexts/ThemeContext";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusSegment } from "@/components/ui/StatusSegment";
import { AppButton } from "@/components/buttons/AppButton";
import { LEGAL_URLS, openSupportEmail } from "@/config/support";
import { Linking } from "react-native";

type Doc = "privacidade" | "termos";

/*
 * Política de Privacidade e Termos de Uso (acessível antes do login).
 * O texto fica em src/content/legal.json — o mesmo usado nas páginas
 * públicas (pasta /docs, gerada por scripts/gerar-paginas-legais.js).
 */
export default function LegalScreen() {
  const { styles } = useTheme();
  const params = useLocalSearchParams<{ doc?: Doc }>();
  const [doc, setDoc] = useState<Doc>(params.doc === "termos" ? "termos" : "privacidade");
  const content = legal[doc];

  return (
    <View style={styles.screen}>
      <PageHeader title="Termos e privacidade" subtitle={`Atualizado em ${legal.atualizadoEm}`} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        <StatusSegment<Doc>
          value={doc}
          onChange={setDoc}
          options={[
            { value: "privacidade", label: "Privacidade" },
            { value: "termos", label: "Termos de uso" },
          ]}
        />

        <View style={styles.card}>
          <Text style={styles.title}>{content.titulo}</Text>
          <Text style={[styles.body, { marginTop: 8, lineHeight: 22 }]}>{content.intro}</Text>

          {content.secoes.map((secao) => (
            <View key={secao.titulo} style={{ marginTop: 18 }}>
              <Text style={styles.listCardTitle} accessibilityRole="header">
                {secao.titulo}
              </Text>
              <Text style={[styles.menuCardDescription, { marginTop: 6, fontSize: 14, lineHeight: 21 }]}>
                {secao.texto}
              </Text>
            </View>
          ))}
        </View>

        <AppButton
          title="Abrir versão web"
          icon="globe-outline"
          variant="secondary"
          onPress={() => Linking.openURL(doc === "termos" ? LEGAL_URLS.termos : LEGAL_URLS.privacidade)}
        />
        <AppButton
          title="Falar com o encarregado de dados"
          icon="mail-outline"
          variant="ghost"
          onPress={() => openSupportEmail("Privacidade de dados — Obra Fácil")}
        />
      </ScrollView>
    </View>
  );
}
