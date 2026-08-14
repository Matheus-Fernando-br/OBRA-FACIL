import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { globalStyles, COLORS } from "@/styles/globalStyles";

interface Props {
  client: string;
  nome: string;
  status: string;
  value: number;
  date: string;
  arquivado?: boolean;

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

      <View style={globalStyles.orcamentoHeader}>
        <Text style={globalStyles.orcamentoCliente}>{nome}</Text>

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
            </Pressable>

            <Pressable
              style={[
                globalStyles.orcamentoDetailsButton,
                globalStyles.orcamentoDeleteButton,
              ]}
              onPress={onDelete}
            >
              <Ionicons name="trash" size={18} color={COLORS.white} />
            </Pressable>
          </>
        )}

        {/* ARQUIVAR / DESARQUIVAR */}

        {canArchive && (
          <Pressable
            style={[
              globalStyles.orcamentoDetailsButton,
              {
                backgroundColor: arquivado ? COLORS.success : COLORS.primary,
              },
            ]}
            onPress={onArchive}
          >
            <Ionicons
              name={arquivado ? "archive" : "archive-outline"}
              size={18}
              color={COLORS.white}
            />
          </Pressable>
        )}
      </View>
    </View>
  );
}
