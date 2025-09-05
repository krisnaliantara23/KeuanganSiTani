// src/pages/LandingPage.jsx
import React from "react";
import { Link } from "react-router-dom";
import HeroSawah from "../assets/PertanianKentang.jpg";
import IconLogo from "../assets/IconLogo.png";
import "../styles/landing.css"; // Import CSS

export default function LandingPage() {
  // Fungsi scroll ke bagian fitur
  const scrollToContent = () => {
    const section = document.getElementById("fitur");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="landing-container">
      {/* Navbar */}
      <header className="navbar">
        <div className="navbar-logo">
          <img src={IconLogo} alt="Logo" className="logo-img" />
          <span className="logo-text">SiTani</span>
        </div>
        <div className="navbar-links">
          <Link to="/login" className="login-link">Masuk</Link>
          <Link to="/register" className="register-btn">Daftar</Link>
        </div>
      </header>

      {/* Hero Section */}
      <section
        className="hero"
        style={{ backgroundImage: `url(${HeroSawah})` }}
      >
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">Kelola Keuangan Tani dengan Mudah</h1>
          <p className="hero-subtitle">
            Website untuk membantu petani dalam memantau pendapatan, pengeluaran,
            dan keuntungan usaha tani secara real-time.
          </p>
          <div className="hero-buttons">
            <Link to="/register" className="primary-btn">Mulai Sekarang</Link>
            <Link to="/Panduan" className="secondary-btn">Pelajari Lebih Lanjut</Link>
          </div>
        </div>

        {/* Tombol Scroll ke Bawah */}
        <button
          onClick={scrollToContent}
          className="scroll-btn"
          aria-label="Scroll ke bawah"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="scroll-icon"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </section>

      {/* Fitur Section */}
      <section id="fitur" className="fitur-section">
        <h2 className="fitur-title">Fitur Lengkap untuk Petani Modern</h2>
        <div className="fitur-grid">
          <div className="fitur-card">
            <h3 className="fitur-card-title">Pencatatan Sederhana</h3>
            <p>Catat pemasukan dan pengeluaran dengan cepat dan mudah.</p>
          </div>
          <div className="fitur-card">
            <h3 className="fitur-card-title">Laporan Visual</h3>
            <p>Lihat laporan keuangan dalam bentuk grafik yang mudah dipahami.</p>
          </div>
          <div className="fitur-card">
            <h3 className="fitur-card-title">Pemantauan Lengkap</h3>
            <p>Pantau perkembangan usaha tani Anda kapan saja dan di mana saja.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-logo">
            <img src={IconLogo} alt="Logo" className="logo-img" />
            <span className="logo-text">SiTani</span>
          </div>
          <div className="footer-copy">
            © {new Date().getFullYear()} Laporan Keuangan Tani. Semua hak cipta dilindungi undang-undang.
          </div>
        </div>
      </footer>
    </div>
  );
}
