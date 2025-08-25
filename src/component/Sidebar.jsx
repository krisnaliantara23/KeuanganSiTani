// Sidebar.jsx
import { X } from "lucide-react";
import { NavLink } from "react-router-dom";

export default function Sidebar({ isOpen, toggleSidebar }) {
  const menuItems = [
    { path: "/beranda", label: "Dashboard" },
    { path: "/pendapatan", label: "Pendapatan" },
    { path: "/pengeluaran", label: "Pengeluaran" },
    { path: "/laporan", label: "Laporan" },
    { path: "/panduan", label: "Panduan" },
    { path: "/pengaturan", label: "Pengaturan" },
  ];

  return (
    <div
      className={`fixed top-0 left-0 h-full w-64 bg-blue-600 text-white shadow-lg 
        transform ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        transition-transform duration-300 ease-in-out 
        md:translate-x-0 md:static md:block z-50`}
    >
      {/* Header Sidebar */}
      <div className="flex justify-between items-center p-4 border-b border-blue-500">
        <h2 className="text-lg font-bold">Menu</h2>
        {/* Tombol close (muncul hanya di mobile) */}
        <button onClick={toggleSidebar} className="md:hidden">
          <X size={24} />
        </button>
      </div>

      {/* Menu navigasi */}
      <ul className="space-y-2 p-4">
        {menuItems.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `block p-2 rounded ${
                  isActive ? "bg-blue-700 font-semibold" : "hover:bg-blue-500"
                }`
              }
              onClick={toggleSidebar} // otomatis close setelah klik di mobile
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
}
