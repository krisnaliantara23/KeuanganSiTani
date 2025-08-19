import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import SyaratDanKetentuan from "./pages/SyaratDanKetentuan";
import LupaKataSandi from "./pages/LupaKataSandi";
import LandingPage from "./pages/LandingPage";
import PanduanPage from "./pages/PanduanPage";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/syarat-dan-ketentuan" element={<SyaratDanKetentuan />} />
        <Route path="/lupa-kata-sandi" element={<LupaKataSandi />} />
        <Route path="*" element={<LandingPage />} />
        <Route path="/panduan" element={<PanduanPage />} />
      </Routes>
    </Router>
  );
}

export default App;
