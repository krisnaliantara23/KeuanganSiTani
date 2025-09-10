// src/App.jsx
import React from "react";
import { DataProvider } from "./context/DataContext";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Pages
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import SyaratDanKetentuan from "./pages/SyaratDanKetentuan";
import LupaKataSandi from "./pages/LupaKataSandi";
import LandingPage from "./pages/LandingPage";
import PanduanPage from "./pages/PanduanPage";
import BerandaPage from "./pages/BerandaPage";
import PendapatanPage from "./pages/PendapatanPage";
import PengeluaranPage from "./pages/PengeluaranPage";
import LaporanPage from "./pages/LaporanPage";
import PengaturanPage from "./pages/PengaturanPage";
import FAQ from "./component/FAQ";

// Components
import Layout from "./component/Layout";
import ProtectedRoute from "./component/ProtectedRoute";

function App() {
  return (
    <Router>
      <DataProvider>
        <Routes>
          {/* Halaman public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/syarat-dan-ketentuan" element={<SyaratDanKetentuan />} />
          <Route path="/lupa-kata-sandi" element={<LupaKataSandi />} />
          <Route path="/panduan" element={<PanduanPage />} />
          <Route path="/faq" element={<FAQ />} />

          {/* Halaman dengan sidebar & header (hanya bisa diakses kalau login) */}
          <Route
            path="/beranda"
            element={
              <ProtectedRoute>
                <Layout>
                  <BerandaPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/pendapatan"
            element={
              <ProtectedRoute>
                <Layout>
                  <PendapatanPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/pengeluaran"
            element={
              <ProtectedRoute>
                <Layout>
                  <PengeluaranPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/laporan"
            element={
              <ProtectedRoute>
                <Layout>
                  <LaporanPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/pengaturan"
            element={
              <ProtectedRoute>
                <Layout>
                  <PengaturanPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* fallback route → kalau path ga dikenal, kembalikan ke landing */}
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </DataProvider>
    </Router>
  );
}

export default App;
