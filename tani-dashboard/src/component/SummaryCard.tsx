// src/component/SummaryCard.tsx
import React from "react";

interface SummaryCardProps {
  title: string;
  value: string;
}

export default function SummaryCard({ title, value }: SummaryCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-2xl font-bold text-green-700">{value}</p>
    </div>
  );
}
