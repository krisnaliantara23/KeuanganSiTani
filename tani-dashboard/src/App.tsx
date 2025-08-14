import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import BerandaPage from "./pages/BerandaPage";
import LaporanPage from "./pages/LaporanPage";
import Sidebar from "./component/Sidebar";
import ProtectedRoute from "./component/ProtectedRoute";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="*"
          element={
            <div className="flex w-full">
              <Sidebar />
              <div className="flex-1">
                <Routes>
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <BerandaPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/laporan"
                    element={
                      <ProtectedRoute>
                        <LaporanPage />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </div>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}
