import axios from "axios";
import { Platform } from "react-native";
import { emitNetworkError } from "./networkEvents";

/**
 * Endereço da API (backend próprio, pasta /backend do repositório).
 * Para apontar para outro servidor sem mudar o código, defina
 * EXPO_PUBLIC_API_URL (arquivo .env local ou "env" no eas.json).
 */
export const API_URL = (
  process.env.EXPO_PUBLIC_API_URL || "https://obra-facil-api.onrender.com"
).replace(/\/+$/, "");

export const api = axios.create({
  baseURL: API_URL,
  // Se o servidor estiver acordando, a primeira resposta pode demorar.
  timeout: 60000,
  // A API usa a plataforma para regras de cobrança por loja (Android/iOS/web).
  headers: { "X-Platform": Platform.OS === "ios" || Platform.OS === "android" ? Platform.OS : "web" },
});

// Falha sem resposta do servidor = sem internet ou servidor fora do ar.
api.interceptors.response.use(undefined, (error) => {
  if (!error?.response) emitNetworkError();
  return Promise.reject(error);
});

// ==========================
// AUTH
// ==========================

export async function login(email: string, senha: string) {
  const { data } = await api.post("/auth/login", {
    email,
    senha,
  });

  return data;
}

/** Troca o refresh token por um par novo (o anterior deixa de valer). */
export async function refreshToken(refreshToken: string): Promise<{
  accessToken: string;
  refreshToken: string;
}> {
  const { data } = await api.post("/auth/refresh", { refreshToken });

  return data;
}

export async function logout(refreshToken?: string | null) {
  await api.post("/auth/logout", { refreshToken: refreshToken ?? undefined });
}

export async function registerUser(data: {
  nome: string;
  email: string;
  senha: string;
  CPF?: string;
  CNPJ?: string;
  aceiteTermos: true;
  versaoTermos: string;
}) {
  const response = await api.post("/auth/register", data);

  return response.data;
}

export async function checkEmailExists(email: string) {
  const response = await api.get("/auth/check-email", {
    params: { email },
  });

  return response.data;
}

export async function verifyEmailCode(data: { email: string; codigo: string }) {
  const response = await api.post("/auth/verify-email", data);

  return response.data;
}

export async function resendVerificationCode(data: { email: string }) {
  const response = await api.post("/auth/resend-verification-code", data);

  return response.data;
}

// ==========================
// RECUPERAÇÃO DE SENHA
// ==========================

export async function requestPasswordReset(data: { email: string }) {
  const response = await api.post("/auth/forgot-password", data);

  return response.data;
}

export async function resetPassword(data: {
  email: string;
  codigo: string;
  novaSenha: string;
}) {
  const response = await api.post("/auth/reset-password", data);

  return response.data;
}

// ==========================
// USER
// ==========================

import { UpdateUsuario } from "@/components/layout/interface";

