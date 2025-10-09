import { Link, useLocation } from "react-router-dom";
import { Home, DollarSign, ShoppingCart, FileText, Book, Settings } from "lucide-react";
import IconLogo from "../assets/IconLogo.png";

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();

  const menuItems = [
    { path: "/beranda", label: "Dashboard", icon: Home },
    { path: "/pendapatan", label: "Pendapatan", icon: DollarSign },
    { path: "/pengeluaran", label: "Pengeluaran", icon: ShoppingCart },
    { path: "/laporan", label: "Laporan", icon: FileText },
    { path: "/panduan", label: "Panduan", icon: Book },
    { path: "/pengaturan", label: "Pengaturan", icon: Settings },
    { path: "/atur-produk", label: "Atur Produk", icon: Settings },
  ];

  const baseLinkClass =
    "flex items-center w-full p-3 rounded-lg text-gray-700 hover:bg-green-100 hover:text-green-800 transition-colors duration-200";
  const activeLinkClass = "bg-green-600 text-white font-bold hover:bg-[#`004030]";

  return (
    <>
      {/* Overlay (mobile only) */}
      <div
        className={`fixed inset-0 bg-black/30 z-30 md:hidden transition-opacity ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg flex flex-col transform transition-transform duration-300 ease-in-out z-40
        ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        {/* Logo */}
        <div className="flex items-center justify-center p-4 border-b border-gray-200">
          <img src={IconLogo} alt="SiTani Logo" className="h-10 w-10 mr-3" />
          <h1 className="text-2xl font-bold text-green-800">SiTani</h1>
        </div>

        {/* Menu */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={`${baseLinkClass} ${location.pathname === path ? activeLinkClass : ""}`}
              onClick={onClose} // close saat klik link di mobile
            >
              <Icon className="mr-4" size={20} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}
