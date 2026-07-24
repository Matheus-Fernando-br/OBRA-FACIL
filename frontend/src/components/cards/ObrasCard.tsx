import { View, Text, Image, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { globalStyles } from "../../styles/globalStyles";

interface Props {
  title: string;

  status: string;

  progress: number;

  EndDate?: string;

  client: string;

  startDate?: string;

  onDetails(): void;

  onEdit(): void;

  onDelete(): void;
}

export function ObrasCard({
  title,
  status,
  progress,
  EndDate,
  client,
  startDate,
  onDetails,
  onEdit,
  onDelete,
}: Props) {
  function getStatusColor() {
    switch (status.toUpperCase()) {
      case "ADIANTADO":
        return "#16A34A";

      case "ATRASADO":
        return "#DC2626";

      case "ENTREGUE":
        return "#2563EB";

      case "CANCELADO":
        return "#6B7280";

      default:
        return "#F59E0B";
    }
  }

  return (
    <View style={globalStyles.workCard}>
      <Image
        source={require("../../assets/images/house.jpg")}
        style={globalStyles.workCardImage}
      />

      <View style={globalStyles.workCardBody}>
        <View style={globalStyles.workCardHeader}>
          <Text
            numberOfLines={1}
            style={globalStyles.workCardTitle}
          >
            {title}
          </Text>

          <View
            style={[
              globalStyles.workStatusBadge,
              {
                backgroundColor: `${getStatusColor()}20`,
              },
            ]}
          >
            <Text
              style={[
                globalStyles.workStatusText,
                {
                  color: getStatusColor(),
                },
              ]}
            >
              {status}
            </Text>
          </View>
        </View>

        <Text style={globalStyles.workCardSubtitle}>
          Cliente: {client}
        </Text>
        {startDate && (
          <Text style={globalStyles.workCardDate}>
            Início: {startDate}
          </Text>
        )}
        {EndDate && (
        <Text style={globalStyles.workCardDate}>
          Previsão de Término: {EndDate}
        </Text>
        )}

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

          <Text style={globalStyles.workCardProgress}>
            {progress}%
          </Text>
        </View>


        {/* BOTÕES */}

        <View style={globalStyles.orcamentoButtons}>
          <Pressable
            style={[
              globalStyles.orcamentoDetailsButton,
              globalStyles.orcamentoMainButton,
            ]}
            onPress={onDetails}
          >
            <Ionicons
              name="eye"
              size={18}
              color="#FFF"
            />

            <Text
              style={
                globalStyles.orcamentoDetailsButtonText
              }
            >
              Detalhes
            </Text>
          </Pressable>

          <Pressable
            style={[
              globalStyles.orcamentoDetailsButton,
              globalStyles.orcamentoEditButton,
            ]}
            onPress={onEdit}
          >
            <Ionicons
              name="create"
              size={18}
              color="#FFF"
            />
          </Pressable>

          <Pressable
            style={[
              globalStyles.orcamentoDetailsButton,
              globalStyles.orcamentoDeleteButton,
            ]}
            onPress={onDelete}
          >
            <Ionicons
              name="trash"
              size={18}
              color="#FFF"
            />
          </Pressable>
        </View>
      </View>
    </View>
  );
}