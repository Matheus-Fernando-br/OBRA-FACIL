import { useCallback, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";

import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { createProduto, deleteProduto, getProdutos, updateProduto } from "@/services/api";
import { AddProduto, Produto } from "@/components/layout/interface";
import { PageHeader } from "@/components/layout/PageHeader";
import { AppButton } from "@/components/buttons/AppButton";
import { AppInput } from "@/components/forms/AppInput";
import { AppCurrencyInput } from "@/components/forms/AppCurrencyInput";
import { EmptyState } from "@/components/ui/EmptyState";
import { FadeInView } from "@/components/ui/FadeInView";
import { ListSkeleton } from "@/components/ui/Skeleton";
import { SearchField } from "@/components/ui/SearchField";
import { StatusSegment } from "@/components/ui/StatusSegment";
import { usePlanLimit } from "@/components/modals/PlanLimitModal";

/*
 * Catálogo de produtos e serviços: preços padrão reutilizáveis nos
 * orçamentos (nome, unidade e valor). Limite por plano: "produtos".
 */

const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const EMPTY: AddProduto = { nome: "", descricao: "", tipo: "SERVICO", unidade: "", preco_unidade: 0, categoria: "" };

export default function CatalogoScreen() {
  const { styles, theme } = useTheme();
  const { token } = useAuth();
  const { guard, limitModal } = usePlanLimit();

  const [items, setItems] = useState<Produto[] | null>(null);
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [editing, setEditing] = useState<Produto | "novo" | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      setItems(await getProdutos(token));
    } catch (error) {
      console.log("ERRO AO CARREGAR CATÁLOGO:", error);
      setItems((current) => current ?? []);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (items ?? []).filter(
      (p) => !q || p.nome.toLowerCase().includes(q) || (p.categoria ?? "").toLowerCase().includes(q),
    );
  }, [items, search]);

  const openNew = () => guard("produtos", items?.length ?? 0, () => setEditing("novo"));

  return (
    <View style={styles.screen}>
      <PageHeader title="Catálogo" subtitle="Produtos e serviços com preço padrão" />

      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            tintColor={theme.primary}
            onRefresh={async () => {
              setRefreshing(true);
              await load();
              setRefreshing(false);
            }}
          />
        }
      >
        <AppButton title="Novo item" icon="add" onPress={openNew} />

        {!!items?.length && (
          <SearchField value={search} onChangeText={setSearch} placeholder="Buscar por nome ou categoria" />
        )}

        {items === null ? (
          <ListSkeleton count={4} />
        ) : !items.length ? (
          <EmptyState
            icon="pricetags-outline"
            title="Seu catálogo está vazio"
            message="Cadastre os serviços e materiais que você mais usa, com unidade e preço, para montar orçamentos mais rápido."
            actionLabel="Cadastrar primeiro item"
            onAction={openNew}
          />
        ) : (
          filtered.map((item, index) => (
            <FadeInView key={item._id} index={Math.min(index, 8)}>
              <Pressable
                onPress={() => setEditing(item)}
                style={({ pressed }) => [styles.card, { opacity: pressed ? 0.85 : 1 }]}
                accessibilityRole="button"
                accessibilityLabel={`Editar ${item.nome}`}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <View style={[styles.emptyStateIcon, { width: 42, height: 42, marginBottom: 0 }]}>
                    <Ionicons
                      name={item.tipo === "PRODUTO" ? "cube-outline" : "construct-outline"}
                      size={20}
                      color={theme.primary}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.listCardTitle} numberOfLines={1}>
                      {item.nome}
                    </Text>
                    <Text style={styles.caption} numberOfLines={1}>
                      {[item.tipo === "PRODUTO" ? "Produto" : "Serviço", item.categoria].filter(Boolean).join(" · ")}
                    </Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={[styles.listCardTitle, { fontVariant: ["tabular-nums"] }]}>
                      {brl(item.preco_unidade)}
                    </Text>
                    <Text style={styles.caption}>por {item.unidade}</Text>
                  </View>
                </View>
              </Pressable>
            </FadeInView>
          ))
        )}
      </ScrollView>

      {editing && (
        <ProdutoForm
          initial={editing === "novo" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}
      {limitModal}
    </View>
  );
}

