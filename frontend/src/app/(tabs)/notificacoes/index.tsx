import { View, ScrollView } from "react-native";
import { useEffect, useState } from "react";

import { useTheme } from "@/contexts/ThemeContext";
import { PageHeader } from "@/components/layout/PageHeader";
import { SettingsSection } from "@/components/settings/SettingsSection";
import { SettingsItem } from "@/components/settings/SettingsItem";
import { AppSwitch } from "@/components/settings/AppSwitch";
import {
  AlertPreferences,
  DEFAULT_ALERT_PREFS,
  loadAlertPrefs,
  saveAlertPrefs,
} from "@/utils/alerts";

/*
 * Preferências dos alertas do painel (sino). Push e e-mail dependem do
 * backend e aparecem como "Em breve" em vez de chaves sem efeito.
 */
export default function NotificacoesScreen() {
  const { styles, theme } = useTheme();
  const [prefs, setPrefs] = useState<AlertPreferences>(DEFAULT_ALERT_PREFS);

  useEffect(() => {
    loadAlertPrefs().then(setPrefs);
  }, []);

  function update(patch: Partial<AlertPreferences>) {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    saveAlertPrefs(next);
  }

  return (
    <View style={styles.screen}>
      <PageHeader title="Notificações" subtitle="O que aparece no sino do app" />

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        <SettingsSection
          title="Alertas no app"
          footer="Os alertas são calculados a partir dos seus orçamentos e obras sempre que o painel é aberto."
        >
          <SettingsItem
            icon="document-text"
            iconColor={theme.warning}
            title="Orçamentos"
            description="Propostas pendentes vencidas ou a vencer em até 3 dias"
            rightComponent={
              <AppSwitch value={prefs.orcamentos} onValueChange={(v) => update({ orcamentos: v })} />
            }
          />
          <SettingsItem
            icon="construct"
            iconColor={theme.danger}
            title="Obras"
            description="Obras atrasadas e entregas nos próximos 7 dias"
            rightComponent={
              <AppSwitch value={prefs.obras} onValueChange={(v) => update({ obras: v })} />
            }
          />
        </SettingsSection>

        <SettingsSection title="Outros canais">
          <SettingsItem
            icon="phone-portrait"
            iconColor={theme.textSecondary}
            title="Notificações push"
            description="Em breve"
            disabled
          />
          <SettingsItem
            icon="mail"
            iconColor={theme.textSecondary}
            title="Resumo por e-mail"
            description="Em breve"
            disabled
          />
        </SettingsSection>
      </ScrollView>
    </View>
  );
}
