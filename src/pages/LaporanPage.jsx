import React, { useEffect, useState } from "react";
import { getPendapatan, getPengeluaran, getNeracaSummary } from "../services/financeService";
import Neraca from "../component/Neraca"; // Impor komponen Neraca
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function LaporanPage() {
  const [activeTab, setActiveTab] = useState("labaRugi"); // State untuk tab
  const [pendapatan, setPendapatan] = useState([]);
  const [pengeluaran, setPengeluaran] = useState([]);
  const [neracaData, setNeracaData] = useState(null); // State untuk data neraca
  const [totalPendapatan, setTotalPendapatan] = useState(0);
  const [totalPengeluaran, setTotalPengeluaran] = useState(0);

  const token = localStorage.getItem("token");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      // Laba Rugi
      const dataPendapatan = await getPendapatan(token);
      const dataPengeluaran = await getPengeluaran(token);
      const pendapatanList = dataPendapatan?.data || dataPendapatan || [];
      const pengeluaranList = dataPengeluaran?.data || dataPengeluaran || [];
      setPendapatan(pendapatanList);
      setPengeluaran(pengeluaranList);
      setTotalPendapatan(pendapatanList.reduce((sum, item) => sum + (item.debit || 0), 0));
      setTotalPengeluaran(pengeluaranList.reduce((sum, item) => sum + (item.kredit || 0), 0));

      // Neraca
      const dataNeraca = await getNeracaSummary(token);
      setNeracaData(dataNeraca.data);

    } catch (err) {
      console.error("Gagal ambil laporan:", err);
    }
  }

  function exportPDF() {
    const doc = new jsPDF();
    doc.text("Laporan Keuangan Pertanian", 14, 16);

    if (activeTab === "labaRugi") {
      doc.text("Laporan Laba Rugi", 14, 22);
      // Tabel Pendapatan
      autoTable(doc, {
        head: [["Kategori", "Jumlah", "Deskripsi", "Tanggal"]],
        body: pendapatan.map((p) => [
          p.kategori_id,
          `Rp ${p.debit?.toLocaleString("id-ID")}`,
          p.deskripsi || "-",
          new Date(p.created_at).toLocaleDateString("id-ID"),
        ]),
        startY: 30,
      });

      // Tabel Pengeluaran
      autoTable(doc, {
        head: [["Kategori", "Jumlah", "Deskripsi", "Tanggal"]],
        body: pengeluaran.map((p) => [
          p.kategori_id,
          `Rp ${p.kredit?.toLocaleString("id-ID")}`,
          p.deskripsi || "-",
          new Date(p.created_at).toLocaleDateString("id-ID"),
        ]),
        startY: doc.lastAutoTable.finalY + 10,
      });
      
      const finalY = doc.lastAutoTable.finalY || 22;
      doc.text(`Total Pendapatan: Rp ${totalPendapatan.toLocaleString("id-ID")}`, 14, finalY + 20);
      doc.text(`Total Pengeluaran: Rp ${totalPengeluaran.toLocaleString("id-ID")}`, 14, finalY + 28);
      doc.text(`Saldo Akhir: Rp ${(totalPendapatan - totalPengeluaran).toLocaleString("id-ID")}`, 14, finalY + 36);
    } else {
      doc.text("Laporan Neraca", 14, 22);
      // Aset
      autoTable(doc, {
        head: [["Aset", "Nama Akun", "Jumlah"]],
        body: [
          ...(neracaData.aset_lancar?.items.map(item => ["Aset Lancar", item.produk_nama, `Rp ${item.saldo.toLocaleString('id-ID')}`]) || []),
          ...(neracaData.aset_tetap?.items.map(item => ["Aset Tetap", item.produk_nama, `Rp ${item.saldo.toLocaleString('id-ID')}`]) || []),
          ["", "Total Aset", `Rp ${neracaData.total_aset.toLocaleString('id-ID')}`]
        ],
        startY: 30,
      });
      // Kewajiban
      autoTable(doc, {
        head: [["Kewajiban", "Nama Akun", "Jumlah"]],
        body: [
          ...(neracaData.kewajiban_lancar?.items.map(item => ["Kewajiban Lancar", item.produk_nama, `Rp ${item.saldo.toLocaleString('id-ID')}`]) || []),
          ...(neracaData.kewajiban_jangka_panjang?.items.map(item => ["Kewajiban Jangka Panjang", item.produk_nama, `Rp ${item.saldo.toLocaleString('id-ID')}`]) || []),
          ["", "Total Kewajiban", `Rp ${neracaData.total_kewajiban.toLocaleString('id-ID')}`]
        ],
        startY: doc.lastAutoTable.finalY + 10,
      });
      const finalY = doc.lastAutoTable.finalY || 22;
      doc.text(`Total (Aset - Kewajiban): Rp ${neracaData.total.toLocaleString('id-ID')}`, 14, finalY + 20);
    }

    doc.save("laporan-keuangan.pdf");
  }

  const renderLabaRugi = () => (
    <>
      {/* Ringkasan */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-green-100 p-4 rounded-xl shadow">
          <h3 className="text-lg font-semibold">Total Pendapatan</h3>
          <p className="text-2xl font-bold text-green-700">Rp {totalPendapatan.toLocaleString("id-ID")}</p>
        </div>
        <div className="bg-red-100 p-4 rounded-xl shadow">
          <h3 className="text-lg font-semibold">Total Pengeluaran</h3>
          <p className="text-2xl font-bold text-red-700">Rp {totalPengeluaran.toLocaleString("id-ID")}</p>
        </div>
        <div className="bg-blue-100 p-4 rounded-xl shadow">
          <h3 className="text-lg font-semibold">Saldo Akhir</h3>
          <p className="text-2xl font-bold text-blue-700">Rp {(totalPendapatan - totalPengeluaran).toLocaleString("id-ID")}</p>
        </div>
      </div>

      {/* Tabel Pendapatan */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">Detail Pendapatan</h3>
        <table className="w-full border-collapse">
          <thead><tr className="bg-gray-100"><th className="border p-2">Kategori</th><th className="border p-2">Jumlah</th><th className="border p-2">Deskripsi</th><th className="border p-2">Tanggal</th></tr></thead>
          <tbody>
            {pendapatan.length > 0 ? (
              pendapatan.map((p, idx) => (
                <tr key={idx}><td className="border p-2">{p.kategori_id}</td><td className="border p-2">Rp {p.debit?.toLocaleString("id-ID")}</td><td className="border p-2">{p.deskripsi || "-"}</td><td className="border p-2">{new Date(p.created_at).toLocaleDateString("id-ID")}</td></tr>
              ))
            ) : (
              <tr><td colSpan="4" className="border p-2 text-center">Tidak ada data pendapatan</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Tabel Pengeluaran */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4">Detail Pengeluaran</h3>
        <table className="w-full border-collapse">
          <thead><tr className="bg-gray-100"><th className="border p-2">Kategori</th><th className="border p-2">Jumlah</th><th className="border p-2">Deskripsi</th><th className="border p-2">Tanggal</th></tr></thead>
          <tbody>
            {pengeluaran.length > 0 ? (
              pengeluaran.map((p, idx) => (
                <tr key={idx}><td className="border p-2">{p.kategori_id}</td><td className="border p-2">Rp {p.kredit?.toLocaleString("id-ID")}</td><td className="border p-2">{p.deskripsi || "-"}</td><td className="border p-2">{new Date(p.created_at).toLocaleDateString("id-ID")}</td></tr>
              ))
            ) : (
              <tr><td colSpan="4" className="border p-2 text-center">Tidak ada data pengeluaran</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );

  return (
    <div className="p-6">
      {/* Header + Export */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold">Laporan Keuangan</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onClick={exportPDF}>
          Export PDF
        </button>
      </div>

      {/* Tab Buttons */}
      <div className="mb-6 flex border-b">
        <button onClick={() => setActiveTab("labaRugi")} className={`py-2 px-4 font-semibold ${activeTab === 'labaRugi' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>
          Laporan Laba Rugi
        </button>
        <button onClick={() => setActiveTab("neraca")} className={`py-2 px-4 font-semibold ${activeTab === 'neraca' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>
          Laporan Neraca
        </button>
      </div>

      {/* Content based on active tab */}
      {activeTab === "labaRugi" ? renderLabaRugi() : <Neraca data={neracaData} />}
    </div>
  );
}
