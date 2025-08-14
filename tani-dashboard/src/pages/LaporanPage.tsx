import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getCurrentUser,
  getTransactions,
  addTransaction
} from "../utils/storage";
import type { Transaction } from "../utils/storage";

export default function LaporanPage() {
  const navigate = useNavigate();
  const [type, setType] = useState<"income" | "expense">("income");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState("");

  const currentUser = getCurrentUser();

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    setTransactions(getTransactions(currentUser));
  }, [navigate, currentUser]);

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || isNaN(Number(amount))) {
      setError("Nominal harus berupa angka");
      return;
    }

    if (!description) {
      setError("Deskripsi wajib diisi");
      return;
    }

    if (!currentUser) return;

    addTransaction(currentUser, {
      id: Date.now(),
      type,
      amount: Number(amount),
      description,
      date: new Date().toISOString()
    });

    setAmount("");
    setDescription("");
    setTransactions(getTransactions(currentUser));
    setError("");
  };

  return (
    <div className="p-6 bg-green-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Laporan Keuangan</h1>

      <form onSubmit={handleAddTransaction} className="bg-white p-4 rounded shadow mb-6">
        {error && (
          <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">
            {error}
          </div>
        )}
        <div className="mb-4">
          <label className="block mb-1">Jenis Transaksi</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as "income" | "expense")}
            className="w-full border p-2 rounded"
          >
            <option value="income">Pemasukan</option>
            <option value="expense">Pengeluaran</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block mb-1">Nominal</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="Masukkan nominal"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1">Deskripsi</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="Misal: Jual padi"
          />
        </div>

        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Tambah
        </button>
      </form>

      <h2 className="text-xl font-semibold mb-2">Daftar Transaksi</h2>
      <table className="w-full bg-white rounded shadow">
        <thead>
          <tr className="bg-green-200 text-left">
            <th className="p-2">Tanggal</th>
            <th className="p-2">Jenis</th>
            <th className="p-2">Nominal</th>
            <th className="p-2">Deskripsi</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t.id} className="border-t">
              <td className="p-2">
                {new Date(t.date).toLocaleDateString()}
              </td>
              <td className="p-2">
                {t.type === "income" ? "Pemasukan" : "Pengeluaran"}
              </td>
              <td className="p-2">Rp {t.amount.toLocaleString()}</td>
              <td className="p-2">{t.description}</td>
            </tr>
          ))}
          {transactions.length === 0 && (
            <tr>
              <td colSpan={4} className="text-center p-4 text-gray-500">
                Belum ada transaksi
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
