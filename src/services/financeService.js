import axios from "axios";

const API_URL = "http://localhost:3001/api/keuangan/laporan";

// Ambil semua pendapatan
export async function getPendapatan(token) {
  const res = await axios.get(`${API_URL}/laporan?jenis=pemasukan`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data.data;
}

// Tambah pendapatan baru
export async function addPendapatan(data, token) {
  const res = await axios.post(`${API_URL}/laporan`, {
    jenis: "pemasukan",
    kategori_id: data.kategori_id,
    deskripsi: data.deskripsi,
    debit: data.jumlah,
    kredit: 0,
    items: []
  }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data.data;
}
