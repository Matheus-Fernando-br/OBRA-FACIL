import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { COLORS } from "@/styles/globalStyles";

/* ============================================================
   TIPOS GERAIS
============================================================ */

export type FilterMode = "clientes" | "orcamentos" | "obras";

export type SortDirection = "asc" | "desc" | null;

export type DatePreset = "all" | "week" | "month" | "year" | "custom";

export type ArchiveFilter = "all" | "active" | "archived";

/* ============================================================
   FILTRO DE DATA
============================================================ */

export interface DateFilter {
  preset: DatePreset;

  /**
   * Usado somente quando preset === "custom".
   * Formato: DD/MM/YYYY
   */
  from: string;

  /**
   * Usado somente quando preset === "custom".
   * Formato: DD/MM/YYYY
   */
  to: string;
}

/* ============================================================
   FILTRO DE VALOR
============================================================ */

export interface RangeFilter {
  min: number;
  max: number;
}

/* ============================================================
   FILTROS DE CLIENTE
============================================================ */

export interface ClientFilters {
  sort: SortDirection;

  personType: "all" | "FISICO" | "JURIDICO";

  budgetQuantity: "all" | "none" | "one" | "two" | "threePlus";
}

/* ============================================================
   FILTROS DE ORÇAMENTO
============================================================ */

export interface BudgetFilters {
  sort: SortDirection;

  status: "all" | "pendente" | "aprovado" | "recusado";

  clientSort: SortDirection;

  publicationDate: DateFilter;

  state: string;

  city: string;

  value: RangeFilter;

  /**
   * Arquivamento é separado do status.
   */
  archived: ArchiveFilter;
}

/* ============================================================
   FILTROS DE OBRA
============================================================ */

export interface WorkFilters {
  sort: SortDirection;

  startDate: DateFilter;

  endDate: DateFilter;

  state: string;

  city: string;

  status:
    | "all"
    | "noprazo"
    | "atrasado"
    | "adiantado"
    | "entregue"
    | "cancelado";

  clientSort: SortDirection;

  value: RangeFilter;

  /**
   * Arquivamento é separado do status.
   */
  archived: ArchiveFilter;
}

/* ============================================================
   PROPS
============================================================ */

interface FilterModalProps {
  visible: boolean;

  mode: FilterMode;

  onClose: () => void;

  onApply: (filters: ClientFilters | BudgetFilters | WorkFilters) => void;

  /**
   * Valores atualmente aplicados na tela.
   * O modal usa esses valores como ponto inicial.
   */
  initialFilters?: ClientFilters | BudgetFilters | WorkFilters;

  /**
   * Lista de estados disponíveis.
   *
   * Exemplo:
   * ["SP", "RJ", "MG"]
   */
  states?: string[];

  /**
   * Lista de cidades disponíveis.
   *
   * Pode ser filtrada posteriormente
   * conforme o estado selecionado.
   */
  cities?: string[];

  /**
   * Valor máximo utilizado pelos sliders.
   *
   * Exemplo:
   * 500000
   */
  maxValue?: number;
}

/* ============================================================
   VALORES PADRÃO
============================================================ */

export const DEFAULT_DATE_FILTER: DateFilter = {
  preset: "all",
  from: "",
  to: "",
};

export const DEFAULT_CLIENT_FILTERS: ClientFilters = {
  sort: null,
  personType: "all",
  budgetQuantity: "all",
};

export const DEFAULT_BUDGET_FILTERS: BudgetFilters = {
  sort: null,

  status: "all",

  clientSort: null,

  publicationDate: {
    ...DEFAULT_DATE_FILTER,
  },

  state: "",

  city: "",

  value: {
    min: 0,
    max: 500000,
  },

  archived: "active",
};

export const DEFAULT_WORK_FILTERS: WorkFilters = {
  sort: null,

  startDate: {
    ...DEFAULT_DATE_FILTER,
  },

  endDate: {
    ...DEFAULT_DATE_FILTER,
  },

  state: "",

  city: "",

  status: "all",

  clientSort: null,

  value: {
    min: 0,
    max: 500000,
  },

  archived: "active",
};

/* ============================================================
   COMPONENTE
============================================================ */

