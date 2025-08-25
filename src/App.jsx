import React from "react";
import { DataProvider } from "./context/DataContext";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import SyaratDanKetentuan from "./pages/SyaratDanKetentuan";
import LupaKataSandi from "./pages/LupaKataSandi";
import LandingPage from "./pages/LandingPage";
import PanduanPage from "./pages/PanduanPage";
import FAQ from "./component/FAQ";
import BerandaPage from "./pages/BerandaPage";
import PendapatanPage from "./pages/PendapatanPage";
import PengeluaranPage from "./pages/PengeluaranPage";
import LaporanPage from "./pages/LaporanPage";
import Layout from "./component/Layout";

function App() {
  return (
    <Router>
      <DataProvider>
        <Routes>
          {/* Halaman tanpa layout */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/syarat-dan-ketentuan" element={<SyaratDanKetentuan />} />
          <Route path="/lupa-kata-sandi" element={<LupaKataSandi />} />

          {/* Halaman dengan sidebar & header */}
          <Route
            path="/beranda"
            element={
              <Layout>
                <BerandaPage />
              </Layout>
            }
          />
          <Route
            path="/pendapatan"
            element={
              <Layout>
                <PendapatanPage />
              </Layout>
            }
          />
          <Route
            path="/pengeluaran"
            element={
              <Layout>
                <PengeluaranPage />
              </Layout>
            }
          />
          <Route
            path="/laporan"
            element={
              <Layout>
                <LaporanPage />
              </Layout>
            }
          />
          <Route
            path="/panduan"
            element={
              <Layout>
                <PanduanPage />
              </Layout>
            }
          />
          <Route path="/faq" element={<FAQ />} />

          {/* fallback */}
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </DataProvider>
    </Router>
  );
}

export default App;
