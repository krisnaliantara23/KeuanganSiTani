import axios from "axios";

// Ambil dari env variable REACT_APP_API_URL
const API_URL = process.env.REACT_APP_API_URL || "https://be-laporankeuangan.up.railway.app";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Tambahkan token jika ada
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
