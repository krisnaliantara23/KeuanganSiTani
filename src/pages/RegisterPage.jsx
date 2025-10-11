// src/pages/RegisterPage.jsx
import React, { useState } from "react";
import { FaUser, FaLock } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toastr from "toastr"; // DITAMBAHKAN: import toastr
import IconLogo from "../assets/IconLogo.png";
import PertanianKentang from "../assets/PertanianKentang3.jpg";
import { bootstrapProduct } from "../services/productService";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(""); // Diubah dari status ke success agar lebih jelas
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState({
    nama: "",
    email: "",
    telepon: "",
    password: "",
    konfirmasiPassword: "",
    setuju: false,
    bootstrap: true,
    role: "user",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "telepon" && !/^\d*$/.test(value)) return;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    // Validasi
    if (!form.nama || !form.email || !form.telepon || !form.password || !form.konfirmasiPassword) {
      setError("Semua field wajib diisi!");
      toastr.error("Semua field wajib diisi!"); // UPDATE: toastr ditambahkan
      setIsLoading(false);
      return;
    }
    if (form.telepon.length < 10) {
      setError("Nomor telepon minimal 10 digit!");
      toastr.error("Nomor telepon minimal 10 digit!"); // UPDATE: toastr ditambahkan
      setIsLoading(false);
      return;
    }
    if (form.password !== form.konfirmasiPassword) {
      setError("Konfirmasi password tidak cocok!");
      toastr.error("Konfirmasi password tidak cocok!"); // UPDATE: toastr ditambahkan
      setIsLoading(false);
      return;
    }
    if (!form.setuju) {
      setError("Anda harus menyetujui Syarat dan Ketentuan.");
      toastr.error("Anda harus menyetujui Syarat dan Ketentuan."); // UPDATE: toastr ditambahkan
      setIsLoading(false);
      return;
    }

    try {
      setSuccess("Mendaftarkan akun Anda...");
      toastr.info("Mendaftarkan akun Anda..."); // UPDATE: toastr ditambahkan

      const res = await axios.post(
        "https://laporan-keuangan-tani-be-production.up.railway.app/api/auth/register",
        {
          nama: form.nama,
          email: form.email,
          nomor_telepon: form.telepon,
          password: form.password,
          role: form.role,
        },
        { headers: { "Content-Type": "application/json" } }
      );

      const token = res?.data?.token;
      if (form.bootstrap && token) {
        const prevToken = localStorage.getItem("token");
        try {
          setSuccess("Membuat data awal...");
          toastr.info("Membuat data awal..."); // UPDATE: toastr ditambahkan
          localStorage.setItem("token", token);
          await bootstrapProduct();
        } catch (bootErr) {
          console.warn("Bootstrap defaults gagal (akan lanjut):", bootErr);
          toastr.warning("Gagal membuat data awal, namun registrasi berhasil."); // UPDATE: toastr ditambahkan
        } finally {
          if (prevToken) localStorage.setItem("token", prevToken);
          else localStorage.removeItem("token");
        }
      }

      setSuccess("Pendaftaran berhasil! Anda akan diarahkan ke halaman login.");
      toastr.success("Pendaftaran berhasil! Anda akan diarahkan ke halaman login."); // UPDATE: toastr ditambahkan
      setTimeout(() => navigate("/login"), 2000); // Diperpanjang sedikit untuk toastr

    } catch (err) {
      console.error("Proses registrasi gagal:", err.response || err.message);
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Pendaftaran gagal, silakan coba lagi.";
      setError(message);
      toastr.error(message); // UPDATE: toastr ditambahkan
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Kiri */}
      <div className="hidden md:flex w-1/2">
        <img src={PertanianKentang} alt="Pertanian Kentang" className="w-full h-full object-cover" />
      </div>

      {/* Kanan */}
      <div className="flex flex-col justify-center w-full md:w-1/2 px-8 md:px-16 bg-white">
        <div className="flex items-center justify-center mb-6">
          <img src={IconLogo} alt="Logo" className="w-10 h-10 object-contain mr-2" />
          <span className="text-2xl font-bold text-[#004030]">SiTani</span>
        </div>

        <h2 className="text-4xl font-bold text-[#004030] mb-2 text-center">Daftar Akun Baru</h2>
        <p className="text-lg font-semibold text-[#004030] mb-6 text-center">
          Mulai kelola keuangan pertanian Anda secara praktis dan aman.
        </p>

        {/* Notifikasi Lama (tetap ada sesuai permintaan) */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-full mb-4 text-center">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-full mb-4 text-center">
            {success}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* ... form fields ... */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
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
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Email</label>
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
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon</label>
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
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kata Sandi</label>
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
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Kata Sandi</label>
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
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-full px-4 py-2 bg-white"
              disabled={isLoading}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Pilih <b>Admin</b> jika akun ini akan mengelola klaster/anggota.
            </p>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="setuju"
                checked={form.setuju}
                onChange={handleChange}
                className="mr-2"
                disabled={isLoading}
              />
              Saya setuju dengan{" "}
              <Link to="/syarat-dan-ketentuan" className="text-[#004030] hover:underline ml-1">
                Syarat dan Ketentuan
              </Link>
            </label>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="bootstrap"
                checked={form.bootstrap}
                onChange={handleChange}
                className="mr-2"
                disabled={isLoading}
              />
              Buat produk awal otomatis
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-[#004030] text-white py-3 rounded-full hover:bg-[#3e826f] transition font-semibold disabled:bg-gray-400"
            disabled={isLoading}
          >
            {isLoading ? "Memproses..." : "Daftar Sekarang"}
          </button>
        </form>

        <p className="text-sm text-gray-600 text-center mt-4">
          Sudah punya akun?{" "}
          <Link to="/login" className="text-[#004030] hover:underline">
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
