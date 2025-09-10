// src/pages/BerandaPage.jsx
import React, { useMemo } from "react";
import { useData } from "../context/DataContext";
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
} from "recharts";
import { ArrowUpRight, ArrowDownRight, DollarSign, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function BerandaPage() {
  const { pendapatan, pengeluaran, loading, error } = useData();
  const navigate = useNavigate();

  // Ambil user dari localStorage
  const user = localStorage.getItem("user");
  const username = user ? JSON.parse(user).username : "Pengguna";

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Hitung ringkasan bulan ini
  const { totalPendapatanBulanIni, totalPengeluaranBulanIni, saldoAkhir } =
    useMemo(() => {
      const now = new Date();
      const month = now.getMonth();
      const year = now.getFullYear();

      const totalPendapatan = pendapatan.reduce(
        (sum, item) => sum + item.jumlah,
        0
      );
      const totalPengeluaran = pengeluaran.reduce(
        (sum, item) => sum + item.jumlah,
        0
      );

      const totalPendapatanBulanIni = pendapatan
        .filter((p) => {
          const tgl = new Date(p.id);
          return tgl.getMonth() === month && tgl.getFullYear() === year;
        })
        .reduce((sum, item) => sum + item.jumlah, 0);

      const totalPengeluaranBulanIni = pengeluaran
        .filter((p) => {
          const tgl = new Date(p.id);
          return tgl.getMonth() === month && tgl.getFullYear() === year;
        })
        .reduce((sum, item) => sum + item.jumlah, 0);

      return {
        totalPendapatanBulanIni,
        totalPengeluaranBulanIni,
        saldoAkhir: totalPendapatan - totalPengeluaran,
      };
    }, [pendapatan, pengeluaran]);

  // Data chart 6 bulan terakhir
  const chartData = useMemo(() => {
    const data = [];
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const month = d.getMonth();
      const year = d.getFullYear();
      const monthName = d.toLocaleString("default", { month: "short" });

      const p = pendapatan
        .filter((item) => {
          const tgl = new Date(item.id);
          return tgl.getMonth() === month && tgl.getFullYear() === year;
        })
        .reduce((sum, item) => sum + item.jumlah, 0);

      const k = pengeluaran
        .filter((item) => {
          const tgl = new Date(item.id);
          return tgl.getMonth() === month && tgl.getFullYear() === year;
        })
        .reduce((sum, item) => sum + item.jumlah, 0);

      data.push({ name: monthName, Pendapatan: p, Pengeluaran: k });
    }
    return data;
  }, [pendapatan, pengeluaran]);

  // Transaksi terakhir
  const recentTransactions = useMemo(() => {
    const all = [
      ...pendapatan.map((p) => ({ ...p, type: "pendapatan" })),
      ...pengeluaran.map((e) => ({ ...e, type: "pengeluaran" })),
    ];
    return all.sort((a, b) => new Date(b.id) - new Date(a.id)).slice(0, 5);
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
      {/* Header User */}
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold">
          Selamat datang, <span className="text-blue-600">{username}</span> 👋
        </h2>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow"
        >
          <LogOut size={18} /> Logout
        </button>
      </div>

      {/* Summary Cards */}
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

      {/* Chart & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold mb-4">
            Ringkasan 6 Bulan Terakhir
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => `Rp ${value.toLocaleString()}`} />
              <Legend />
              <Bar dataKey="Pendapatan" fill="#16a34a" />
              <Bar dataKey="Pengeluaran" fill="#dc2626" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold mb-4">Transaksi Terakhir</h3>
          <div className="space-y-4">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium">{item.kategori}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(item.id).toLocaleDateString()}
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
    </div>
  );
}
