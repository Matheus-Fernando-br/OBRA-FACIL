import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { globalStyles, COLORS } from "@/styles/globalStyles";

interface Props {
  client: string;
  nome: string;
  status: string;
  value: number;
  date: string;
  arquivado?: boolean;
  loadingArchive?: boolean;
  onDetails(): void;
  onEdit(): void;
  onDelete(): void;
  onArchive(): void;
}

export function BudgetCard({
  client,
  nome,
  status,
  value,
  date,
  arquivado = false,
  loadingArchive,
  onDetails,
  onEdit,
  onDelete,
  onArchive,
}: Props) {
  function getStatusColor() {
    switch (status.toLowerCase()) {
      case "aprovado":
        return COLORS.success;

      case "recusado":
        return COLORS.danger;

      default:
        return COLORS.warning;
    }
  }

  const isLocked =
    arquivado ||
    status.toUpperCase() === "APROVADO" ||
    status.toUpperCase() === "RECUSADO";

  const canArchive =
    status.toUpperCase() === "APROVADO" || status.toUpperCase() === "RECUSADO";

  return (
    <View style={globalStyles.orcamentoCard}>
      {/* HEADER */}

      {/* HEADER */}

      <View style={globalStyles.orcamentoHeader}>
        <Text style={globalStyles.orcamentoCliente}>{nome}</Text>

        <View style={{ alignItems: "flex-end", gap: 5 }}>
          {/* STATUS ATUAL */}
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

          {/* ARQUIVADO */}
          {arquivado && (
            <View
              style={[
                globalStyles.orcamentoStatusBadge,
                {
                  backgroundColor: `${COLORS.textSecondary}20`,
                },
              ]}
            >
              <Text
                style={[
                  globalStyles.orcamentoStatusText,
                  {
                    color: COLORS.textSecondary,
                  },
                ]}
              >
                Arquivado
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* INFORMAÇÕES */}

      <Text style={globalStyles.orcamentoInfo}>Cliente: {client}</Text>

      <Text style={globalStyles.orcamentoInfo}>
        Valor: R$ {value.toFixed(2)}
      </Text>

      <Text style={globalStyles.orcamentoInfo}>Criado em: {date}</Text>

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
            Ver Detalhes
          </Text>
        </Pressable>

        {/* EDITAR + EXCLUIR */}

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
                paddingHorizontal: 20,
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
  );
}
