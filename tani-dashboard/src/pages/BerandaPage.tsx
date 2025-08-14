// src/pages/BerandaPage.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, getTransactions } from "../utils/storage";
import type { Transaction } from "../utils/storage";
import SummaryCard from "../component/SummaryCard";

export default function BerandaPage() {
  const navigate = useNavigate();
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      navigate("/login");
      return;
    }

    const transactions = getTransactions(currentUser);

    const totalIncome = transactions
      .filter((t: Transaction) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
      .filter((t: Transaction) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    setIncome(totalIncome);
    setExpense(totalExpense);
    setBalance(totalIncome - totalExpense);
  }, [navigate]);

  return (
    <div className="p-6 bg-green-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard title="Saldo" value={`Rp ${balance.toLocaleString()}`} />
        <SummaryCard title="Pemasukan" value={`Rp ${income.toLocaleString()}`} />
        <SummaryCard title="Pengeluaran" value={`Rp ${expense.toLocaleString()}`} />
      </div>
    </div>
  );
}
