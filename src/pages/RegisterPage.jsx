// RegisterPage.jsx
import React, { useState } from "react";
import { FaUser, FaLock } from "react-icons/fa";
import { Link } from "react-router-dom";
import IconLogo from "../assets/IconLogo.png";
import GambarSawah from "../assets/GambarSawah.jpg";

export default function RegisterPage() {
  const [form, setForm] = useState({
    nama: "",
    email: "",
    telepon: "",
    password: "",
    konfirmasiPassword: "",
    setuju: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Khusus nomor telepon hanya angka
    if (name === "telepon") {
      if (!/^\d*$/.test(value)) return; // tolak input kalau bukan angka
    }

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validasi semua wajib diisi
    if (
      !form.nama ||
      !form.email ||
      !form.telepon ||
      !form.password ||
      !form.konfirmasiPassword
    ) {
      alert("Semua field wajib diisi!");
      return;
    }

    // Validasi nomor telepon minimal 10 digit (opsional)
    if (form.telepon.length < 10) {
      alert("Nomor telepon minimal 10 digit!");
      return;
    }

    // Validasi password
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(form.password)) {
      alert(
        "Password minimal 8 karakter dan harus mengandung kombinasi huruf dan angka!"
      );
      return;
    }

    // Validasi konfirmasi password
    if (form.password !== form.konfirmasiPassword) {
      alert("Konfirmasi password tidak cocok!");
      return;
    }

    // Validasi setuju syarat
    if (!form.setuju) {
      alert("Anda harus menyetujui syarat dan ketentuan!");
      return;
    }

    console.log("Form berhasil dikirim:", form);
    alert("Pendaftaran berhasil!");
  };

  return (
    <div className="min-h-screen flex">
      {/* Bagian kiri */}
      <div className="hidden md:flex w-1/2">
        <img
          src={GambarSawah}
          alt="Sawah"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Bagian kanan */}
      <div className="flex flex-col justify-center w-full md:w-1/2 px-8 md:px-16 bg-white">
        {/* Logo */}
        <div className="flex items-center justify-center mb-6">
          <img
            src={IconLogo}
            alt="Logo"
            className="w-10 h-10 object-contain mr-2"
          />
          <span className="text-2xl font-bold text-[#004030]">SiTani</span>
        </div>

        {/* Judul */}
        <h2 className="text-4xl font-bold text-[#004030] mb-2 text-center">
          Daftar Akun Baru
        </h2>
        <p className="text-lg font-semibold text-[#004030] mb-6 text-center">
          Mulai kelola keuangan pertanian Anda secara praktis dan aman.
        </p>

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Nama */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Lengkap
            </label>
            <div className="flex items-center border border-gray-300 rounded-full px-4 py-2">
              <FaUser className="text-gray-400 mr-2" />
              <input
                type="text"
                name="nama"
                value={form.nama}
                onChange={handleChange}
                placeholder="Masukkan nama lengkap Anda"
                className="flex-1 outline-none bg-transparent"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alamat Email
            </label>
            <div className="flex items-center border border-gray-300 rounded-full px-4 py-2">
              <FaUser className="text-gray-400 mr-2" />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Masukkan alamat email Anda"
                className="flex-1 outline-none bg-transparent"
                required
              />
            </div>
          </div>

          {/* Nomor Telepon */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nomor Telepon
            </label>
            <div className="flex items-center border border-gray-300 rounded-full px-4 py-2">
              <FaUser className="text-gray-400 mr-2" />
              <input
                type="tel"
                name="telepon"
                value={form.telepon}
                onChange={handleChange}
                placeholder="Masukkan nomor telepon Anda"
                className="flex-1 outline-none bg-transparent"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kata Sandi
            </label>
            <div className="flex items-center border border-gray-300 rounded-full px-4 py-2">
              <FaLock className="text-gray-400 mr-2" />
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Masukkan kata sandi Anda"
                className="flex-1 outline-none bg-transparent"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Minimal 8 karakter, kombinasi huruf dan angka
            </p>
          </div>

          {/* Konfirmasi Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Konfirmasi Kata Sandi
            </label>
            <div className="flex items-center border border-gray-300 rounded-full px-4 py-2">
              <FaLock className="text-gray-400 mr-2" />
              <input
                type="password"
                name="konfirmasiPassword"
                value={form.konfirmasiPassword}
                onChange={handleChange}
                placeholder="Konfirmasi kata sandi Anda"
                className="flex-1 outline-none bg-transparent"
                required
              />
            </div>
          </div>

          {/* Checkbox */}
          <div className="flex items-center text-sm text-gray-600">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="setuju"
                checked={form.setuju}
                onChange={handleChange}
                className="mr-2"
              />
              Saya setuju dengan{" "}
              <Link
                to="/syarat-dan-ketentuan"
                className="text-[#004030] hover:underline ml-1"
              >
                Syarat dan Ketentuan
              </Link>
            </label>
          </div>

          {/* Tombol */}
          <button
            type="submit"
            className="w-full bg-[#4A9782] text-white py-3 rounded-full hover:bg-[#3e826f] transition font-semibold"
          >
            Daftar Sekarang
          </button>
        </form>

        {/* Link Masuk */}
        <p className="text-sm text-gray-600 text-center mt-4">
          Sudah punya akun?{" "}
          <Link to="/login" className="text-[#004030] hover:underline">
            Masuk di sini
          </Link>
        </p>

        {/* Google */}
        <p className="text-sm text-gray-600 text-center mt-4">
          Atau{" "}
          <a
            href="#"
            className="text-[#004030] hover:underline"
            onClick={(e) => {
              e.preventDefault();
              console.log("Integrasi Google Login belum diimplementasikan");
            }}
          >
            Daftar dengan Google
          </a>
        </p>
      </div>
    </div>
  );
}
