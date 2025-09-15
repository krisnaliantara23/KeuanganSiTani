// src/pages/PengeluaranPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  getPengeluaran,
  addPengeluaran,
  updatePengeluaran,
  deletePengeluaran,
  getLaporanById,
} from "../services/financeService";
import { getProducts } from "../services/productService";
import { listAkunKas } from "../services/akunKasService";
import { listKategoriScopev2 } from "../services/kategoriService";
import "../styles/pendapatan.css";

export default function PengeluaranPage() {
  const token = localStorage.getItem("token");

  // ===== Utils
  const formatRupiah = (v) =>
    !v
      ? ""
      : new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          minimumFractionDigits: 0,
        }).format(v);

  const getScopeParams = (extra = {}) => {
    let user_id = null, klaster_id = null;
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const obj = JSON.parse(raw);
        user_id = obj?.user_id || obj;
        klaster_id = obj?.klaster_id || null;
      }
    } catch {}
    const p = { ...extra };
    if (user_id) p.user_id = user_id;
    if (klaster_id) p.klaster_id = klaster_id;
    return p;
  };

  const isShared = (obj) =>
    Boolean(obj?.share_to_klaster ?? obj?.share_klaster ?? obj?.klaster_id);

  // ===== State (khusus pengeluaran)
  const [pengeluaran, setPengeluaran] = useState([]);
  const [produkPengeluaran, setProdukPengeluaran] = useState([]); // dropdown item
  const [akunKas, setAkunKas] = useState([]);

  // filter & modal
  const [filterShare, setFilterShare] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [replaceItems, setReplaceItems] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [copied, setCopied] = useState(false);

  // form transaksi
  const [form, setForm] = useState({
    akun_id: 0,
    deskripsi: "",
    tanggal: "",
    share_to_klaster: false,
  });

  // items multi-baris
  const [items, setItems] = useState([{ produk_id: 0, qty: 1, harga_satuan: 0 }]);
  const [hargaDisplay, setHargaDisplay] = useState([""]);

  // ===== Loaders
  useEffect(() => {
    loadInitialData();
    loadProductsForDropdown();
    loadAkunKas();
  }, []);

  async function loadInitialData() {
    try {
      const data = await getPengeluaran(token);
      setPengeluaran(data || []);
    } catch (err) {
      console.error("Gagal ambil pengeluaran:", err);
      setPengeluaran([]);
    }
  }

  async function loadProductsForDropdown() {
    // Hanya produk kategori "pengeluaran"
    try {
      const [resProduk, resKat] = await Promise.all([
        getProducts(),
        listKategoriScopev2(getScopeParams({ jenis: "pengeluaran", limit: 200 })),
      ]);

      const listProduk = Array.isArray(resProduk.data?.data)
        ? resProduk.data.data
        : resProduk.data || [];

      const katList = Array.isArray(resKat.data?.data) ? resKat.data.data : [];
      const pengeluaranIds = new Set(katList.map((k) => Number(k.kategori_id)));

      const onlyExpense = listProduk.filter((p) => {
        const jenis = (
          p.kategori_jenis ||
          p.jenis_kategori ||
          p.kategori?.jenis ||
          p.jenis ||
          ""
        ).toLowerCase();
        if (jenis) return jenis === "pengeluaran";
        return pengeluaranIds.size ? pengeluaranIds.has(Number(p.kategori_id)) : false;
      });

      setProdukPengeluaran(onlyExpense);
    } catch (err) {
      console.error("Gagal ambil produk/kategori:", err);
      setProdukPengeluaran([]);
    }
  }

  async function loadAkunKas(params = { page: 1, limit: 100 }) {
    try {
      const res = await listAkunKas(params);
      const list = Array.isArray(res.data?.data) ? res.data.data : res.data?.data || [];
      setAkunKas(list);
    } catch (err) {
      console.error("Gagal ambil akun kas:", err);
      setAkunKas([]);
    }
  }

  // ===== Items handlers
  const subtot = (r) => Number(r.qty || 0) * Number(r.harga_satuan || 0);
  const total = useMemo(() => items.reduce((s, r) => s + subtot(r), 0), [items]);

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
  const updateRow = (idx, patch) =>
    setItems((a) => a.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
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
    setHargaDisplay((d) =>
      d.map((s, i) => (i === idx ? (raw ? formatRupiah(num) : "") : s))
    );
    setReplaceItems(true);
  };
  const onHargaBlur = (idx) => {
    setHargaDisplay((d) =>
      d.map((s, i) => (i === idx ? formatRupiah(items[idx].harga_satuan) : s))
    );
  };

  // ===== CRUD transaksi
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
          share_klaster: !!form.share_to_klaster,
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
          share_klaster: !!form.share_to_klaster,
          items: mappedItems,
        });
      }

      // reset
      setForm({ akun_id: 0, deskripsi: "", tanggal: "", share_to_klaster: false });
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
        share_to_klaster: Boolean(
          d.share_to_klaster ?? d.share_klaster ?? d.klaster_id ?? row.klaster_id
        ),
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
        setReplaceItems(false);
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
        share_to_klaster: !!row.share_to_klaster,
      });
      setItems([{ produk_id: 0, qty: 1, harga_satuan: 0 }]);
      setHargaDisplay([""]);
      setReplaceItems(true);
    }
  };

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(editingId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  const onDelete = async (row) => {
    const pretty = new Intl.NumberFormat("id-ID").format(row.kredit || 0);
    if (
      !window.confirm(
        `Hapus pengeluaran ini?\nJumlah: Rp ${pretty}\nTanggal: ${new Date(
          row.tanggal
        ).toLocaleDateString("id-ID")}`
      )
    ) {
      return;
    }
    try {
      setDeletingId(row.id_laporan);
      await deletePengeluaran(token, row.id_laporan);
      alert("Berhasil hapus pengeluaran.");
      await loadInitialData();
    } catch (err) {
      console.error("Gagal hapus pengeluaran:", err);
      alert(err?.response?.data?.message || "Gagal menghapus pengeluaran");
    } finally {
      setDeletingId(null);
    }
  };

  // ===== Derived
  const pengeluaranFiltered = useMemo(() => {
    if (filterShare === "own") return pengeluaran.filter((x) => !isShared(x));
    if (filterShare === "shared") return pengeluaran.filter((x) => isShared(x));
    return pengeluaran;
  }, [pengeluaran, filterShare]);

  const transaksiTerakhir = useMemo(() => {
    if (pengeluaranFiltered.length === 0) return null;
    return [...pengeluaranFiltered].sort(
      (a, b) => new Date(b.tanggal) - new Date(a.tanggal)
    )[0];
  }, [pengeluaranFiltered]);

  const akunTerakhir = useMemo(() => {
    if (!transaksiTerakhir) return null;
    const acc = akunKas.find((a) => a.akun_id === transaksiTerakhir.akun_id);
    return {
      id: transaksiTerakhir.akun_id,
      nama: transaksiTerakhir.akun_nama || acc?.nama || null,
      saldo: acc?.saldo_akhir,
    };
  }, [transaksiTerakhir, akunKas]);

  // ===== Render
  return (
    <>
      {/* Header */}
      <div className="bg-white rounded-xl shadow-md p-4 md:p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <h2 className="text-xl md:text-2xl font-bold">Pengeluaran Pertanian</h2>

          <div className="flex gap-2 items-center flex-wrap">
            <select
              className="border rounded px-2 py-2 text-sm md:text-base"
              value={filterShare}
              onChange={(e) => setFilterShare(e.target.value)}
              title="Filter laporan"
            >
              <option value="all">Semua</option>
              <option value="own">Milik Saya</option>
              <option value="shared">Share Klaster</option>
            </select>
            <button
              className="bg-red-600 text-white px-3 py-2 md:px-4 md:py-2 rounded text-sm md:text-base"
              onClick={() => {
                setEditingId(null);
                setItems([{ produk_id: 0, qty: 1, harga_satuan: 0 }]);
                setHargaDisplay([""]);
                setForm({ akun_id: 0, deskripsi: "", tanggal: "", share_to_klaster: false });
                setReplaceItems(true);
                setShowModal(true);
              }}
            >
              + Tambah Pengeluaran
            </button>
          </div>
        </div>
      </div>

      {/* Transaksi Terakhir */}
      {transaksiTerakhir && (
        <div className="bg-white rounded-xl shadow-md p-4 md:p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Transaksi Terakhir</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <p className="text-xs md:text-sm text-gray-500">Tanggal</p>
              <p className="font-medium">
                {new Date(transaksiTerakhir.tanggal).toLocaleDateString("id-ID")}
              </p>
            </div>
            <div>
              <p className="text-xs md:text-sm text-gray-500">Jumlah</p>
              <p className="font-medium text-red-600">
                Rp {transaksiTerakhir.kredit?.toLocaleString("id-ID")}
              </p>
            </div>
            <div>
              <p className="text-xs md:text-sm text-gray-500">Akun Kas</p>
              <p className="font-medium">
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
            <div className="md:col-span-1">
              <p className="text-xs md:text-sm text-gray-500">Deskripsi</p>
              <p className="font-medium">{transaksiTerakhir.deskripsi || "-"}</p>
            </div>
            <div>
              <p className="text-xs md:text-sm text-gray-500">Share</p>
              <p className="font-medium">{isShared(transaksiTerakhir) ? "Klaster" : "Pribadi"}</p>
            </div>
          </div>
        </div>
      )}

      {/* ====== Riwayat (Mobile Cards) ====== */}
      <div className="md:hidden bg-white rounded-xl shadow-md p-4">
        <h3 className="text-lg font-semibold mb-4">Riwayat Pengeluaran</h3>

        {pengeluaranFiltered.length === 0 ? (
          <div className="text-center text-gray-500 py-6">Tidak ada data.</div>
        ) : (
          <div className="space-y-3">
            {pengeluaranFiltered.map((item, i) => (
              <div key={item.id_laporan} className="rounded-lg border p-4">
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <div className="text-sm text-gray-500">
                      {new Date(item.tanggal).toLocaleDateString("id-ID")}
                    </div>
                    <div className="text-base font-semibold text-red-700">
                      Rp {item.kredit?.toLocaleString("id-ID")}
                    </div>
                    <div className="text-sm text-gray-700 line-clamp-2">
                      {item.deskripsi || "-"}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {isShared(item) ? "Klaster" : "Pribadi"}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      className="px-2 py-1 rounded bg-amber-500 text-white text-sm"
                      onClick={() => onEdit(item)}
                    >
                      Edit
                    </button>
                    <button
                      className={`px-2 py-1 rounded bg-rose-600 text-white text-sm ${
                        deletingId === item.id_laporan ? "opacity-60 cursor-not-allowed" : ""
                      }`}
                      onClick={() => onDelete(item)}
                      disabled={deletingId === item.id_laporan}
                    >
                      {deletingId === item.id_laporan ? "Menghapus..." : "Hapus"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ====== Riwayat (Desktop Table) ====== */}
      <div className="hidden md:block bg-white rounded-xl shadow-md p-6 mt-6 md:mt-0">
        <h3 className="text-lg font-semibold mb-4">Riwayat Pengeluaran</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2">Nomor</th>
                <th className="p-2">Jumlah</th>
                <th className="p-2">Deskripsi</th>
                <th className="p-2">Tanggal</th>
                <th className="p-2">Share</th>
                <th className="p-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {pengeluaranFiltered.map((item, i) => (
                <tr key={item.id_laporan} className="border-t">
                  <td className="p-2">{i + 1}</td>
                  <td className="p-2">Rp {item.kredit?.toLocaleString("id-ID")}</td>
                  <td className="p-2">{item.deskripsi || "-"}</td>
                  <td className="p-2">{new Date(item.tanggal).toLocaleDateString("id-ID")}</td>
                  <td className="p-2">{isShared(item) ? "Klaster" : "Pribadi"}</td>
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
              {pengeluaranFiltered.length === 0 && (
                <tr>
                  <td className="p-3 text-center text-gray-500" colSpan={6}>
                    Tidak ada data.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ====== Modal Tambah/Edit Pengeluaran ====== */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box w-full max-w-none md:max-w-3xl h-[100dvh] md:h-auto rounded-none md:rounded-xl overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">{editingId ? "Edit Pengeluaran" : "Tambah Pengeluaran"}</h3>

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

            <form onSubmit={submitLaporan} className="flex flex-col gap-3 pb-3">
              {/* Akun Kas */}
              <select
                value={form.akun_id}
                onChange={(e) => setForm({ ...form, akun_id: Number(e.target.value) })}
                className="block w-full border rounded px-3 py-2"
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
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                  <div className="font-semibold">Item Produk</div>
                  <button type="button" className="px-2 py-1 rounded bg-emerald-600 text-white text-sm md:text-base" onClick={addRow}>
                    + Tambah Baris
                  </button>
                </div>

                {/* Header grid desktop */}
                <div className="hidden md:grid grid-cols-12 gap-2 text-sm font-medium mb-1">
                  <div className="col-span-6">Produk</div>
                  <div className="col-span-2">Qty</div>
                  <div className="col-span-3">Harga Satuan (Rp)</div>
                  <div className="col-span-1"></div>
                </div>

                {items.map((r, idx) => (
                  <div key={idx} className="mb-3">
                    {/* Mobile: stacked */}
                    <div className="md:hidden space-y-2">
                      <div>
                        <label className="text-xs text-gray-500">Produk</label>
                        <select
                          className="w-full border rounded px-3 py-2"
                          value={r.produk_id}
                          onChange={(e) => onProdukChange(idx, e.target.value)}
                          required
                        >
                          <option value={0}>Pilih produk</option>
                          {produkPengeluaran.map((p) => (
                            <option key={p.produk_id} value={p.produk_id}>
                              {p.nama}
                              {p.kategori_nama ? ` — ${p.kategori_nama}` : ""}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs text-gray-500">Qty</label>
                          <input
                            type="number"
                            min="1"
                            className="w-full border rounded px-3 py-2"
                            value={r.qty}
                            onChange={(e) => onQtyChange(idx, e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">Harga Satuan (Rp)</label>
                          <input
                            type="text"
                            className="w-full border rounded px-3 py-2"
                            placeholder="Rp"
                            value={hargaDisplay[idx] ?? ""}
                            onChange={(e) => onHargaChange(idx, e)}
                            onBlur={() => onHargaBlur(idx)}
                            required
                          />
                        </div>
                      </div>
                      {items.length > 1 && (
                        <button type="button" className="text-red-600 text-xs underline" onClick={() => removeRow(idx)}>
                          Hapus baris
                        </button>
                      )}
                    </div>

                    {/* Desktop: grid */}
                    <div className="hidden md:grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-6">
                        <select
                          className="w-full border rounded px-2 py-1"
                          value={r.produk_id}
                          onChange={(e) => onProdukChange(idx, e.target.value)}
                          required
                        >
                          <option value={0}>Pilih produk</option>
                          {produkPengeluaran.map((p) => (
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
                      <div className="col-span-1">
                        {items.length > 1 && (
                          <button type="button" className="text-red-600 text-xs underline" onClick={() => removeRow(idx)}>
                            Hapus
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Share */}
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.share_to_klaster}
                  onChange={(e) => setForm({ ...form, share_to_klaster: e.target.checked })}
                />
                Bagikan ke klaster
              </label>

              <div className="flex flex-col md:flex-row md:justify-between gap-2">
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
                className="border rounded px-3 py-2"
                placeholder="Deskripsi pengeluaran..."
                value={form.deskripsi}
                onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
              />

              <input
                type="date"
                className="border rounded px-3 py-2"
                value={form.tanggal}
                onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
                required
              />

              {/* Sticky action bar (mobile) */}
              <div className="flex flex-col md:flex-row md:justify-end gap-3 mt-3 sticky bottom-0 bg-white pt-3">
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
    </>
  );
}
