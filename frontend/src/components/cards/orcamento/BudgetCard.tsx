import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";
import { COLORS } from "@/styles/globalStyles";
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
  const { styles, theme } = useTheme();

  function getStatusColor() {
    switch (status.toLowerCase()) {
      case "aprovado":
        return theme.success;

      case "recusado":
        return theme.danger;

      default:
        return theme.warning;
    }
  }

  const isLocked =
    arquivado ||
    status.toUpperCase() === "APROVADO" ||
    status.toUpperCase() === "RECUSADO";

  const canArchive =
    status.toUpperCase() === "APROVADO" || status.toUpperCase() === "RECUSADO";

  return (
    <View style={styles.orcamentoCard}>
      {/* HEADER */}

      {/* HEADER */}

      <View style={styles.orcamentoHeader}>
        <Text style={styles.orcamentoCliente}>{nome}</Text>

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

      {/* INFORMAÇÕES */}

      <Text style={styles.orcamentoInfo}>Cliente: {client}</Text>

      <Text style={styles.orcamentoInfo}>Valor: R$ {value.toFixed(2)}</Text>

      <Text style={styles.orcamentoInfo}>Criado em: {date}</Text>

      {/* BOTÕES */}

      <View style={styles.orcamentoButtons}>
        {/* DETALHES */}

        <Pressable
          style={[styles.orcamentoDetailsButton, styles.orcamentoMainButton]}
          onPress={onDetails}
        >
          <Ionicons name="eye" size={18} color={COLORS.white} />

          <Text style={styles.orcamentoDetailsButtonText}>Ver Detalhes</Text>
        </Pressable>

        {/* EDITAR + EXCLUIR */}

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
                paddingHorizontal: 20,
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
                  color={theme.white}
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
  );
}
