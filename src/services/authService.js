// src/services/authService.js
import axios from "axios";

const API_URL = "https://laporan-keuangan-tani-be-production.up.railway.app/api";

const authHeader = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

export function getMe(token) {
  return axios.get(`${API_URL}/auth/me`, authHeader(token));
}

// ✨ baru: patch profile (nama, email, nomor_telepon, dan utk admin bisa klaster_id)
export const updateMe = (token, payload) =>
  axios.patch(`${API_URL}/auth/me`, payload, authHeader(token));

// opsional kalau mau: ganti password
export const changeMyPassword = (token, body) =>
  axios.patch(`${API_URL}/auth/me/password`, body, authHeader(token));