export default function FilterModal({
  visible,
  mode,
  onClose,
  onApply,
  initialFilters,
  states = [],
  cities = [],
  maxValue = 500000,
}: FilterModalProps) {
  /* ==========================================================
     ESTADO TEMPORÁRIO
  ========================================================== */

  const [clientFilters, setClientFilters] = useState<ClientFilters>(
    DEFAULT_CLIENT_FILTERS,
  );

  const [budgetFilters, setBudgetFilters] = useState<BudgetFilters>({
    ...DEFAULT_BUDGET_FILTERS,
    value: {
      min: 0,
      max: maxValue,
    },
  });

  const [workFilters, setWorkFilters] = useState<WorkFilters>({
    ...DEFAULT_WORK_FILTERS,
    value: {
      min: 0,
      max: maxValue,
    },
  });

  /* ==========================================================
     QUANDO O MODAL ABRIR
  ========================================================== */

  useEffect(() => {
    if (!visible) return;

    if (mode === "clientes") {
      setClientFilters(
        initialFilters
          ? {
              ...DEFAULT_CLIENT_FILTERS,
              ...(initialFilters as ClientFilters),
            }
          : DEFAULT_CLIENT_FILTERS,
      );

      return;
    }

    if (mode === "orcamentos") {
      setBudgetFilters(
        initialFilters
          ? {
              ...DEFAULT_BUDGET_FILTERS,
              ...(initialFilters as BudgetFilters),

              publicationDate: {
                ...DEFAULT_BUDGET_FILTERS.publicationDate,
                ...(initialFilters as BudgetFilters).publicationDate,
              },

              value: {
                ...DEFAULT_BUDGET_FILTERS.value,
                ...(initialFilters as BudgetFilters).value,
              },
            }
          : {
              ...DEFAULT_BUDGET_FILTERS,
              value: {
                min: 0,
                max: maxValue,
              },
            },
      );

      return;
    }

    if (mode === "obras") {
      setWorkFilters(
        initialFilters
          ? {
              ...DEFAULT_WORK_FILTERS,
              ...(initialFilters as WorkFilters),

              startDate: {
                ...DEFAULT_WORK_FILTERS.startDate,
                ...(initialFilters as WorkFilters).startDate,
              },

              endDate: {
                ...DEFAULT_WORK_FILTERS.endDate,
                ...(initialFilters as WorkFilters).endDate,
              },

              value: {
                ...DEFAULT_WORK_FILTERS.value,
                ...(initialFilters as WorkFilters).value,
              },
            }
          : {
              ...DEFAULT_WORK_FILTERS,
              value: {
                min: 0,
                max: maxValue,
              },
            },
      );
    }
  }, [visible, mode, initialFilters, maxValue]);

  /* ==========================================================
     CIDADES DISPONÍVEIS
  ========================================================== */

  const availableCities = useMemo(() => {
    return cities;
  }, [cities]);

  /* ==========================================================
     AÇÕES
  ========================================================== */

  function handleApply() {
    if (mode === "clientes") {
      onApply(clientFilters);
      onClose();
      return;
    }

    if (mode === "orcamentos") {
      onApply(budgetFilters);
      onClose();
      return;
    }

    onApply(workFilters);
    onClose();
  }

  function handleClear() {
    if (mode === "clientes") {
      setClientFilters({
        ...DEFAULT_CLIENT_FILTERS,
      });

      return;
    }

    if (mode === "orcamentos") {
      setBudgetFilters({
        ...DEFAULT_BUDGET_FILTERS,

        value: {
          min: 0,
          max: maxValue,
        },
      });

      return;
    }

    setWorkFilters({
      ...DEFAULT_WORK_FILTERS,

      value: {
        min: 0,
        max: maxValue,
      },
    });
  }

  /* ==========================================================
     CONTAGEM DE FILTROS ATIVOS
  ========================================================== */

  const activeFiltersCount = useMemo(() => {
    if (mode === "clientes") {
      let count = 0;

      if (clientFilters.sort) count++;

      if (clientFilters.personType !== "all") {
        count++;
      }

      if (clientFilters.budgetQuantity !== "all") {
        count++;
      }

      return count;
    }

    if (mode === "orcamentos") {
      let count = 0;

      if (budgetFilters.sort) count++;

      if (budgetFilters.status !== "all") {
        count++;
      }

      if (budgetFilters.clientSort) {
        count++;
      }

      if (budgetFilters.publicationDate.preset !== "all") {
        count++;
      }

      if (budgetFilters.state) count++;

      if (budgetFilters.city) count++;

      if (budgetFilters.value.min > 0 || budgetFilters.value.max < maxValue) {
        count++;
      }

      if (budgetFilters.archived !== "active") {
        count++;
      }

      return count;
    }

    let count = 0;

    if (workFilters.sort) count++;

    if (workFilters.startDate.preset !== "all") {
      count++;
    }

    if (workFilters.endDate.preset !== "all") {
      count++;
    }

    if (workFilters.state) count++;

    if (workFilters.city) count++;

    if (workFilters.status !== "all") {
      count++;
    }

    if (workFilters.clientSort) {
      count++;
    }

    if (workFilters.value.min > 0 || workFilters.value.max < maxValue) {
      count++;
    }

    if (workFilters.archived !== "active") {
      count++;
    }

    return count;
  }, [mode, clientFilters, budgetFilters, workFilters, maxValue]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* ==================================================
              HEADER
          ================================================== */}

          <View style={styles.header}>
            <View style={styles.headerTitleContainer}>
              <Ionicons name="filter" size={22} color={COLORS.primary} />

              <Text style={styles.title}>Filtros</Text>

              {activeFiltersCount > 0 && (
                <View style={styles.counter}>
                  <Text style={styles.counterText}>{activeFiltersCount}</Text>
                </View>
              )}
            </View>

            <Pressable onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </Pressable>
          </View>

          {/* ==================================================
              CONTEÚDO
          ================================================== */}

          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            {mode === "clientes" && (
              <ClientFiltersContent
                filters={clientFilters}
                setFilters={setClientFilters}
              />
            )}

            {mode === "orcamentos" && (
              <BudgetFiltersContent
                filters={budgetFilters}
                setFilters={setBudgetFilters}
                states={states}
                cities={availableCities}
                maxValue={maxValue}
              />
            )}

            {mode === "obras" && (
              <WorkFiltersContent
                filters={workFilters}
                setFilters={setWorkFilters}
                states={states}
                cities={availableCities}
                maxValue={maxValue}
              />
            )}
          </ScrollView>

          {/* ==================================================
              FOOTER
          ================================================== */}

          <View style={styles.footer}>
            <Pressable onPress={handleClear} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>Limpar</Text>
            </Pressable>

            <Pressable onPress={handleApply} style={styles.applyButton}>
              <Ionicons name="checkmark" size={19} color={COLORS.white} />

              <Text style={styles.applyButtonText}>Aplicar filtros</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

/* ============================================================
   CLIENTES
============================================================ */

interface ClientFiltersContentProps {
  filters: ClientFilters;

  setFilters: React.Dispatch<React.SetStateAction<ClientFilters>>;
}

function ClientFiltersContent({
  filters,
  setFilters,
}: ClientFiltersContentProps) {
  return (
    <>
      <FilterSection title="Ordenação">
        <FilterOption
          label="Nome A → Z"
          selected={filters.sort === "asc"}
          onPress={() =>
            setFilters((prev) => ({
              ...prev,
              sort: prev.sort === "asc" ? null : "asc",
            }))
          }
        />

        <FilterOption
          label="Nome Z → A"
          selected={filters.sort === "desc"}
          onPress={() =>
            setFilters((prev) => ({
              ...prev,
              sort: prev.sort === "desc" ? null : "desc",
            }))
          }
        />
      </FilterSection>

      <FilterSection title="Tipo de pessoa">
        <FilterOption
          label="Todos"
          selected={filters.personType === "all"}
          onPress={() =>
            setFilters((prev) => ({
              ...prev,
              personType: "all",
            }))
          }
        />

        <FilterOption
          label="Pessoa Física"
          selected={filters.personType === "FISICO"}
          onPress={() =>
            setFilters((prev) => ({
              ...prev,
              personType: "FISICO",
            }))
          }
        />

        <FilterOption
          label="Pessoa Jurídica"
          selected={filters.personType === "JURIDICO"}
          onPress={() =>
            setFilters((prev) => ({
              ...prev,
              personType: "JURIDICO",
            }))
          }
        />
      </FilterSection>

      <FilterSection title="Quantidade de orçamentos">
        <FilterOption
          label="Todos"
          selected={filters.budgetQuantity === "all"}
          onPress={() =>
            setFilters((prev) => ({
              ...prev,
              budgetQuantity: "all",
            }))
          }
        />

        <FilterOption
          label="Sem orçamento"
          selected={filters.budgetQuantity === "none"}
          onPress={() =>
            setFilters((prev) => ({
              ...prev,
              budgetQuantity: "none",
            }))
          }
        />

        <FilterOption
          label="1 orçamento"
          selected={filters.budgetQuantity === "one"}
          onPress={() =>
            setFilters((prev) => ({
              ...prev,
              budgetQuantity: "one",
            }))
          }
        />

        <FilterOption
          label="2 orçamentos"
          selected={filters.budgetQuantity === "two"}
          onPress={() =>
            setFilters((prev) => ({
              ...prev,
              budgetQuantity: "two",
            }))
          }
        />

        <FilterOption
          label="3 ou mais"
          selected={filters.budgetQuantity === "threePlus"}
          onPress={() =>
            setFilters((prev) => ({
              ...prev,
              budgetQuantity: "threePlus",
            }))
          }
        />
      </FilterSection>
    </>
  );
}

/* ============================================================
   ORÇAMENTOS
============================================================ */

interface BudgetFiltersContentProps {
  filters: BudgetFilters;

  setFilters: React.Dispatch<React.SetStateAction<BudgetFilters>>;

  states: string[];

  cities: string[];

  maxValue: number;
}

function BudgetFiltersContent({
  filters,
  setFilters,
  states,
  cities,
  maxValue,
}: BudgetFiltersContentProps) {
  return (
    <>
      {/* ORDENAR */}
      <FilterSection title="Ordenação">
        <FilterOption
          label="Nome A → Z"
          selected={filters.sort === "asc"}
          onPress={() =>
            setFilters((prev) => ({
              ...prev,
              sort: prev.sort === "asc" ? null : "asc",
            }))
          }
        />

        <FilterOption
          label="Nome Z → A"
          selected={filters.sort === "desc"}
          onPress={() =>
            setFilters((prev) => ({
              ...prev,
              sort: prev.sort === "desc" ? null : "desc",
            }))
          }
        />
      </FilterSection>

      {/* STATUS */}
      <FilterSection title="Status">
        <FilterOption
          label="Todos"
          selected={filters.status === "all"}
          onPress={() =>
            setFilters((prev) => ({
              ...prev,
              status: "all",
            }))
          }
        />

        <FilterOption
          label="Pendente"
          selected={filters.status === "pendente"}
          onPress={() =>
            setFilters((prev) => ({
              ...prev,
              status: "pendente",
            }))
          }
        />

        <FilterOption
          label="Aprovado"
          selected={filters.status === "aprovado"}
          onPress={() =>
            setFilters((prev) => ({
              ...prev,
              status: "aprovado",
            }))
          }
        />

        <FilterOption
          label="Recusado"
          selected={filters.status === "recusado"}
          onPress={() =>
            setFilters((prev) => ({
              ...prev,
              status: "recusado",
            }))
          }
        />
      </FilterSection>

      {/* ARQUIVAMENTO */}
      <FilterSection title="Arquivamento">
        <FilterOption
          label="Não arquivados"
          selected={filters.archived === "active"}
          onPress={() =>
            setFilters((prev) => ({
              ...prev,
              archived: "active",
            }))
          }
        />

        <FilterOption
          label="Arquivados"
          selected={filters.archived === "archived"}
          onPress={() =>
            setFilters((prev) => ({
              ...prev,
              archived: "archived",
            }))
          }
        />

        <FilterOption
          label="Todos"
          selected={filters.archived === "all"}
          onPress={() =>
            setFilters((prev) => ({
              ...prev,
              archived: "all",
            }))
          }
        />
      </FilterSection>

      {/* CLIENTE */}
      <FilterSection title="Cliente">
        <FilterOption
          label="Cliente A → Z"
          selected={filters.clientSort === "asc"}
          onPress={() =>
            setFilters((prev) => ({
              ...prev,
              clientSort: prev.clientSort === "asc" ? null : "asc",
            }))
          }
        />

        <FilterOption
          label="Cliente Z → A"
          selected={filters.clientSort === "desc"}
          onPress={() =>
            setFilters((prev) => ({
              ...prev,
              clientSort: prev.clientSort === "desc" ? null : "desc",
            }))
          }
        />
      </FilterSection>

      {/* DATA */}
      <FilterSection title="Data de publicação">
        <DateFilterControl
          value={filters.publicationDate}
          onChange={(publicationDate) =>
            setFilters((prev) => ({
              ...prev,
              publicationDate,
            }))
          }
        />
      </FilterSection>

      {/* LOCALIZAÇÃO */}
      <FilterSection title="Localização">
        <SelectLike
          label="Estado"
          value={filters.state || "Todos os estados"}
          options={states}
          onSelect={(state) =>
            setFilters((prev) => ({
              ...prev,
              state,
              city: "",
            }))
          }
        />

        <SelectLike
          label="Cidade"
          value={filters.city || "Todas as cidades"}
          options={cities}
          onSelect={(city) =>
            setFilters((prev) => ({
              ...prev,
              city,
            }))
          }
        />
      </FilterSection>

      {/* VALOR */}
      <FilterSection title="Custo total com BDI">
        <RangeFilterControl
          value={filters.value}
          max={maxValue}
          onChange={(value) =>
            setFilters((prev) => ({
              ...prev,
              value,
            }))
          }
        />
      </FilterSection>
    </>
  );
}

/* ============================================================
   OBRAS
============================================================ */

interface WorkFiltersContentProps {
  filters: WorkFilters;

  setFilters: React.Dispatch<React.SetStateAction<WorkFilters>>;

  states: string[];

  cities: string[];

  maxValue: number;
}

function WorkFiltersContent({
  filters,
  setFilters,
  states,
  cities,
  maxValue,
}: WorkFiltersContentProps) {
  return (
    <>
      {/* ORDENAR */}
      <FilterSection title="Ordenação">
        <FilterOption
          label="Nome A → Z"
          selected={filters.sort === "asc"}
          onPress={() =>
            setFilters((prev) => ({
              ...prev,
              sort: prev.sort === "asc" ? null : "asc",
            }))
          }
        />

        <FilterOption
          label="Nome Z → A"
          selected={filters.sort === "desc"}
          onPress={() =>
            setFilters((prev) => ({
              ...prev,
              sort: prev.sort === "desc" ? null : "desc",
            }))
          }
        />
      </FilterSection>

      {/* INÍCIO REAL */}
      <FilterSection title="Data de início real">
        <DateFilterControl
          value={filters.startDate}
          onChange={(startDate) =>
            setFilters((prev) => ({
              ...prev,
              startDate,
            }))
          }
        />
      </FilterSection>

      {/* FIM REAL */}
      <FilterSection title="Data de fim real">
        <DateFilterControl
          value={filters.endDate}
          onChange={(endDate) =>
            setFilters((prev) => ({
              ...prev,
              endDate,
            }))
          }
        />
      </FilterSection>

      {/* ENDEREÇO */}
      <FilterSection title="Endereço">
        <SelectLike
          label="Estado"
          value={filters.state || "Todos os estados"}
          options={states}
          onSelect={(state) =>
            setFilters((prev) => ({
              ...prev,
              state,
              city: "",
            }))
          }
        />

        <SelectLike
          label="Cidade"
          value={filters.city || "Todas as cidades"}
          options={cities}
          onSelect={(city) =>
            setFilters((prev) => ({
              ...prev,
              city,
            }))
          }
        />
      </FilterSection>

      {/* STATUS */}
      <FilterSection title="Status">
        <FilterOption
          label="Todos"
          selected={filters.status === "all"}
          onPress={() =>
            setFilters((prev) => ({
              ...prev,
              status: "all",
            }))
          }
        />

        <FilterOption
          label="No prazo"
          selected={filters.status === "noprazo"}
          onPress={() =>
            setFilters((prev) => ({
              ...prev,
              status: "noprazo",
            }))
          }
        />

        <FilterOption
          label="Atrasado"
          selected={filters.status === "atrasado"}
          onPress={() =>
            setFilters((prev) => ({
              ...prev,
              status: "atrasado",
            }))
          }
        />

        <FilterOption
          label="Adiantado"
          selected={filters.status === "adiantado"}
          onPress={() =>
            setFilters((prev) => ({
              ...prev,
              status: "adiantado",
            }))
          }
        />

        <FilterOption
          label="Entregue"
          selected={filters.status === "entregue"}
          onPress={() =>
            setFilters((prev) => ({
              ...prev,
              status: "entregue",
            }))
          }
        />

        <FilterOption
          label="Cancelado"
          selected={filters.status === "cancelado"}
          onPress={() =>
            setFilters((prev) => ({
              ...prev,
              status: "cancelado",
            }))
          }
        />
      </FilterSection>

      {/* ARQUIVAMENTO */}
      <FilterSection title="Arquivamento">
        <FilterOption
          label="Não arquivadas"
          selected={filters.archived === "active"}
          onPress={() =>
            setFilters((prev) => ({
              ...prev,
              archived: "active",
            }))
          }
        />

        <FilterOption
          label="Arquivadas"
          selected={filters.archived === "archived"}
          onPress={() =>
            setFilters((prev) => ({
              ...prev,
              archived: "archived",
            }))
          }
        />

        <FilterOption
          label="Todas"
          selected={filters.archived === "all"}
          onPress={() =>
            setFilters((prev) => ({
              ...prev,
              archived: "all",
            }))
          }
        />
      </FilterSection>

      {/* CLIENTE */}
      <FilterSection title="Cliente">
        <FilterOption
          label="Cliente A → Z"
          selected={filters.clientSort === "asc"}
          onPress={() =>
            setFilters((prev) => ({
              ...prev,
              clientSort: prev.clientSort === "asc" ? null : "asc",
            }))
          }
        />

        <FilterOption
          label="Cliente Z → A"
          selected={filters.clientSort === "desc"}
          onPress={() =>
            setFilters((prev) => ({
              ...prev,
              clientSort: prev.clientSort === "desc" ? null : "desc",
            }))
          }
        />
      </FilterSection>

      {/* VALOR */}
      <FilterSection title="Valor total gasto">
        <RangeFilterControl
          value={filters.value}
          max={maxValue}
          onChange={(value) =>
            setFilters((prev) => ({
              ...prev,
              value,
            }))
          }
        />
      </FilterSection>
    </>
  );
}

/* ============================================================
   SEÇÃO
============================================================ */

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
}

