import React, { useState } from "react";
import { FaUser, FaLock } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import IconLogo from "../assets/IconLogo.png";
import PertanianKentang from "../assets/PertanianKentang3.jpg";

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post(
        "https://be-laporankeuangan.up.railway.app/api/auth/login",
        {
          identifier: form.email,
          password: form.password,
        }
      );

      // simpan token ke localStorage
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // arahkan ke dashboard
      navigate("/beranda");
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.message || "Login gagal, periksa kembali data Anda.";
      setError(msg);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Bagian kiri */}
      <div className="hidden md:flex w-1/2">
        <img
          src={PertanianKentang}
          alt="Pertanian Kentang"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Bagian kanan */}
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
          Masuk
        </h2>
        <p className="text-lg font-semibold text-[#004030] mb-6 text-center">
          Silakan masuk untuk mengelola keuangan pertanian Anda.
        </p>

        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-3 rounded-full mb-4 text-center">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
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
                placeholder="Masukkan email Anda"
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
          </div>

          {/* Tombol */}
          <button
            type="submit"
            className="w-full bg-[#004030] text-white py-3 rounded-full hover:bg-[#3e826f] transition font-semibold"
          >
            Masuk
          </button>
        </form>

        <p className="text-sm text-gray-600 text-center mt-4">
          Belum punya akun?{" "}
          <Link to="/register" className="text-[#004030] hover:underline">
            Daftar sekarang
          </Link>
        </p>
      </div>
    </div>
  );
}