function ProdutoForm({
  initial,
  onClose,
  onSaved,
}: {
  initial: Produto | null;
  onClose(): void;
  onSaved(): void;
}) {
  const { styles, theme } = useTheme();
  const { token } = useAuth();
  const [form, setForm] = useState<AddProduto>(initial ? { ...EMPTY, ...initial } : EMPTY);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");

  const set = <K extends keyof AddProduto>(key: K, value: AddProduto[K]) => setForm((f) => ({ ...f, [key]: value }));

  async function save() {
    if (!token) return;
    if (!form.nome.trim()) return setFeedback("Informe o nome do item.");
    if (!form.unidade.trim()) return setFeedback("Informe a unidade (ex.: m², un, h).");
    setFeedback("");
    setSaving(true);
    try {
      const body = { ...form, nome: form.nome.trim(), unidade: form.unidade.trim() };
      if (initial) await updateProduto(initial._id, body, token);
      else await createProduto(body, token);
      onSaved();
    } catch (error: any) {
      setFeedback(error?.response?.data?.message ?? "Não foi possível salvar.");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!token || !initial) return;
    setSaving(true);
    try {
      await deleteProduto(initial._id, token);
      onSaved();
    } catch (error: any) {
      setFeedback(error?.response?.data?.message ?? "Não foi possível excluir.");
      setSaving(false);
    }
  }

  return (
    <Modal visible transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1, justifyContent: "flex-end", backgroundColor: theme.backgroundDestaque }}
      >
        <View style={[styles.card, { borderBottomLeftRadius: 0, borderBottomRightRadius: 0, marginBottom: 0, maxHeight: "92%" }]}>
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <Text style={styles.title}>{initial ? "Editar item" : "Novo item"}</Text>
              <Pressable onPress={onClose} style={styles.menuCloseButton} accessibilityLabel="Fechar">
                <Ionicons name="close" size={18} color={theme.text} />
              </Pressable>
            </View>

            <StatusSegment<AddProduto["tipo"]>
              value={form.tipo}
              onChange={(v) => set("tipo", v)}
              options={[
                { value: "SERVICO", label: "Serviço" },
                { value: "PRODUTO", label: "Produto" },
              ]}
            />

            <Text style={styles.label}>Nome</Text>
            <AppInput value={form.nome} onChangeText={(v) => set("nome", v)} placeholder="Ex.: Assentamento de piso" />

            <View style={{ flexDirection: "row", gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Unidade</Text>
                <AppInput value={form.unidade} onChangeText={(v) => set("unidade", v)} placeholder="m², un, h" autoCapitalize="none" />
              </View>
              <View style={{ flex: 1.4 }}>
                <Text style={styles.label}>Preço por unidade</Text>
                <AppCurrencyInput value={form.preco_unidade} onChangeValue={(v) => set("preco_unidade", v ?? 0)} />
              </View>
            </View>

            <Text style={styles.label}>Categoria (opcional)</Text>
            <AppInput value={form.categoria ?? ""} onChangeText={(v) => set("categoria", v)} placeholder="Ex.: Acabamento" />

            <Text style={styles.label}>Descrição (opcional)</Text>
            <AppInput
              value={form.descricao ?? ""}
              onChangeText={(v) => set("descricao", v)}
              placeholder="Detalhes que aparecem no orçamento"
              multiline
            />

            {!!feedback && <Text style={styles.feedback}>{feedback}</Text>}

            <AppButton title={saving ? "Salvando..." : "Salvar"} loading={saving} onPress={save} />
            {initial && <AppButton title="Excluir item" variant="ghost" icon="trash-outline" onPress={remove} disabled={saving} />}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
