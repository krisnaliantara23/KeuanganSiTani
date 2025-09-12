// src/services/financeService.js
import axios from "axios";

const API_URL = "https://be-laporankeuangan.up.railway.app/api/keuangan";

function getAuthHeader(token) {
  return { headers: { Authorization: `Bearer ${token}` } };
}

// --- Pendapatan ---
export async function getPendapatan(token) {
  const res = await axios.get(`${API_URL}/laporan?jenis=pemasukan`, getAuthHeader(token));
  return res.data.data;
}

export async function getPengeluaran(token) {
  const res = await axios.get(`${API_URL}/laporan?jenis=pengeluaran`, getAuthHeader(token));
  return res.data.data;
}

export async function addPendapatanv1(token, data) {
  const payload = {
    jenis: "pemasukan",
    akun_id: data.akun_id,
    debit: data.jumlah,
    kredit: 0,
    items: [
      {
        produk_id: data.produk_id,
        jumlah: 1,
        subtotal: data.jumlah
      }
    ],
    deskripsi: data.deskripsi,
    tanggal: data.tanggal,
  };
  const res = await axios.post(`${API_URL}/laporan`, payload, getAuthHeader(token));
  return res.data.data;
}

export async function addPengeluaranv1(token, data) {
  const payload = {
    jenis: "pengeluaran",
    akun_id: data.akun_id || 1,
    debit: 0,
    kredit: data.jumlah,
    items: [
      {
        produk_id: data.produk_id || 1,
        jumlah: 1,
        subtotal: data.jumlah
      }
    ],
    deskripsi: data.deskripsi,
    tanggal: data.tanggal,
  };
  const res = await axios.post(`${API_URL}/laporan`, payload, getAuthHeader(token));
  return res.data.data;
}

// --- Laporan ---
export async function getLaporan(token) {
  const res = await axios.get(`${API_URL}/laporan`, getAuthHeader(token));
  return res.data.data;
}

// get laporan by id
export const getLaporanById = (token, id) =>
  axios.get(`${API_URL}/laporan/${id}`, getAuthHeader(token));

// Patch
export const updatePendapatan = async (token, id, data) => {
  // kalau data.items ada → BE akan replace detail
  return axios.patch(`${API_URL}/laporan/${id}`, data, getAuthHeader(token));
};

// Delete
export const deletePendapatan = async (token, id) => {
  return axios.delete(`${API_URL}/laporan/${id}`, getAuthHeader(token));
};

// add pendapatan v2
export const addPendapatan = async (token, data) => {
  // data boleh berisi: jenis, akun_id, deskripsi, tanggal, debit, kredit, items
  return axios.post(`${API_URL}/laporan`, data, getAuthHeader(token));
};

// add pengeluaran v2
export const addPengeluaran = async (token, data) => {
  // data boleh berisi: jenis, akun_id, deskripsi, tanggal, debit, kredit, items
  return axios.post(`${API_URL}/laporan`, data, getAuthHeader(token));
};

export const updatePengeluaran = async (token, id, data) => {
  // kalau data.items ada → BE akan replace detail
  return axios.patch(`${API_URL}/laporan/${id}`, data, getAuthHeader(token));
};

// Delete
export const deletePengeluaran = async (token, id) => {
  return axios.delete(`${API_URL}/laporan/${id}`, getAuthHeader(token));
};