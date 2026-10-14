import { View, ScrollView, Text, ActivityIndicator } from "react-native";
import { useState } from "react";

import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/layout/PageHeader";
import { SettingsSection } from "@/components/settings/SettingsSection";
import { SettingsItem } from "@/components/settings/SettingsItem";
import { AppSwitch } from "@/components/settings/AppSwitch";
import { StatusSegment } from "@/components/ui/StatusSegment";
import { PdfViewerModal } from "@/components/modals/PdfViewerModal";
import { getBudgets, getClients, getWork } from "@/services/api";
import { usePdfOptions } from "@/utils/pdf/preferences";
import { GeneratedPdf, shareCsv } from "@/utils/pdf/output";
import {
  ReportData,
  ReportKind,
  buildReportCsv,
  generateReportPdf,
} from "@/utils/pdf/generateReportPdf";

type Format = "pdf" | "csv";

const REPORTS: {
  kind: ReportKind;
  title: string;
  description: string;
  icon: "analytics" | "people" | "document-text" | "construct";
}[] = [
  {
    kind: "geral",
    title: "Relatório geral",
    description: "Indicadores, obras, orçamentos e clientes (PDF)",
    icon: "analytics",
  },
  { kind: "clientes", title: "Clientes", description: "Contatos e quantidade de orçamentos", icon: "people" },
  { kind: "orcamentos", title: "Orçamentos", description: "Status, emissão e valores", icon: "document-text" },
  { kind: "obras", title: "Obras", description: "Andamento, prazos e status", icon: "construct" },
];

export default function RelatoriosScreen() {
  const { styles, theme } = useTheme();
  const { token, user } = useAuth();
  const { options, update } = usePdfOptions();

  const [format, setFormat] = useState<Format>("pdf");
  const [running, setRunning] = useState<ReportKind | null>(null);
  const [feedback, setFeedback] = useState("");
  const [pdf, setPdf] = useState<GeneratedPdf | null>(null);
  const [pdfTitle, setPdfTitle] = useState("");

  async function loadData(): Promise<ReportData> {
    if (!token) throw new Error("Sessão expirada. Entre novamente.");
    const [clients, budgets, works] = await Promise.all([
      getClients(token),
      getBudgets(token),
      getWork(token),
    ]);
    return {
      clients: Array.isArray(clients) ? clients : [],
      budgets: Array.isArray(budgets) ? budgets : [],
      works: Array.isArray(works) ? works : (works?.obras ?? []),
    };
  }

  async function handleGenerate(kind: ReportKind, title: string) {
    if (running) return;
    setFeedback("");
    setRunning(kind);

    try {
      const data = await loadData();
      const asCsv = format === "csv" && kind !== "geral";

      if (asCsv) {
        await shareCsv(buildReportCsv(kind, data, options), `Obra-Facil ${title}`);
        setFeedback(`Planilha de ${title.toLowerCase()} exportada.`);
      } else {
        const generated = await generateReportPdf(kind, data, user ?? undefined, options);
        setPdfTitle(title);
        setPdf(generated);
      }
    } catch (error: any) {
      console.log("ERRO AO GERAR RELATÓRIO:", error);
      setFeedback(error?.message || "Não foi possível gerar o relatório.");
    } finally {
      setRunning(null);
    }
  }

  return (
    <View style={styles.screen}>
      <PageHeader title="Relatórios" subtitle="Documentos prontos para enviar ao cliente" />

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        <Text style={styles.subtitle}>Formato das listas</Text>
        <StatusSegment
          value={format}
          onChange={setFormat}
          options={[
            { value: "pdf", label: "PDF" },
            { value: "csv", label: "Planilha (Excel)" },
          ]}
        />

        <SettingsSection
          title="Gerar"
          footer={
            format === "csv"
              ? "Planilhas em CSV abrem no Excel e no Google Planilhas. O relatório geral é sempre em PDF."
              : undefined
          }
        >
          {REPORTS.map((report) => (
            <SettingsItem
              key={report.kind}
              icon={report.icon}
              iconColor={report.kind === "geral" ? theme.primary : theme.info}
              title={report.title}
              description={report.description}
              disabled={running !== null && running !== report.kind}
              onPress={() => handleGenerate(report.kind, report.title)}
              rightComponent={
                running === report.kind ? (
                  <ActivityIndicator size="small" color={theme.primary} />
                ) : undefined
              }
            />
          ))}
        </SettingsSection>

        {feedback ? (
          <Text style={[styles.feedback, { color: feedback.includes("exportada") ? theme.success : theme.danger }]}>
            {feedback}
          </Text>
        ) : null}

        <SettingsSection
          title="Aparência dos documentos"
          footer="Vale para relatórios, orçamentos e relatórios de obra."
        >
          <SettingsItem
            icon="image"
            iconColor={theme.primary}
            title="Mostrar marca Obra Fácil"
            description="Cabeçalho com o nome do app"
            rightComponent={
              <AppSwitch value={options.showLogo} onValueChange={(v) => update({ showLogo: v })} />
            }
          />
          <SettingsItem
            icon="ribbon"
            iconColor={theme.secondary}
            title="Linhas de assinatura"
            description="Responsável técnico e cliente"
            rightComponent={
              <AppSwitch value={options.signature} onValueChange={(v) => update({ signature: v })} />
            }
          />
          <SettingsItem
            icon="cash"
            iconColor={theme.success}
            title="Exibir valores"
            description="Mostrar valores nos relatórios gerais"
            rightComponent={
              <AppSwitch value={options.showValues} onValueChange={(v) => update({ showValues: v })} />
            }
          />
        </SettingsSection>
      </ScrollView>

      <PdfViewerModal
        visible={pdf !== null}
        onClose={() => setPdf(null)}
        pdf={pdf}
        budgetTitle={pdfTitle}
      />
    </View>
  );
}
