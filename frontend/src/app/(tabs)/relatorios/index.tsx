import { ScrollView } from "react-native";
import { useState } from "react";

import { globalStyles } from "@/styles/globalStyles";

import { PageHeader } from "@/components/layout/PageHeader";
import { SettingsSection } from "@/components/settings/SettingsSection";
import { SettingsItem } from "@/components/settings/SettingsItem";
import { AppSwitch } from "@/components/settings/AppSwitch";
import { SettingsSelect } from "@/components/settings/SettingsSelect";
import { AppButton } from "@/components/buttons/AppButton";

export default function RelatoriosScreen() {

  const [formato, setFormato] = useState("PDF");

  const [assinatura, setAssinatura] =
    useState(true);

  const [logoEmpresa, setLogoEmpresa] =
    useState(true);

  const [incluirValores, setIncluirValores] =
    useState(true);

  return (

    <ScrollView
      style={globalStyles.container}
      showsVerticalScrollIndicator={false}
    >

      <PageHeader
        title="Relatórios"
        subtitle="Exportações e estatísticas"
      />

      <SettingsSection title="Exportação">

        <SettingsItem
          icon="document"
          title="Formato padrão"
          description="Formato utilizado nas exportações"
          rightComponent={
            <SettingsSelect
              title="Formato"
              value={formato}
              options={[
                "PDF",
                "Excel",
                "CSV",
              ]}
              onChange={setFormato}
            />
          }
        />

        <SettingsItem
          icon="ribbon"
          title="Inserir assinatura"
          description="Adicionar assinatura ao relatório"
          rightComponent={
            <AppSwitch
              value={assinatura}
              onValueChange={setAssinatura}
            />
          }
        />

        <SettingsItem
          icon="image"
          title="Mostrar logotipo"
          description="Inserir logo da empresa"
          rightComponent={
            <AppSwitch
              value={logoEmpresa}
              onValueChange={setLogoEmpresa}
            />
          }
        />

        <SettingsItem
          icon="cash"
          title="Exibir valores"
          description="Mostrar custos nos relatórios"
          rightComponent={
            <AppSwitch
              value={incluirValores}
              onValueChange={setIncluirValores}
            />
          }
        />

      </SettingsSection>

      <SettingsSection title="Gerar">

        <AppButton
          title="Gerar Relatório Geral"
          onPress={() => {}}
        />

        <AppButton
          title="Exportar Clientes"
          onPress={() => {}}
        />

        <AppButton
          title="Exportar Obras"
          onPress={() => {}}
        />

        <AppButton
          title="Exportar Orçamentos"
          onPress={() => {}}
        />

      </SettingsSection>

    </ScrollView>

  );

}