import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Checkbox } from "expo-checkbox";
import { AppButton } from "../buttons/AppButton";
import { useTheme } from "@/contexts/ThemeContext";
import { DEFAULT_PLAN_ID, formatPlanPrice, getPlan } from "@/config/plans";

interface Props {
  loading: boolean;
  feedback: string;
  onBack: () => void;
  onContinue: () => void;
}

/**
 * Etapa 3 do cadastro: toda conta começa no plano Gratuito (sem cobrança
 * no cadastro) e o usuário aceita os Termos e a Política de Privacidade.
 */
export function PlanoStep({ loading, feedback, onBack, onContinue }: Props) {
  const { styles, theme } = useTheme();
  const plan = getPlan(DEFAULT_PLAN_ID);
  const [aceite, setAceite] = useState(false);
  const [aviso, setAviso] = useState("");

  function handleContinue() {
    if (!aceite) {
      setAviso("Para criar a conta, aceite os Termos de Uso e a Política de Privacidade.");
      return;
    }
    setAviso("");
    onContinue();
  }

  return (
    <View>
      <Text style={styles.cadastroStepTitle}>Seu plano inicial</Text>
      <Text style={styles.cadastroStepSubtitle}>
        Comece grátis. Quando precisar de mais espaço, mude de plano em Mais → Planos.
      </Text>

      <View style={[styles.card, { borderColor: theme.primary, borderWidth: 1.5 }]}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }}>
          <Text style={styles.title}>{plan.nome}</Text>
          <Text style={[styles.listCardTitle, { color: theme.primary }]}>{formatPlanPrice(plan)}</Text>
        </View>
        <View style={{ marginTop: 10, gap: 8 }}>
          {plan.recursos.map((recurso) => (
            <View key={recurso} style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
              <Ionicons name="checkmark" size={16} color={theme.success} />
              <Text style={styles.menuCardDescription}>{recurso}</Text>
            </View>
          ))}
        </View>
      </View>

      <Pressable
        onPress={() => {
          setAceite((v) => !v);
          if (aviso) setAviso("");
        }}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: aceite }}
        style={{ flexDirection: "row", gap: 12, alignItems: "flex-start", marginTop: 4 }}
      >
        <Checkbox
          value={aceite}
          onValueChange={setAceite}
          color={aceite ? theme.primary : undefined}
          style={styles.checkbox}
        />
        <Text style={[styles.menuCardDescription, { flex: 1, fontSize: 14, lineHeight: 20 }]}>
          Li e aceito os{" "}
          <Text
            style={{ color: theme.primary, fontWeight: "700" }}
            onPress={() => router.push({ pathname: "/legal", params: { doc: "termos" } })}
          >
            Termos de Uso
          </Text>{" "}
          e a{" "}
          <Text
            style={{ color: theme.primary, fontWeight: "700" }}
            onPress={() => router.push({ pathname: "/legal", params: { doc: "privacidade" } })}
          >
            Política de Privacidade
          </Text>
          .
        </Text>
      </Pressable>

      {!!(aviso || feedback) && (
        <Text style={styles.cadastroFeedback}>{aviso || feedback}</Text>
      )}

      <AppButton
        title={loading ? "Criando conta..." : "Criar minha conta"}
        onPress={handleContinue}
        loading={loading}
        color={theme.title}
      />
      <AppButton variant="secondary" title="Voltar" onPress={onBack} />
    </View>
  );
}
