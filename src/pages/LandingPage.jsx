// src/pages/LandingPage.jsx
import React from "react";
import { Link } from "react-router-dom";
import HeroSawah from "../assets/HeroSawah.jpg";
import IconLogo from "../assets/IconLogo.png";

export default function LandingPage() {
  // Fungsi scroll ke bagian fitur
  const scrollToContent = () => {
    const section = document.getElementById("fitur");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <header className="w-full flex justify-between items-center p-4 bg-white shadow-md fixed top-0 left-0 z-50">
        <div className="flex items-center space-x-2">
          <img src={IconLogo} alt="Logo" className="h-8 w-8" />
          <span className="text-xl font-bold text-[#004030]">SiTani</span>
        </div>
        <div className="space-x-2">
          <Link
            to="/login"
            className="text-[#004030] font-medium hover:underline"
          >
            Masuk
          </Link>
          <Link
            to="/Register"
            className="bg-[#4A9782] text-white px-4 py-2 rounded-lg hover:bg-[#3b7a67]"
          >
            Daftar
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section
        className="h-screen bg-cover bg-center relative text-white flex items-center justify-center"
        style={{
          backgroundImage: `url(${HeroSawah})`,
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>

        {/* Isi Hero */}
        <div className="relative z-10 text-center px-6">
          <h1 className="text-5xl font-bold mb-4">
            Kelola Keuangan Tani dengan Mudah
          </h1>
          <p className="max-w-2xl mb-6 text-lg mx-auto">
            Aplikasi untuk membantu petani dalam memantau pendapatan, pengeluaran,
            dan keuntungan usaha tani secara real-time.
          </p>
          <div className="space-x-4">
            <Link
              to="/register"
              className="bg-[#4A9782] text-white px-8 py-3 rounded-lg text-lg hover:bg-[#3b7a67] transition"
            >
              Mulai Sekarang
            </Link>
            <Link
              to="/Panduan"
              className="bg-gray-700 px-8 py-3 rounded-lg text-lg hover:bg-gray-600 transition"
            >
              Pelajari Lebih Lanjut
            </Link>
          </div>
        </div>

        {/* Tombol Scroll ke Bawah */}
        <button
          onClick={scrollToContent}
          className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-white animate-bounce"
          aria-label="Scroll ke bawah"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8"
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
      <section id="fitur" className="py-16 bg-white text-center">
        <h2 className="text-3xl font-bold text-[#004030] mb-8">
          Fitur Lengkap untuk Petani Modern
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-6 max-w-6xl mx-auto">
          <div>
            <h3 className="text-xl font-semibold mb-2">Pencatatan Sederhana</h3>
            <p>Catat pemasukan dan pengeluaran dengan cepat dan mudah.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Laporan Visual</h3>
            <p>
              Lihat laporan keuangan dalam bentuk grafik yang mudah dipahami.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Pemantauan Lengkap</h3>
            <p>
              Pantau perkembangan usaha tani Anda kapan saja dan di mana saja.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[#4A9782] text-white text-center">
        <h2 className="text-2xl font-bold mb-4">
          Siap Meningkatkan Usaha Tani Anda?
        </h2>
        <p className="mb-6">
          Bergabunglah sekarang dan nikmati kemudahan mengelola keuangan
          pertanian.
        </p>
        <Link
          to="/register"
          className="bg-white text-[#004030] px-6 py-3 rounded-lg font-semibold hover:bg-gray-200"
        >
          Daftar Sekarang
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-[#004030] text-white py-8 px-6 text-sm">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h4 className="font-bold mb-2">Tentang SiTani</h4>
            <p>
              Solusi pengelolaan keuangan untuk petani dengan fitur modern dan
              mudah digunakan.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-2">Sumber</h4>
            <ul className="space-y-1">
              <li>Pusat Bantuan</li>
              <li>Blog</li>
              <li>Kontak Kami</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-2">Produk</h4>
            <ul className="space-y-1">
              <li>SiTani Mobile</li>
              <li>Fitur Keuangan</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-2">Kontak</h4>
            <p>Email: info@sitani.com</p>
            <p>Telp: +62 812-3456-7890</p>
          </div>
        </div>
        <div className="text-center mt-6 border-t border-gray-600 pt-4">
          &copy; {new Date().getFullYear()} SiTani. Semua Hak Dilindungi.
        </div>
      </footer>
    </div>
  );
}
