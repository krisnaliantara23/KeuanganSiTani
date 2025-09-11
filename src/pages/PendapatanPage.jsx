import React, { useEffect, useState, useMemo } from "react";
import {
  getPendapatan,
  addPendapatan,
  getAkunKas,
} from "../services/financeService";
import { getProduk } from "../services/productService";
import "../styles/pendapatan.css";

export default function PendapatanPage() {
  const [pendapatan, setPendapatan] = useState([]);
  const [produkList, setProdukList] = useState([]);
  const [akunList, setAkunList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    produk_id: "",
    akun_id: "",
    jumlah: 0,
    deskripsi: "",
    tanggal: "",
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    try {
      const [dataPendapatan, dataProduk, dataAkun] = await Promise.all([
        getPendapatan(token),
        getProduk(token),
        getAkunKas(token),
      ]);
      setPendapatan(dataPendapatan || []);
      setProdukList(dataProduk || []);
      setAkunList(dataAkun || []);
    } catch (err) {
      console.error("Gagal ambil data awal:", err);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        produk_id: parseInt(form.produk_id),
        akun_id: parseInt(form.akun_id),
      };
      await addPendapatan(token, payload);
      setForm({ produk_id: "", akun_id: "", jumlah: 0, deskripsi: "", tanggal: "" });
      setShowModal(false);
      loadInitialData();
    } catch (err) {
      console.error("Gagal tambah pendapatan:", err);
    }
  }

  const transaksiTerakhir = useMemo(() => {
    if (pendapatan.length === 0) return null;
    const sorted = [...pendapatan].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );
    return sorted[0];
  }, [pendapatan]);

  return (
    <>
      {/* Header */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold">Pendapatan Pertanian</h2>
        <button
          className="bg-green-600 text-white px-4 py-2 rounded"
          onClick={() => setShowModal(true)}
        >
          + Tambah Pendapatan
        </button>
      </div>

      {/* ... sisa komponen ... */}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3 className="text-xl font-bold mb-4">Tambah Pendapatan</h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <select
                value={form.akun_id}
                onChange={(e) => setForm({ ...form, akun_id: e.target.value })}
                required
              >
                <option value="" disabled>Pilih Akun Kas</option>
                {akunList.map((akun) => (
                  <option key={akun.id} value={akun.id}>
                    {akun.nama}
                  </option>
                ))}
              </select>

              <select
                value={form.produk_id}
                onChange={(e) => setForm({ ...form, produk_id: e.target.value })}
                required
              >
                <option value="" disabled>Pilih Produk</option>
                {produkList.map((produk) => (
                  <option key={produk.id} value={produk.id}>
                    {produk.nama}
                  </option>
                ))}
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
