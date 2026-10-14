import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";
import { PressableScale } from "@/components/ui/PressableScale";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StatusPill } from "@/components/ui/StatusPill";
import { getWorkStatusMeta } from "@/utils/status";
import { formatDate } from "@/utils/format";

interface Props {
  title: string;
  client?: string;
  progress: number;
  status: string;
  endDate?: Date | string;
  onPress?: () => void;
}

/** Resumo compacto de uma obra em andamento (dashboard). */
export function WorkCard({ title, client, progress, status, endDate, onPress }: Props) {
  const { styles, theme } = useTheme();
  const meta = getWorkStatusMeta(status, theme);

  return (
    <PressableScale onPress={onPress} disabled={!onPress} style={styles.workCard}>
      <View style={styles.listCardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.workCardTitle} numberOfLines={1}>
            {title}
          </Text>
          {client ? (
            <Text style={styles.workCardInfo} numberOfLines={1}>
              {client}
            </Text>
          ) : null}
        </View>
        <StatusPill meta={meta} />
      </View>

      <View style={{ marginTop: 14 }}>
        <ProgressBar value={progress} color={meta.color} />
      </View>

      {endDate ? (
        <View style={[styles.listCardMeta, { marginTop: 10 }]}>
          <Ionicons name="flag-outline" size={13} color={theme.textSecondary} />
          <Text style={styles.listCardMetaText}>
            Término previsto {formatDate(endDate)}
          </Text>
        </View>
      ) : null}
    </PressableScale>
  );
}
