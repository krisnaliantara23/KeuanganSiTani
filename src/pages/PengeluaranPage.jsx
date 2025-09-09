
import React, { useState, useEffect, useMemo } from "react";
import { getPengeluaran, addPengeluaran } from "../services/financeService";
import "../styles/pendapatan.css"; // Menggunakan style yang sama dengan pendapatan

export default function PengeluaranPage() {
  const [pengeluaran, setPengeluaran] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    kategori_id: "",
    jumlah: 0,
    deskripsi: "",
    tanggal: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const data = await getPengeluaran();
      setPengeluaran(data);
    } catch (err) {
      console.error("Gagal ambil pengeluaran:", err);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await addPengeluaran(form);
      setForm({ kategori_id: "", jumlah: 0, deskripsi: "", tanggal: "" });
      setShowModal(false);
      loadData();
    } catch (err) {
      console.error("Gagal tambah pengeluaran:", err);
    }
  }

  const transaksiTerakhir = useMemo(() => {
    if (pengeluaran.length === 0) return null;
    // Sort by date to find the most recent transaction
    const sorted = [...pengeluaran].sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
    return sorted[0];
  }, [pengeluaran]);

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

      {/* Transaksi Terakhir */}
      {transaksiTerakhir && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4 border-b pb-2">Transaksi Terakhir</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                    <p className="text-sm text-gray-500">Tanggal</p>
                    <p className="font-medium">{new Date(transaksiTerakhir.tanggal).toLocaleDateString("id-ID")}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500">Jumlah</p>
                    <p className="font-medium text-red-600">Rp {transaksiTerakhir.kredit?.toLocaleString("id-ID")}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500">Kategori</p>
                    <p className="font-medium">{transaksiTerakhir.kategori_id}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500">Deskripsi</p>
                    <p className="font-medium">{transaksiTerakhir.deskripsi || "-"}</p>
                </div>
            </div>
        </div>
      )}

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
              <tr key={item.id_laporan} className="border-t">
                <td className="p-2">{item.kategori_id}</td>
                <td className="p-2">
                  Rp {item.kredit?.toLocaleString("id-ID")}
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
                value={form.kategori_id}
                onChange={(e) =>
                  setForm({ ...form, kategori_id: e.target.value })
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
