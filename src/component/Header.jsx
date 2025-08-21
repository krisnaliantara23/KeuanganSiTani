// Header.jsx
import React from "react";
import { Menu } from "lucide-react";

export default function Header({ toggleSidebar }) {
  return (
    <header className="flex items-center justify-between p-4 bg-white shadow-md">
      {/* Tombol hamburger selalu ada */}
      <button
        onClick={toggleSidebar}
        className="text-gray-700 hover:text-green-700"
      >
        <Menu size={28} />
      </button>

      <h1 className="text-lg font-bold text-[#004030]">Keuangan SiTani</h1>
    </header>
  );
}
