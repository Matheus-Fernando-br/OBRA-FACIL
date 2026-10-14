import { View, Text, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";
import { PressableScale } from "@/components/ui/PressableScale";
import { StatusPill } from "@/components/ui/StatusPill";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { getWorkStatusMeta } from "@/utils/status";

interface Props {
  title: string;
  status: string;
  progress: number;
  EndDate?: string;
  startDate?: string;
  client: string;
  arquivado?: boolean;
  /** Obra concluída: bloqueia edição e permite arquivar. */
  finished?: boolean;
  loadingArchive?: boolean;
  onDetails(): void;
  onEdit(): void;
  onDelete(): void;
  onArchive(): void;
}

export function ObrasCard({
  title,
  status,
  progress,
  EndDate,
  startDate,
  client,
  arquivado = false,
  finished,
  loadingArchive,
  onDetails,
  onEdit,
  onDelete,
  onArchive,
}: Props) {
  const { styles, theme } = useTheme();
  const meta = getWorkStatusMeta(status, theme);

  const upper = status.toUpperCase();
  const terminal = finished ?? (upper === "ENTREGUE" || upper === "CANCELADO");
  const isLocked = arquivado || terminal;
  const canArchive = terminal;

  return (
    <PressableScale
      onPress={onDetails}
      activeScale={0.985}
      style={[styles.listCard, arquivado && { opacity: 0.78 }]}
      accessibilityLabel={`Obra ${title}, ${meta.label}, ${Math.round(progress)}% concluída`}
    >
      <View style={styles.listCardHeader}>
        <View style={{ flex: 1 }}>
          <Text numberOfLines={2} style={styles.listCardTitle}>
            {title}
          </Text>
          <View style={[styles.listCardMeta, { marginTop: 4 }]}>
            <Ionicons name="person-outline" size={13} color={theme.textSecondary} />
            <Text style={styles.listCardMetaText} numberOfLines={1}>
              {client}
            </Text>
          </View>
        </View>

        <View style={{ alignItems: "flex-end", gap: 6 }}>
          <StatusPill meta={meta} withIcon />
          {arquivado && (
            <StatusPill
              meta={{ label: "Arquivada", color: theme.textSecondary, icon: "archive" }}
              withIcon
            />
          )}
        </View>
      </View>

      <View style={{ marginTop: 16 }}>
        <ProgressBar value={progress} color={meta.color} />
      </View>

      <View style={styles.listCardMetaRow}>
        {startDate && (
          <View style={styles.listCardMeta}>
            <Ionicons name="play-outline" size={13} color={theme.textSecondary} />
            <Text style={styles.listCardMetaText}>Início {startDate}</Text>
          </View>
        )}
        {EndDate && (
          <View style={styles.listCardMeta}>
            <Ionicons name="flag-outline" size={13} color={theme.textSecondary} />
            <Text style={styles.listCardMetaText}>Término {EndDate}</Text>
          </View>
        )}
      </View>

      <View style={styles.listCardActions}>
        <PressableScale onPress={onDetails} style={styles.actionChip}>
          <Ionicons name="eye-outline" size={15} color={theme.text} />
          <Text style={styles.actionChipText}>Detalhes</Text>
        </PressableScale>

        <View style={{ flex: 1 }} />

        {!isLocked && (
          <>
            <PressableScale
              onPress={onEdit}
              style={styles.actionChip}
              accessibilityLabel="Atualizar andamento"
            >
              <Ionicons name="pencil" size={14} color={theme.text} />
              <Text style={styles.actionChipText}>Atualizar</Text>
            </PressableScale>
            <PressableScale
              onPress={onDelete}
              style={styles.iconButton}
              accessibilityLabel="Excluir obra"
            >
              <Ionicons name="trash-outline" size={16} color={theme.danger} />
            </PressableScale>
          </>
        )}

        {canArchive && (
          <PressableScale
            onPress={onArchive}
            disabled={loadingArchive}
            style={styles.actionChip}
            accessibilityLabel={arquivado ? "Desarquivar" : "Arquivar"}
          >
            {loadingArchive ? (
              <ActivityIndicator size="small" color={theme.text} />
            ) : (
              <>
                <Ionicons
                  name={arquivado ? "arrow-undo-outline" : "archive-outline"}
                  size={15}
                  color={theme.text}
                />
                <Text style={styles.actionChipText}>
                  {arquivado ? "Desarquivar" : "Arquivar"}
                </Text>
              </>
            )}
          </PressableScale>
        )}
      </View>
    </PressableScale>
  );
}
