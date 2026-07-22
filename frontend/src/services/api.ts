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

// ==========================
// USER
// ==========================

export async function getUser(token: string) {
  const { data } = await api.get("/user/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
}

export async function updateUser(
  id: string,
  body: {
    nome: string;
    email: string;
    CPF?: string;
    CNPJ?: string;
    senha?: string;
  },
  token: string,
) {
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

export async function getClients(token: string) {
  const { data } = await api.get("/client/userClients", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
}

export async function createClient(
  body: {
    nome: string;
    email: string;
    CPF?: string;
    CNPJ?: string;
    telefone?: string;
  },
  token: string,
) {
  const { data } = await api.post("/client", body, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
}

export async function updateClient(
  id: string,
  body: {
    nome: string;
    email: string;
    CPF?: string;
    CNPJ?: string;
    telefone?: string;
  },
  token: string,
) {
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
  const { data } = await api.get("/orcamento", {
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
  const { data } = await api.get("/work", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
}

export async function createWork(Work: Obra, token: string) {
  const { data } = await api.post("/work", Work, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
}

export async function updateWork(id: string, work: Obra, token: string) {
  const { data } = await api.put(`/work/${id}`, work, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
}

export async function deleteWork(id: string, token: string) {
  const { data } = await api.delete(`/work/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
}
