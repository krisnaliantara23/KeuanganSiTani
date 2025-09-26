import axios from "axios";

const API_URL = "https://be-laporankeuangan.up.railway.app/api/produk";

export const getProducts = async (params = {}) => {
  return axios.get(`${API_URL}/saya`, { 
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    params,
   });
};

export const getProductById = async (id) => {
  return axios.get(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  });
};

export const createProduct = async (data) => {
  return axios.post(API_URL, data, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  });
};

export const bootstrapProduct = async (data) => {
  return axios.post(`${API_URL}/bootstrap`, data, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  });
};

export const updateProduct = async (id, data) => {
  return axios.put(`${API_URL}/${id}`, data, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  });
};

export const deleteProduct = async (id) => {
  return axios.delete(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  });
};
