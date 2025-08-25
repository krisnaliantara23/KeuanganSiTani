import React from "react";

export default function SummaryCard({ title, value, color }) {
  return (
    <div
      className={`bg-white p-5 rounded-xl shadow-md border-t-4 ${color} transition hover:shadow-lg`}
    >
      <h4 className="text-sm text-gray-500">{title}</h4>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
  );
}
