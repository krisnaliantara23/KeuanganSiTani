// src/component/Sidebar.jsx
import React from "react";
import { Link } from "react-router-dom";
import { cn } from "../lib/utils";

export default function Sidebar({ isOpen, onClose }) {
  const mainMenu = [
    { id: "dashboard", label: "Dashboard", path: "/" },
    { id: "pendapatan", label: "Pendapatan", path: "/pendapatan" },
    { id: "pengeluaran", label: "Pengeluaran", path: "/pengeluaran" },
    { id: "laporan", label: "Laporan", path: "/laporan" },
    { id: "panduan", label: "Panduan", path: "/panduan" },
    { id: "pengaturan", label: "Pengaturan", path: "/pengaturan" },
  ];

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 h-full w-64 bg-white border-r shadow-md transform transition-transform duration-300 z-40",
        isOpen ? "translate-x-0" : "-translate-x-full", // toggle animasi
        "md:translate-x-0" // default muncul di layar besar
      )}
    >
      <div className="p-4 flex justify-between items-center border-b">
        <h2 className="text-lg font-bold text-green-700">Menu</h2>
        <button
          className="md:hidden text-gray-600"
          onClick={onClose}
        >
          ✖
        </button>
      </div>

      <nav className="p-4 space-y-2">
        {mainMenu.map((menu) => (
          <Link
            key={menu.id}
            to={menu.path}
            className="block w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100"
            onClick={onClose}
          >
            {menu.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