function FilterSection({ title, children }: FilterSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>

      <View style={styles.sectionContent}>{children}</View>
    </View>
  );
}

/* ============================================================
   OPÇÃO
============================================================ */

interface FilterOptionProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

function FilterOption({ label, selected, onPress }: FilterOptionProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.option, selected && styles.optionSelected]}
    >
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected && <View style={styles.radioInner} />}
      </View>

      <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

/* ============================================================
   DATA
============================================================ */

interface DateFilterControlProps {
  value: DateFilter;

  onChange: (value: DateFilter) => void;
}

function DateFilterControl({ value, onChange }: DateFilterControlProps) {
  return (
    <View>
      <FilterOption
        label="Qualquer período"
        selected={value.preset === "all"}
        onPress={() =>
          onChange({
            preset: "all",
            from: "",
            to: "",
          })
        }
      />

      <FilterOption
        label="Última semana"
        selected={value.preset === "week"}
        onPress={() =>
          onChange({
            ...value,
            preset: "week",
          })
        }
      />

      <FilterOption
        label="Último mês"
        selected={value.preset === "month"}
        onPress={() =>
          onChange({
            ...value,
            preset: "month",
          })
        }
      />

      <FilterOption
        label="Último ano"
        selected={value.preset === "year"}
        onPress={() =>
          onChange({
            ...value,
            preset: "year",
          })
        }
      />

      <FilterOption
        label="Personalizado"
        selected={value.preset === "custom"}
        onPress={() =>
          onChange({
            ...value,
            preset: "custom",
          })
        }
      />

      {value.preset === "custom" && (
        <View style={styles.customDateContainer}>
          <View style={styles.dateInputContainer}>
            <Text style={styles.inputLabel}>Data inicial</Text>

            <TextInput
              style={styles.input}
              placeholder="DD/MM/AAAA"
              placeholderTextColor={COLORS.textSecondary}
              keyboardType="numeric"
              maxLength={10}
              value={value.from}
              onChangeText={(from) =>
                onChange({
                  ...value,
                  from,
                })
              }
            />
          </View>

          <View style={styles.dateInputContainer}>
            <Text style={styles.inputLabel}>Data final</Text>

            <TextInput
              style={styles.input}
              placeholder="DD/MM/AAAA"
              placeholderTextColor={COLORS.textSecondary}
              keyboardType="numeric"
              maxLength={10}
              value={value.to}
              onChangeText={(to) =>
                onChange({
                  ...value,
                  to,
                })
              }
            />
          </View>
        </View>
      )}
    </View>
  );
}

