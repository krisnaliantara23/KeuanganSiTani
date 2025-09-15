import React from "react";
import { Menu } from "lucide-react";

export default function Header({ onLogout, onToggleSidebar }) {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <header className="bg-white shadow p-4 flex justify-between items-center">
      <div className="flex items-center gap-3">
        {/* Hamburger hanya di mobile */}
        <button
          className="md:hidden inline-flex items-center justify-center p-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>

        <h1 className="text-xl font-bold text-[#004030]">Dashboard SiTani</h1>
      </div>

      <div className="flex items-center space-x-4">
        {user && <span className="text-gray-700 font-medium">Halo, {user.nama}</span>}
        <button
          onClick={onLogout}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
