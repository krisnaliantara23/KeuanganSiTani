import axios from "axios";

// Base axios instance
const api = axios.create({
  baseURL: "http://localhost:3001/api", // Menggunakan port dari financeService
  headers: { "Content-Type": "application/json" },
});

// Interceptor untuk menambahkan token ke header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;