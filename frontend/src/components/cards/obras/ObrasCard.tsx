import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";
import { COLORS } from "@/styles/globalStyles";

interface Props {
  title: string;
  status: string;
  progress: number;
  EndDate?: string;
  startDate?: string;
  client: string;
  arquivado?: boolean;
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
  loadingArchive,
  onDetails,
  onEdit,
  onDelete,
  onArchive,
}: Props) {
  const { styles, theme } = useTheme();

  function getStatusColor() {
    switch (status.toUpperCase()) {
      case "ADIANTADO":
        return theme.success;

      case "ATRASADO":
        return theme.danger;

      case "ENTREGUE":
        return theme.primary;

      case "CANCELADO":
        return theme.warning;

      default:
        return theme.warning;
    }
  }

  const isLocked =
    arquivado ||
    status.toUpperCase() === "ENTREGUE" ||
    status.toUpperCase() === "CANCELADO";

  const canArchive =
    status.toUpperCase() === "ENTREGUE" || status.toUpperCase() === "CANCELADO";

  return (
    <View style={styles.obrasCard}>
      {/* OVERLAY */}

      <View style={styles.obrasCardOverlay} />

      {/* CONTEÚDO */}

      <View style={styles.obrasCardContent}>
        {/* HEADER */}

        <View style={styles.obrasCardHeader}>
          <View style={{ flex: 1 }}>
            <Text numberOfLines={1} style={styles.orcamentoCliente}>
              {title}
            </Text>
          </View>

          {/* STATUS */}

          <View style={{ alignItems: "flex-end", gap: 5 }}>
            {/* STATUS ATUAL */}
            <View
              style={[
                styles.orcamentoStatusBadge,
                {
                  backgroundColor: `${getStatusColor()}20`,
                },
              ]}
            >
              <Text
                style={[
                  styles.orcamentoStatusText,
                  {
                    color: getStatusColor(),
                  },
                ]}
              >
                {status}
              </Text>
            </View>

            {/* ARQUIVADO */}
            {arquivado && (
              <View
                style={[
                  styles.orcamentoStatusBadge,
                  {
                    backgroundColor: `${theme.textSecondary}20`,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.orcamentoStatusText,
                    {
                      color: theme.textSecondary,
                    },
                  ]}
                >
                  Arquivado
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* CLIENTE */}

        <Text style={styles.orcamentoInfo}>Cliente: {client}</Text>

        {/* DATA INÍCIO */}

        {startDate && (
          <Text style={styles.orcamentoInfo}>Início: {startDate}</Text>
        )}

        {/* DATA FINAL */}

        {EndDate && (
          <Text style={styles.orcamentoInfo}>
            Previsão de término: {EndDate}
          </Text>
        )}

        {/* PROGRESSO */}

        <View style={styles.progressContainer}>
          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${progress}%`,
                },
              ]}
            />
          </View>

          <Text style={styles.workCardProgress}>{progress}%</Text>
        </View>

        {/* BOTÕES */}

        <View style={styles.orcamentoButtons}>
          {/* DETALHES */}

          <Pressable
            style={[styles.orcamentoDetailsButton, styles.orcamentoMainButton]}
            onPress={onDetails}
          >
            <Ionicons name="eye" size={18} color={COLORS.white} />

            <Text style={styles.orcamentoDetailsButtonText}>Ver detalhes</Text>
          </Pressable>

          {/* EDITAR */}

          {!isLocked && (
            <>
              <Pressable
                style={[
                  styles.orcamentoDetailsButton,
                  styles.orcamentoEditButton,
                ]}
                onPress={onEdit}
              >
                <Ionicons name="create" size={18} color={COLORS.white} />
                <Text style={styles.orcamentoTextButton}>Editar</Text>
              </Pressable>

              {/* EXCLUIR */}

              <Pressable
                style={[
                  styles.orcamentoDetailsButton,
                  styles.orcamentoDeleteButton,
                ]}
                onPress={onDelete}
              >
                <Ionicons name="trash" size={18} color={COLORS.white} />
                <Text style={styles.orcamentoTextButton}>Excluir</Text>
              </Pressable>
            </>
          )}

          {/* ARQUIVAR / DESARQUIVAR */}
          {canArchive && (
            <Pressable
              style={[
                styles.orcamentoDetailsButton,
                {
                  backgroundColor: arquivado ? theme.success : theme.title,
                  paddingHorizontal: 10,
                  opacity: loadingArchive ? 0.7 : 1,
                },
              ]}
              onPress={onArchive}
              disabled={loadingArchive}
            >
              {loadingArchive ? (
                <ActivityIndicator size="small" color={theme.white} />
              ) : (
                <>
                  <Ionicons
                    name={arquivado ? "archive" : "archive-outline"}
                    size={18}
                    color={COLORS.white}
                  />

                  <Text style={styles.orcamentoTextButton}>
                    {arquivado ? "Desarquivar" : "Arquivar"}
                  </Text>
                </>
              )}
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}
