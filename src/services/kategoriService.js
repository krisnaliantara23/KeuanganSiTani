// services/kategoriService.js
import axios from "axios"; // paka
const API_KATEGORI = "https://backendsitani-production.up.railway.app/api/kategori";


const auth = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});


// GET /api/kategori/scope?user_id&klaster_id&jenis&search&page&limit
export const listKategoriScope = async (params = {}) => {
  return axios.get(`${API_KATEGORI}/scope`, { params, ...auth() });
};

// DELETE /api/kategori/:id
export const deleteKategori = async (id) => {
  return axios.delete(`${API_KATEGORI}/${id}`, auth());
};

export const createKategori = async (data) =>{
  return axios.post(`${API_KATEGORI}`, data, auth());
}

export const listKategoriScopev2 = (params = {}) => {
  const q = {};
  if (params.user_id)   q.user_id = params.user_id;
  if (params.klaster_id) q.klaster_id = params.klaster_id;
  if (params.jenis)     q.jenis = params.jenis; // "pemasukan" | "pengeluaran" | "produk"
  q.page  = params.page  ?? 1;
  q.limit = params.limit ?? 200;
  return axios.get(`${API_KATEGORI}/scope`, { params: q, ...auth() });
};