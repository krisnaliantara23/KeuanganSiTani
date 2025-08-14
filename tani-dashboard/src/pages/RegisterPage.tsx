import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addUser, getUsers } from "../utils/storage";
import type { User } from "../utils/storage";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi input
    if (!username || !password) {
      setError("Username dan password wajib diisi");
      return;
    }

    // Cek apakah username sudah digunakan
    const users = getUsers();
    if (users.some((u: User) => u.username === username)) {
      setError("Username sudah digunakan");
      return;
    }

    // Simpan user baru
    addUser({ username, password });

    // Arahkan ke login
    navigate("/login");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-green-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Daftar Akun</h2>

        {error && (
          <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div className="mb-4">
            <label className="block mb-1">Username</label>
            <input
              type="text"
              className="w-full border p-2 rounded"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1">Password</label>
            <input
              type="password"
              className="w-full border p-2 rounded"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700"
          >
            Daftar
          </button>
        </form>

        <p className="mt-4 text-center text-sm">
          Sudah punya akun?{" "}
          <span
            className="text-green-600 cursor-pointer"
            onClick={() => navigate("/login")}
          >
            Login di sini
          </span>
        </p>
      </div>
    </div>
  );
}
