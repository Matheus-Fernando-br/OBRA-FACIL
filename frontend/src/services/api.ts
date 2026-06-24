import axios from "axios";

export const api = axios.create({

  baseURL: "https://obra-facil-backend-n4du.onrender.com",
});

//ROTAS CLIENTES
export async function getClients() {
  try {
    const response = await api.get("/client");

    console.log("CLIENTES API:", response.data);

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