import axios from "axios";

export const api = axios.create({

  baseURL: "https://obra-facil-backend-n4du.onrender.com",
});

// ==========================
// USUÁRIO
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

export async function logout() {
  await api.post("/auth/logout");
}

export async function getUser(
  id: string,
  token: string
) {
  const response = await api.get(`/user/${id}`, {
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
  const response = await api.put(
    `/user/${id}`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}

// ==========================
// CLIENTE
// ==========================

export async function getClients() {
  try {
    const response = await api.get("/client");

    return response.data;
  } catch (error) {
    console.log("ERRO CLIENTES:", error);

    return [];
  }
}

export async function createClient(
  data: {
    nome: string;
    email: string;
    CPF: string;
  },
  token: string,
) {
  const response = await api.post(
    "/client",
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
}

export async function updateClient(
  id: string,
  data: {
    nome: string;
    email: string;
    CPF: string;
  },
  token: string,
) {
  const response = await api.put(`/client/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export async function deleteClient(id: string, token: string) {
  const response = await api.delete(`/client/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}