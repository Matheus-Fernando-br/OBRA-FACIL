import { useCallback, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";

import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { cancelCurrentSubscription, openCheckout, refreshFromProvider } from "@/services/subscription";
import { PageHeader } from "@/components/layout/PageHeader";
import { SettingsSection } from "@/components/settings/SettingsSection";
import { SettingsItem } from "@/components/settings/SettingsItem";
import { AppButton } from "@/components/buttons/AppButton";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { FadeInView } from "@/components/ui/FadeInView";
import { withAlpha } from "@/styles/globalStyles";
import { formatPlanPrice, LIMIT_LABELS, LimitKey, PlanDefinition } from "@/config/plans";
import { openSupportEmail, openWhatsApp, SUPPORT } from "@/config/support";

/*
 * Planos: preços e limites vêm do servidor (painel administrativo).
 * O botão de assinar só aparece se o servidor liberar o checkout nesta
 * plataforma (no Android começa desligado — regras da Google Play).
 */

const LIMIT_KEYS: LimitKey[] = ["clientes", "orcamentos", "obras", "produtos"];
const fmtDate = (d?: string | null) => (d ? new Date(d).toLocaleDateString("pt-BR") : "");

export default function PlanosScreen() {
  const { styles, theme } = useTheme();
  const { token } = useAuth();
  const sub = useSubscription();
  const currentPlan = sub.plan;

  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Ao voltar do pagamento (ou abrir a tela), consulta o Mercado Pago de novo.
  useFocusEffect(
    useCallback(() => {
      if (!token) return;
      (sub.pendente ? refreshFromProvider(token).catch(() => null) : Promise.resolve()).then(() => sub.refresh());
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]),
  );

  async function onRefresh() {
    if (!token) return;
    setRefreshing(true);
    await refreshFromProvider(token).catch(() => null);
    await sub.refresh();
    setRefreshing(false);
  }

  async function handleSubscribe(plan: PlanDefinition) {
    if (!token) return;
    setMessage(null);
    setBusy(plan.id);
    try {
      await openCheckout(plan.id, token);
      setMessage({
        text: "Conclua o pagamento no Mercado Pago. Quando ele for confirmado, seu plano muda automaticamente — puxe a tela para atualizar.",
      });
    } catch (error: any) {
      setMessage({ text: error?.response?.data?.message ?? error?.message ?? "Não foi possível abrir o pagamento.", error: true });
    } finally {
      setBusy(null);
    }
  }

  async function handleCancel() {
    if (!token) return;
    setBusy("cancelar");
    setMessage(null);
    try {
      await cancelCurrentSubscription(token);
      await sub.refresh();
      setMessage({ text: "Assinatura cancelada. Não haverá novas cobranças." });
    } catch (error: any) {
      setMessage({ text: error?.response?.data?.message ?? "Não foi possível cancelar agora.", error: true });
    } finally {
      setBusy(null);
    }
  }

  const statusLine = (() => {
    if (sub.origem === "cortesia") return sub.acessoAte ? `Cortesia até ${fmtDate(sub.acessoAte)}` : "Plano cortesia";
    if (sub.status === "ativa" && sub.renovaEm) return `Renova em ${fmtDate(sub.renovaEm)}`;
    if (sub.status === "cancelada" && sub.acessoAte) return `Cancelado · acesso até ${fmtDate(sub.acessoAte)}`;
    return null;
  })();

  return (
    <View style={styles.screen}>
      <PageHeader title="Planos" subtitle="Escolha o espaço ideal para o seu trabalho" />

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
      >
        {/* PLANO ATUAL + USO */}
        <FadeInView>
          <View style={styles.card}>
            <Text style={styles.subtitle}>Seu plano</Text>
            <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
              <Text style={styles.pageHeaderTitle}>{currentPlan.nome}</Text>
              <Text style={styles.caption}>{formatPlanPrice(currentPlan)}</Text>
              {sub.loading && <ActivityIndicator size="small" color={theme.primary} />}
            </View>
            {!!statusLine && <Text style={[styles.caption, { marginTop: 4 }]}>{statusLine}</Text>}
            {sub.inadimplente && (
              <Text style={[styles.menuCardDescription, { color: theme.danger, marginTop: 8 }]}>
                Não conseguimos cobrar a última mensalidade. Confira o cartão cadastrado no Mercado Pago.
              </Text>
            )}

            {LIMIT_KEYS.map((key) => {
              const limit = currentPlan.limites[key];
              const used = sub.uso?.[key];
              const pct = limit && used != null ? (used / limit) * 100 : 0;
              const color = pct >= 100 ? theme.danger : pct >= 80 ? theme.warning : theme.primary;
              return (
                <View key={key} style={{ marginTop: 16 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={styles.menuText}>
                      {LIMIT_LABELS[key].plural.charAt(0).toUpperCase() + LIMIT_LABELS[key].plural.slice(1)}
                    </Text>
                    <Text style={[styles.caption, { fontVariant: ["tabular-nums"] }]}>
                      {used ?? "…"} / {limit ?? "ilimitado"}
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

            {sub.status === "ativa" && sub.origem === "assinatura" && (
              <AppButton
                title={busy === "cancelar" ? "Cancelando..." : "Cancelar assinatura"}
                variant="ghost"
                loading={busy === "cancelar"}
                onPress={handleCancel}
              />
            )}
          </View>
        </FadeInView>

        {!!message && (
          <FadeInView>
            <View
              style={[
                styles.card,
                {
                  borderColor: message.error ? theme.danger : theme.primary,
                  backgroundColor: withAlpha(message.error ? theme.danger : theme.primary, 0.06),
                },
              ]}
            >
              <Text style={[styles.menuCardDescription, { lineHeight: 19 }]}>{message.text}</Text>
            </View>
          </FadeInView>
        )}

        {/* PLANOS */}
        <Text style={styles.subtitle}>Planos disponíveis</Text>
        {sub.plans.map((plan, index) => {
          const isCurrent = plan.id === currentPlan.id;
          const canBuy = sub.checkoutEnabled && plan.precoMensal > 0 && !isCurrent && plan.disponivel !== false;
          return (
            <FadeInView key={plan.id} index={index + 1}>
              <View style={[styles.card, plan.destaque && { borderColor: theme.primary, borderWidth: 1.5 }]}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.title}>{plan.nome}</Text>
                    <Text style={[styles.menuCardDescription, { marginTop: 4 }]}>{plan.descricao}</Text>
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

                <Text style={[styles.dashboardCardValue, { marginTop: 14 }]}>{formatPlanPrice(plan)}</Text>

                <View style={{ marginTop: 10, gap: 8 }}>
                  {plan.recursos.map((recurso) => (
                    <View key={recurso} style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
                      <Ionicons name="checkmark" size={16} color={theme.success} />
                      <Text style={styles.menuCardDescription}>{recurso}</Text>
                    </View>
                  ))}
                </View>

                {canBuy && (
                  <AppButton
                    title={busy === plan.id ? "Abrindo pagamento..." : `Assinar ${plan.nome}`}
                    variant={plan.destaque ? "primary" : "tinted"}
                    loading={busy === plan.id}
                    onPress={() => handleSubscribe(plan)}
                  />
                )}
              </View>
            </FadeInView>
          );
        })}

        {!sub.checkoutEnabled && (
          <Text style={[styles.caption, { textAlign: "center", marginBottom: 16 }]}>
            A contratação de planos pagos pelo app estará disponível em breve.
          </Text>
        )}

        <SettingsSection
          title="Dúvidas"
          footer={
            sub.checkoutEnabled
              ? "Pagamento mensal processado pelo Mercado Pago. Cancele quando quiser; o plano continua até o fim do período já pago."
              : undefined
          }
        >
          <SettingsItem
            icon="logo-whatsapp"
            iconColor={theme.success}
            title="WhatsApp do suporte"
            description={SUPPORT.whatsappDisplay}
            onPress={() => openWhatsApp("Olá! Tenho uma dúvida sobre o Obra Fácil.")}
          />
          <SettingsItem
            icon="mail"
            iconColor={theme.info}
            title="E-mail do suporte"
            description={SUPPORT.email}
            onPress={() => openSupportEmail("Dúvida sobre o Obra Fácil")}
          />
        </SettingsSection>
      </ScrollView>
    </View>
  );
}
