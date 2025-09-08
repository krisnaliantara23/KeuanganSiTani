// src/pages/SyaratDanKetentuan.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function SyaratDanKetentuan() {
  return (
    <div className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8">
        {/* Judul */}
        <h1 className="text-3xl font-bold text-[#004030] mb-6 text-center">
          Syarat & Ketentuan
        </h1>

        {/* Isi Konten */}
        <div className="space-y-4 text-gray-700 leading-relaxed">
          <p>
            Selamat datang di <span className="font-semibold">SiTani</span>. 
            Dengan menggunakan website ini, Anda menyetujui syarat dan ketentuan yang berlaku. 
            Harap membaca dengan seksama sebelum menggunakan layanan kami.
          </p>

          <h2 className="text-xl font-semibold text-[#004030]">1. Penggunaan Layanan</h2>
          <p>
            Layanan ini hanya boleh digunakan untuk tujuan yang sah dan sesuai hukum. 
            Dilarang menggunakan layanan untuk aktivitas yang dapat merugikan pihak lain.
          </p>

          <h2 className="text-xl font-semibold text-[#004030]">2. Privasi Data</h2>
          <p>
            Kami menjaga privasi Anda dan tidak akan membagikan informasi pribadi tanpa persetujuan, 
            kecuali jika diwajibkan oleh hukum.
          </p>

          <h2 className="text-xl font-semibold text-[#004030]">3. Tanggung Jawab</h2>
          <p>
            Pengguna bertanggung jawab penuh atas akun dan aktivitas yang dilakukan di dalam aplikasi.
          </p>

          <h2 className="text-xl font-semibold text-[#004030]">4. Perubahan Syarat</h2>
          <p>
            Kami berhak mengubah syarat dan ketentuan ini sewaktu-waktu. 
            Perubahan akan diumumkan melalui aplikasi.
          </p>

          <h2 className="text-xl font-semibold text-[#004030]">5. Kontak</h2>
          <p>
            Jika Anda memiliki pertanyaan mengenai syarat dan ketentuan ini, 
            silakan hubungi kami melalui email resmi.
          </p>
        </div>

        {/* Tombol Kembali */}
        <div className="mt-8 text-center">
          <Link
            to="/register"
            className="inline-block bg-[#4A9782] text-white px-6 py-2 rounded-full hover:bg-[#3e826f] transition"
          >
            Kembali
          </Link>
        </div>
      </div>
    </div>
  );
}
