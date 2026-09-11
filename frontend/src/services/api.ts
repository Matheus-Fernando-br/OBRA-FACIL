import axios from "axios";

export const api = axios.create({
  baseURL: "https://obra-facil-backend-n4du.onrender.com",
  withCredentials: true,
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

export async function refreshToken(token: string) {
  const { data } = await api.post(
    "/auth/refresh",
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return data;
}

export async function logout(token?: string) {
  await api.post(
    "/auth/logout",
    {},
    {
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : undefined,
    },
  );
}

export async function registerUser(data: {
  nome: string;
  email: string;
  senha: string;
  CPF?: string;
  CNPJ?: string;
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
// USER
// ==========================

import { Usuario } from "@/components/layout/interface";

export async function getUser(token: string) {
  const { data } = await api.get("/user/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
}

export async function updateUser(id: string, body: Usuario, token: string) {
  const { data } = await api.put(`/user/${id}`, body, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
}

export async function deleteUser(id: string, token: string) {
  const { data } = await api.delete(`/user/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
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

export async function getPlans(token: string) {
  const { data } = await api.get("/plans", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

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

export async function changeSubscription(planoId: string, token: string) {
  const { data } = await api.put(
    `/subscription/${planoId}`,
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
  const { data } = await api.delete("/subscription", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
}
