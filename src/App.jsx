// src/App.jsx
import React, { useEffect } from "react"; // Import useEffect
import { DataProvider } from "./context/DataContext";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Lenis from "lenis"; // Import Lenis

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
import AturProdukPage from "./pages/AturProdukPage";
import FAQ from "./component/FAQ";

// Components
import Layout from "./component/Layout";
import ProtectedRoute from "./component/ProtectedRoute";

// Konfigurasi animasi
const pageVariants = {
  initial: {
    opacity: 0,
  },
  in: {
    opacity: 1,
  },
  out: {
    opacity: 0,
  },
};

const pageTransition = {
  type: "tween",
  ease: "linear",
  duration: 0.3,
};

// Wrapper untuk animasi halaman publik
const PageWrapper = ({ children }) => (
  <motion.div
    initial="initial"
    animate="in"
    exit="out"
    variants={pageVariants}
    transition={pageTransition}
  >
    {children}
  </motion.div>
);

function App() {
  const location = useLocation();

  // Efek untuk smooth scroll dengan Lenis
  useEffect(() => {
    const lenis = new Lenis();

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Cleanup
    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <DataProvider>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Halaman public */}
          <Route path="/" element={<PageWrapper><LandingPage /></PageWrapper>} />
          <Route path="/login" element={<PageWrapper><LoginPage /></PageWrapper>} />
          <Route path="/register" element={<PageWrapper><RegisterPage /></PageWrapper>} />
          <Route path="/syarat-dan-ketentuan" element={<PageWrapper><SyaratDanKetentuan /></PageWrapper>} />
          {/* <Route path="/Atur-Produk" element={<PageWrapper><AturProdukPage/></PageWrapper>} /> */}
          <Route path="/lupa-kata-sandi" element={<PageWrapper><LupaKataSandi /></PageWrapper>} />
          <Route path="/panduan" element={<PageWrapper><PanduanPage /></PageWrapper>} />
          <Route path="/faq" element={<PageWrapper><FAQ /></PageWrapper>} />

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
          <Route
            path="/atur-produk"
            element={
              <ProtectedRoute>
                <Layout>
                  <AturProdukPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* fallback route → kalau path ga dikenal, kembalikan ke landing */}
          <Route path="*" element={<PageWrapper><LandingPage /></PageWrapper>} />
        </Routes>
      </AnimatePresence>
    </DataProvider>
  );
}

// Karena useLocation butuh ada di dalam Router, kita buat komponen AppWrapper
function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

export default AppWrapper;
