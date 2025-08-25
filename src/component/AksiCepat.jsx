import {Link} from "react-router-dom";
import React from "react";

export default function QuickActions() {
  return (
    <div className="bg-white rounded-2xl shadow-md p-5 mt-6">
      <h2 className="text-lg font-semibold mb-4">Aksi Cepat</h2>
      <div className="grid grid-cols-3 gap-4">
        
        {/* Tambah Pendapatan */}
        <Link
          to="/pendapatan"
          className="flex flex-col items-center justify-center p-4 bg-blue-100 rounded-xl hover:bg-blue-200 transition"
        >
          <span className="text-blue-600 text-2xl">➕</span>
          <p className="mt-2 text-sm font-medium text-blue-600 text-center">
            Tambah Pendapatan
          </p>
        </Link>

        {/* Tambah Pengeluaran */}
        <Link
          to="/pengeluaran"
          className="flex flex-col items-center justify-center p-4 bg-red-100 rounded-xl hover:bg-red-200 transition"
        >
          <span className="text-red-600 text-2xl">➖</span>
          <p className="mt-2 text-sm font-medium text-red-600 text-center">
            Tambah Pengeluaran
          </p>
        </Link>

        {/* Laporan */}
        <Link
          to="/laporan"
          className="flex flex-col items-center justify-center p-4 bg-green-100 rounded-xl hover:bg-green-200 transition"
        >
          <span className="text-green-600 text-2xl">📊</span>
          <p className="mt-2 text-sm font-medium text-green-600 text-center">
            Laporan
          </p>
        </Link>

      </div>
    </div>
  );
}
