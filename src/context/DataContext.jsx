import React, { createContext, useState, useContext } from "react";

const DataContext = createContext();

export function DataProvider({ children }) {
  const [pendapatan, setPendapatan] = useState([]);
  const [pengeluaran, setPengeluaran] = useState([]);

  // Tambah pendapatan baru
  const tambahPendapatan = (item) => {
    setPendapatan((prev) => [...prev, item]);
  };

  // Tambah pengeluaran baru
  const tambahPengeluaran = (item) => {
    setPengeluaran((prev) => [...prev, item]);
  };

  return (
    <DataContext.Provider
      value={{ pendapatan, pengeluaran, tambahPendapatan, tambahPengeluaran }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}
