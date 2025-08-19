import React from "react";
import { FaUser, FaLock } from "react-icons/fa";
import IconLogo from "../assets/IconLogo.png";
import GambarSawah from "../assets/GambarSawah.jpg";
import { Link } from "react-router-dom";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Bagian kiri: Gambar Sawah */}
      <div className="hidden md:flex w-1/2">
        <img
          src={GambarSawah}
          alt="Sawah"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Bagian kanan: Form Login */}
      <div className="flex flex-col justify-center w-full md:w-1/2 px-8 md:px-16 bg-white">
        {/* Logo dan Nama */}
        <div className="flex items-center justify-center mb-6">
          <img src={IconLogo} alt="Logo" className="w-10 h-10 object-contain mr-2" />
          <span className="text-2xl font-bold text-[#004030]">SiTani</span>
        </div>

        {/* Judul & Deskripsi */}
        <h2 className="text-4xl font-bold text-[#004030] mb-2 text-center">
          Masuk ke Akun Anda
        </h2>
        <p className="text-lg font-semibold text-[#004030] mb-6 text-center">
          Pantau laporan keuangan pertanian Anda dengan mudah.
        </p>

        {/* Form */}
        <form className="space-y-4">
          {/* Input Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alamat Email
            </label>
            <div className="flex items-center border border-gray-300 rounded-full px-4 py-2 focus-within:ring-2 focus-within:ring-[#004030]">
              <FaUser className="text-gray-400 mr-2" />
              <input
                type="email"
                placeholder="Masukkan alamat email Anda"
                className="flex-1 outline-none bg-transparent"
                required
              />
            </div>
          </div>

          {/* Input Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kata Sandi
            </label>
            <div className="flex items-center border border-gray-300 rounded-full px-4 py-2 focus-within:ring-2 focus-within:ring-[#004030]">
              <FaLock className="text-gray-400 mr-2" />
              <input
                type="password"
                placeholder="Masukkan kata sandi Anda"
                className="flex-1 outline-none bg-transparent"
                required
              />
            </div>
          </div>

          {/* Ingat Saya & Lupa Kata Sandi */}
          <div className="flex items-center justify-between text-gray-600">
            <label className="flex items-center text-base">
              <input type="checkbox" className="mr-2" />
              Ingat Saya
            </label>
            <Link
              to="/lupa-kata-sandi"
              className="text-sm hover:underline text-[#004030]"
            >
              Lupa Kata Sandi?
            </Link>
          </div>

          {/* Tombol Masuk */}
          <button
            type="submit"
            className="w-full bg-[#4A9782] text-white py-3 rounded-full hover:bg-[#3e826f] transition font-semibold"
          >
            Masuk
          </button>
        </form>

        {/* Link Daftar */}
        <p className="text-sm text-gray-600 text-center mt-4">
          Belum punya akun?{" "}
          <Link to="/register" className="text-[#004030] hover:underline">
            Daftar di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
