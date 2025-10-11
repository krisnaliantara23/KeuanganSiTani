// src/services/klasterInviteService.js
import axios from "axios";
const API_URL = "https://laporan-keuangan-tani-be-production.up.railway.app/api/invite";

const authHeader = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

// OWNER/ADMIN
export function createInvite(token, klasterId, payload) {
  // payload = { email, phone, role, expires_at }
  return axios.post(`${API_URL}/klaster/${klasterId}/invites`, payload, authHeader(token));
}

export function listKlasterInvites(token, klasterId) {
  return axios.get(`${API_URL}/klaster/${klasterId}/invites`, authHeader(token));
}

export function revokeInvite(token, klasterId, inviteId) {
  return axios.post(`${API_URL}/klaster/${klasterId}/invites/${inviteId}/revoke`, {}, authHeader(token));
}

// MEMBER (non-admin)
export function getMyInvites(token) {
  return axios.get(`${API_URL}/me/invites`, authHeader(token));
}

export function previewInvite(inviteToken) {
  return axios.get(`${API_URL}/invites/preview`, { params: { token: inviteToken } });
}

export function acceptInvite(token, body) {
  // body = { token: "<invite_token>", invite_id: "<uuid>" }
  return axios.post(`${API_URL}/invites/accept`, body, authHeader(token));
}

export function rejectInvite(token, body) {
  // body = { token: "<invite_token>", invite_id: "<uuid>" }
  return axios.post(`${API_URL}/invites/reject`, body, authHeader(token));
}
