import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { getBudgets, getClients, getWork } from "@/services/api";
import { requestPlanChange } from "@/services/subscription";
import { PageHeader } from "@/components/layout/PageHeader";
import { SettingsSection } from "@/components/settings/SettingsSection";
import { SettingsItem } from "@/components/settings/SettingsItem";
import { AppButton } from "@/components/buttons/AppButton";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { FadeInView } from "@/components/ui/FadeInView";
import { withAlpha } from "@/styles/globalStyles";
import {
  countForLimit,
  formatPlanPrice,
  LIMIT_LABELS,
  LimitKey,
  PLANS,
  PlanDefinition,
} from "@/config/plans";
import { openSupportEmail, openWhatsApp, SUPPORT } from "@/config/support";

/*
 * Planos: limites e preços vêm de config/plans.ts.
 * A compra é feita em services/subscription.ts (TODO(pagamento)).
 */

const LIMIT_KEYS: LimitKey[] = ["clientes", "orcamentos", "obras"];

export default function PlanosScreen() {
  const { styles, theme } = useTheme();
  const { token } = useAuth();
  const { plan: currentPlan } = useSubscription();

  const [usage, setUsage] = useState<Record<LimitKey, number> | null>(null);
  const [pendingPlan, setPendingPlan] = useState<PlanDefinition | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) return;
    Promise.all([getClients(token), getBudgets(token), getWork(token)])
      .then(([clients, budgets, works]) =>
        setUsage({
          clientes: countForLimit("clientes", Array.isArray(clients) ? clients : []),
          orcamentos: countForLimit("orcamentos", Array.isArray(budgets) ? budgets : []),
          obras: countForLimit(
            "obras",
            Array.isArray(works) ? works : (works?.obras ?? []),
          ),
        }),
      )
      .catch((error) => console.log("ERRO AO CARREGAR USO DO PLANO:", error));
  }, [token]);

  async function handleSelect(plan: PlanDefinition) {
    if (!token || plan.id === currentPlan.id) return;
    setMessage("");
    try {
      await requestPlanChange(plan.id, token);
    } catch (error: any) {
      setPendingPlan(plan);
      setMessage(error?.message ?? "Não foi possível mudar de plano agora.");
    }
  }

  return (
    <View style={styles.screen}>
      <PageHeader title="Planos" subtitle="Escolha o espaço ideal para o seu trabalho" />

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        {/* PLANO ATUAL + USO */}
        <FadeInView>
          <View style={styles.card}>
            <Text style={styles.subtitle}>Seu plano</Text>
            <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8 }}>
              <Text style={styles.pageHeaderTitle}>{currentPlan.nome}</Text>
              <Text style={styles.caption}>{formatPlanPrice(currentPlan)}</Text>
            </View>

            {LIMIT_KEYS.map((key) => {
              const limit = currentPlan.limites[key];
              const used = usage?.[key] ?? 0;
              const pct = limit ? (used / limit) * 100 : 0;
              const color = pct >= 100 ? theme.danger : pct >= 80 ? theme.warning : theme.primary;
              return (
                <View key={key} style={{ marginTop: 16 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={styles.menuText}>
                      {LIMIT_LABELS[key].plural.charAt(0).toUpperCase() +
                        LIMIT_LABELS[key].plural.slice(1)}
                    </Text>
                    <Text style={[styles.caption, { fontVariant: ["tabular-nums"] }]}>
                      {usage ? used : "…"} / {limit ?? "ilimitado"}
                    </Text>
                  </View>
                  {limit !== null && (
                    <View style={{ marginTop: 8 }}>
                      <ProgressBar value={pct} color={color} showLabel={false} />
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </FadeInView>

        {/* AVISO DE ASSINATURA EM BREVE */}
        {pendingPlan && (
          <FadeInView>
            <View
              style={[
                styles.card,
                { borderColor: theme.primary, backgroundColor: withAlpha(theme.primary, 0.06) },
              ]}
            >
              <Text style={styles.listCardTitle}>Quer o plano {pendingPlan.nome}?</Text>
              <Text style={[styles.menuCardDescription, { marginTop: 6, lineHeight: 19 }]}>
                {message}
              </Text>
              <AppButton
                title="Falar no WhatsApp"
                icon="logo-whatsapp"
                onPress={() =>
                  openWhatsApp(`Olá! Quero assinar o plano ${pendingPlan.nome} do Obra Fácil.`)
                }
              />
              <AppButton
                title="Enviar e-mail"
                icon="mail-outline"
                variant="tinted"
                onPress={() =>
                  openSupportEmail(`Assinatura do plano ${pendingPlan.nome}`)
                }
              />
            </View>
          </FadeInView>
        )}

        {/* PLANOS */}
        <Text style={styles.subtitle}>Planos disponíveis</Text>
        {PLANS.map((plan, index) => {
          const isCurrent = plan.id === currentPlan.id;
          return (
            <FadeInView key={plan.id} index={index + 1}>
              <View
                style={[
                  styles.card,
                  plan.destaque && { borderColor: theme.primary, borderWidth: 1.5 },
                ]}
              >
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.title}>{plan.nome}</Text>
                    <Text style={[styles.menuCardDescription, { marginTop: 4 }]}>
                      {plan.descricao}
                    </Text>
                  </View>
                  {plan.destaque && !isCurrent && (
                    <View style={[styles.statusPill, { backgroundColor: theme.titleBackground }]}>
                      <Ionicons name="star" size={11} color={theme.primary} />
                      <Text style={[styles.statusPillText, { color: theme.primary }]}>Recomendado</Text>
                    </View>
                  )}
                  {isCurrent && (
                    <View style={[styles.statusPill, { backgroundColor: withAlpha(theme.success, 0.13) }]}>
                      <Ionicons name="checkmark-circle" size={11} color={theme.success} />
                      <Text style={[styles.statusPillText, { color: theme.success }]}>Plano atual</Text>
                    </View>
                  )}
                </View>

                <Text style={[styles.dashboardCardValue, { marginTop: 14 }]}>
                  {formatPlanPrice(plan)}
                </Text>

                <View style={{ marginTop: 10, gap: 8 }}>
                  {plan.recursos.map((recurso) => (
                    <View key={recurso} style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
                      <Ionicons name="checkmark" size={16} color={theme.success} />
                      <Text style={styles.menuCardDescription}>{recurso}</Text>
                    </View>
                  ))}
                </View>

                {!isCurrent && (
                  <AppButton
                    title={plan.precoMensal === 0 ? `Voltar para o ${plan.nome}` : `Assinar ${plan.nome}`}
                    variant={plan.destaque ? "primary" : "tinted"}
                    onPress={() => handleSelect(plan)}
                  />
                )}
              </View>
            </FadeInView>
          );
        })}

        <SettingsSection
          title="Dúvidas"
          footer="As assinaturas serão cobradas pelo Google Play e poderão ser canceladas a qualquer momento na própria loja."
        >
          <SettingsItem
            icon="logo-whatsapp"
            iconColor={theme.success}
            title="WhatsApp do suporte"
            description={SUPPORT.whatsappDisplay}
            onPress={() => openWhatsApp("Olá! Tenho uma dúvida sobre os planos do Obra Fácil.")}
          />
          <SettingsItem
            icon="mail"
            iconColor={theme.info}
            title="E-mail do suporte"
            description={SUPPORT.email}
            onPress={() => openSupportEmail("Dúvida sobre planos")}
          />
        </SettingsSection>
      </ScrollView>
    </View>
  );
}
