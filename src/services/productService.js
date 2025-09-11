import axios from "axios";

const API_URL = "https://be-laporankeuangan.up.railway.app/api";

function getAuthHeader(token) {
  return { headers: { Authorization: `Bearer ${token}` } };
}

/**
 * Mengambil daftar semua produk.
 * @param {string} token - JWT Token
 */
export async function getProduk(token) {
  const res = await axios.get(`${API_URL}/produk`, getAuthHeader(token));
  return res.data.data;
}

/**
 * Mengambil detail satu produk berdasarkan ID.
 * @param {string} token - JWT Token
 * @param {number} id - ID Produk
 */
export async function getProdukById(token, id) {
  const res = await axios.get(`${API_URL}/produk/${id}`, getAuthHeader(token));
  return res.data.data;
}