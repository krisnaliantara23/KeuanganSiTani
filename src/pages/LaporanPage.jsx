import React, { useEffect, useState } from "react";
import { getPendapatan, getPengeluaran } from "../services/financeService";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function LaporanPage() {
  const [pendapatan, setPendapatan] = useState([]);
  const [pengeluaran, setPengeluaran] = useState([]);
  const [totalPendapatan, setTotalPendapatan] = useState(0);
  const [totalPengeluaran, setTotalPengeluaran] = useState(0);

  const token = localStorage.getItem("token");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const dataPendapatan = await getPendapatan(token);
      const dataPengeluaran = await getPengeluaran(token);

      const pendapatanList = dataPendapatan?.data || dataPendapatan || [];
      const pengeluaranList = dataPengeluaran?.data || dataPengeluaran || [];

      setPendapatan(pendapatanList);
      setPengeluaran(pengeluaranList);

      setTotalPendapatan(
        pendapatanList.reduce((sum, item) => sum + (item.debit || 0), 0)
      );
      setTotalPengeluaran(
        pengeluaranList.reduce((sum, item) => sum + (item.kredit || 0), 0)
      );
    } catch (err) {
      console.error("Gagal ambil laporan:", err);
    }
  }

  function exportPDF() {
    const doc = new jsPDF();
    doc.text("Laporan Keuangan Pertanian", 14, 16);

    // Tabel Pendapatan
    autoTable(doc, {
      head: [["Kategori", "Jumlah", "Deskripsi", "Tanggal"]],
      body: pendapatan.map((p) => [
        p.kategori_id,
        `Rp ${p.debit?.toLocaleString("id-ID")}`,
        p.deskripsi || "-",
        new Date(p.tanggal).toLocaleDateString("id-ID"),
      ]),
      startY: 22,
    });

    // Tabel Pengeluaran
    autoTable(doc, {
      head: [["Kategori", "Jumlah", "Deskripsi", "Tanggal"]],
      body: pengeluaran.map((p) => [
        p.kategori_id,
        `Rp ${p.kredit?.toLocaleString("id-ID")}`,
        p.deskripsi || "-",
        new Date(p.tanggal).toLocaleDateString("id-ID"),
      ]),
      startY: doc.lastAutoTable.finalY + 10,
    });

    // Ringkasan
    const finalY = doc.lastAutoTable.finalY || 22;
    doc.text(
      `Total Pendapatan: Rp ${totalPendapatan.toLocaleString("id-ID")}`,
      14,
      finalY + 20
    );
    doc.text(
      `Total Pengeluaran: Rp ${totalPengeluaran.toLocaleString("id-ID")}`,
      14,
      finalY + 28
    );
    doc.text(
      `Saldo Akhir: Rp ${(totalPendapatan - totalPengeluaran).toLocaleString(
        "id-ID"
      )}`,
      14,
      finalY + 36
    );

    doc.save("laporan-keuangan.pdf");
  }

  return (
    <div className="p-6">
      {/* Header + Export */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold">Laporan Keuangan</h2>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={exportPDF}
        >
          Export PDF
        </button>
      </div>

      {/* Ringkasan */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-green-100 p-4 rounded-xl shadow">
          <h3 className="text-lg font-semibold">Total Pendapatan</h3>
          <p className="text-2xl font-bold text-green-700">
            Rp {totalPendapatan.toLocaleString("id-ID")}
          </p>
        </div>
        <div className="bg-red-100 p-4 rounded-xl shadow">
          <h3 className="text-lg font-semibold">Total Pengeluaran</h3>
          <p className="text-2xl font-bold text-red-700">
            Rp {totalPengeluaran.toLocaleString("id-ID")}
          </p>
        </div>
        <div className="bg-blue-100 p-4 rounded-xl shadow">
          <h3 className="text-lg font-semibold">Saldo Akhir</h3>
          <p className="text-2xl font-bold text-blue-700">
            Rp {(totalPendapatan - totalPengeluaran).toLocaleString("id-ID")}
          </p>
        </div>
      </div>

      {/* Tabel Pendapatan */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">Detail Pendapatan</h3>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Kategori</th>
              <th className="border p-2">Jumlah</th>
              <th className="border p-2">Deskripsi</th>
              <th className="border p-2">Tanggal</th>
            </tr>
          </thead>
          <tbody>
            {pendapatan.length > 0 ? (
              pendapatan.map((p, idx) => (
                <tr key={idx}>
                  <td className="border p-2">{p.kategori_id}</td>
                  <td className="border p-2">
                    Rp {p.debit?.toLocaleString("id-ID")}
                  </td>
                  <td className="border p-2">{p.deskripsi || "-"}</td>
                  <td className="border p-2">
                    {new Date(p.tanggal).toLocaleDateString("id-ID")}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="border p-2 text-center">
                  Tidak ada data pendapatan
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Tabel Pengeluaran */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4">Detail Pengeluaran</h3>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Kategori</th>
              <th className="border p-2">Jumlah</th>
              <th className="border p-2">Deskripsi</th>
              <th className="border p-2">Tanggal</th>
            </tr>
          </thead>
          <tbody>
            {pengeluaran.length > 0 ? (
              pengeluaran.map((p, idx) => (
                <tr key={idx}>
                  <td className="border p-2">{p.kategori_id}</td>
                  <td className="border p-2">
                    Rp {p.kredit?.toLocaleString("id-ID")}
                  </td>
                  <td className="border p-2">{p.deskripsi || "-"}</td>
                  <td className="border p-2">
                    {new Date(p.tanggal).toLocaleDateString("id-ID")}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="border p-2 text-center">
                  Tidak ada data pengeluaran
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
