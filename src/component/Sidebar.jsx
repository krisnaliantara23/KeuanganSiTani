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
  ChevronDown
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import IconLogo from "../assets/IconLogo.png";

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
  ];

  const baseLinkClass = "flex items-center w-full p-3 rounded-lg text-gray-700 hover:bg-green-100 hover:text-green-800 transition-colors duration-200";
  const activeLinkClass = "bg-green-600 text-white font-bold hover:bg-green-700";

  return (
    <>
      {/* Hamburger Button for Mobile */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-green-600 text-white p-2 rounded-lg shadow-lg"
        onClick={toggleSidebar}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg flex flex-col transform transition-transform duration-300 ease-in-out z-40
        ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-center p-4 border-b border-gray-200">
          <img src={IconLogo} alt="SiTani Logo" className="h-10 w-10 mr-3"/>
          <h1 className="text-2xl font-bold text-green-800">SiTani</h1>
        </div>

        {/* Menu Items Section */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={`${baseLinkClass} ${location.pathname === path ? activeLinkClass : ""}`}
              onClick={() => setIsOpen(false)} // Close sidebar on mobile after click
            >
              <Icon className="mr-4" size={20} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t border-gray-200">
            <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center mr-3">
                    <User className="text-green-700" />
                </div>
                <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">Nama Petani</p>
                    <p className="text-xs text-gray-500">petani@email.com</p>
                </div>
                <ChevronDown size={20} className="text-gray-500"/>
            </div>
        </div>
      </aside>
    </>
  );
}