import React, { useEffect, useMemo, useState } from "react";
import { getPendapatan, addPendapatan, updatePendapatan, getLaporanById, deletePendapatan } from "../services/financeService";
import { getProducts, createProduct } from "../services/productService";
import { listAkunKas, createAkunKas } from "../services/akunKasService";
import "../styles/pendapatan.css";

export default function PendapatanPage() {
  const token = localStorage.getItem("token");

  // data list
  const [pendapatan, setPendapatan] = useState([]);
  const [products, setProducts] = useState([]);
  const [akunKas, setAkunKas] = useState([]);

  // modal
  const [showModal, setShowModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showAkunModal, setShowAkunModal] = useState(false);

  // edit state
  const [editingId, setEditingId] = useState(null);
  const [replaceItems, setReplaceItems] = useState(true); // default: ganti items saat edit
  const [copied, setCopied] = useState(false);

  // Delete state
  const [deletingId, setDeletingId] = useState(null);

  // form transaksi (tanpa jumlah karena dihitung)
  const [form, setForm] = useState({
    akun_id: 0,
    deskripsi: "",
    tanggal: "",
  });

  // items (baris dinamis)
  const [items, setItems] = useState([
    { produk_id: 0, qty: 1, harga_satuan: 0 },
  ]);
  // tampilan harga per baris (format rupiah saat ketik)
  const [hargaDisplay, setHargaDisplay] = useState([""]);

  // form tambah produk/kategori
  const [productForm, setProductForm] = useState({ nama: "", kategori_nama: "" });

  // form akun kas
  const [akunForm, setAkunForm] = useState({ nama: "", deskripsi: "", saldo_awal: 0 });
  const [displaySaldo, setDisplaySaldo] = useState("");

  useEffect(() => {
    loadInitialData(); // ✅ Fixed: changed from loadData() to loadInitialData()
    loadProducts();
    loadAkunKas();
  }, []);

  async function loadInitialData() {
    try {
      const data = await getPendapatan(token);
      console.log("data pendapatan:", data);
      setPendapatan(data);
    } catch (err) {
      console.error("Gagal ambil pendapatan:", err);
    }
  }
  async function loadProducts() {
    try {
      const res = await getProducts();
      const list = Array.isArray(res.data?.data) ? res.data.data : res.data || [];
      setProducts(list);
    } catch (err) {
      console.error("Gagal ambil produk/kategori:", err);
      setProducts([]);
    }
  }
  async function loadAkunKas(params = { page: 1, limit: 50 }) {
    try {
      const res = await listAkunKas(params);
      const list = Array.isArray(res.data?.data) ? res.data.data : res.data?.data || [];
      setAkunKas(list);
    } catch (err) {
      console.error("Gagal ambil akun kas:", err);
      setAkunKas([]);
    }
  }

  // utils
  const formatRupiah = (value) =>
    !value ? "" : new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(value);

  // subtotal & total
  const subtot = (row) => Number(row.qty || 0) * Number(row.harga_satuan || 0);
  const total = useMemo(() => items.reduce((s, r) => s + subtot(r), 0), [items]);

  // handler baris items
  const addRow = () => {
    setItems((arr) => [...arr, { produk_id: 0, qty: 1, harga_satuan: 0 }]);
    setHargaDisplay((d) => [...d, ""]);
  };
  const removeRow = (idx) => {
    setItems((arr) => arr.filter((_, i) => i !== idx));
    setHargaDisplay((d) => d.filter((_, i) => i !== idx));
  };
  const updateRow = (idx, patch) => {
    setItems((arr) => arr.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  };
  const onQtyChange = (idx, val) => {
    const qty = Math.max(0, Number(val || 0));
    updateRow(idx, { qty });
  };
  const onProdukChange = (idx, val) => {
    updateRow(idx, { produk_id: Number(val || 0) });
  };
  const onHargaChange = (idx, e) => {
    const raw = e.target.value.replace(/\D/g, "");
    const num = Number(raw || 0);
    updateRow(idx, { harga_satuan: num });
    setHargaDisplay((d) => d.map((s, i) => (i === idx ? (raw ? formatRupiah(num) : "") : s)));
  };
  const onHargaBlur = (idx) => {
    setHargaDisplay((d) => d.map((s, i) => (i === idx ? formatRupiah(items[idx].harga_satuan) : s)));
  };

  // akun kas saldo awal (modal akun kas)
  const handleChangeSaldoAwal = (e) => {
    const raw = e.target.value.replace(/\D/g, "");
    const num = Number(raw);
    setAkunForm({ ...akunForm, saldo_awal: num });
    setDisplaySaldo(raw ? formatRupiah(num) : "");
  };
  // Handle Delete
  const onDelete = async (row) => {
  const pretty = new Intl.NumberFormat("id-ID").format(row.debit || 0);
  if (!window.confirm(`Hapus laporan ini?\nJumlah: Rp ${pretty}\nTanggal: ${new Date(row.tanggal).toLocaleDateString("id-ID")}`)) {
    return;
  }
  try {
    setDeletingId(row.id_laporan);
    await deletePendapatan(token, row.id_laporan);
    // opsional: optimistik
    // setPendapatan((prev) => prev.filter(x => x.id_laporan !== row.id_laporan));
    alert("Berhasil hapus pendapatan.");
    window.location.reload();
  } catch (err) {
    console.error("Gagal hapus pendapatan:", err);
    alert(err?.response?.data?.message || "Gagal menghapus pendapatan");
  } finally {
    setDeletingId(null);
  }
};


  // submit create/update
  async function submitLaporan(e) {
    e.preventDefault();

    if (!form.akun_id) return alert("Pilih Akun Kas dulu.");
    if (!form.tanggal) return alert("Isi tanggal dulu.");
    if (items.length === 0) return alert("Tambahkan minimal 1 produk.");
    for (const r of items) {
      if (!r.produk_id) return alert("Ada baris tanpa produk yang dipilih.");
      if (!r.qty || r.qty <= 0) return alert("Qty setiap baris harus > 0.");
      if (!r.harga_satuan || r.harga_satuan <= 0) return alert("Harga satuan setiap baris harus > 0.");
    }

    const payload = {
      akun_id: form.akun_id,
      deskripsi: form.deskripsi,
      tanggal: form.tanggal,
      jumlah: total,            // supaya kompatibel dgn service lama
      items: items.map((r) => ({
        produk_id: r.produk_id,
        jumlah: Number(r.qty),
        harga_satuan: Number(r.harga_satuan),
        subtotal: subtot(r),
      })),
    };

    try {
      if (editingId) {
        // sesuai dok PATCH → kirim items untuk mengganti detail
        await updatePendapatan(token, editingId, {
          jenis: "pemasukan",
          debit: total,
          kredit: 0,
          akun_id: form.akun_id,
          deskripsi: form.deskripsi,
          tanggal: form.tanggal,
          ...(replaceItems ? { items: payload.items } : {}), // kalau tidak replace, omit items
        });
      } else {
        // pastikan service POST meneruskan 'items' ke body
        await addPendapatan(token, {
          jenis: "pemasukan",
          debit: total,
          kredit: 0,
          akun_id: form.akun_id,
          deskripsi: form.deskripsi,
          tanggal: form.tanggal,
          items: payload.items,
        });
        console.log("payload items:", payload.items);
      }

      // reset
      setForm({ akun_id: 0, deskripsi: "", tanggal: "" });
      setItems([{ produk_id: 0, qty: 1, harga_satuan: 0 }]);
      setHargaDisplay([""]);
      setEditingId(null);
      setReplaceItems(true);
      setShowModal(false);
      loadInitialData();
    } catch (err) {
      console.error("Gagal simpan pendapatan:", err);
      alert(err?.response?.data?.message || "Gagal menyimpan pendapatan");
    }
  }

  // edit row (kalau API list belum mengembalikan items, user bisa replace items baru)
  const onEdit = async (row) => {
    setEditingId(row.id_laporan);
    setShowModal(true); // buka dulu biar terasa responsif

    try {
      const res = await getLaporanById(token, row.id_laporan);
      const d = res.data?.data || res.data || {};

      // isi form utama
      setForm({
        akun_id: Number(d.akun_id ?? row.akun_id) || 0,
        deskripsi: d.deskripsi ?? row.deskripsi ?? "",
        tanggal: (d.tanggal ?? row.tanggal ?? "").slice(0, 10),
      });

      // --- penting: map details -> items di state ---
      const det = Array.isArray(d.details) ? d.details : [];
      const its = det.map((it) => {
        const qty = Number(it.jumlah ?? 1);
        const unit = it.harga_satuan != null
          ? Number(it.harga_satuan)
          : Math.round(Number(it.subtotal ?? 0) / (qty || 1));
        return {
          produk_id: Number(it.produk_id ?? it.produk?.produk_id ?? 0),
          qty,
          harga_satuan: unit,
        };
      });

      if (its.length) {
        setItems(its);
        setHargaDisplay(its.map((x) => (x.harga_satuan ? formatRupiah(x.harga_satuan) : "")));
        setReplaceItems(false); // karena kita sudah muat items lama
      } else {
        // fallback kalau endpoint tidak mengembalikan details
        setItems([{ produk_id: 0, qty: 1, harga_satuan: 0 }]);
        setHargaDisplay([""]);
        setReplaceItems(true);
      }
    } catch (e) {
      console.error("Gagal ambil detail laporan:", e);
      // fallback minimal
      setForm({
        akun_id: Number(row.akun_id) || 0,
        deskripsi: row.deskripsi || "",
        tanggal: (row.tanggal || "").slice(0, 10),
      });
      setItems([{ produk_id: 0, qty: 1, harga_satuan: 0 }]);
      setHargaDisplay([""]);
      setReplaceItems(true);
    }
  };

  // Copy ID
  const copyId = async () => {
  try {
    await navigator.clipboard.writeText(editingId);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  } catch {}
};

  //  Untuk data transaksi terakhir
  const transaksiTerakhir = useMemo(() => {
    if (pendapatan.length === 0) return null;
    const sorted = [...pendapatan].sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
    return sorted[0];
  }, [pendapatan]);
  // Untuk data akun kas terakhir (berdasarkan transaksi terakhir)
  const akunTerakhir = useMemo(() => {
  if (!transaksiTerakhir) return null;
  const acc = akunKas.find(a => a.akun_id === transaksiTerakhir.akun_id);
  return {
    id: transaksiTerakhir.akun_id,
    nama: transaksiTerakhir.akun_nama || acc?.nama || null,
    saldo: acc?.saldo_akhir,
  };
}, [transaksiTerakhir, akunKas]);


  return (
    <>
      {/* Header */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6 flex flex-wrap gap-3 justify-between items-center">
        <h2 className="text-2xl font-bold">Pendapatan Pertanian</h2>
        <div className="flex gap-2">
          <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={() => { setEditingId(null); setShowModal(true); }}>
            + Tambah Pendapatan
          </button>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded" onClick={() => setShowProductModal(true)}>
            + Tambah Kategori/Produk
          </button>
          <button className="bg-sky-600 text-white px-4 py-2 rounded" onClick={() => setShowAkunModal(true)}>
            + Tambah Akun Kas
          </button>
        </div>
      </div>

      {/* Transaksi Terakhir */}
      {transaksiTerakhir && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Transaksi Terakhir</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div><p className="text-sm text-gray-500">Tanggal</p><p className="font-medium">{new Date(transaksiTerakhir.tanggal).toLocaleDateString("id-ID")}</p></div>
            <div><p className="text-sm text-gray-500">Jumlah</p><p className="font-medium text-green-600">Rp {transaksiTerakhir.debit?.toLocaleString("id-ID")}</p></div>
            <div><p className="text-sm text-gray-500">Akun yang Digunakan</p><p className="font-medium">
            {akunTerakhir?.nama
              ? akunTerakhir.nama
              : akunTerakhir?.id
              ? `Akun #${akunTerakhir.id}`
              : "-"}
          </p>
          {akunTerakhir?.saldo != null && (
            <p className="text-xs text-gray-500">
              Saldo: Rp {akunTerakhir.saldo.toLocaleString("id-ID")}
            </p>
          )}
          </div>
            <div><p className="text-sm text-gray-500">Deskripsi</p><p className="font-medium">{transaksiTerakhir.deskripsi || "-"}</p></div>
          </div>
        </div>
      )}

      {/* Tabel */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Riwayat Pendapatan</h3>
        <table className="w-full text-left border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2">Nomor</th>
              <th className="p-2">Jumlah</th>
              <th className="p-2">Deskripsi</th>
              <th className="p-2">Tanggal</th>
              <th className="p-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {pendapatan.map((item, i) => (
              <tr key={item.id_laporan} className="border-t">
                <td className="p-2">{i + 1}</td>
                <td className="p-2">Rp {item.debit?.toLocaleString("id-ID")}</td>
                <td className="p-2">{item.deskripsi}</td>
                <td className="p-2">{item.tanggal}</td>
                <td className="p-2">
                  <div className="flex gap-2">
                     <button className="px-2 py-1 rounded bg-amber-500 text-white" onClick={() => onEdit(item)}>Edit</button>
                    <button
                      className={`px-2 py-1 rounded bg-rose-600 text-white ${deletingId === item.id_laporan ? "opacity-60 cursor-not-allowed" : ""}`}
                      onClick={() => onDelete(item)}
                      disabled={deletingId === item.id_laporan}
                    >
                      {deletingId === item.id_laporan ? "Menghapus..." : "Hapus"}
                    </button>
                  </div>
                 
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Tambah/Edit Pendapatan dgn MULTI ITEM */}
      {showModal && (
        <div className="modal-overlay w-96">
          <div className="modal-box">
            <h3 className="text-xl font-bold mb-4">{editingId ? "Edit Pendapatan" : "Tambah Pendapatan"}</h3>
            {editingId && (
              <div className="flex items-center gap-2 text-xs mb-3">
                <span className="px-2 py-1 bg-gray-100 rounded">
                  ID: <code className="font-mono">{editingId}</code>
                </span>
                <button
                  type="button"
                  onClick={copyId}
                  className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300"
                  title="Salin ID"
                >
                  {copied ? "Tersalin ✓" : "Salin"}
                </button>
              </div>
            )}
            <form onSubmit={submitLaporan} className="flex flex-col gap-3">
              {/* Akun Kas */}
              <select
                value={form.akun_id}
                onChange={(e) => setForm({ ...form, akun_id: Number(e.target.value) })}
                className="block w-full border rounded"
                required
              >
                <option value={0}>Pilih Akun Kas</option>
                {akunKas.map((a) => (
                  <option key={a.akun_id} value={a.akun_id}>
                    {a.nama} {typeof a.saldo_akhir === "number" ? `— Rp ${a.saldo_akhir.toLocaleString("id-ID")}` : ""}
                  </option>
                ))}
              </select>

              {/* ITEMS */}
              <div className="border rounded p-3">
                <div className="flex justify-between items-center mb-2">
                  <div className="font-semibold">Item Produk</div>
                  <button type="button" className="px-2 py-1 rounded bg-emerald-600 text-white" onClick={addRow}>
                    + Tambah Baris
                  </button>
                </div>

                <div className="grid grid-cols-12 gap-2 text-sm font-medium mb-1">
                  <div className="col-span-6">Produk</div>
                  <div className="col-span-2">Qty</div>
                  <div className="col-span-3">Harga Satuan (Rp)</div>
                  {/* <div className="col-span-1 text-right">Subtotal</div> */}
                </div>

                {items.map((r, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center mb-2">
                    <div className="col-span-6">
                      <select
                        className="w-full border rounded"
                        value={r.produk_id}
                        onChange={(e) => onProdukChange(idx, e.target.value)}
                        required
                      >
                        <option value={0}>Pilih produk</option>
                        {products.map((p) => (
                          <option key={p.produk_id} value={p.produk_id}>
                            {p.nama}{p.kategori_nama ? ` — ${p.kategori_nama}` : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        min="1"
                        className="w-full border rounded px-2 py-1"
                        value={r.qty}
                        onChange={(e) => onQtyChange(idx, e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-span-3">
                      <input
                        type="text"
                        className="w-full border rounded px-2 py-1"
                        placeholder="Rp"
                        value={hargaDisplay[idx] ?? ""}
                        onChange={(e) => onHargaChange(idx, e)}
                        onBlur={() => onHargaBlur(idx)}
                        required
                      />
                    </div>
                    {/* <div className="col-span-1 text-right">
                      // {formatRupiah(subtot(r))}
                    </div> */}

                    <div className="col-span-12">
                      {items.length > 1 && (
                        <button
                          type="button"
                          className="text-red-600 text-xs underline"
                          onClick={() => removeRow(idx)}
                        >
                          Hapus baris
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between">
                <div className="text-sm text-gray-600">
                  {editingId && (
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={replaceItems}
                        onChange={(e) => setReplaceItems(e.target.checked)}
                      />
                      Ganti semua detail (items) saat simpan
                    </label>
                  )}
                </div>
                <div className="font-semibold">
                  Total: <span className="text-green-700">{formatRupiah(total)}</span>
                </div>
              </div>

              <textarea
                placeholder="Deskripsi pendapatan..."
                value={form.deskripsi}
                onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
              />

              <input
                type="date"
                value={form.tanggal}
                onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
                required
              />

              <div className="flex justify-end gap-3 mt-3">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => {
                    setShowModal(false);
                    setEditingId(null);
                    setReplaceItems(true);
                    setItems([{ produk_id: 0, qty: 1, harga_satuan: 0 }]);
                    setHargaDisplay([""]);
                  }}
                >
                  Batal
                </button>
                <button type="submit" className="btn-simpan">
                  {editingId ? "Simpan Perubahan" : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah Kategori/Produk */}
      {showProductModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3 className="text-xl font-bold mb-4">Tambah Kategori / Produk</h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await createProduct(productForm);
                  setProductForm({ nama: "", kategori_nama: "" });
                  setShowProductModal(false);
                  await loadProducts();
                } catch (err) {
                  console.error("Gagal tambah produk/kategori:", err);
                  alert(err?.response?.data?.message || "Gagal menambah kategori/produk");
                }
              }}
              className="flex flex-col gap-3"
            >
              <div className="font-bold">Nama Produk</div>
              <input type="text" value={productForm.nama} onChange={(e) => setProductForm({ ...productForm, nama: e.target.value })} required />
              <div className="font-bold">Kategori Produk</div>
              <input type="text" value={productForm.kategori_nama} onChange={(e) => setProductForm({ ...productForm, kategori_nama: e.target.value })} required />
              <div className="flex justify-end gap-3 mt-3">
                <button type="button" className="btn-cancel" onClick={() => setShowProductModal(false)}>Batal</button>
                <button type="submit" className="btn-simpan">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah Akun Kas */}
      {showAkunModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3 className="text-xl font-bold mb-4">Tambah Akun Kas</h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await createAkunKas({ nama: akunForm.nama, deskripsi: akunForm.deskripsi, saldo_awal: akunForm.saldo_awal });
                  setAkunForm({ nama: "", deskripsi: "", saldo_awal: 0 });
                  setDisplaySaldo("");
                  setShowAkunModal(false);
                  await loadAkunKas();
                } catch (err) {
                  console.error("Gagal tambah akun kas:", err);
                  alert(err?.response?.data?.message || "Gagal menambah akun kas");
                }
              }}
              className="flex flex-col gap-3"
            >
              <div className="font-bold">Nama Akun</div>
              <input type="text" value={akunForm.nama} onChange={(e) => setAkunForm({ ...akunForm, nama: e.target.value })} required />
              <div className="font-bold">Deskripsi</div>
              <input type="text" value={akunForm.deskripsi} onChange={(e) => setAkunForm({ ...akunForm, deskripsi: e.target.value })} />
              <div className="font-bold">Saldo Awal</div>
              <input type="text" placeholder="Saldo awal (Rp)" value={displaySaldo} onChange={handleChangeSaldoAwal} onBlur={() => setDisplaySaldo(formatRupiah(akunForm.saldo_awal))} />
              <div className="flex justify-end gap-3 mt-3">
                <button type="button" className="btn-cancel" onClick={() => { setShowAkunModal(false); setDisplaySaldo(""); }}>Batal</button>
                <button type="submit" className="btn-simpan">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}