/* ============================================================
   SELECT
============================================================ */

interface SelectLikeProps {
  label: string;
  value: string;
  options: string[];
  onSelect: (value: string) => void;
}

function SelectLike({ label, value, options, onSelect }: SelectLikeProps) {
  const [opened, setOpened] = useState(false);

  return (
    <View style={styles.selectContainer}>
      <Text style={styles.inputLabel}>{label}</Text>

      <Pressable
        style={styles.selectButton}
        onPress={() => setOpened((prev) => !prev)}
      >
        <Text style={styles.selectButtonText} numberOfLines={1}>
          {value}
        </Text>

        <Ionicons
          name={opened ? "chevron-up" : "chevron-down"}
          size={18}
          color={COLORS.text}
        />
      </Pressable>

      {opened && (
        <View style={styles.selectOptions}>
          {options.length === 0 ? (
            <Text style={styles.emptyOption}>Nenhuma opção disponível</Text>
          ) : (
            options.map((option) => (
              <Pressable
                key={option}
                style={styles.selectOption}
                onPress={() => {
                  onSelect(option);
                  setOpened(false);
                }}
              >
                <Text style={styles.selectOptionText}>{option}</Text>
              </Pressable>
            ))
          )}
        </View>
      )}
    </View>
  );
}

/* ============================================================
   RANGE / SLIDER
============================================================ */

