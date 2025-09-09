import api from "../lib/api";

// Ambil semua pendapatan
export async function getPendapatan() {
  const res = await api.get(`/keuangan/laporan?jenis=pemasukan`);
  return res.data.data;
}

// Tambah pendapatan baru
export async function addPendapatan(data) {
  const res = await api.post(`/keuangan/laporan`, {
    jenis: "pemasukan",
    kategori_id: data.kategori_id,
    deskripsi: data.deskripsi,
    debit: data.jumlah,
    kredit: 0,
    tanggal: data.tanggal,
    items: [],
  });
  return res.data.data;
}

// Ambil semua pengeluaran
export async function getPengeluaran() {
  const res = await api.get(`/keuangan/laporan?jenis=pengeluaran`);
  return res.data.data;
}

// Tambah pengeluaran baru
export async function addPengeluaran(data) {
  const res = await api.post(`/keuangan/laporan`, {
    jenis: "pengeluaran",
    kategori_id: data.kategori_id,
    deskripsi: data.deskripsi,
    debit: 0,
    kredit: data.jumlah,
    tanggal: data.tanggal,
    items: [],
  });
  return res.data.data;
}