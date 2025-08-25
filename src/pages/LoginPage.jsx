import React, { useState } from "react";
import { FaUser, FaLock } from "react-icons/fa";
import IconLogo from "../assets/IconLogo.png";
import GambarSawah from "../assets/GambarSawah.jpg";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    if (!form.email || !form.password) {
      alert("Email dan password wajib diisi!");
      return;
    }
    // if (form.password.length < 8) {
    //   alert("Password minimal 8 karakter!");
    //   return;
    // }
    // if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    //   alert("Format email tidak valid!");
    //   return;
    // }

    // 👉 mapping email -> username
    const payload = {
      identifier: form.email,
      password: form.password,
    };

    const res = await axios.post("http://localhost:3000/api/auth/login", payload);
    localStorage.setItem("token", res.data.token);
    alert("Login berhasil!");
    navigate("/dashboard");
  } catch (err) {
    console.error(err);
    alert("Email atau password salah!");
  }
};


  return (
    <div className="min-h-screen flex">
      {/* Bagian kiri */}
      <div className="hidden md:flex w-1/2">
        <img src={GambarSawah} alt="Sawah" className="w-full h-full object-cover" />
      </div>

      {/* Bagian kanan */}
      <div className="flex flex-col justify-center w-full md:w-1/2 px-8 md:px-16 bg-white">
        {/* Logo */}
        <div className="flex items-center justify-center mb-6">
          <img src={IconLogo} alt="Logo" className="w-10 h-10 object-contain mr-2" />
          <span className="text-2xl font-bold text-[#004030]">SiTani</span>
        </div>

        <h2 className="text-4xl font-bold text-[#004030] mb-2 text-center">Masuk ke Akun Anda</h2>
        <p className="text-lg font-semibold text-[#004030] mb-6 text-center">
          Pantau laporan keuangan pertanian Anda dengan mudah.
        </p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email pengguna</label>
            <div className="flex items-center border border-gray-300 rounded-full px-4 py-2">
              <FaUser className="text-gray-400 mr-2" />
              <input
                type="text"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Masukkan email pengguna Anda"
                className="flex-1 outline-none bg-transparent"
                required
              />
            </div>
          </div>

          {/* Password */}
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
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-gray-600">
            <label className="flex items-center text-base">
              <input type="checkbox" className="mr-2" /> Ingat Saya
            </label>
            <Link to="/lupa-kata-sandi" className="text-sm hover:underline text-[#004030]">
              Lupa Kata Sandi?
            </Link>
          </div>

          <button
            type="submit"
            className="w-full bg-[#4A9782] text-white py-3 rounded-full hover:bg-[#3e826f] transition font-semibold"
          >
            Masuk
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
