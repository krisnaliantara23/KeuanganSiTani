// src/pages/BerandaPage.jsx
import { useEffect, useState } from "react";
import { Card, CardContent } from "../component/ui/Card";
import "../styles/beranda.css";
import { FaArrowUp, FaArrowDown, FaChartLine } from "react-icons/fa";
import Sidebar from "../component/Sidebar";

export default function BerandaPage() {
  const [saldo, setSaldo] = useState(null);
  const [summary, setSummary] = useState({});
  const [transaksi, setTransaksi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setError(null);

        const resSaldo = await fetch("http://localhost:5000/api/saldo");
        const dataSaldo = await resSaldo.json();
        setSaldo(dataSaldo.saldo);

        const resSummary = await fetch("http://localhost:5000/api/summary");
        const dataSummary = await resSummary.json();
        setSummary(dataSummary);

        const resTransaksi = await fetch(
          "http://localhost:5000/api/transaksi?limit=3"
        );
        const dataTransaksi = await resTransaksi.json();
        setTransaksi(dataTransaksi);
      } catch (err) {
        console.error("Gagal fetch data:", err);
        setError("Gagal memuat data, coba lagi nanti.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Konten utama */}
      <main className="flex-1 p-8 md:ml-64 space-y-6 transition-all duration-300 ease-in-out overflow-y-auto">
        {/* Error message */}
        {error && (
          <div className="p-4 bg-red-100 text-red-700 rounded-lg shadow">
            {error}
          </div>
        )}

        {/* Header Saldo */}
        <div className="header-saldo">
          <h2>Saldo Saat Ini</h2>
          <p>{loading ? "Loading..." : `Rp ${saldo?.toLocaleString()}`}</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="summary-card">
            <CardContent className="summary-content">
              <div className="summary-icon bg-green-100">
                <FaArrowUp className="text-green-600" size={24} />
              </div>
              <div>
                <p>Pendapatan Bulan Ini</p>
                <h3 className="text-green-700">
                  {loading
                    ? "Loading..."
                    : `Rp ${summary.pendapatan?.toLocaleString()}`}
                </h3>
                <span className="text-green-500">
                  {summary.pendapatanPersen || ""}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="summary-card">
            <CardContent className="summary-content">
              <div className="summary-icon bg-red-100">
                <FaArrowDown className="text-red-600" size={24} />
              </div>
              <div>
                <p>Pengeluaran Bulan Ini</p>
                <h3 className="text-red-700">
                  {loading
                    ? "Loading..."
                    : `Rp ${summary.pengeluaran?.toLocaleString()}`}
                </h3>
                <span className="text-red-500">
                  {summary.pengeluaranPersen || ""}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="summary-card">
            <CardContent className="summary-content">
              <div className="summary-icon bg-blue-100">
                <FaChartLine className="text-blue-600" size={24} />
              </div>
              <div>
                <p>Keuntungan Bulan Ini</p>
                <h3 className="text-blue-700">
                  {loading
                    ? "Loading..."
                    : `Rp ${summary.keuntungan?.toLocaleString()}`}
                </h3>
                <span className="text-blue-500">
                  {summary.keuntunganPersen || ""}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chart + Transaksi Terakhir */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Chart Card */}
          <Card className="chart-card">
            <CardContent>
              <h3 className="chart-title">Pendapatan vs Pengeluaran</h3>
              <div className="chart-placeholder">
                📊 Chart data dari API nanti dimasukin sini
              </div>
            </CardContent>
          </Card>

          {/* Transaksi Terakhir */}
          <Card className="transaksi-card">
            <CardContent>
              <div className="transaksi-header">
                <h3>Transaksi Terakhir</h3>
                <button className="lihat-semua-btn">Lihat Semua</button>
              </div>
              <ul className="transaksi-list">
                {loading ? (
                  <p>Loading...</p>
                ) : transaksi.length > 0 ? (
                  transaksi.map((item, idx) => (
                    <li key={idx} className="transaksi-item">
                      <div>
                        <p>{item.nama}</p>
                        <span>{item.waktu}</span>
                      </div>
                      <span
                        className={
                          item.nominal > 0
                            ? "transaksi-nominal-plus"
                            : "transaksi-nominal-minus"
                        }
                      >
                        {item.nominal > 0
                          ? `+ Rp ${item.nominal.toLocaleString()}`
                          : `- Rp ${Math.abs(item.nominal).toLocaleString()}`}
                      </span>
                    </li>
                  ))
                ) : (
                  <p>Tidak ada transaksi</p>
                )}
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
