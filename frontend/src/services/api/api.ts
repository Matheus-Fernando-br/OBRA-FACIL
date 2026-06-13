import axios from "axios";

export const api = axios.create({
  // Backend futuro
  baseURL: "http://192.168.0.10:8000",
});
