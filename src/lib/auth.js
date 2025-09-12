// import api from "./api";

// export const login = (payload) => api.post("/auth/login", payload);
// export const register = (payload) => api.post("/auth/register", payload);
// export const fetchProfile = () => api.get("/auth/me");

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;

    const parsed = JSON.parse(raw);

    // Kalau kadang disimpan sebagai string UUID saja
    if (typeof parsed === "string") {
      return { user_id: parsed, klaster_id: null };
    }

    // Normalnya objek dengan field user_id, klaster_id, dll
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}