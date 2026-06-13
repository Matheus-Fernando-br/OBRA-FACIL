import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Pressable,
} from "react-native";

import { useState } from "react";

import { globalStyles } from "../../styles/globalStyles";

import { AppInput } from "../../components/forms/AppInput";

import { obras } from "../../data/obras";

export default function ObrasScreen() {
  const [search, setSearch] = useState("");

  const FilteredObras = obras.filter((obra) =>
    obra.nome.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <View style={globalStyles.screen}>
      <ScrollView
        style={globalStyles.container}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View style={globalStyles.pageHeaderRow}>
          <Text style={globalStyles.title}>Obras</Text>

          <Pressable style={globalStyles.pageHeaderButton}>
            <Text style={globalStyles.pageHeaderButtonText}>+</Text>
          </Pressable>
        </View>

        <AppInput
          placeholder="Buscar Obra..."
          value={search}
          onChangeText={setSearch}
        />

        <View style={globalStyles.filterRow}>
          {["Todos", "Pendentes", "Finalizadas", "Canceladas"].map((item) => (
            <TouchableOpacity key={item} style={globalStyles.filterButton}>
              <Text style={globalStyles.filterButtonText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {obras.map((obra) => (
          <View key={obra.id} style={globalStyles.obraCard}>
            {/* Imagem */}
            <View style={globalStyles.obraImagePlaceholder}>
              <Text style={globalStyles.obraImageText}>Imagem da Obra</Text>
            </View>

            {/* Informações */}
            <Text style={globalStyles.obraNome}>{obra.nome}</Text>

            <Text style={globalStyles.obraInfo}>Status: {obra.status}</Text>

            <Text style={globalStyles.obraInfo}>Empresa: {obra.empresa}</Text>

            <Text style={globalStyles.obraInfo}>Endereço: {obra.endereco}</Text>

            <Text style={globalStyles.obraInfo}>Tipo: {obra.tipo}</Text>

            <Text style={globalStyles.obraInfo}>Área: {obra.metros}m²</Text>

            {/* Barra de progresso */}
            <View style={globalStyles.progressBarBackground}>
              <View
                style={[
                  globalStyles.progressBarFill,
                  {
                    width: `${obra.progresso}%`,
                  },
                ]}
              />
            </View>

            <Text style={globalStyles.obraProgressText}>
              {obra.progresso}% concluído
            </Text>

            <TouchableOpacity style={globalStyles.obraDetailsButton}>
              <Text style={globalStyles.obraDetailsButtonText}>
                Ver detalhes
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <View style={globalStyles.bottomActionContainer}>
        <Pressable style={globalStyles.bottomActionButton}>
          <Text style={globalStyles.bottomActionButtonText}>+ Nova Obra</Text>
        </Pressable>
      </View>
    </View>
  );
}
