// src/pages/LupaKataSandi.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function LupaKataSandi() {
  const [step, setStep] = useState(1);
  const [inputValue, setInputValue] = useState("");
  const [otp, setOtp] = useState("");

  const handleVerifikasi = (e) => {
    e.preventDefault();
    if (!inputValue) {
      alert("Masukkan email atau nomor telepon terlebih dahulu!");
      return;
    }
    // Simulasi kirim kode OTP
    alert(`Kode verifikasi telah dikirim ke ${inputValue}`);
    setStep(2);
  };

  const handleKonfirmasiOTP = (e) => {
    e.preventDefault();
    if (otp === "123456") {
      alert("Kode benar! Silakan lanjut ubah kata sandi.");
      // Arahkan ke halaman reset password
    } else {
      alert("Kode salah, coba lagi.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold text-[#004030] mb-4 text-center">
          Lupa Kata Sandi?
        </h2>

        {step === 1 && (
          <form onSubmit={handleVerifikasi} className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Masukkan Email atau Nomor Telepon
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#004030]"
              placeholder="Email atau Nomor Telepon"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              required
            />
            <button
              type="submit"
              className="w-full bg-[#4A9782] text-white py-2 rounded-lg hover:bg-[#3e826f] transition"
            >
              Verifikasi
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleKonfirmasiOTP} className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Masukkan Kode Verifikasi
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#004030]"
              placeholder="6 digit kode"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              required
            />
            <button
              type="submit"
              className="w-full bg-[#4A9782] text-white py-2 rounded-lg hover:bg-[#3e826f] transition"
            >
              Konfirmasi Kode
            </button>
          </form>
        )}

        <p className="text-sm text-gray-600 text-center mt-4">
          <Link to="/login" className="text-[#004030] hover:underline">
            Kembali ke Login
          </Link>
        </p>
      </div>
    </div>
  );
}
