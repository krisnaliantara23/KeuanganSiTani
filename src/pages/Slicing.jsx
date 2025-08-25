import React, { useEffect, useState } from "react";
import { getProducts, deleteProduct } from "../services/productService";

export default function Slicing() {
  const [products, setProducts] = useState([]);

  const fetchData = async () => {
    try {
      const res = await getProducts();
      setProducts(res.data.data); // sesuai respon backend kamu
    } catch (err) {
      console.error(err);
      alert("Gagal mengambil data produk");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Yakin hapus produk?")) {
      try {
        await deleteProduct(id);
        fetchData(); // refresh list
      } catch (err) {
        alert("Gagal hapus produk");
      }
    }
  };

  return (
    <div>
      <h1>Daftar Produk</h1>
      <ul>
        {products.map((p) => (
          <li key={p.id}>
            {p.nama} - Rp {p.harga} 
            <button onClick={() => handleDelete(p.id)}>Hapus</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
