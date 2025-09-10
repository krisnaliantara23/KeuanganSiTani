// src/component/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const isLoggedIn = !!localStorage.getItem("token"); // cek token di localStorage

  if (!isLoggedIn) {
    // kalau belum login, lempar ke halaman login
    return <Navigate to="/login" replace />;
  }

  return children;
}
