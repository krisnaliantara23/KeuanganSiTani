// Sidebar.jsx
import React from "react";
import { Menu, X } from "lucide-react";
import { NavLink } from "react-router-dom";

export default function Sidebar({ isOpen, toggleSidebar }) {
  const menuItems = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/pendapatan", label: "Pendapatan" },
    { path: "/pengeluaran", label: "Pengeluaran" },
    { path: "/laporan", label: "Laporan" },
    { path: "/panduan", label: "Panduan" },
    { path: "/pengaturan", label: "Pengaturan" },
  ];

  return (
    <div
      className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-40 transform transition-transform duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
    >
      {/* Header Sidebar */}
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-bold text-[#004030]">Menu</h2>

        {/* Logo (desktop & mobile) */}
        <div className="flex-1 text-center">
          <h1 className="text-xl font-bold text-[#004030]">Keuangan SiTani</h1>
        </div>

        {/* Toggle button (selalu muncul) */}
        <button
          className="text-gray-600"
          onClick={toggleSidebar}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col space-y-2 p-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end
            className={({ isActive }) =>
              `p-2 rounded transition ${
                isActive
                  ? "bg-green-100 text-green-700 font-semibold border-l-4 border-green-600"
                  : "text-gray-700 hover:bg-gray-100"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
