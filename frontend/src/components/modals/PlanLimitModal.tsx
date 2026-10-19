import { useCallback, useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Animated, { FadeIn, ZoomIn } from "react-native-reanimated";
import { useTheme } from "@/contexts/ThemeContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { AppButton } from "@/components/buttons/AppButton";
import { isWithinLimit, LIMIT_LABELS, LimitKey } from "@/config/plans";

interface Props {
  limitKey: LimitKey | null;
  onClose(): void;
}

/** Aviso de limite do plano atingido, com atalho para os planos. */
export function PlanLimitModal({ limitKey, onClose }: Props) {
  const { styles, theme } = useTheme();
  const { plan } = useSubscription();

  if (!limitKey) return null;
  const limit = plan.limites[limitKey];
  const label = LIMIT_LABELS[limitKey];

  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <Animated.View
        entering={FadeIn.duration(160)}
        style={{
          flex: 1,
          backgroundColor: theme.backgroundDestaque,
          justifyContent: "center",
          padding: 20,
        }}
      >
        <Animated.View
          entering={ZoomIn.springify().damping(18)}
          style={[styles.card, { padding: 22, marginBottom: 0, alignSelf: "center", width: "100%", maxWidth: 420 }]}
        >
          <Pressable
            onPress={onClose}
            style={[styles.menuCloseButton, { position: "absolute", top: 14, right: 14 }]}
            accessibilityLabel="Fechar"
          >
            <Ionicons name="close" size={18} color={theme.text} />
          </Pressable>

          <View style={[styles.emptyStateIcon, { alignSelf: "center" }]}>
            <Ionicons name="rocket-outline" size={28} color={theme.primary} />
          </View>
          <Text style={[styles.title, { textAlign: "center" }]}>Limite do plano atingido</Text>
          <Text style={[styles.emptyStateText, { marginTop: 8 }]}>
            O plano {plan.nome} permite até {limit} {limit === 1 ? label.singular : label.plural}.
            Arquive itens concluídos ou conheça os planos com mais espaço.
          </Text>

          <View style={{ marginTop: 18 }}>
            <AppButton
              title="Ver planos"
              icon="sparkles-outline"
              onPress={() => {
                onClose();
                router.navigate("/planos");
              }}
            />
            <AppButton title="Agora não" variant="ghost" onPress={onClose} />
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

/**
 * Uso nas telas:
 *   const { guard, limitModal } = usePlanLimit();
 *   guard("clientes", clientsList.length, () => setAddVisible(true));
 *   ...  {limitModal}
 */
export function usePlanLimit() {
  const { plan } = useSubscription();
  const [blocked, setBlocked] = useState<LimitKey | null>(null);

  const guard = useCallback(
    (key: LimitKey, currentCount: number, onAllowed: () => void) => {
      if (isWithinLimit(plan, key, currentCount)) onAllowed();
      else setBlocked(key);
    },
    [plan],
  );

  const limitModal = <PlanLimitModal limitKey={blocked} onClose={() => setBlocked(null)} />;

  return { plan, guard, limitModal };
}
