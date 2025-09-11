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

export async function addPendapatan(token, data) {
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

export async function deletePendapatan(token, id) {
  const res = await axios.delete(`${API_URL}/laporan/${id}`, getAuthHeader(token));
  return res.data.data;
}

// --- Pengeluaran ---
export async function getPengeluaran(token) {
  const res = await axios.get(`${API_URL}/laporan?jenis=pengeluaran`, getAuthHeader(token));
  return res.data.data;
}

export async function addPengeluaran(token, data) {
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

export async function deletePengeluaran(token, id) {
  const res = await axios.delete(`${API_URL}/laporan/${id}`, getAuthHeader(token));
  return res.data.data;
}

// --- Laporan ---
export async function getLaporan(token) {
  const res = await axios.get(`${API_URL}/laporan`, getAuthHeader(token));
  return res.data.data;
}
