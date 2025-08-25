// Layout.jsx
import { useState } from "react";
import Sidebar from "./Sidebar";
import { Menu } from "lucide-react";

export default function Layout({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />

      {/* Main area */}
      <div className="flex flex-col flex-1">
        {/* Header / Navbar */}
        <header className="flex items-center justify-between bg-white shadow px-4 py-3 sticky top-0 z-40">
          <button
            onClick={toggleSidebar}
            className="md:hidden p-2 rounded hover:bg-gray-200"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-lg font-bold text-green-800">
            Keuangan SiTani
          </h1>
        </header>

        {/* Main content */}
        <main className="flex-1 p-6">{children}</main>

        {/* Footer */}
        <footer className="bg-green-900 text-white py-6 mt-6">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 px-4">
            <div>
              <h3 className="font-bold mb-2">Sistem Informasi Keuangan</h3>
              <p className="text-sm">
                Membantu mengelola pendapatan & pengeluaran usaha tani Anda.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-2">Produk</h3>
              <ul className="space-y-1 text-sm">
                <li>Pendapatan</li>
                <li>Pengeluaran</li>
                <li>Laporan</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-2">Bantuan</h3>
              <ul className="space-y-1 text-sm">
                <li>Panduan</li>
                <li>FAQ</li>
                <li>Kontak</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-2">Tentang</h3>
              <ul className="space-y-1 text-sm">
                <li>Tentang Kami</li>
                <li>Kebijakan Privasi</li>
                <li>Syarat & Ketentuan</li>
              </ul>
            </div>
          </div>
          <p className="text-center text-xs mt-6">
            © 2025 Keuangan SiTani. Semua hak cipta dilindungi.
          </p>
        </footer>
      </div>
    </div>
  );
}
