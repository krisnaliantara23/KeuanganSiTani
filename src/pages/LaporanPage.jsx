import React from "react";
import Sidebar from "../component/Sidebar";
import Header from "../component/Header";
import Footer from "../component/Footer";
import SummaryCard from "../component/SummaryCard";
import { useData } from "../context/DataContext";

import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function LaporanPage() {
  const { pendapatan, pengeluaran } = useData();

  // Hitung total dan saldo
  const totalPendapatan = pendapatan.reduce((a, b) => a + b.jumlah, 0);
  const totalPengeluaran = pengeluaran.reduce((a, b) => a + b.jumlah, 0);
  const saldoAkhir = totalPendapatan - totalPengeluaran;

  // Data grafik bulanan
  const bulanList = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
  const dataGrafik = bulanList.map((bulan, idx) => {
    const sumPend = pendapatan
      .filter(p => new Date(p.id).getMonth() === idx)
      .reduce((s, p) => s + p.jumlah, 0);
    const sumPeng = pengeluaran
      .filter(e => new Date(e.id).getMonth() === idx)
      .reduce((s, e) => s + e.jumlah, 0);
    return { name: bulan, pendapatan: sumPend, pengeluaran: sumPeng };
  });

  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1 bg-gray-50 min-h-screen p-6">
        <Header />

        {/* Ringkasan */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
          <SummaryCard title="Total Pendapatan" value={`Rp ${totalPendapatan.toLocaleString()}`} color="border-green-500" />
          <SummaryCard title="Total Pengeluaran" value={`Rp ${totalPengeluaran.toLocaleString()}`} color="border-red-500" />
          <SummaryCard title="Saldo Akhir" value={`Rp ${saldoAkhir.toLocaleString()}`} color="border-blue-500" />
        </div>

        {/* Grafik */}
        <div className="bg-white p-5 rounded-xl shadow-md mb-6">
          <h3 className="text-lg font-semibold mb-4">Grafik Laporan Keuangan</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dataGrafik}>
              <Line type="monotone" dataKey="pendapatan" stroke="#16a34a" strokeWidth={2} />
              <Line type="monotone" dataKey="pengeluaran" stroke="#dc2626" strokeWidth={2} />
              <CartesianGrid stroke="#e5e7eb" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(v) => `Rp ${v.toLocaleString()}`} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Tabel Laporan */}
        <div className="bg-white p-5 rounded-xl shadow-md mb-6">
          <h3 className="text-lg font-semibold mb-4">Daftar Transaksi</h3>
          <table className="w-full text-left border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2">Jenis</th>
                <th className="p-2">Kategori</th>
                <th className="p-2">Jumlah</th>
                <th className="p-2">Deskripsi</th>
                <th className="p-2">Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {pendapatan.map(item => (
                <tr key={item.id} className="border-t">
                  <td className="p-2 text-green-600">Pendapatan</td>
                  <td className="p-2">{item.kategori}</td>
                  <td className="p-2">Rp {item.jumlah.toLocaleString()}</td>
                  <td className="p-2">{item.deskripsi}</td>
                  <td className="p-2">{new Date(item.id).toLocaleDateString()}</td>
                </tr>
              ))}
              {pengeluaran.map(item => (
                <tr key={item.id} className="border-t">
                  <td className="p-2 text-red-600">Pengeluaran</td>
                  <td className="p-2">{item.kategori}</td>
                  <td className="p-2">Rp {item.jumlah.toLocaleString()}</td>
                  <td className="p-2">{item.deskripsi}</td>
                  <td className="p-2">{new Date(item.id).toLocaleDateString()}</td>
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
