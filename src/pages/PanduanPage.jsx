// src/pages/PanduanPage.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import IconLogo from "../assets/IconLogo.png";
import Footer from "../component/Footer";
import Layout from "../component/Layout"; // Impor Layout

export default function PanduanPage() {
  const [activeTab, setActiveTab] = useState("memulai");

  const isLoggedIn = !!localStorage.getItem("token"); // cek login

  const guideTabs = [
    { id: "memulai", label: "Memulai" },
    { id: "dashboard", label: "Dashboard" },
    { id: "pendapatan", label: "Catat Pendapatan" },
    { id: "pengeluaran", label: "Catat Pengeluaran" },
    { id: "produk", label: "Manajemen Produk" },
    { id: "laporan", label: "Laporan Keuangan" },
    { id: "pengaturan", label: "Pengaturan Akun" },
    { id: "tips", label: "Tips & Trik" },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "memulai":
        return (
          <section className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Selamat Datang di Panduan SiTani!
            </h2>
            <p className="text-gray-700 mb-4">
              Panduan ini akan membantu Anda memahami cara menggunakan setiap
              fitur di aplikasi Keuangan SiTani untuk mengelola keuangan usaha
              tani Anda secara efektif.
            </p>

            <div className="mt-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                Langkah 1: Pendaftaran Akun
              </h3>
              <p className="text-gray-700 mb-3">
                Jika Anda belum memiliki akun, mulailah dengan mendaftar.
              </p>
              <ul className="list-decimal list-inside text-gray-700 space-y-2">
                <li>
                  Klik tombol <strong>"Daftar"</strong> di halaman utama.
                </li>
                <li>
                  Isi formulir pendaftaran dengan nama, alamat email, dan kata
                  sandi Anda.
                </li>
                <li>
                  Pastikan semua data terisi dengan benar, lalu klik
                  <strong>"Buat Akun"</strong>.
                </li>
                <li>
                  Anda akan otomatis masuk ke halaman dashboard setelah
                  pendaftaran berhasil.
                </li>
              </ul>
            </div>

            <div className="mt-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                Langkah 2: Masuk ke Akun Anda
              </h3>
              <p className="text-gray-700 mb-3">
                Jika Anda sudah memiliki akun, masuklah untuk mulai mengelola
                keuangan Anda.
              </p>
              <ul className="list-decimal list-inside text-gray-700 space-y-2">
                <li>
                  Klik tombol <strong>"Masuk"</strong> di halaman utama.
                </li>
                <li>
                  Masukkan alamat email dan kata sandi yang telah Anda
                  daftarkan.
                </li>
                <li>
                  Klik tombol <strong>"Masuk"</strong> untuk mengakses
                  dashboard Anda.
                </li>
                <li>
                  Jika Anda lupa kata sandi, gunakan tautan{" "}
                  <strong>"Lupa Kata Sandi"</strong> untuk meresetnya.
                </li>
              </ul>
            </div>
          </section>
        );

      case "dashboard":
        return (
          <section className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Navigasi Halaman Dashboard
            </h2>
            <p className="text-gray-700 mb-4">
              Dashboard adalah halaman utama setelah Anda masuk. Di sini, Anda
              bisa mendapatkan gambaran umum tentang kondisi keuangan usaha tani
              Anda.
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-3">
              <li>
                <strong>Ringkasan Keuangan:</strong> Kartu ringkasan di bagian
                atas menampilkan total pendapatan, pengeluaran, dan laba/rugi
                dalam periode tertentu. Ini membantu Anda melihat performa
                keuangan secara sekilas.
              </li>
              <li>
                <strong>Grafik Keuangan:</strong> Grafik batang menyajikan
                visualisasi perbandingan antara pendapatan dan pengeluaran dari
                waktu ke waktu, memudahkan Anda menganalisis tren.
              </li>
              <li>
                <strong>Transaksi Terbaru:</strong> Tabel di bagian bawah
                menampilkan daftar transaksi terakhir yang Anda catat, baik itu
                pemasukan maupun pengeluaran.
              </li>
              <li>
                <strong>Akses Cepat:</strong> Tombol-tombol di dashboard
                memberikan akses cepat untuk menambah data pendapatan atau
                pengeluaran baru tanpa harus berpindah halaman.
              </li>
            </ul>
          </section>
        );

      case "pendapatan":
        return (
          <section className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Cara Mencatat Pendapatan
            </h2>
            <p className="text-gray-700 mb-4">
              Mencatat setiap pendapatan dari hasil panen atau penjualan produk
              lainnya sangat penting untuk melacak profitabilitas usaha Anda.
            </p>
            <ul className="list-decimal list-inside text-gray-700 space-y-3">
              <li>
                Buka halaman <strong>"Pendapatan"</strong> dari menu navigasi.
              </li>
              <li>
                Klik tombol <strong>"Tambah Pendapatan"</strong> untuk membuka
                formulir.
              </li>
              <li>
                <strong>Pilih Produk:</strong> Pilih produk pertanian yang
                terjual dari daftar produk Anda.
              </li>
              <li>
                <strong>Masukkan Jumlah:</strong> Isi nominal pendapatan yang
                Anda terima dari penjualan tersebut.
              </li>
              <li>
                <strong>Pilih Tanggal:</strong> Tentukan tanggal transaksi
                terjadi.
              </li>
              <li>
                <strong>Tambahkan Keterangan (Opsional):</strong> Berikan
                deskripsi tambahan jika diperlukan, misalnya nama pembeli atau
                detail lainnya.
              </li>
              <li>
                Klik <strong>"Simpan"</strong> untuk mencatat pendapatan. Data
                akan otomatis diperbarui di dashboard dan laporan.
              </li>
            </ul>
          </section>
        );

      case "pengeluaran":
        return (
          <section className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Cara Mencatat Pengeluaran
            </h2>
            <p className="text-gray-700 mb-4">
              Catat semua biaya yang Anda keluarkan untuk operasional usaha
              tani, mulai dari pembelian bibit hingga biaya tenaga kerja.
            </p>
            <ul className="list-decimal list-inside text-gray-700 space-y-3">
              <li>
                Akses halaman <strong>"Pengeluaran"</strong> melalui menu.
              </li>
              <li>
                Tekan tombol <strong>"Tambah Pengeluaran"</strong>.
              </li>
              <li>
                <strong>Pilih Kategori:</strong> Pilih kategori pengeluaran
                yang paling sesuai (contoh: Bibit, Pupuk, Tenaga Kerja,
                Transportasi).
              </li>
              <li>
                <strong>Masukkan Jumlah:</strong> Tuliskan nominal biaya yang
                dikeluarkan.
              </li>
              <li>
                <strong>Pilih Tanggal:</strong> Atur tanggal pengeluaran
                tersebut.
              </li>
              <li>
                <strong>Tambahkan Keterangan (Opsional):</strong> Catat detail
                penting seperti nama toko atau tujuan pengeluaran.
              </li>
              <li>
                Klik <strong>"Simpan"</strong>. Pengeluaran Anda akan tercatat
                dan memengaruhi laporan keuangan.
              </li>
            </ul>
          </section>
        );

      case "produk":
        return (
          <section className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Manajemen Produk Pertanian
            </h2>
            <p className="text-gray-700 mb-4">
              Kelola daftar produk hasil tani Anda untuk memudahkan pencatatan
              pendapatan. Anda dapat menambah, mengubah, atau menghapus produk.
            </p>
            <ul className="list-decimal list-inside text-gray-700 space-y-3">
              <li>
                Masuk ke halaman <strong>"Atur Produk"</strong> dari menu.
              </li>
              <li>
                Untuk <strong>menambah produk baru</strong>, klik tombol
                "Tambah Produk", isi nama produk (misal: "Padi Pandan Wangi",
                "Jagung Manis"), lalu simpan.
              </li>
              <li>
                Untuk <strong>mengubah nama produk</strong>, klik ikon{" "}
                <strong>pensil (edit)</strong> di samping nama produk yang
                ingin diubah, perbarui namanya, lalu simpan.
              </li>
              <li>
                Untuk <strong>menghapus produk</strong>, klik ikon{" "}
                <strong>tong sampah (hapus)</strong>. Harap berhati-hati,
                tindakan ini tidak dapat diurungkan.
              </li>
            </ul>
          </section>
        );

      case "laporan":
        return (
          <section className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Memahami Laporan Keuangan
            </h2>
            <p className="text-gray-700 mb-4">
              Halaman laporan memberikan analisis mendalam tentang kinerja
              keuangan usaha tani Anda. Gunakan fitur ini untuk membuat
              keputusan yang lebih baik.
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-3">
              <li>
                <strong>Pilih Periode Laporan:</strong> Anda dapat memfilter
                laporan berdasarkan rentang waktu tertentu (misalnya, bulanan,
                tahunan) untuk melihat performa pada periode tersebut.
              </li>
              <li>
                <strong>Laporan Laba Rugi:</strong> Laporan ini secara otomatis
                menghitung selisih antara total pendapatan dan total
                pengeluaran untuk menunjukkan apakah usaha Anda untung atau
                rugi.
              </li>
              <li>
                <strong>Arus Kas:</strong> Laporan ini merinci semua aliran kas
                masuk (pendapatan) dan kas keluar (pengeluaran) dalam periode
                yang dipilih.
              </li>
              <li>
                <strong>Neraca (Fitur Mendatang):</strong> Laporan neraca akan
                menunjukkan posisi aset, kewajiban, dan modal usaha Anda pada
                satu titik waktu.
              </li>
            </ul>
          </section>
        );

      case "pengaturan":
        return (
          <section className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Pengaturan Akun Pengguna
            </h2>
            <p className="text-gray-700 mb-4">
              Sesuaikan informasi profil dan keamanan akun Anda melalui halaman
              pengaturan.
            </p>
            <ul className="list-decimal list-inside text-gray-700 space-y-3">
              <li>
                Buka halaman <strong>"Pengaturan"</strong> dari menu navigasi.
              </li>
              <li>
                <strong>Memperbarui Profil:</strong> Anda dapat mengubah nama
                dan informasi kontak Anda. Klik "Simpan" setelah melakukan
                perubahan.
              </li>
              <li>
                <strong>Mengubah Kata Sandi:</strong> Untuk alasan keamanan,
                Anda bisa memperbarui kata sandi secara berkala. Masukkan kata
                sandi lama, lalu masukkan kata sandi baru Anda dan
                konfirmasikan.
              </li>
              <li>
                <strong>Keluar dari Akun:</strong> Gunakan tombol "Keluar" di
                menu navigasi atau di halaman pengaturan untuk keluar dari sesi
                Anda dengan aman.
              </li>
            </ul>
          </section>
        );

      case "tips":
        return (
          <section className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Tips & Trik untuk Petani Cerdas
            </h2>
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Menghemat Biaya Produksi
              </h3>
              <p className="text-gray-700 mb-3">
                Strategi untuk mengurangi pengeluaran tanpa mengorbankan
                kualitas hasil panen.
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>
                  Gunakan pupuk organik atau kompos buatan sendiri untuk
                  mengurangi ketergantungan pada pupuk kimia yang mahal.
                </li>
                <li>
                  Optimalkan jadwal dan volume penyiraman untuk menghemat air
                  dan biaya listrik pompa.
                </li>
                <li>
                  Lakukan rotasi tanaman untuk menjaga kesuburan tanah secara
                  alami dan mengurangi risiko hama.
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Meningkatkan Pemasaran Produk
              </h3>
              <p className="text-gray-700 mb-3">
                Cara efektif untuk menjangkau pasar yang lebih luas dan
                meningkatkan keuntungan.
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>
                  Jual hasil panen langsung ke konsumen melalui pasar tani atau
                  komunitas online untuk mendapatkan harga yang lebih baik.
                </li>
                <li>
                  Olah sebagian hasil panen menjadi produk bernilai tambah
                  (misalnya, keripik, jus, atau selai).
                </li>
                <li>
                  Gunakan media sosial untuk mempromosikan produk Anda, bagikan
                  cerita dari lahan Anda untuk menarik minat pembeli.
                </li>
              </ul>
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  const mainContent = (
    <main className="flex-1 p-4 sm:p-6 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Panduan Penggunaan Aplikasi SiTani
        </h1>
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {guideTabs.map((tab) => (
            <button
              key={tab.id}
              className={`px-4 py-2 text-sm sm:text-base rounded-full font-semibold transition-colors duration-300 ${
                activeTab === tab.id
                  ? "bg-green-600 text-white shadow"
                  : "bg-white text-gray-600 hover:bg-green-100"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="transition-opacity duration-500 ease-in-out">
          {renderContent()}
        </div>
      </div>
    </main>
  );

  if (isLoggedIn) {
    return <Layout>{mainContent}</Layout>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="w-full flex justify-between items-center p-4 bg-white shadow-md sticky top-0 z-50">
        <div className="flex items-center space-x-2">
          <img src={IconLogo} alt="Logo" className="h-8 w-8" />
          <span className="text-xl font-bold text-[#004030]">
            SiTani - Panduan
          </span>
        </div>
        <div className="space-x-4">
          <Link to="/" className="text-[#004030] font-medium hover:underline">
            Kembali ke Beranda
          </Link>
          <Link
            to="/login"
            className="bg-[#004030] text-white px-4 py-2 rounded-lg hover:bg-[#3b7a67]"
          >
            Masuk
          </Link>
        </div>
      </header>

      <div className="flex-1">{mainContent}</div>

      <Footer />
    </div>
  );
}