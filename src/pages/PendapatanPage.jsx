import React, { useEffect, useState, useMemo } from "react";
import { getPendapatan, addPendapatan } from "../services/financeService";
import "../styles/pendapatan.css";

export default function PendapatanPage() {
  const [pendapatan, setPendapatan] = useState([]);
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
      const data = await getPendapatan();
      setPendapatan(data);
    } catch (err) {
      console.error("Gagal ambil pendapatan:", err);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await addPendapatan(form);
      setForm({ kategori_id: "", jumlah: 0, deskripsi: "", tanggal: "" });
      setShowModal(false);
      loadData();
    } catch (err) {
      console.error("Gagal tambah pendapatan:", err);
    }
  }

  const transaksiTerakhir = useMemo(() => {
    if (pendapatan.length === 0) return null;
    // Sort by date to find the most recent transaction
    const sorted = [...pendapatan].sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
    return sorted[0];
  }, [pendapatan]);

  return (
    <>
      {/* Header section */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold">Pendapatan Pertanian</h2>
        <button
          className="bg-green-600 text-white px-4 py-2 rounded"
          onClick={() => setShowModal(true)}
        >
          + Tambah Pendapatan
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
                    <p className="font-medium text-green-600">Rp {transaksiTerakhir.debit?.toLocaleString("id-ID")}</p>
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
        <h3 className="text-lg font-semibold mb-4">Riwayat Pendapatan</h3>
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
            {pendapatan.map((item) => (
              <tr key={item.id_laporan} className="border-t">
                <td className="p-2">{item.kategori_id}</td>
                <td className="p-2">
                  Rp {item.debit?.toLocaleString("id-ID")}
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
            <h3 className="text-xl font-bold mb-4">Tambah Pendapatan</h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <select
                value={form.kategori_id}
                onChange={(e) =>
                  setForm({ ...form, kategori_id: e.target.value })
                }
                required
              >
                <option value="">Pilih kategori</option>
                <option value="Kentang">Kentang</option>
                <option value="Selada">Selada</option>
                <option value="Bawang">Bawang</option>
                <option value="Sawi">Sawi</option>
                <option value="Bawang_Prei">Bawang Prei</option>
                <option value="Serai">Serai</option>
                <option value="Jagung">Jagung</option>
                <option value="Tomat">Tomat</option>
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
                placeholder="Deskripsi pendapatan..."
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
