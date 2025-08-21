import React, { useState } from "react";
import { Link } from "react-router-dom";
import IconLogo from "../assets/IconLogo.png";
import Sidebar from "../component/Sidebar";
import Footer from "../component/Footer";
import { Section } from "lucide-react";

export default function PanduanPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const guideTabs = [
    { id: "dashboard", label: "Dashboard" },
    { id: "pendapatan", label: "Pendapatan" },
    { id: "pengeluaran", label: "Pengeluaran" },
    { id: "laporan", label: "Laporan" },
    { id: "tips", label: "Tips & Trik" },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
  return (
    <>
      {/* Section: Dasar-dasar */}
      <section className="bg-white p-6 rounded-xl shadow mb-6">
        <h2 className="text-xl font-bold mb-3">Memulai dengan Agri Finance</h2>
        <p className="text-gray-700 mb-2">
          Pelajari cara menggunakan aplikasi Agri Finance untuk mengelola keuangan pertanian Anda dengan mudah.
        </p>
        <ul className="list-decimal list-inside text-gray-700 space-y-2 mt-2">
          <li>Daftar dan lengkapi profil Anda.</li>
          <li>Tambahkan sumber pendapatan dan pengeluaran.</li>
          <li>Gunakan fitur laporan untuk memantau keuangan.</li>
          <li>Ikuti tips dan trik untuk meningkatkan hasil pertanian Anda.</li>
          <li>Lihat laporan keuangan bulanan.</li>
        </ul>
      </section>

      {/* Section: Navigasi Dashboard */}
      <section className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-bold mb-3">Navigasi Dashboard</h2>
        <p className="text-gray-700">
          Dashboard adalah pusat kontrol Anda. Di sini Anda dapat melihat ringkasan keuangan, grafik pendapatan dan pengeluaran, serta transaksi terbaru.
        </p>
        <ul className="list-decimal list-inside text-gray-700 space-y-2 mt-2">
          <li>Panel ringkasan keuangan</li>
          <li>Grafik pendapatan dan pengeluaran</li>
          <li>Transaksi terbaru</li>
          <li>Aksi cepat input data</li>
        </ul>
      </section>
      </>
        );

      case "pendapatan":
        return (
          <>
          {/* Section: Pendapatan */}
          <section className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-bold mb-3">Mencatat Pendapatan</h2>
            <p className="text-gray-700">Mengelompokkan pendapatan berdasarkan jenis komoditas</p>
             <ul className="list-decimal list-inside text-gray-700 space-y-2 mt-2">
              <li>Padi dan beras</li>
              <li>Jagung dan Kentang</li>
              <li>Sayuran dan buah</li>
              <li>Ternak dan perikanan</li>
            </ul>
            </section>
            
            {/* Section: Cara Mencatat Pendapatan */}
          <section className="bg-white p-6 rounded-xl shadow mt-6">
            <h2 className="text-xl font-bold mb-3">Cara Mencatat Pendapatan</h2>
            <ul className="list-decimal list-inside text-gray-700 space-y-2 mt-2">
              <li>Pilih kategori pendapatan yang sesuai</li>
              <li> Masukkan jumlah dan tanggal transaksi</li>
              <li>Tambahkan deskripsi untuk detail lebih lanjut</li>
              <li>Simpan untuk memperbarui catatan keuangan Anda</li>
            </ul>
          </section>
          </>
        );

      case "pengeluaran":
        return (
          <>
          {/* Section: Pengeluaran */}
          <section className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-bold mb-2">Mengelola Pengeluaran</h2>
            <p className="text-gray-700"> Cara mencatat dan mengelompokkan pengeluaran pertanian Anda.</p>
            <ul className="list-decimal list-inside text-gray-700 space-y-2 mt-7">
              <li>Buka menu pengeluaran</li>
              <li>Pilih kategori pengeluaran</li>
              <li>Masukkan jumlah dan keterangan</li>
              <li>Upload foto struk jika ada</li>
            </ul>
          </section>
          <section className="bg-white p-6 rounded-xl shadow mt-6">
            <h2 className="text-xl font-bold mb-2">Kategori Pengeluaran</h2>
            <p className="text-gray-700">Jenis - jenis pengeluaran dalam usaha pertanian</p>
            <ul className="list-decimal list-inside text-gray-700 space-y-2 mt-7">
              <li>Biaya pupuk dan pestisida</li>
              <li>Gaji pekerja</li>
              <li>Biaya perawatan alat</li>
              <li>Transportasi dan operasional</li>
              <li>Biaya sewa lahan (jika ada)</li>
              <li>Biaya administrasi dan lain-lain</li>
            </ul>
          </section>
          </>
        );
      case "laporan":
        return (
          <>
          {/* Section: Laporan */}
          <section className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-bold mb-3">Membaca Laporan Keuangan</h2>
            <p className="text-gray-700">
              Lihat laporan keuangan bulanan atau tahunan untuk memantau perkembangan usaha Anda.
            </p>
            <ul className="list-decimal list-inside text-gray-700 space-y-2 mt-2">
              <li>Akses menu laporan</li>
              <li>Pilih periode laporan</li>
              <li>Analisis grafik dan tabel (Laba atau Rugi)</li>
              <li>Export laporan ke PDF (jika diperlukan)</li>
            </ul>
          </section>

          {/* Section: Analisis Keuntungan*/}
          <section className="bg-white p-6 rounded-xl shadow mt-6">
            <h2 className="text-xl font-bold mb-3">Analisis Keuntungan
            </h2>
            <p className="text-gray-700">
              Gunakan laporan untuk menganalisis keuntungan dan mengidentifikasi area yang perlu diperbaiki.
            </p>
            <ul className="list-decimal list-inside text-gray-700 space-y-2 mt-2">
              <li>Bandingkan pendapatan dan pengeluaran</li>
              <li>Identifikasi tren musiman</li>
              <li>Evaluasi efektivitas strategi pemasaran</li>
              <li>Rencanakan perbaikan untuk periode berikutnya</li>
            </ul>
          </section>
          </>
        );
      case "tips":
        return (
          <>
          {/* Section: Tips & Trik */}
          <section className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-bold mb-2">Tips Menghemat Biaya Produksi</h2>
            <p className="text-gray-700">Strategi mengurangi pengeluaran tanpa mengorbankan kualitas</p>
            <ul className="list-decimal list-inside text-gray-700 space-y-2 mt-7">
              <li>Gunakan pupuk organik untuk mengurangi biaya</li>
              <li>Optimalkan penggunaan air irigasi</li>
              <li>Manfaatkan teknologi untuk efisiensi</li>
              <li>Rencanakan rotasi tanaman untuk meningkatkan hasil</li>
            </ul>
          </section>

          {/* Section: Tips Pemasaran */}
          <section className="bg-white p-6 rounded-xl shadow mt-6">
            <h2 className="text-xl font-bold mb-2">Tips Pemasaran Produk Pertanian</h2>
            <p className="text-gray-700">Cara meningkatkan penjualan dan menjangkau pasar yang lebih luas</p>
            <ul className="list-decimal list-inside text-gray-700 space-y-2 mt-7">
              <li>lakukan penganekaragaman atau penyebaran tanaman</li>
              <li>Olah produk menjadi nilai tambah</li>
              <li>Jual langsung ke konsumen</li>
              <li>Gunakan media sosial untuk promosi</li>
              <li>Tawarkan produk berkualitas tinggi dengan harga bersaing</li>
            </ul>
          </section>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="w-full flex justify-between items-center p-4 bg-white shadow-md fixed top-0 left-0 z-50">
        <div className="flex items-center space-x-2">
          {/* tombol hamburger */}
          <button
            className="md:hidden mr-2 text-gray-700"
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </button>
          <img src={IconLogo} alt="Logo" className="h-8 w-8" />
          <span className="text-xl font-bold text-[#004030]">SiTani</span>
        </div>
        <div className="space-x-4">
          <Link to="/" className="text-[#004030] font-medium hover:underline">
            Beranda
          </Link>
          <Link
            to="/login"
            className="bg-[#4A9782] text-white px-4 py-2 rounded-lg hover:bg-[#3b7a67]"
          >
            Masuk
          </Link>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 pt-16 bg-gray-50">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Konten utama */}
        <main className="flex-1 p-6 z-10 max-w-4xl mx-auto">
          {/* Tab navigasi */}
          <div className="flex flex-wrap gap-2 mb-6">
            {guideTabs.map((tab) => (
              <button
                key={tab.id}
                className={`px-4 py-2 rounded-full ${
                  activeTab === tab.id
                    ? "bg-green-100 text-green-700 font-bold"
                    : "bg-gray-200 text-gray-700"
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Konten berdasarkan tab */}
          {renderContent()}
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
