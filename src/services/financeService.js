// src/services/financeService.js
import axios from "axios";

const API_URL = "https://be-laporankeuangan.up.railway.app/api/keuangan";
// const API_NERACA = "http://localhost:5173/api/neraca";
const API_NERACA = "https://be-laporankeuangan.up.railway.app/api/neraca";

function getAuthHeader(token) {
  return { headers: { Authorization: `Bearer ${token}` } };
}

const auth = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

// --- Pendapatan ---
export async function getPendapatan(token, params = {}) {
  const res = await axios.get(
    `${API_URL}/laporan`, 
    {
      ...getAuthHeader(token),
      params: { ...params ,jenis: "pemasukan" }, 
    }
  );
  return res.data.data;
}

export async function getPengeluaran(token, params = {}) {
  const res = await axios.get(
    `${API_URL}/laporan`,
    {
      ...getAuthHeader(token),
      params: { ...params, jenis: "pengeluaran" },
    }
  );
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
export async function getLaporan(token, params) {
  const res = await axios.get(`${API_URL}/laporan`, getAuthHeader(token), params);
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



// GET NERACA TAPI FILTER BY KLASTER
export const getNeraca = (token, {
  userId,    // optional: target user (admin)
  klasterId, // optional: target klaster
  start,     // optional YYYY-MM-DD
  end        // optional YYYY-MM-DD
} = {}) => {
  const params = {};
  if (start) params.start = start;
  if (end)   params.end   = end;

  let url = `${API_NERACA}/summary`; // default: user saat ini (milik pribadi)
  if (klasterId) url = `${API_NERACA}/summary/cluster/${klasterId}`;
  else if (userId) url = `${API_NERACA}/summary/user/${userId}`;

  return axios.get(url, { ...auth(token), params });
};


// Merge neraca (no filter applied)
  const mergeBuckets = (A = {}, B = {}) => {
    const keys = ["aset_lancar","aset_tetap","kewajiban_lancar","kewajiban_jangka_panjang"];
    const out = {};
    for (const k of keys) {
      const a = A?.[k] || { debit:0, kredit:0, items:[] };
      const b = B?.[k] || { debit:0, kredit:0, items:[] };
      const m = new Map();
      for (const it of [...(a.items||[]), ...(b.items||[])]) {
        const key = it.produk_id ?? `unknown:${it.kategori_id ?? "null"}`;
        const cur = m.get(key) || { ...it, debit:0, kredit:0, saldo:0 };
        cur.debit  += Number(it.debit  || 0);
        cur.kredit += Number(it.kredit || 0);
        cur.saldo   = cur.debit - cur.kredit;
        // pastikan nama tetap ada
        if (!cur.produk_nama && it.produk_nama) cur.produk_nama = it.produk_nama;
        if (!cur.kategori_nama && it.kategori_nama) cur.kategori_nama = it.kategori_nama;
        m.set(key, cur);
      }
      const items = [...m.values()];
      const debit  = Number(a.debit  || 0) + Number(b.debit  || 0);
      const kredit = Number(a.kredit || 0) + Number(b.kredit || 0);
      out[k] = { debit, kredit, saldo: debit - kredit, items };
    }
    const total_aset = (out.aset_lancar.saldo + out.aset_tetap.saldo);
    const total_kew  = (out.kewajiban_lancar.saldo + out.kewajiban_jangka_panjang.saldo);
    return { ...out, total_aset, total_kewajiban: total_kew, total: total_aset + total_kew };
  };


export const getNeracaAll = async (token, {
  userId,
  klasterId,
  start,
  end
} = {}) => {
  const params = {};
  if (start) params.start = start;
  if (end)   params.end   = end;

  // pribadi
  const ownUrl = userId ? `${API_NERACA}/summary/user/${userId}` : `${API_NERACA}/summary`;
  const ownP = axios.get(ownUrl, { ...auth(token), params });

  // klaster (kalau ada)
  const reqs = [ownP];
  if (klasterId) {
    reqs.push(axios.get(`${API_NERACA}/summary/cluster/${klasterId}`, { ...auth(token), params }));
  }

  const [ownRes, clusterRes] = await Promise.all(reqs);
  const ownData     = ownRes.data;
  const clusterData = clusterRes?.data;

  if (!clusterData) {
    return { data: ownData }; // supaya FE yang pakai res.data?.data || res.data tetap aman
  }

  const merged = mergeBuckets(ownData, clusterData);
  return {
    data: {
      ...merged,
      scope: "all",
      periode: ownData.periode || clusterData.periode || { start: start ?? null, end: end ?? null },
      sources: {
        own: { target: ownData.target },
        cluster: { target: clusterData.target },
      },
    }
  };
};