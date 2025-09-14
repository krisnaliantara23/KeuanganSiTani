import api from '../lib/api';

const API_URL = '/produk';

export const getProducts = async (params = {}) => {
  return api.get(`${API_URL}/saya`, { params });
};

export const getProductById = async (id) => {
  return api.get(`${API_URL}/${id}`);
};

export const createProduct = async (data) => {
  return api.post(API_URL, data);
};

export const updateProduct = async (id, data) => {
  return api.put(`${API_URL}/${id}`, data);
};

export const deleteProduct = async (id) => {
  return api.delete(`${API_URL}/${id}`);
};
