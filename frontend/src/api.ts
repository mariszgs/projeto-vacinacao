import axios from "axios";

export const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  headers: {
    Accept: "application/json",
  },
});

// Sempre que tiver token no localStorage, adiciona no header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // ou sessionStorage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
