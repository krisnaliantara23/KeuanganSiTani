import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { getCurrentUser, logoutUser } from "../utils/storage";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = getCurrentUser();

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  if (!currentUser) return null; // Jangan tampilkan sidebar kalau belum login

  return (
    <div className="w-64 bg-green-700 text-white min-h-screen p-4 flex flex-col">
      <h2 className="text-2xl font-bold mb-8">KeuanganSiTani</h2>

      <nav className="flex-1">
        <ul className="space-y-2">
          <li>
            <Link
              to="/"
              className={`block px-4 py-2 rounded ${
                location.pathname === "/" ? "bg-green-900" : "hover:bg-green-800"
              }`}
            >
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              to="/laporan"
              className={`block px-4 py-2 rounded ${
                location.pathname === "/laporan"
                  ? "bg-green-900"
                  : "hover:bg-green-800"
              }`}
            >
              Laporan
            </Link>
          </li>
        </ul>
      </nav>

      <button
        onClick={handleLogout}
        className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white"
      >
        Logout
      </button>
    </div>
  );
}
