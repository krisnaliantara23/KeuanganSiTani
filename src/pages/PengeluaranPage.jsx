// src/pages/PengeluaranPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  getPengeluaran,
  addPengeluaran,
  updatePengeluaran,
  deletePengeluaran,
  getLaporanById,
} from "../services/financeService";
import { getProducts, createProduct } from "../services/productService";
import { listAkunKas, createAkunKas } from "../services/akunKasService";
import "../styles/pendapatan.css";

export default function PengeluaranPage() {
  const token = localStorage.getItem("token");

  // data list
  const [pengeluaran, setPengeluaran] = useState([]);
  const [products, setProducts] = useState([]);
  const [akunKas, setAkunKas] = useState([]);

  // modal
  const [showModal, setShowModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showAkunModal, setShowAkunModal] = useState(false);

  // edit/delete state
  const [editingId, setEditingId] = useState(null);
  const [replaceItems, setReplaceItems] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [copied, setCopied] = useState(false);

  // form utama
  const [form, setForm] = useState({
    akun_id: 0,
    deskripsi: "",
    tanggal: "",
  });

  // items (multi baris)
  const [items, setItems] = useState([{ produk_id: 0, qty: 1, harga_satuan: 0 }]);
  const [hargaDisplay, setHargaDisplay] = useState([""]);

  // form bantu
  const [productForm, setProductForm] = useState({ nama: "", kategori_nama: "" });
  const [akunForm, setAkunForm] = useState({ nama: "", deskripsi: "", saldo_awal: 0 });
  const [displaySaldo, setDisplaySaldo] = useState("");

  useEffect(() => {
    loadInitialData(); // ✅ Fixed: changed from loadData() to loadInitialData()
    loadProducts();
    loadAkunKas();
  }, []);

  async function loadInitialData() {
    try {
      const data = await getPengeluaran(token);
      setPengeluaran(data);
    } catch (err) {
      console.error("Gagal ambil pengeluaran:", err);
    }
  }
  async function loadProducts() {
    try {
      const res = await getProducts();
      const list = Array.isArray(res.data?.data) ? res.data.data : res.data || [];
      setProducts(list);
    } catch (err) {
      console.error("Gagal ambil produk:", err);
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

  // util
  const formatRupiah = (v) =>
    !v ? "" : new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(v);

  const subtot = (r) => Number(r.qty || 0) * Number(r.harga_satuan || 0);
  const total = useMemo(() => items.reduce((s, r) => s + subtot(r), 0), [items]);

  // handlers baris
  const addRow = () => {
    setItems((a) => [...a, { produk_id: 0, qty: 1, harga_satuan: 0 }]);
    setHargaDisplay((d) => [...d, ""]);
    setReplaceItems(true);
  };
  const removeRow = (idx) => {
    setItems((a) => a.filter((_, i) => i !== idx));
    setHargaDisplay((d) => d.filter((_, i) => i !== idx));
    setReplaceItems(true);
  };
  const updateRow = (idx, patch) => setItems((a) => a.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  const onQtyChange = (idx, val) => {
    updateRow(idx, { qty: Math.max(0, Number(val || 0)) });
    setReplaceItems(true);
  };
  const onProdukChange = (idx, val) => {
    updateRow(idx, { produk_id: Number(val || 0) });
    setReplaceItems(true);
  };
  const onHargaChange = (idx, e) => {
    const raw = e.target.value.replace(/\D/g, "");
    const num = Number(raw || 0);
    updateRow(idx, { harga_satuan: num });
    setHargaDisplay((d) => d.map((s, i) => (i === idx ? (raw ? formatRupiah(num) : "") : s)));
    setReplaceItems(true);
  };
  const onHargaBlur = (idx) => {
    setHargaDisplay((d) => d.map((s, i) => (i === idx ? formatRupiah(items[idx].harga_satuan) : s)));
  };

  // akun kas form
  const handleChangeSaldoAwal = (e) => {
    const raw = e.target.value.replace(/\D/g, "");
    const num = Number(raw);
    setAkunForm({ ...akunForm, saldo_awal: num });
    setDisplaySaldo(raw ? formatRupiah(num) : "");
  };

  // CREATE/UPDATE pengeluaran
  async function submitLaporan(e) {
    e.preventDefault();
    if (!form.akun_id) return alert("Pilih Akun Kas dulu.");
    if (!form.tanggal) return alert("Isi tanggal dulu.");
    if (items.length === 0) return alert("Tambahkan minimal 1 produk.");
    for (const r of items) {
      if (!r.produk_id) return alert("Ada baris tanpa produk.");
      if (!r.qty || r.qty <= 0) return alert("Qty harus > 0.");
      if (!r.harga_satuan || r.harga_satuan <= 0) return alert("Harga satuan harus > 0.");
    }

    const mappedItems = items.map((r) => ({
      produk_id: r.produk_id,
      jumlah: Number(r.qty),
      harga_satuan: Number(r.harga_satuan),
      subtotal: subtot(r),
    }));

    try {
      if (editingId) {
        await updatePengeluaran(token, editingId, {
          jenis: "pengeluaran",
          debit: 0,
          kredit: total,
          akun_id: form.akun_id,
          deskripsi: form.deskripsi,
          tanggal: form.tanggal,
          ...(replaceItems ? { items: mappedItems } : {}),
        });
      } else {
        await addPengeluaran(token, {
          jenis: "pengeluaran",
          debit: 0,
          kredit: total,
          akun_id: form.akun_id,
          deskripsi: form.deskripsi,
          tanggal: form.tanggal,
          items: mappedItems,
        });
        console.log(total);
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
      console.error("Gagal simpan pengeluaran:", err);
      alert(err?.response?.data?.message || "Gagal menyimpan pengeluaran");
    }
  }

  // EDIT: load detail (details -> items)
  const onEdit = async (row) => {
    setEditingId(row.id_laporan);
    setShowModal(true);
    try {
      const res = await getLaporanById(token, row.id_laporan);
      const d = res.data?.data || res.data || {};

      setForm({
        akun_id: Number(d.akun_id ?? row.akun_id) || 0,
        deskripsi: d.deskripsi ?? row.deskripsi ?? "",
        tanggal: (d.tanggal ?? row.tanggal ?? "").slice(0, 10),
      });

      const det = Array.isArray(d.details) ? d.details : [];
      const its = det.map((it) => {
        const qty = Number(it.jumlah ?? 1);
        const unit =
          it.harga_satuan != null
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
        setReplaceItems(false); // sudah pakai items lama
      } else {
        setItems([{ produk_id: 0, qty: 1, harga_satuan: 0 }]);
        setHargaDisplay([""]);
        setReplaceItems(true);
      }
    } catch (e) {
      console.error("Gagal ambil detail laporan:", e);
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
  // COPY ID
  const copyId = async () => {
  try {
    await navigator.clipboard.writeText(editingId);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  } catch {}
  };
  // DELETE
  const onDelete = async (row) => {
    const pretty = new Intl.NumberFormat("id-ID").format(row.kredit || 0);
    if (!window.confirm(`Hapus pengeluaran ini?\nJumlah: Rp ${pretty}\nTanggal: ${new Date(row.tanggal).toLocaleDateString("id-ID")}`)) {
      return;
    }
    try {
      setDeletingId(row.id_laporan);
      await deletePengeluaran(token, row.id_laporan);
      await loadData();
    } catch (err) {
      console.error("Gagal hapus pengeluaran:", err);
      alert(err?.response?.data?.message || "Gagal menghapus pengeluaran");
    } finally {
      setDeletingId(null);
    }
  };

  // transaksi terakhir + akun kasnya
  const transaksiTerakhir = useMemo(() => {
    if (pengeluaran.length === 0) return null;
    return [...pengeluaran].sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))[0];
  }, [pengeluaran]);

  const akunTerakhir = useMemo(() => {
    if (!transaksiTerakhir) return null;
    const acc = akunKas.find((a) => a.akun_id === transaksiTerakhir.akun_id);
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
        <h2 className="text-2xl font-bold">Pengeluaran Pertanian</h2>
        <div className="flex gap-2">
          <button
            className="bg-red-600 text-white px-4 py-2 rounded"
            onClick={() => {
              setEditingId(null);
              setItems([{ produk_id: 0, qty: 1, harga_satuan: 0 }]);
              setHargaDisplay([""]);
              setReplaceItems(true);
              setShowModal(true);
            }}
          >
            + Tambah Pengeluaran
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
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <p className="text-sm text-gray-500">Tanggal</p>
              <p className="font-medium">
                {new Date(transaksiTerakhir.tanggal).toLocaleDateString("id-ID")}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Jumlah</p>
              <p className="font-medium text-red-600">
                Rp {transaksiTerakhir.kredit?.toLocaleString("id-ID")}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Akun Kas</p>
              <p className="font-medium">
                {akunTerakhir?.nama ? akunTerakhir.nama : akunTerakhir?.id ? `Akun #${akunTerakhir.id}` : "-"}
              </p>
              {akunTerakhir?.saldo != null && (
                <p className="text-xs text-gray-500">
                  Saldo: Rp {akunTerakhir.saldo.toLocaleString("id-ID")}
                </p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500">Deskripsi</p>
              <p className="font-medium">{transaksiTerakhir.deskripsi || "-"}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabel */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Riwayat Pengeluaran</h3>
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
            {pengeluaran.map((item, i) => (
              <tr key={item.id_laporan} className="border-t">
                <td className="p-2">{i + 1}</td>
                <td className="p-2">Rp {item.kredit?.toLocaleString("id-ID")}</td>
                <td className="p-2">{item.deskripsi}</td>
                <td className="p-2">{new Date(item.tanggal).toLocaleDateString("id-ID")}</td>
                <td className="p-2">
                  <div className="flex gap-2">
                    <button className="px-2 py-1 rounded bg-amber-500 text-white" onClick={() => onEdit(item)}>
                      Edit
                    </button>
                    <button
                      className={`px-2 py-1 rounded bg-rose-600 text-white ${
                        deletingId === item.id_laporan ? "opacity-60 cursor-not-allowed" : ""
                      }`}
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

      {/* Modal Tambah/Edit Pengeluaran (MULTI ITEM) */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box max-w-3xl">
            <h3 className="text-xl font-bold mb-4">{editingId ? "Edit Pengeluaran" : "Tambah Pengeluaran"}</h3>
            {/* Tampilin ID Laporannya */}
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
                  <div className="col-span-5">Produk</div>
                  <div className="col-span-2">Qty</div>
                  <div className="col-span-3">Harga Satuan (Rp)</div>
                  {/* <div className="col-span-2 text-right">Subtotal</div> */}
                </div>

                {items.map((r, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center mb-2">
                    <div className="col-span-5">
                      <select
                        className="w-full border rounded"
                        value={r.produk_id}
                        onChange={(e) => onProdukChange(idx, e.target.value)}
                        required
                      >
                        <option value={0}>Pilih produk</option>
                        {products.map((p) => (
                          <option key={p.produk_id} value={p.produk_id}>
                            {p.nama}
                            {p.kategori_nama ? ` — ${p.kategori_nama}` : ""}
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
                    {/* <div className="col-span-2 text-right">//{formatRupiah(subtot(r))}</div> */}

                    <div className="col-span-12">
                      {items.length > 1 && (
                        <button type="button" className="text-red-600 text-xs underline" onClick={() => removeRow(idx)}>
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
                  Total: <span className="text-red-700">{formatRupiah(total)}</span>
                </div>
              </div>

              <textarea
                placeholder="Deskripsi pengeluaran..."
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

            {akunKas?.length > 0 && (
              <div className="mt-4 border-t pt-3">
                <p className="text-sm text-gray-600 mb-1">Akun Kas terbaru:</p>
                <ul className="list-disc pl-5 max-h-36 overflow-auto">
                  {akunKas.slice(0, 5).map((a) => (
                    <li key={a.akun_id}>
                      {a.nama} {typeof a.saldo_akhir === "number" ? `— Rp ${a.saldo_akhir.toLocaleString("id-ID")}` : ""}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}