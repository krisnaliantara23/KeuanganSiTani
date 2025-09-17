import React, { useState } from "react";
import { FaUser, FaLock } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import IconLogo from "../assets/IconLogo.png";
import PertanianKentang from "../assets/PertanianKentang3.jpg";
import { createKategori } from "../services/kategoriService";
import { createProduct } from "../services/productService";

// Data default untuk kentang
const defaultData = [
  {
    kategori: { nama: "Bibit", jenis: "pengeluaran" },
    produk: [{ nama: "Bibit Kentang Granola", satuan: "kg" }],
  },
  {
    kategori: { nama: "Pupuk", jenis: "pengeluaran" },
    produk: [
      { nama: "Pupuk NPK", satuan: "kg" },
      { nama: "Pupuk Kandang", satuan: "kg" },
    ],
  },
  {
    kategori: { nama: "Pestisida", jenis: "pengeluaran" },
    produk: [
      { nama: "Insektisida", satuan: "liter" },
      { nama: "Fungisida", satuan: "liter" },
    ],
  },
  {
    kategori: { nama: "Peralatan", jenis: "pengeluaran" },
    produk: [{ nama: "Cangkul", satuan: "unit" }],
  },
  {
    kategori: { nama: "Hasil Panen", jenis: "pemasukan" },
    produk: [{ nama: "Kentang Granola", satuan: "kg" }],
  },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [status, setStatus] = useState(""); // Untuk pesan status selama proses
  const [isLoading, setIsLoading] = useState(false);

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
    if (name === "telepon" && !/^\d*$/.test(value)) return;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Fungsi untuk membuat data default
  const setupInitialData = async () => {
    try {
      setStatus("Membuat kategori default...");
      for (const item of defaultData) {
        // Buat kategori
        const kategoriRes = await createKategori(item.kategori);
        const kategoriId = kategoriRes.data.id;

        // Buat produk untuk kategori ini
        for (const prod of item.produk) {
          await createProduct({
            ...prod,
            kategori_id: kategoriId,
          });
        }
      }
    } catch (err) {
      console.error("Gagal membuat data default:", err);
      throw new Error("Gagal menyiapkan data awal untuk akun Anda.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setStatus("");
    setIsLoading(true);

    // Validasi
    if (!form.nama || !form.email || !form.telepon || !form.password || !form.konfirmasiPassword) {
      setError("Semua field wajib diisi!");
      setIsLoading(false);
      return;
    }
    if (form.password !== form.konfirmasiPassword) {
      setError("Konfirmasi password tidak cocok!");
      setIsLoading(false);
      return;
    }
    if (!form.setuju) {
      setError("Anda harus menyetujui Syarat dan Ketentuan.");
      setIsLoading(false);
      return;
    }

    try {
      // 1. Registrasi
      setStatus("Mendaftarkan akun Anda...");
      await axios.post(
        "https://be-laporankeuangan.up.railway.app/api/auth/register",
        {
          nama: form.nama,
          email: form.email,
          nomor_telepon: form.telepon,
          password: form.password,
          role: "user",
        }
      );

      // 2. Login otomatis untuk mendapatkan token
      setStatus("Pendaftaran berhasil. Melakukan login...");
      const loginRes = await axios.post(
        "https://be-laporankeuangan.up.railway.app/api/auth/login",
        {
          identifier: form.email,
          password: form.password,
        }
      );

      localStorage.setItem("token", loginRes.data.token);
      localStorage.setItem("user", JSON.stringify(loginRes.data.user));

      // 3. Membuat data default
      setStatus("Menyiapkan data awal untuk akun Anda...");
      await setupInitialData();

      // 4. Selesai dan arahkan
      setStatus("Akun Anda telah siap! Mengarahkan ke Beranda...");
      setTimeout(() => navigate("/beranda"), 2000);
    } catch (err) {
      console.error("Proses registrasi gagal:", err.response || err.message);
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Pendaftaran gagal, silakan coba lagi.";
      setError(message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden md:flex w-1/2">
        <img
          src={PertanianKentang}
          alt="Pertanian Kentang"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex flex-col justify-center w-full md:w-1/2 px-8 md:px-16 bg-white">
        <div className="flex items-center justify-center mb-6">
          <img
            src={IconLogo}
            alt="Logo"
            className="w-10 h-10 object-contain mr-2"
          />
          <span className="text-2xl font-bold text-[#004030]">SiTani</span>
        </div>

        <h2 className="text-4xl font-bold text-[#004030] mb-2 text-center">
          Daftar Akun Baru
        </h2>
        <p className="text-lg font-semibold text-[#004030] mb-6 text-center">
          Mulai kelola keuangan pertanian Anda secara praktis dan aman.
        </p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-full mb-4 text-center">
            {error}
          </div>
        )}
        {status && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-full mb-4 text-center">
            {status}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
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
                disabled={isLoading}
              />
            </div>
          </div>

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
                disabled={isLoading}
              />
            </div>
          </div>

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
                disabled={isLoading}
              />
            </div>
          </div>

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
                disabled={isLoading}
              />
            </div>
          </div>

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
                disabled={isLoading}
              />
            </div>
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
              <Link
                to="/syarat-dan-ketentuan"
                className="text-[#004030] hover:underline ml-1"
              >
                Syarat dan Ketentuan
              </Link>
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-[#004030] text-white py-3 rounded-full hover:bg-[#3e826f] transition font-semibold disabled:bg-gray-400"
            disabled={isLoading}
          >
            {isLoading ? status : "Daftar Sekarang"}
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