export async function getUser(token: string) {
  const { data } = await api.get("/user/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
}

export async function updateUser(id: string, body: UpdateUsuario, token: string) {
  const { data } = await api.put(`/user/${id}`, body, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
}

/** A senha vai no corpo para o backend confirmar a identidade antes de excluir. */
export async function deleteUser(id: string, token: string, senha?: string) {
  const { data } = await api.delete(`/user/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: senha ? { senha } : undefined,
  });

  return data;
}

// ==========================
// CLIENTS
// ==========================

import { Cliente, AddCliente } from "@/components/layout/interface";

export async function getClients(token: string) {
  const { data } = await api.get("/client/userClients", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
}

export async function getClientById(id: string, token: string) {
  const { data } = await api.get(`/client/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
}

export async function createClient(body: AddCliente, token: string) {
  const { data } = await api.post("/client", body, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
}

export async function updateClient(id: string, body: Cliente, token: string) {
  const { data } = await api.put(`/client/${id}`, body, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
}

export async function deleteClient(id: string, token: string) {
  const { data } = await api.delete(`/client/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
}

// ==============================
// ORÇAMENTOS
// ==============================
import { Orcamento } from "@/components/layout/interface";

export async function getBudgets(token: string) {
  const { data } = await api.get("/orcamento/userOrcamentos", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
}

export async function getBudgetById(id: string, token: string) {
  const { data } = await api.get(`/orcamento/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
}

export async function getBudgetByClient(id: string, token: string) {
  const { data } = await api.get(`/orcamento/client/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
}

export async function createBudget(budget: Orcamento, token: string) {
  const { data } = await api.post("/orcamento", budget, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
}

export async function updateBudget(
  id: string,
  budget: Orcamento,
  token: string,
) {
  const { data } = await api.put(`/orcamento/${id}`, budget, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
}

export async function archiveBudget(
  id: string,
  arquivado: boolean,
  token: string,
) {
  const { data } = await api.put(
    `/orcamento/${id}`,
    { arquivado },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return data;
}

/** Aprova direto pelo card (só orçamentos pendentes; o servidor impede duplicar). */
export async function approveBudget(id: string, token: string) {
  const { data } = await api.post(`/orcamento/${id}/aprovar`, {}, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
}

export async function deleteBudget(id: string, token: string) {
  const { data } = await api.delete(`/orcamento/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
}

// ==============================
// OBRAS
// ==============================

import { Obra } from "../components/layout/interface";

export async function getWork(token: string) {
  const { data } = await api.get("/obra/userObras", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
}

export async function getWorkById(id: string, token: string) {
  const { data } = await api.get(`/obra/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
}

export async function getWorkByClient(id: string, token: string) {
  const { data } = await api.get(`/obra/client/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
}

export async function createWork(Work: Obra, token: string) {
  const { data } = await api.post("/obra", Work, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
}

export async function updateWork(id: string, work: Obra, token: string) {
  const { data } = await api.put(`/obra/${id}`, work, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
}

export async function archiveWork(
  id: string,
  arquivado: boolean,
  token: string,
) {
  const { data } = await api.put(
    `/obra/${id}`,
    { arquivado },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return data;
}

export async function deleteWork(id: string, token: string) {
  const { data } = await api.delete(`/obra/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
}

// ==============================
// PLANOS E ASSINATURAS
// ==============================

/** Planos, limites e se o checkout está liberado nesta plataforma (público). */
export async function getPlans() {
  const { data } = await api.get("/plans");

  return data;
}

export async function getMySubscription(token: string) {
  const { data } = await api.get("/subscription/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
}

/** Cria o pagamento no Mercado Pago e devolve o link (initPoint). */
export async function startCheckout(planoId: string, token: string): Promise<{ initPoint: string }> {
  const { data } = await api.post(
    "/subscription/checkout",
    { planoId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return data;
}

/** Consulta o Mercado Pago de novo (ex.: ao voltar do pagamento). */
export async function syncSubscription(token: string) {
  const { data } = await api.post(
    "/subscription/sync",
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return data;
}

export async function cancelSubscription(token: string) {
  const { data } = await api.post(
    "/subscription/cancel",
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return data;
}

// ==============================
// CATÁLOGO (PRODUTOS E SERVIÇOS)
// ==============================
import { Produto, AddProduto } from "@/components/layout/interface";

export async function getProdutos(token: string): Promise<Produto[]> {
  const { data } = await api.get("/produto", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
}

export async function createProduto(body: AddProduto, token: string) {
  const { data } = await api.post("/produto", body, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
}

export async function updateProduto(id: string, body: Partial<AddProduto>, token: string) {
  const { data } = await api.put(`/produto/${id}`, body, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
}

export async function deleteProduto(id: string, token: string) {
  const { data } = await api.delete(`/produto/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
}

/* ==========================================================
   NOTIFICAÇÕES DA EQUIPE (enviadas pelo painel admin)
========================================================== */

export interface ServerNotification {
  _id: string;
  titulo: string;
  mensagem: string;
  lidaEm?: string | null;
  createdAt: string;
}

export async function getMyNotifications(token: string): Promise<ServerNotification[]> {
  const { data } = await api.get("/notificacoes", { headers: { Authorization: `Bearer ${token}` } });
  return Array.isArray(data) ? data : [];
}

export async function markNotificationsRead(ids: string[], token: string) {
  await api.post("/notificacoes/lidas", { ids }, { headers: { Authorization: `Bearer ${token}` } });
}

export async function removeNotification(id: string, token: string) {
  await api.delete(`/notificacoes/${id}`, { headers: { Authorization: `Bearer ${token}` } });
}
