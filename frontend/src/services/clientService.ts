import { clients } from "../data/clients";

export async function getClients() {
  return clients;
}

/*
FUTURO (Render + MongoDB)

import axios from "axios";

export async function getClients() {
  const response = await axios.get(
    "https://seu-backend.onrender.com/clientes"
  );

  return response.data;
}

*/
