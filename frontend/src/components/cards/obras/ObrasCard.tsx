import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, globalStyles } from "@/styles/globalStyles";

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
  function getStatusColor() {
    switch (status.toUpperCase()) {
      case "ADIANTADO":
        return COLORS.success;

      case "ATRASADO":
        return COLORS.danger;

      case "ENTREGUE":
        return COLORS.primary;

      case "CANCELADO":
        return COLORS.warning;

      default:
        return COLORS.warning;
    }
  }

  const isLocked =
    arquivado ||
    status.toUpperCase() === "ENTREGUE" ||
    status.toUpperCase() === "CANCELADO";

  const canArchive =
    status.toUpperCase() === "ENTREGUE" || status.toUpperCase() === "CANCELADO";

  return (
    <View style={globalStyles.obrasCard}>
      {/* OVERLAY */}

      <View style={globalStyles.obrasCardOverlay} />

      {/* CONTEÚDO */}

      <View style={globalStyles.obrasCardContent}>
        {/* HEADER */}

        <View style={globalStyles.obrasCardHeader}>
          <View style={{ flex: 1 }}>
            <Text numberOfLines={1} style={globalStyles.orcamentoCliente}>
              {title}
            </Text>
          </View>

          {/* STATUS */}

          <View
            style={[
              globalStyles.orcamentoStatusBadge,
              {
                backgroundColor: `${getStatusColor()}20`,
              },
            ]}
          >
            <Text
              style={[
                globalStyles.orcamentoStatusText,
                {
                  color: getStatusColor(),
                },
              ]}
            >
              {status}
            </Text>
          </View>
        </View>

        {/* CLIENTE */}

        <Text style={globalStyles.orcamentoInfo}>Cliente: {client}</Text>

        {/* DATA INÍCIO */}

        {startDate && (
          <Text style={globalStyles.orcamentoInfo}>Início: {startDate}</Text>
        )}

        {/* DATA FINAL */}

        {EndDate && (
          <Text style={globalStyles.orcamentoInfo}>
            Previsão de término: {EndDate}
          </Text>
        )}

        {/* PROGRESSO */}

        <View style={globalStyles.progressContainer}>
          <View style={globalStyles.progressBarBackground}>
            <View
              style={[
                globalStyles.progressBarFill,
                {
                  width: `${progress}%`,
                },
              ]}
            />
          </View>

          <Text style={globalStyles.workCardProgress}>{progress}%</Text>
        </View>

        {/* BOTÕES */}

        <View style={globalStyles.orcamentoButtons}>
          {/* DETALHES */}

          <Pressable
            style={[
              globalStyles.orcamentoDetailsButton,
              globalStyles.orcamentoMainButton,
            ]}
            onPress={onDetails}
          >
            <Ionicons name="eye" size={18} color={COLORS.white} />

            <Text style={globalStyles.orcamentoDetailsButtonText}>
              Ver detalhes
            </Text>
          </Pressable>

          {/* EDITAR */}

          {!isLocked && (
            <>
              <Pressable
                style={[
                  globalStyles.orcamentoDetailsButton,
                  globalStyles.orcamentoEditButton,
                ]}
                onPress={onEdit}
              >
                <Ionicons name="create" size={18} color={COLORS.white} />
                <Text style={globalStyles.orcamentoTextButton}>Editar</Text>
              </Pressable>

              {/* EXCLUIR */}

              <Pressable
                style={[
                  globalStyles.orcamentoDetailsButton,
                  globalStyles.orcamentoDeleteButton,
                ]}
                onPress={onDelete}
              >
                <Ionicons name="trash" size={18} color={COLORS.white} />
                <Text style={globalStyles.orcamentoTextButton}>Excluir</Text>
              </Pressable>
            </>
          )}

          {/* ARQUIVAR / DESARQUIVAR */}
          {canArchive && (
            <Pressable
              style={[
                globalStyles.orcamentoDetailsButton,
                {
                  backgroundColor: arquivado ? COLORS.success : COLORS.title,
                  paddingHorizontal: 10,
                  opacity: loadingArchive ? 0.7 : 1,
                },
              ]}
              onPress={onArchive}
              disabled={loadingArchive}
            >
              {loadingArchive ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <>
                  <Ionicons
                    name={arquivado ? "archive" : "archive-outline"}
                    size={18}
                    color={COLORS.white}
                  />

                  <Text style={globalStyles.orcamentoTextButton}>
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
