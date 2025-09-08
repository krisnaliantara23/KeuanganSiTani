
import React, { useState, useMemo } from "react";
import SummaryCard from "../component/SummaryCard";
import { useData } from "../context/DataContext";
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function LaporanPage() {
  const { pendapatan, pengeluaran } = useData();
  const [bulan, setBulan] = useState(new Date().getMonth());
  const [tahun, setTahun] = useState(new Date().getFullYear());

  const filteredData = useMemo(() => {
    const filteredPendapatan = pendapatan.filter(
      (p) =>
        new Date(p.id).getMonth() === bulan &&
        new Date(p.id).getFullYear() === tahun
    );
    const filteredPengeluaran = pengeluaran.filter(
      (e) =>
        new Date(e.id).getMonth() === bulan &&
        new Date(e.id).getFullYear() === tahun
    );
    return { filteredPendapatan, filteredPengeluaran };
  }, [pendapatan, pengeluaran, bulan, tahun]);

  const totalPendapatan = filteredData.filteredPendapatan.reduce(
    (a, b) => a + b.jumlah,
    0
  );
  const totalPengeluaran = filteredData.filteredPengeluaran.reduce(
    (a, b) => a + b.jumlah,
    0
  );
  const keuntungan = totalPendapatan - totalPengeluaran;

  const bulanList = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];
  const tahunList = [
    ...new Set(
      [...pendapatan, ...pengeluaran].map((d) => new Date(d.id).getFullYear())
    ),
  ];

  const trendData = useMemo(() => {
    return bulanList.map((namaBulan, idx) => {
      const p = pendapatan
        .filter((item) => new Date(item.id).getMonth() === idx && new Date(item.id).getFullYear() === tahun)
        .reduce((sum, item) => sum + item.jumlah, 0);
      const k = pengeluaran
        .filter((item) => new Date(item.id).getMonth() === idx && new Date(item.id).getFullYear() === tahun)
        .reduce((sum, item) => sum + item.jumlah, 0);
      return { name: namaBulan.substring(0, 3), keuntungan: p - k };
    });
  }, [pendapatan, pengeluaran, tahun]);

  const komposisiPengeluaran = useMemo(() => {
    const grouped = filteredData.filteredPengeluaran.reduce((acc, curr) => {
      acc[curr.kategori] = (acc[curr.kategori] || 0) + curr.jumlah;
      return acc;
    }, {});
    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }, [filteredData.filteredPengeluaran]);

  const analisisKomoditas = useMemo(() => {
    const komoditas = {};
    filteredData.filteredPendapatan.forEach(p => {
        komoditas[p.kategori] = { ...komoditas[p.kategori], pendapatan: (komoditas[p.kategori]?.pendapatan || 0) + p.jumlah };
    });
    filteredData.filteredPengeluaran.forEach(e => {
        komoditas[e.kategori] = { ...komoditas[e.kategori], pengeluaran: (komoditas[e.kategori]?.pengeluaran || 0) + e.jumlah };
    });

    return Object.entries(komoditas).map(([nama, data]) => ({
        nama,
        pendapatan: data.pendapatan || 0,
        pengeluaran: data.pengeluaran || 0,
        laba: (data.pendapatan || 0) - (data.pengeluaran || 0)
    }));
  }, [filteredData]);


  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text(`Laporan Keuangan - ${bulanList[bulan]} ${tahun}`, 14, 16);
    
    doc.autoTable({
        startY: 22,
        head: [['Total Pendapatan', 'Total Pengeluaran', 'Keuntungan']],
        body: [[`Rp ${totalPendapatan.toLocaleString()}`, `Rp ${totalPengeluaran.toLocaleString()}`, `Rp ${keuntungan.toLocaleString()}`]],
        theme: 'grid'
    });

    doc.text("Daftar Transaksi", 14, doc.autoTable.previous.finalY + 10);
    const tableData = [
        ...filteredData.filteredPendapatan.map(p => ['Pendapatan', p.kategori, `Rp ${p.jumlah.toLocaleString()}`, p.deskripsi, new Date(p.id).toLocaleDateString()]),
        ...filteredData.filteredPengeluaran.map(e => ['Pengeluaran', e.kategori, `Rp ${e.jumlah.toLocaleString()}`, e.deskripsi, new Date(e.id).toLocaleDateString()])
    ];
    
    doc.autoTable({
        startY: doc.autoTable.previous.finalY + 15,
        head: [['Jenis', 'Kategori', 'Jumlah', 'Deskripsi', 'Tanggal']],
        body: tableData,
        theme: 'striped'
    });

    doc.save(`laporan_${bulanList[bulan]}_${tahun}.pdf`);
  };

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  return (
    <>
      {/* Headline & Filter */}
      <div className="bg-white p-5 rounded-xl shadow-md mb-6">
          <div className="flex justify-between items-center mb-4">
              <div>
                  <h2 className="text-2xl font-bold">Laporan Keuangan</h2>
                  <p className="text-gray-500">Analisis Keuangan Anda dalam Genggaman</p>
              </div>
              <div className="flex gap-4">
                  <select value={bulan} onChange={e => setBulan(parseInt(e.target.value))} className="border p-2 rounded">
                      {bulanList.map((b, i) => <option key={i} value={i}>{b}</option>)}
                  </select>
                  <select value={tahun} onChange={e => setTahun(parseInt(e.target.value))} className="border p-2 rounded">
                      {tahunList.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <button onClick={exportPDF} className="bg-blue-600 text-white px-4 py-2 rounded">
                      Export PDF
                  </button>
              </div>
          </div>
          <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded-md">
              <h3 className="font-bold">Keuntungan Bulan Ini</h3>
              <p className="text-xl">Rp {keuntungan.toLocaleString()}</p>
          </div>
      </div>

      {/* Ringkasan */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
        <SummaryCard title="Total Pendapatan" value={`Rp ${totalPendapatan.toLocaleString()}`} color="border-green-500" />
        <SummaryCard title="Total Pengeluaran" value={`Rp ${totalPengeluaran.toLocaleString()}`} color="border-red-500" />
        <SummaryCard title="Keuntungan" value={`Rp ${keuntungan.toLocaleString()}`} color="border-blue-500" />
      </div>

      {/* Grafik Tren & Komposisi */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-5 rounded-xl shadow-md">
              <h3 className="text-lg font-semibold mb-4">Tren Keuntungan (per Bulan)</h3>
              <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(v) => `Rp ${v.toLocaleString()}`} />
                      <Bar dataKey="keuntungan">
                          {trendData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.keuntungan >= 0 ? '#16a34a' : '#dc2626'} />
                          ))}
                      </Bar>
                  </BarChart>
              </ResponsiveContainer>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-md">
              <h3 className="text-lg font-semibold mb-4">Komposisi Pengeluaran</h3>
              <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                      <Pie data={komposisiPengeluaran} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                          {komposisiPengeluaran.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                      </Pie>
                      <Tooltip formatter={(v) => `Rp ${v.toLocaleString()}`} />
                  </PieChart>
              </ResponsiveContainer>
          </div>
      </div>
      
      {/* Analisis per Komoditas */}
      <div className="bg-white p-5 rounded-xl shadow-md mb-6">
        <h3 className="text-lg font-semibold mb-4">Analisis per Komoditas</h3>
        <table className="w-full text-left border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">Komoditas</th>
              <th className="p-2">Total Pendapatan</th>
              <th className="p-2">Total Pengeluaran</th>
              <th className="p-2">Laba/Rugi</th>
            </tr>
          </thead>
          <tbody>
            {analisisKomoditas.map(item => (
              <tr key={item.nama} className="border-t">
                <td className="p-2 font-medium">{item.nama}</td>
                <td className="p-2 text-green-600">Rp {item.pendapatan.toLocaleString()}</td>
                <td className="p-2 text-red-600">Rp {item.pengeluaran.toLocaleString()}</td>
                <td className={`p-2 font-bold ${item.laba >= 0 ? 'text-green-700' : 'text-red-700'}`}>Rp {item.laba.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