interface RangeFilterControlProps {
  value: RangeFilter;

  max: number;

  onChange: (value: RangeFilter) => void;
}

function RangeFilterControl({ value, max, onChange }: RangeFilterControlProps) {
  const [minText, setMinText] = useState(String(Math.round(value.min)));

  const [maxText, setMaxText] = useState(String(Math.round(value.max)));

  useEffect(() => {
    setMinText(String(Math.round(value.min)));

    setMaxText(String(Math.round(value.max)));
  }, [value.min, value.max]);

  function updateMin(text: string) {
    const numeric = Number(text.replace(/\D/g, ""));

    const newMin = Math.min(numeric || 0, value.max);

    setMinText(String(numeric || 0));

    onChange({
      min: newMin,
      max: value.max,
    });
  }

  function updateMax(text: string) {
    const numeric = Number(text.replace(/\D/g, ""));

    const newMax = Math.max(numeric || 0, value.min);

    const limitedMax = Math.min(newMax, max);

    setMaxText(String(numeric || 0));

    onChange({
      min: value.min,
      max: limitedMax,
    });
  }

  return (
    <View style={styles.rangeContainer}>
      <View style={styles.rangeValues}>
        <View style={styles.rangeValueBox}>
          <Text style={styles.rangeLabel}>Mínimo</Text>

          <TextInput
            value={minText}
            onChangeText={updateMin}
            keyboardType="numeric"
            style={styles.rangeInput}
            placeholder="0"
            placeholderTextColor={COLORS.textSecondary}
          />
        </View>

        <Text style={styles.rangeSeparator}>até</Text>

        <View style={styles.rangeValueBox}>
          <Text style={styles.rangeLabel}>Máximo</Text>

          <TextInput
            value={maxText}
            onChangeText={updateMax}
            keyboardType="numeric"
            style={styles.rangeInput}
            placeholder={String(max)}
            placeholderTextColor={COLORS.textSecondary}
          />
        </View>
      </View>

      <Text style={styles.rangeHint}>
        De R$ {formatMoney(value.min)} até R$ {formatMoney(value.max)}
      </Text>

      {/*
        O controle visual principal do intervalo
        será refinado posteriormente na tela,
        caso você esteja usando uma biblioteca
        de slider no projeto.

        A estrutura de dados já está preparada:
        {
          min,
          max
        }
      */}
    </View>
  );
}

