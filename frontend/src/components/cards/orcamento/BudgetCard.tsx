import { View, Text, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";
import { PressableScale } from "@/components/ui/PressableScale";
import { StatusPill } from "@/components/ui/StatusPill";
import { getBudgetStatusMeta } from "@/utils/status";
import { formatCurrency } from "@/utils/format";

interface Props {
  client: string;
  nome: string;
  status: string;
  value: number;
  /** Data de validade já formatada. */
  date: string;
  /** Data de emissão já formatada. */
  issuedAt?: string;
  /** Pendente com validade vencida. */
  expired?: boolean;
  arquivado?: boolean;
  loadingArchive?: boolean;
  onDetails(): void;
  onEdit(): void;
  onDelete(): void;
  onArchive(): void;
  /** Gera o PDF e abre o compartilhamento (WhatsApp, e-mail...). */
  onShare?(): void;
  loadingShare?: boolean;
  /** Aprovar direto pelo card (só aparece em orçamentos pendentes). */
  onApprove?(): void;
  loadingApprove?: boolean;
}

export function BudgetCard({
  client,
  nome,
  status,
  value,
  date,
  issuedAt,
  expired = false,
  arquivado = false,
  loadingArchive,
  onDetails,
  onEdit,
  onDelete,
  onArchive,
  onShare,
  loadingShare,
  onApprove,
  loadingApprove,
}: Props) {
  const { styles, theme } = useTheme();
  const meta = getBudgetStatusMeta(status, theme);

  const upper = status.toUpperCase();
  const isLocked = arquivado || upper === "APROVADO" || upper === "RECUSADO";
  const canArchive = upper === "APROVADO" || upper === "RECUSADO";
  const canApprove = !arquivado && upper === "PENDENTE" && !!onApprove;

  return (
    <PressableScale
      onPress={onDetails}
      activeScale={0.985}
      style={[styles.listCard, arquivado && { opacity: 0.78 }]}
      accessibilityLabel={`Orçamento ${nome}, ${meta.label}, ${formatCurrency(value)}`}
    >
      <View style={styles.listCardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.listCardTitle} numberOfLines={2}>
            {nome}
          </Text>
          <View style={[styles.listCardMeta, { marginTop: 4 }]}>
            <Ionicons name="person-outline" size={13} color={theme.textSecondary} />
            <Text style={styles.listCardMetaText} numberOfLines={1}>
              {client}
            </Text>
          </View>
        </View>

        <View style={{ alignItems: "flex-end", gap: 6 }}>
          <StatusPill meta={meta} />
          {arquivado && (
            <StatusPill
              meta={{ label: "Arquivado", color: theme.textSecondary, icon: "archive" }}
              withIcon
            />
          )}
        </View>
      </View>

      <Text style={styles.listCardValue}>{formatCurrency(value)}</Text>

      <View style={styles.listCardMetaRow}>
        {issuedAt ? (
          <View style={styles.listCardMeta}>
            <Ionicons name="calendar-outline" size={13} color={theme.textSecondary} />
            <Text style={styles.listCardMetaText}>Emitido {issuedAt}</Text>
          </View>
        ) : null}
        <View style={styles.listCardMeta}>
          <Ionicons
            name={expired ? "hourglass" : "hourglass-outline"}
            size={13}
            color={expired ? theme.danger : theme.textSecondary}
          />
          <Text
            style={[
              styles.listCardMetaText,
              expired && { color: theme.danger, fontWeight: "600" },
            ]}
          >
            {expired ? `Vencido em ${date}` : `Válido até ${date}`}
          </Text>
        </View>
      </View>

      <View style={styles.listCardActions}>
        <PressableScale onPress={onDetails} style={styles.actionChip}>
          <Ionicons name="eye-outline" size={15} color={theme.text} />
          <Text style={styles.actionChipText}>Detalhes</Text>
        </PressableScale>

        {onShare && (
          <PressableScale
            onPress={onShare}
            disabled={loadingShare}
            style={styles.actionChip}
            accessibilityLabel={`Compartilhar PDF do orçamento ${nome}`}
          >
            {loadingShare ? (
              <ActivityIndicator size="small" color={theme.text} />
            ) : (
              <Ionicons name="share-social-outline" size={15} color={theme.text} />
            )}
            <Text style={styles.actionChipText}>PDF</Text>
          </PressableScale>
        )}

        {canApprove && (
          <PressableScale
            onPress={onApprove}
            disabled={loadingApprove}
            style={[styles.actionChip, { borderColor: theme.success }]}
            accessibilityLabel={`Aprovar orçamento ${nome}`}
          >
            {loadingApprove ? (
              <ActivityIndicator size="small" color={theme.success} />
            ) : (
              <Ionicons name="checkmark-circle-outline" size={15} color={theme.success} />
            )}
            <Text style={[styles.actionChipText, { color: theme.success }]}>Aprovar</Text>
          </PressableScale>
        )}

        <View style={{ flex: 1 }} />

        {!isLocked && (
          <>
            <PressableScale
              onPress={onEdit}
              style={styles.iconButton}
              accessibilityLabel="Editar orçamento"
            >
              <Ionicons name="pencil" size={16} color={theme.text} />
            </PressableScale>
            <PressableScale
              onPress={onDelete}
              style={styles.iconButton}
              accessibilityLabel="Excluir orçamento"
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
