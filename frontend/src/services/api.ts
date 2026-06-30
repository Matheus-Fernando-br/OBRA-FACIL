import axios from "axios";

export const api = axios.create({
  baseURL: "https://obra-facil-backend-n4du.onrender.com",
  withCredentials: true,
});

// ==========================
// AUTH
// ==========================

export async function login(email: string, senha: string) {
  const response = await api.post("/auth/login", {
    email,
    senha,
  });

  return response.data;
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

export async function refreshToken() {
  const response = await api.post("/auth/refresh");

  return response.data;
}

export async function logout() {
  await api.post("/auth/logout");
}

// ==========================
// USUÁRIO
// ==========================

export async function getUser(token: string) {
  const response = await api.get("/user/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export async function updateUser(
  id: string,
  data: {
    nome: string;
    email: string;
    CPF?: string;
    CNPJ?: string;
    senha?: string;
  },
  token: string
) {
  const response = await api.put(`/user/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export async function deleteUser(
  id: string,
  token: string
) {
  const response = await api.delete(`/user/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

// ==========================
// CLIENTES
// ==========================

export async function getClients(token: string) {
  const response = await api.get("/client/userClients", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export async function createClient(
  data: {
    nome: string;
    email: string;
    CPF: string;
  },
  token: string
) {
  const response = await api.post("/client", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export async function updateClient(
  id: string,
  data: {
    nome: string;
    email: string;
    CPF: string;
  },
  token: string
) {
  const response = await api.put(`/client/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export async function deleteClient(
  id: string,
  token: string
) {
  const response = await api.delete(`/client/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}