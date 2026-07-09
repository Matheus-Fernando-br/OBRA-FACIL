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

export async function getBudgets(token: string) {
  const { data } = await api.get("/budget", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
}

export interface BudgetService {
  nome: string;
  descricao: string;
  unidade: string;
  quantidade_unidade: number;
  preco_da_unidade: number;
  preco_total: number;
}

export interface BudgetCategory {
  nome: string;
  servicos: BudgetService[];
  preco_total_da_categoria: number;
}

export interface BudgetAddress {
  CEP: string;
  estado: string;
  cidade: string;
  bairro: string;
  rua: string;
  numero: string;
  complemento: string;
}

export interface CreateBudgetDTO {
  nome: string;

  endereco: BudgetAddress;

  descricao: string;

  cliente: string;

  responsavel: string;

  categoria: BudgetCategory[];

  status: string;

  preco: number;

  bdi: number;

  preco_com_bdi: number;

  data_publicacao?: Date;

  valido_durante: number;

  data_validade: Date;
}

export async function createBudget(budget: CreateBudgetDTO, token: string) {
  const { data } = await api.post("/budget", budget, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
}

export async function updateBudget(
  id: string,
  budget: CreateBudgetDTO,
  token: string,
) {
  const { data } = await api.put(`/budget/${id}`, budget, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
}

export async function deleteBudget(id: string, token: string) {
  const { data } = await api.delete(`/budget/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
}
