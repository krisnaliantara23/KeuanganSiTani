// src/component/Sidebar.jsx
import { useState } from "react";
import {
  Home,
  DollarSign,
  ShoppingCart,
  FileText,
  Book,
  Settings,
  User,
  Menu,
  X,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => setIsOpen(!isOpen);

  const menuItems = [
    { path: "/beranda", label: "Dashboard", icon: Home },
    { path: "/pendapatan", label: "Pendapatan", icon: DollarSign },
    { path: "/pengeluaran", label: "Pengeluaran", icon: ShoppingCart },
    { path: "/laporan", label: "Laporan", icon: FileText },
    { path: "/panduan", label: "Panduan", icon: Book },
    { path: "/pengaturan", label: "Pengaturan", icon: Settings },
    { path: "/admin", label: "Panel Admin", icon: User },
  ];

  return (
    <>
      {/* Hamburger Button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-green-600 text-white p-2 rounded-lg shadow-lg"
        onClick={toggleSidebar}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-md flex flex-col justify-between p-4 transform transition-transform duration-300 ease-in-out z-40
        ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        {/* Logo */}
        <div>
          <div className="flex items-center space-x-2 mb-6">
            <div className="bg-green-100 p-2 rounded-lg">
              <Home className="text-green-600" size={20} />
            </div>
            <div>
              
              <h1 className="text-lg font-bold text-gray-800">SiTani</h1>
              <p className="text-xs text-gray-500">Kelola Keuangan Pertanian</p>
            </div>
          </div>

          {/* Menu */}
          <nav className="space-y-2">
            {menuItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`sidebar-link ${
                  location.pathname === path ? "active" : ""
                }`}
                onClick={() => setIsOpen(false)} // close kalau mobile
              >
                <Icon size={18} /> {label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Profil User */}
        <div className="bg-green-100 rounded-lg p-3 flex items-center space-x-2">
          <User className="text-green-600" size={20} />
          <div>
            <p className="text-sm font-medium">Budi Santoso</p>
            <p className="text-xs text-gray-500">budisantoso@email.com</p>
          </div>
        </div>
      </aside>
    </>
  );
}
