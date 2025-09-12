import axios from "axios";

const API_URL = "https://be-laporankeuangan.up.railway.app/api";

function getAuthHeader(token) {
  return { headers: { Authorization: `Bearer ${token}` } };
}

// --- Akun Kas ---
export async function getAkunKas(token) {
  const res = await axios.get(`${API_URL}/akun-kas`, getAuthHeader(token));
  return res.data.data;
}

// --- Pendapatan ---
export async function getPendapatan(token) {
  const res = await axios.get(
    `${API_URL}/keuangan/laporan?jenis=pemasukan`,
    getAuthHeader(token)
  );
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
        subtotal: data.jumlah,
      },
    ],
    deskripsi: data.deskripsi,
    tanggal: data.tanggal,
  };
  const res = await axios.post(
    `${API_URL}/keuangan/laporan`,
    payload,
    getAuthHeader(token)
  );
  return res.data.data;
}

// --- Pengeluaran ---
export async function getPengeluaran(token) {
  const res = await axios.get(
    `${API_URL}/keuangan/laporan?jenis=pengeluaran`,
    getAuthHeader(token)
  );
  return res.data.data;
}

export async function addPengeluaran(token, data) {
  const payload = {
    jenis: "pengeluaran",
    akun_id: data.akun_id,
    debit: 0,
    kredit: data.jumlah,
    items: [
      {
        produk_id: data.produk_id,
        jumlah: 1,
        subtotal: data.jumlah,
      },
    ],
    deskripsi: data.deskripsi,
    tanggal: data.tanggal,
  };
  const res = await axios.post(
    `${API_URL}/keuangan/laporan`,
    payload,
    getAuthHeader(token)
  );
  return res.data.data;
}

// --- Update (edit laporan) ---
export async function updateLaporan(token, id, data) {
  const res = await axios.patch(
    `${API_URL}/keuangan/laporan/${id}`,
    data,
    getAuthHeader(token)
  );
  return res.data.data;
}

// --- Delete (hapus laporan) ---
export async function deleteLaporan(token, id) {
  const res = await axios.delete(
    `${API_URL}/keuangan/laporan/${id}`,
    getAuthHeader(token)
  );
  return res.data;
}

// --- Arus Kas ---
export async function getArusKas(token) {
  const res = await axios.get(`${API_URL}/arus-kas`, getAuthHeader(token));
  return res.data.data;
}

// --- Neraca ---
export async function getNeracaSummary(token) {
  const res = await axios.get(
    `${API_URL}/neraca/summary`,
    getAuthHeader(token)
  );
  return res.data;
}
