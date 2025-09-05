// // src/lib/api.js
// import axios from "axios";

// // Base axios instance
// const api = axios.create({
//   baseURL: "http://localhost:3000/api", // default ke /api
//   headers: { "Content-Type": "application/json" },
// });

// // Interceptor untuk token
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token");
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// export default api;
