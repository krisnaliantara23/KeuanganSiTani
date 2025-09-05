import React, { useState } from "react";
import { FaUser, FaLock } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import IconLogo from "../assets/IconLogo.png";
import GambarSawah from "../assets/GambarSawah.jpg";

export default function LoginPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      alert("Email dan password wajib diisi!");
      return;
    }

    try {
      const res = await axios.post("http://localhost:3000/api/auth/login", {
        email: form.email,
        password: form.password,
      });

      localStorage.setItem("token", res.data.token);
      alert("Login berhasil!");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Login gagal, coba lagi!");
    }
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

        <h2 className="text-4xl font-bold text-[#004030] mb-2 text-center">
          Selamat Datang Kembali
        </h2>
        <p className="text-lg font-semibold text-[#004030] mb-6 text-center">
          Masuk untuk mengelola keuangan pertanian Anda.
        </p>

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
                placeholder="Masukkan alamat email Anda"
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
            Masuk Sekarang
          </button>
        </form>

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
