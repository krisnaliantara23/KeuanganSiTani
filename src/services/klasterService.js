// src/services/klasterService.js
import axios from "axios";

const API_URL = "https://laporan-keuangan-tani-be-production.up.railway.app/api";

const getAuthHeader = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

export const listKlasters = (token, params = {}) =>
  axios.get(`${API_URL}/klaster`, { ...getAuthHeader(token), params });

export const getMyKlaster = (token) =>
  axios.get(`${API_URL}/klaster/me`, getAuthHeader(token));

export const getKlasterDetail = (token, id) =>
  axios.get(`${API_URL}/klaster/${id}`, getAuthHeader(token));

export const createKlaster = (token, body) =>
  axios.post(`${API_URL}/klaster`, body, getAuthHeader(token));

export const updateKlaster = (token, id, body) =>
  axios.patch(`${API_URL}/klaster/${id}`, body, getAuthHeader(token));

export const deleteKlaster = (token, id) =>
  axios.delete(`${API_URL}/klaster/${id}`, getAuthHeader(token));

export const kickMember = (token, klasterId, userId) =>
  axios.delete(`${API_URL}/klaster/${klasterId}/members/${userId}`, getAuthHeader(token));
