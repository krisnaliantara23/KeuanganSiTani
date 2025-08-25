import axios from "axios";

const API_URL = "http://localhost:3000/api/products";

export const getProducts = async (params = {}) => {
  return axios.get(API_URL, { params });
};

export const getProductById = async (id) => {
  return axios.get(`${API_URL}/${id}`);
};

export const createProduct = async (data) => {
  return axios.post(API_URL, data, {
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
