
import React, { useState } from "react";
import { Link } from "react-router-dom";
import IconLogo from "../assets/IconLogo.png";
import Sidebar from "../component/Sidebar";
import Footer from "../component/Footer";

export default function PanduanPage() {
  const [activeTab, setActiveTab] = useState("dasar");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const guideTabs = [
    { id: "dasar", label: "Dasar-dasar" },
    { id: "pendapatan", label: "Pendapatan" },
    { id: "pengeluaran", label: "Pengeluaran" },
    { id: "laporan", label: "Laporan" },
    { id: "tips", label: "Tips & Trik" },
  ];

  const FAQ = (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-3">Pertanyaan Sering Diajukan</h3>
      <div className="space-y-3">
        <p>
          <strong>Bagaimana cara menghapus transaksi yang salah?</strong><br />
          Anda dapat menghapus transaksi dengan masuk ke menu riwayat transaksi,
          pilih transaksi yang ingin dihapus, lalu klik tombol hapus.
        </p>
        <p>
          <strong>Apakah data saya aman?</strong><br />
          Ya, semua data Anda dienkripsi dan disimpan dengan aman. Kami tidak
          akan membagikan data pribadi Anda kepada pihak ketiga.
        </p>
        <p>
          <strong>Bisakah saya menggunakan aplikasi offline?</strong><br />
          Beberapa fitur dapat digunakan offline, namun untuk sinkronisasi data
          terbaru Anda memerlukan koneksi internet.
        </p>
        <p>
          <strong>Bagaimana cara backup data?</strong><br />
          Data Anda secara otomatis tersimpan di cloud. Anda juga dapat
          mengexport laporan dalam format PDF atau Excel.
        </p>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "dasar":
        return (
          <>
            <h2 className="text-xl font-bold mb-2">Memulai dengan Agri Finance</h2>
            <p className="mb-4">
              Pelajari cara menggunakan aplikasi untuk mengelola keuangan pertanian Anda
            </p>
            <ol className="list-decimal pl-6 space-y-1 mb-6">
              <li>Daftar dan lengkapi profil Anda</li>
              <li>Tambahkan sumber pendapatan pertama</li>
              <li>Catat pengeluaran harian</li>
              <li>Lihat laporan keuangan bulanan</li>
            </ol>

            <h3 className="text-lg font-semibold mb-2">Navigasi Dashboard</h3>
            <p className="mb-4">Memahami setiap fitur di dashboard utama</p>
            <ol className="list-decimal pl-6 space-y-1 mb-6">
              <li>Panel ringkasan keuangan</li>
              <li>Grafik pendapatan dan pengeluaran</li>
              <li>Transaksi terbaru</li>
              <li>Aksi cepat untuk input data</li>
            </ol>

            {FAQ}
          </>
        );
      case "pendapatan":
        return (
          <>
            <h2 className="text-xl font-bold mb-2">Mencatat Pendapatan</h2>
            <p className="mb-4">Cara menambahkan dan mengelola pendapatan dari hasil pertanian</p>
            <ol className="list-decimal pl-6 space-y-1 mb-6">
              <li>Klik tombol "Tambah Pendapatan"</li>
              <li>Pilih jenis komoditas (padi, jagung, dll)</li>
              <li>Masukkan jumlah dan harga</li>
              <li>Simpan transaksi pendapatan</li>
            </ol>

            <h3 className="text-lg font-semibold mb-2">Kategori Pendapatan</h3>
            <p className="mb-4">Mengelompokkan pendapatan berdasarkan jenis komoditas</p>
            <ol className="list-decimal pl-6 space-y-1 mb-6">
              <li>Padi dan beras</li>
              <li>Jagung dan palawija</li>
              <li>Sayuran dan buah</li>
              <li>Ternak dan perikanan</li>
            </ol>

            {FAQ}
          </>
        );
      case "pengeluaran":
        return (
          <>
            <h2 className="text-xl font-bold mb-2">Mengelola Pengeluaran</h2>
            <p className="mb-4">Cara mencatat dan mengkategorikan pengeluaran pertanian</p>
            <ol className="list-decimal pl-6 space-y-1 mb-6">
              <li>Buka menu pengeluaran</li>
              <li>Pilih kategori pengeluaran</li>
              <li>Masukkan jumlah dan keterangan</li>
              <li>Upload foto struk jika ada</li>
            </ol>

            <h3 className="text-lg font-semibold mb-2">Kategori Pengeluaran</h3>
            <p className="mb-4">Jenis-jenis pengeluaran dalam usaha pertanian</p>
            <ol className="list-decimal pl-6 space-y-1 mb-6">
              <li>Bibit dan pupuk</li>
              <li>Pestisida dan obat-obatan</li>
              <li>Sewa alat dan tenaga kerja</li>
              <li>Transport dan operasional</li>
            </ol>

            {FAQ}
          </>
        );
      case "laporan":
        return (
          <>
            <h2 className="text-xl font-bold mb-2">Membaca Laporan Keuangan</h2>
            <p className="mb-4">Memahami laporan pendapatan, pengeluaran, dan keuntungan</p>
            <ol className="list-decimal pl-6 space-y-1 mb-6">
              <li>Akses menu laporan</li>
              <li>Pilih periode laporan</li>
              <li>Analisis grafik dan tabel</li>
              <li>Export laporan ke PDF</li>
            </ol>

            <h3 className="text-lg font-semibold mb-2">Analisis Keuntungan</h3>
            <p className="mb-4">Cara menghitung dan menganalisis keuntungan usaha tani</p>
            <ol className="list-decimal pl-6 space-y-1 mb-6">
              <li>Hitung total pendapatan</li>
              <li>Kurangi total pengeluaran</li>
              <li>Analisis margin keuntungan</li>
              <li>Bandingkan dengan periode lalu</li>
            </ol>

            {FAQ}
          </>
        );
      case "tips":
        return (
          <>
            <h2 className="text-xl font-bold mb-2">Tips Menghemat Biaya Produksi</h2>
            <p className="mb-4">Strategi mengurangi pengeluaran tanpa mengorbankan kualitas</p>
            <ol className="list-decimal pl-6 space-y-1 mb-6">
              <li>Beli pupuk dalam jumlah besar</li>
              <li>Gunakan pupuk organik buatan sendiri</li>
              <li>Bergabung dengan kelompok tani</li>
              <li>Manfaatkan teknologi pertanian</li>
            </ol>

            <h3 className="text-lg font-semibold mb-2">Meningkatkan Pendapatan</h3>
            <p className="mb-4">Cara memaksimalkan hasil dan nilai jual produk pertanian</p>
            <ol className="list-decimal pl-6 space-y-1 mb-6">
              <li>Diversifikasi tanaman</li>
              <li>Olah produk menjadi nilai tambah</li>
              <li>Jual langsung ke konsumen</li>
              <li>Manfaatkan media sosial untuk pemasaran</li>
            </ol>

            {FAQ}
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
            className="md:hidden mr-2"
            onClick={() => setSidebarOpen(!sidebarOpen)}
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
        <Sidebar isOpen={sidebarOpen} />

        {/* Konten utama */}
        <main className="flex-1 p-6">
          {/* Tab navigasi panduan */}
          <div className="flex flex-wrap gap-2 mb-6">
            {guideTabs.map((tab) => (
              <button
                key={tab.id}
                className={`px-4 py-2 rounded-full ${
                  activeTab === tab.id
                    ? "bg-green-100 text-green-700 font-semibold"
                    : "bg-gray-200 text-gray-700"
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {renderContent()}
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
