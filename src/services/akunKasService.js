import axios from "axios";

const API_URL = "https://backendsitani-production.up.railway.app/api/akun-kas";
const API_KEUANGAN = "https://backendsitani-production.up.railway.app/api";
const auth = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

export const getArusKasByAkun = (
  token,
  {
    akun_id,
    start,
    end,
    page = 1,
    limit = 100,
    share = "all",        // all | own | cluster
    klaster_id,           // wajib jika share === 'cluster' (dan user punya klaster)
    id_user,              // opsional (admin bisa lihat user lain)
  } = {}
) => {
  if (!akun_id) throw new Error("akun_id wajib diisi");

  const params = { akun_id, page, limit };
  if (start) params.start = start;
  if (end)   params.end   = end;
  if (share) params.share = share;
  if (share === "cluster" && klaster_id != null) {
    params.klaster_id = String(klaster_id);
  }
  if (id_user) params.id_user = String(id_user);

  return axios.get(
    `${API_KEUANGAN}/keuangan/arus-kas/akun`,
    { headers: { Authorization: `Bearer ${token}` }, params }
  );
};

export const listAkunKas = async (params = {}) => {
  return axios.get(API_URL, { params, ...auth() });
};

export const getAkunKasById = async (id) => {
  return axios.get(`${API_URL}/${id}`, auth());
};

export const createAkunKas = async (data) => {
  return axios.post(API_URL, data, auth());
};
export const updateAkunKas = async (id, data) => {
  return axios.patch(`${API_URL}/${id}`, data, auth());
};

export const deleteAkunKas = async (id) => {
  return axios.delete(`${API_URL}/${id}`, auth());
};

export const getArusKas = async () => {
  return axios.get(`${API_URL}/arus-kas`, auth());
};
