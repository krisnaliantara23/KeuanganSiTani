import React from 'react';
import { User, Bell, Lock } from 'lucide-react';

export default function PengaturanPage() {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold mb-6">Pengaturan</h2>
      
      <div className="space-y-8">

        {/* Pengaturan Profil */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <User className="mr-2" size={20} /> Profil Pengguna
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Nama Lengkap" className="p-2 border rounded" />
            <input type="email" placeholder="Alamat Email" className="p-2 border rounded" />
            <textarea placeholder="Alamat" className="p-2 border rounded md:col-span-2" rows="3"></textarea>
          </div>
          <button className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Simpan Perubahan Profil
          </button>
        </div>

        {/* Pengaturan Notifikasi */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Bell className="mr-2" size={20} /> Notifikasi
          </h3>
          <div className="space-y-2">
              <label className="flex items-center">
                  <input type="checkbox" className="form-checkbox" />
                  <span className="ml-2">Notifikasi email untuk laporan bulanan</span>
              </label>
              <label className="flex items-center">
                  <input type="checkbox" className="form-checkbox" />
                  <span className="ml-2">Notifikasi saat ada pembaruan fitur</span>
              </label>
          </div>
        </div>

        {/* Ganti Kata Sandi */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Lock className="mr-2" size={20} /> Ganti Kata Sandi
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="password" placeholder="Kata Sandi Saat Ini" className="p-2 border rounded" />
              <input type="password" placeholder="Kata Sandi Baru" className="p-2 border rounded" />
          </div>
          <button className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Ubah Kata Sandi
          </button>
        </div>

      </div>
    </div>
  );
}