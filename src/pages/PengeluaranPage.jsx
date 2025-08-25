import React, { useState } from "react";
import { useData } from "../context/DataContext";
import Sidebar from "../component/Sidebar";
import Header from "../component/Header";
import Footer from "../component/Footer";

export default function PengeluaranPage() {
  const { pengeluaran, tambahPengeluaran } = useData();
  const [form, setForm] = useState({ kategori: "", jumlah: 0, deskripsi: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    tambahPengeluaran({ ...form, id: Date.now() });
    setForm({ kategori: "", jumlah: 0, deskripsi: "" });
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-6 bg-gray-50 min-h-screen">
        <Header />

        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Pengeluaran Pertanian</h2>
          <form onSubmit={handleSubmit} className="flex gap-4">
            <input
              type="text"
              placeholder="Kategori"
              value={form.kategori}
              onChange={(e) => setForm({ ...form, kategori: e.target.value })}
              className="border p-2 rounded flex-1"
              required
            />
            <input
              type="number"
              placeholder="Jumlah"
              value={form.jumlah}
              onChange={(e) => setForm({ ...form, jumlah: parseInt(e.target.value) })}
              className="border p-2 rounded flex-1"
              required
            />
            <input
              type="text"
              placeholder="Deskripsi"
              value={form.deskripsi}
              onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
              className="border p-2 rounded flex-1"
            />
            <button
              type="submit"
              className="bg-orange-600 text-white px-4 py-2 rounded"
            >
              + Tambah
            </button>
          </form>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Riwayat Pengeluaran</h3>
          <table className="w-full text-left border">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2">Kategori</th>
                <th className="p-2">Jumlah</th>
                <th className="p-2">Deskripsi</th>
              </tr>
            </thead>
            <tbody>
              {pengeluaran.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="p-2">{item.kategori}</td>
                  <td className="p-2">Rp {item.jumlah.toLocaleString()}</td>
                  <td className="p-2">{item.deskripsi}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Footer />
      </div>
    </div>
  );
}
