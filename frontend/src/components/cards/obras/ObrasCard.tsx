import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { COLORS, globalStyles } from "@/styles/globalStyles";

interface Props {
  title: string;
  status: string;
  progress: number;

  EndDate?: string;
  startDate?: string;

  client: string;

  onDetails(): void;
  onEdit(): void;
  onDelete(): void;
}

export function ObrasCard({
  title,
  status,
  progress,
  EndDate,
  startDate,
  client,
  onDetails,
  onEdit,
  onDelete,
}: Props) {
  const [menuVisible, setMenuVisible] = useState(false);

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

  return (
    <>
      <View style={globalStyles.obrasCard}>
        {/* ==========================
            IMAGEM DE FUNDO
        ========================== 

        <Image
          source={require("../../../assets/images/house.jpg")}
          style={globalStyles.obrasCardBackground}
        />

        */}

        {/* Overlay branco */}
        <View style={globalStyles.obrasCardOverlay} />

        {/* ==========================
            CONTEÚDO
        ========================== */}

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

            <Pressable
              style={globalStyles.menuButton}
              onPress={() => setMenuVisible(true)}
            >
              <Ionicons name="ellipsis-vertical" size={22} color={COLORS.placeholder} />
            </Pressable>
          </View>

          {/* CLIENTE */}

          <Text style={globalStyles.orcamentoInfo}>Cliente: {client}</Text>

          {/* DATAS */}

          {startDate && (
            <Text style={globalStyles.orcamentoInfo}>Início: {startDate}</Text>
          )}

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

          {/* BOTÃO PRINCIPAL */}

          <Pressable style={globalStyles.obraMainButton} onPress={onDetails}>
            <Ionicons name="eye" size={20} color={COLORS.white} />

            <Text style={globalStyles.orcamentoDetailsButtonText}>
              Ver detalhes
            </Text>
          </Pressable>
        </View>
      </View>

      {/* =======================================================
          MENU
      ======================================================== */}

      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={globalStyles.menuOverlay}>
            <TouchableWithoutFeedback>
              <View style={globalStyles.menuContainer}>
                {/* FECHAR */}

                <Pressable
                  style={globalStyles.closeButton}
                  onPress={() => setMenuVisible(false)}
                >
                  <Ionicons name="close" size={22} color={COLORS.danger} />
                </Pressable>

                {/* EDITAR */}

                <Pressable
                  style={globalStyles.menuItem}
                  onPress={() => {
                    setMenuVisible(false);
                    onEdit();
                  }}
                >
                  <Ionicons
                    name="create-outline"
                    size={20}
                    color={COLORS.primary}
                  />

                  <Text style={globalStyles.obrasMenuText}>Editar</Text>
                </Pressable>

                {/* EXCLUIR */}

                <Pressable
                  style={globalStyles.menuItem}
                  onPress={() => {
                    setMenuVisible(false);
                    onDelete();
                  }}
                >
                  <Ionicons
                    name="trash-outline"
                    size={20}
                    color={COLORS.danger}
                  />

                  <Text style={globalStyles.obrasMenuText}>Excluir</Text>
                </Pressable>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}