/* ============================================================
   FORMATAÇÃO DE DINHEIRO
============================================================ */

function formatMoney(value: number) {
  return Number(value || 0).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/* ============================================================
   STYLES
============================================================ */

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    justifyContent: "flex-end",
  },

  modal: {
    width: "100%",
    maxHeight: "92%",
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },

  header: {
    minHeight: 65,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderNull,
  },

  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  title: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "700",
  },

  counter: {
    minWidth: 24,
    height: 24,
    paddingHorizontal: 7,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
  },

  counterText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "700",
  },

  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  content: {
    flexGrow: 0,
  },

  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 25,
  },

  section: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderNull,
  },

  sectionTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
  },

  sectionContent: {
    gap: 7,
  },

  option: {
    minHeight: 46,
    paddingHorizontal: 13,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "transparent",
  },

  optionSelected: {
    backgroundColor: "rgba(0, 0, 0, 0.04)",
  },

  radio: {
    width: 21,
    height: 21,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: COLORS.borderNull,
    alignItems: "center",
    justifyContent: "center",
  },

  radioSelected: {
    borderColor: COLORS.primary,
  },

  radioInner: {
    width: 11,
    height: 11,
    borderRadius: 999,
    backgroundColor: COLORS.primary,
  },

  optionText: {
    flex: 1,
    color: COLORS.text,
    fontSize: 15,
  },

  optionTextSelected: {
    fontWeight: "600",
  },

  customDateContainer: {
    marginTop: 10,
    gap: 12,
    paddingLeft: 34,
  },

  dateInputContainer: {
    gap: 6,
  },

  inputLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },

  input: {
    height: 46,
    borderWidth: 1,
    borderColor: COLORS.borderNull,
    borderRadius: 10,
    paddingHorizontal: 12,
    color: COLORS.text,
    backgroundColor: COLORS.card,
  },

  selectContainer: {
    marginTop: 6,
    gap: 6,
  },

  selectButton: {
    minHeight: 46,
    paddingHorizontal: 13,
    borderWidth: 1,
    borderColor: COLORS.borderNull,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  selectButtonText: {
    flex: 1,
    color: COLORS.text,
    fontSize: 14,
    marginRight: 10,
  },

  selectOptions: {
    borderWidth: 1,
    borderColor: COLORS.borderNull,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: COLORS.card,
  },

  selectOption: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 13,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderNull,
  },

  selectOptionText: {
    color: COLORS.text,
    fontSize: 14,
  },

  emptyOption: {
    padding: 14,
    color: COLORS.textSecondary,
    fontSize: 14,
  },

  rangeContainer: {
    paddingTop: 4,
  },

  rangeValues: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
  },

  rangeValueBox: {
    flex: 1,
    gap: 6,
  },

  rangeLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },

  rangeInput: {
    height: 45,
    borderWidth: 1,
    borderColor: COLORS.borderNull,
    borderRadius: 10,
    paddingHorizontal: 10,
    color: COLORS.text,
  },

  rangeSeparator: {
    color: COLORS.textSecondary,
    fontSize: 13,
    paddingBottom: 13,
  },

  rangeHint: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 10,
  },

  footer: {
    minHeight: 75,
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderNull,
  },

  clearButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderNull,
    alignItems: "center",
    justifyContent: "center",
  },

  clearButtonText: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "600",
  },

  applyButton: {
    flex: 1.5,
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  applyButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "700",
  },
});
