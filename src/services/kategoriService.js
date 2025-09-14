import api from '../lib/api';

const API_KATEGORI = '/kategori';

// GET /api/kategori/scope?user_id&klaster_id&jenis&search&page&limit
export const listKategoriScope = async (params = {}) => {
  return api.get(`${API_KATEGORI}/scope`, { params });
};

// DELETE /api/kategori/:id
export const deleteKategori = async (id) => {
  return api.delete(`${API_KATEGORI}/${id}`);
};

export const createKategori = async (data) => {
  return api.post(`${API_KATEGORI}`, data);
};

export const listKategoriScopev2 = (params = {}) => {
  const q = {};
  if (params.user_id) q.user_id = params.user_id;
  if (params.klaster_id) q.klaster_id = params.klaster_id;
  if (params.jenis) q.jenis = params.jenis; // "pemasukan" | "pengeluaran" | "produk"
  q.page = params.page ?? 1;
  q.limit = params.limit ?? 200;
  return api.get(`${API_KATEGORI}/scope`, { params: q });
};
