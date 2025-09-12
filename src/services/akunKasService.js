import axios from "axios";

const API_URL = "https://be-laporankeuangan.up.railway.app/api/akun-kas";

const auth = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

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
