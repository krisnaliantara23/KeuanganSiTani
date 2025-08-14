// src/pages/LoginPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUsers, setCurrentUser } from "../utils/storage";
import type { User } from "../utils/storage";
import Sawah from "../assets/IconSawah.png";
import Logo from "../assets/IconLogo.png";

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      setError("Username dan password wajib diisi");
      return;
    }

    const users = getUsers();
    const user = users.find(
      (u: User) => u.username === username && u.password === password
    );

    if (!user) {
      setError("Username atau password salah");
      return;
    }

    setCurrentUser(username);
    navigate("/");
  };

  return (
    <div className="flex min-h-screen">
      {/* Bagian Kiri - Gambar Sawah */}
      <div className="hidden md:block w-1/2">
        <img
          src={Sawah}
          alt="Sawah"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Bagian Kanan - Form */}
      <div className="flex w-full md:w-1/2 justify-center items-center p-8 bg-white">
        <div className="max-w-md w-full space-y-6">
          {/* Logo dan Judul */}
          <div className="text-center">
            <img src={Logo} alt="SiTani Logo" className="mx-auto w-16 h-16" />
            <h2 className="mt-4 text-2xl font-bold text-gray-900">
              Masuk ke Akun Anda
            </h2>
            <p className="mt-2 text-gray-600 text-sm">
              Pantau laporan keuangan pertanian Anda dengan mudah.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-100 text-red-700 p-2 rounded text-center">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                type="text"
                className="mt-1 w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                className="mt-1 w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg font-semibold"
            >
              Login
            </button>
          </form>

          {/* Link Daftar */}
          <p className="text-center text-sm text-gray-600">
            Belum punya akun?{" "}
            <span
              className="text-green-600 hover:underline cursor-pointer"
              onClick={() => navigate("/register")}
            >
              Daftar di sini
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}