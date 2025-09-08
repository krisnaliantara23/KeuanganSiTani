
import React, { useState } from "react";
import { useData } from "../context/DataContext";
import "../styles/pendapatan.css"; // Menggunakan style yang sama dengan pendapatan

export default function PengeluaranPage() {
  const { pengeluaran, tambahPengeluaran } = useData();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    kategori: "",
    jumlah: 0,
    deskripsi: "",
    tanggal: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    tambahPengeluaran({ ...form, id: Date.now() });
    setForm({ kategori: "", jumlah: 0, deskripsi: "", tanggal: "" });
    setShowModal(false);
  };

  return (
    <>
      {/* Header section */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold">Pengeluaran Pertanian</h2>
        <button
          className="bg-red-600 text-white px-4 py-2 rounded"
          onClick={() => setShowModal(true)}
        >
          + Tambah Pengeluaran
        </button>
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Riwayat Pengeluaran</h3>
        <table className="w-full text-left border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2">Kategori</th>
              <th className="p-2">Jumlah</th>
              <th className="p-2">Deskripsi</th>
              <th className="p-2">Tanggal</th>
            </tr>
          </thead>
          <tbody>
            {pengeluaran.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="p-2">{item.kategori}</td>
                <td className="p-2">
                  Rp {item.jumlah.toLocaleString("id-ID")}
                </td>
                <td className="p-2">{item.deskripsi}</td>
                <td className="p-2">
                  {new Date(item.tanggal).toLocaleDateString("id-ID")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3 className="text-xl font-bold mb-4">Tambah Pengeluaran</h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <select
                value={form.kategori}
                onChange={(e) =>
                  setForm({ ...form, kategori: e.target.value })
                }
                className="p-2 border rounded"
                required
              >
                <option value="" disabled>Pilih Kategori</option>
                <option value="Bibit">Bibit</option>
                <option value="Pupuk">Pupuk</option>
                <option value="Pestisida">Pestisida</option>
                <option value="Alat & Mesin">Alat & Mesin</option>
                <option value="Upah Tenaga Kerja">Upah Tenaga Kerja</option>
                <option value="Transportasi">Transportasi</option>
                <option value="Lain-lain">Lain-lain</option>
              </select>

              <input
                type="number"
                placeholder="Jumlah (Rp)"
                value={form.jumlah}
                onChange={(e) =>
                  setForm({ ...form, jumlah: parseInt(e.target.value) })
                }
                required
              />

              <textarea
                placeholder="Deskripsi pengeluaran..."
                value={form.deskripsi}
                onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
              />

              <input
                type="date"
                value={form.tanggal}
                onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
                required
              />

              <div className="flex justify-end gap-3 mt-3">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowModal(false)}
                >
                  Batal
                </button>
                <button type="submit" className="btn-simpan">
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
