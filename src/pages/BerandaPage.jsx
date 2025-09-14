// src/pages/BerandaPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { getPendapatan, getPengeluaran } from "../services/financeService";
import { getProducts } from "../services/productService";
import SummaryCard from "../component/SummaryCard";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { ArrowUpRight, ArrowDownRight, DollarSign } from "lucide-react";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF", "#FF1919"];

export default function BerandaPage() {
  const [pendapatan, setPendapatan] = useState([]);
  const [pengeluaran, setPengeluaran] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");
  const username = user ? JSON.parse(user).username : "Pengguna";

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [dataPendapatan, dataPengeluaran, productData] = await Promise.all([
          getPendapatan(token),
          getPengeluaran(token),
          getProducts(),
        ]);
        setPendapatan(Array.isArray(dataPendapatan) ? dataPendapatan : []);
        setPengeluaran(Array.isArray(dataPengeluaran) ? dataPengeluaran : []);
        setProducts(Array.isArray(productData.data.data) ? productData.data.data : []);
        setError(null);
      } catch (err) {
        console.error("Gagal memuat data beranda:", err);
        setError(err.message || "Gagal memuat data");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [token]);

  const { totalPendapatanBulanIni, totalPengeluaranBulanIni, saldoAkhir } = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const filterByCurrentMonth = (item) => {
      const itemDate = new Date(item.tanggal || item.created_at);
      return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
    };

    const totalPendapatan = pendapatan.reduce((sum, item) => sum + (item.debit || 0), 0);
    const totalPengeluaran = pengeluaran.reduce((sum, item) => sum + (item.kredit || 0), 0);

    const totalPendapatanBulanIni = pendapatan
      .filter(filterByCurrentMonth)
      .reduce((sum, item) => sum + (item.debit || 0), 0);

    const totalPengeluaranBulanIni = pengeluaran
      .filter(filterByCurrentMonth)
      .reduce((sum, item) => sum + (item.kredit || 0), 0);

    return {
      totalPendapatanBulanIni,
      totalPengeluaranBulanIni,
      saldoAkhir: totalPendapatan - totalPengeluaran,
    };
  }, [pendapatan, pengeluaran]);

  const yearlyChartData = useMemo(() => {
    const data = [];
    const today = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const month = d.getMonth();
      const year = d.getFullYear();
      const monthName = d.toLocaleString("default", { month: "short" });

      const p = pendapatan
        .filter((item) => {
          const tgl = new Date(item.tanggal || item.created_at);
          return tgl.getMonth() === month && tgl.getFullYear() === year;
        })
        .reduce((sum, item) => sum + (item.debit || 0), 0);

      const k = pengeluaran
        .filter((item) => {
          const tgl = new Date(item.tanggal || item.created_at);
          return tgl.getMonth() === month && tgl.getFullYear() === year;
        })
        .reduce((sum, item) => sum + (item.kredit || 0), 0);

      data.push({ name: `${monthName} ${year.toString().slice(-2)}`, Pendapatan: p, Pengeluaran: k });
    }
    return data;
  }, [pendapatan, pengeluaran]);

  const expenseCompositionData = useMemo(() => {
    const categoryTotals = pengeluaran.reduce((acc, item) => {
      const category = item.kategori?.nama_kategori || "Lain-lain";
      const amount = item.kredit || 0;
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += amount;
      return acc;
    }, {});

    return Object.keys(categoryTotals).map(category => ({
      name: category,
      value: categoryTotals[category],
    }));
  }, [pengeluaran]);

  const commodityAnalysisData = useMemo(() => {
    if (!products.length) return [];

    return products.map(product => {
      const relatedPendapatan = pendapatan.filter(p => 
        p.items && p.items.some(item => item.produk_id === product.id_produk)
      );
      const relatedPengeluaran = pengeluaran.filter(e => 
        e.items && e.items.some(item => item.produk_id === product.id_produk)
      );

      const totalPendapatan = relatedPendapatan.reduce((sum, item) => sum + (item.debit || 0), 0);
      const totalPengeluaran = relatedPengeluaran.reduce((sum, item) => sum + (item.kredit || 0), 0);
      const keuntungan = totalPendapatan - totalPengeluaran;

      return {
        name: product.nama_produk,
        Pendapatan: totalPendapatan,
        Pengeluaran: totalPengeluaran,
        Keuntungan: keuntungan,
      };
    });
  }, [pendapatan, pengeluaran, products]);

  const recentTransactions = useMemo(() => {
    const all = [
      ...pendapatan.map((p) => ({ ...p, type: "pendapatan", jumlah: p.debit, tanggal: p.tanggal || p.created_at })),
      ...pengeluaran.map((e) => ({ ...e, type: "pengeluaran", jumlah: e.kredit, tanggal: e.tanggal || e.created_at })),
    ];
    return all.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal)).slice(0, 5);
  }, [pendapatan, pengeluaran]);

  if (loading) {
    return <div className="text-center p-8">Memuat data...</div>;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-lg shadow">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold">
          Selamat datang, <span className="text-blue-600">{username}</span> 👋
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard
          title="Pendapatan Bulan Ini"
          value={`Rp ${totalPendapatanBulanIni.toLocaleString()}`}
          icon={<ArrowUpRight size={24} />}
          color="border-green-500"
        />
        <SummaryCard
          title="Pengeluaran Bulan Ini"
          value={`Rp ${totalPengeluaranBulanIni.toLocaleString()}`}
          icon={<ArrowDownRight size={24} />}
          color="border-red-500"
        />
        <SummaryCard
          title="Total Saldo"
          value={`Rp ${saldoAkhir.toLocaleString()}`}
          icon={<DollarSign size={24} />}
          color="border-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold mb-4">
            Ringkasan 12 Bulan Terakhir
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={yearlyChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => `Rp ${value.toLocaleString()}`}/>
              <Legend />
              <Bar dataKey="Pendapatan" fill="#16a34a" />
              <Bar dataKey="Pengeluaran" fill="#dc2626" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold mb-4">Transaksi Terakhir</h3>
          <div className="space-y-4">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((item) => (
                <div
                  key={item.id_laporan}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium">{item.deskripsi || "-"}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(item.tanggal).toLocaleDateString()}
                    </p>
                  </div>
                  <p
                    className={`font-bold ${
                      item.type === "pendapatan"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {item.type === "pendapatan" ? "+" : "-"} Rp{" "}
                    {item.jumlah.toLocaleString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">Tidak ada transaksi.</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold mb-4">Komposisi Pengeluaran</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={expenseCompositionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={(props) => `${props.name} (${(props.percent * 100).toFixed(0)}%)`}
              >
                {expenseCompositionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `Rp ${value.toLocaleString()}`}/>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold mb-4">Analisis per Komoditas</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={commodityAnalysisData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" width={100} />
              <Tooltip formatter={(value) => `Rp ${value.toLocaleString()}`}/>
              <Legend />
              <Bar dataKey="Pendapatan" fill="#16a34a" />
              <Bar dataKey="Pengeluaran" fill="#dc2626" />
              <Bar dataKey="Keuntungan" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}