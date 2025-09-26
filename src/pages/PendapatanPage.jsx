// src/pages/PendapatanPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  getPendapatan,
  addPendapatan,
  updatePendapatan,
  getLaporanById,
  deletePendapatan,
} from "../services/financeService";
import { getProducts, getProductById } from "../services/productService";
import { listAkunKas } from "../services/akunKasService";
import { listKategoriScopev2 } from "../services/kategoriService";
import { getCurrentUser } from "../lib/auth";
import "../styles/pendapatan.css";

// ========== Utils ==========
const toastr = window.toastr; // kalau kamu pakai toastr; opsional
if (toastr) {
  toastr.options = {
    positionClass: "toast-top-right",
    closeButton: true,
    progressBar: true,
    timeOut: 2200,
    extendedTimeOut: 1500,
    newestOnTop: true,
    preventDuplicates: true,
  };
}

const formatRupiah = (value) =>
  !value
    ? ""
    : new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(value);

const isShared = (obj) =>
  Boolean(obj?.share_to_klaster ?? obj?.share_klaster ?? obj?.klaster_id);

const getScopeParams = (extra = {}) => {
  let user_id = null,
    klaster_id = null;
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

// ========== Pagination Component ==========
function Pagination({ total, page, limit, onPageChange, onLimitChange }) {
  const totalPages = Math.max(1, Math.ceil((total ?? 0) / (limit || 10)));
  const canPrev = page > 1;
  const canNext = page < totalPages;

  const windowSize = 5;
  const start = Math.max(1, page - Math.floor(windowSize / 2));
  const end = Math.min(totalPages, start + windowSize - 1);
  const pages = [];
  for (let p = start; p <= end; p++) pages.push(p);

  return (
    <div className="flex items-center gap-2 mt-3 flex-wrap">
      <button
        className="px-3 py-1 border rounded disabled:opacity-50"
        onClick={() => onPageChange(1)}
        disabled={!canPrev}
      >
        «
      </button>
      <button
        className="px-3 py-1 border rounded disabled:opacity-50"
        onClick={() => onPageChange(page - 1)}
        disabled={!canPrev}
      >
        Prev
      </button>

      {pages.map((p) => (
        <button
          key={p}
          className={`px-3 py-1 border rounded ${
            p === page ? "bg-gray-200 font-semibold" : ""
          }`}
          onClick={() => onPageChange(p)}
        >
          {p}
        </button>
      ))}

      <button
        className="px-3 py-1 border rounded disabled:opacity-50"
        onClick={() => onPageChange(page + 1)}
        disabled={!canNext}
      >
        Next
      </button>
      <button
        className="px-3 py-1 border rounded disabled:opacity-50"
        onClick={() => onPageChange(totalPages)}
        disabled={!canNext}
      >
        »
      </button>

      <span className="ml-2 text-sm text-gray-600">
        Halaman {page} dari {totalPages} — Total {total ?? 0}
      </span>

      {onLimitChange && (
        <select
          className="ml-3 border rounded px-2 py-1"
          value={limit}
          onChange={(e) => {
            onLimitChange(Number(e.target.value));
            onPageChange(1);
          }}
          title="Items per page"
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      )}
    </div>
  );
}

// ========== Product Picker (search + pagination) ==========
function ProductPicker({
  isOpen,
  onClose,
  onSelect,
  allowedKategoriIds, // Set<number> gabungan kategori "pemasukan" & "modal"
}) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);

  const isAllowed = (p) => {
    const kid = Number(p.kategori_id ?? p.kategori?.kategori_id ?? 0);
    if (!kid) return false;
    return allowedKategoriIds.has(kid);
  };

  useEffect(() => {
    if (!isOpen) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, page, limit]);

  const load = async () => {
    try {
      setLoading(true);
      const res = await getProducts({ page, limit, search: search?.trim() || undefined });
      const payload = res?.data || {};
      const list = Array.isArray(payload.data) ? payload.data : [];
      const filtered = list.filter(isAllowed);
      setRows(filtered);
      setTotal(payload.total ?? 0);

      // jaga2 kalau user search dan total page berubah
      const maxPage = Math.max(1, Math.ceil((payload.total ?? 0) / limit));
      if (page > maxPage) setPage(maxPage);
    } catch (e) {
      console.error("Gagal load produk (picker):", e);
      setRows([]);
      setTotal(0);
      alert("Gagal memuat produk.");
    } finally {
      setLoading(false);
    }
  };

  const applySearch = () => {
    setPage(1);
    load();
  };

  if (!isOpen) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-box w-full max-w-none md:max-w-3xl h-[100dvh] md:h-auto rounded-none md:rounded-xl overflow-y-auto">
        <div className="flex items-center justify-between gap-2 mb-3">
          <h3 className="text-xl font-bold">Pilih Produk (Pemasukan & Modal)</h3>
          <button className="btn-cancel" onClick={onClose}>
            Tutup
          </button>
        </div>

        <div className="flex gap-2 mb-3">
          <input
            className="border rounded px-3 py-2 w-full"
            placeholder="Cari nama produk…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applySearch()}
          />
          <button className="px-3 py-2 bg-gray-100 rounded border" onClick={applySearch}>
            Cari
          </button>
        </div>

        <div className="border rounded">
          <div className="hidden md:grid grid-cols-12 gap-2 px-3 py-2 bg-gray-50 text-sm font-medium">
            <div className="col-span-6">Nama Produk</div>
            <div className="col-span-4">Kategori</div>
            <div className="col-span-2">Aksi</div>
          </div>

          {loading ? (
            <div className="p-4 text-center text-gray-500">Memuat…</div>
          ) : rows.length === 0 ? (
            <div className="p-4 text-center text-gray-500">Tidak ada produk di halaman ini.</div>
          ) : (
            rows.map((p) => (
              <div key={p.produk_id} className="px-3 py-3 border-t first:border-t-0">
                {/* mobile */}
                <div className="md:hidden space-y-1">
                  <div className="font-semibold">{p.nama}</div>
                  <div className="text-sm text-gray-600">
                    {p.kategori?.nama || p.kategori_nama || "-"}
                    {p.kategori?.jenis ? ` — ${p.kategori?.jenis}` : ""}
                  </div>
                  <div className="text-xs text-gray-500">
                    {(p.share_to_klaster ?? p.share_klaster ?? p.klaster_id) ? "Klaster" : "Pribadi"}
                  </div>
                  <div className="pt-2">
                    <button
                      className="px-2 py-1 rounded bg-emerald-600 text-white"
                      onClick={() => onSelect(p)}
                    >
                      Pilih
                    </button>
                  </div>
                </div>

                {/* desktop */}
                <div className="hidden md:grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-6">
                    <div className="font-semibold">{p.nama}</div>
                    <div className="text-xs text-gray-500">
                      {(p.share_to_klaster ?? p.share_klaster ?? p.klaster_id) ? "Klaster" : "Pribadi"}
                    </div>
                  </div>
                  <div className="col-span-4">
                    {p.kategori?.nama || p.kategori_nama || "-"}
                    {p.kategori?.jenis ? ` — ${p.kategori?.jenis}` : ""}
                  </div>
                  <div className="col-span-2">
                    <button
                      className="px-2 py-1 rounded bg-emerald-600 text-white"
                      onClick={() => onSelect(p)}
                    >
                      Pilih
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <Pagination
          total={total}
          page={page}
          limit={limit}
          onPageChange={setPage}
          onLimitChange={setLimit}
        />
      </div>
    </div>
  );
}

export default function PendapatanPage() {
  const token = localStorage.getItem("token");
  const me = getCurrentUser() || {};
  const userId = me.user_id || null;

  // ====== state utama
  const [pendapatan, setPendapatan] = useState([]);
  const [akunKas, setAkunKas] = useState([]);

  // cache produk (id -> objek) untuk tampilkan nama di input readOnly
  const [produkCache, setProdukCache] = useState(new Map());

  // kategori yang diizinkan: pemasukan + modal
  const [allowedKategoriIds, setAllowedKategoriIds] = useState(new Set());

  // filter & modal transaksi
  const [filterShare, setFilterShare] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [replaceItems, setReplaceItems] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [copied, setCopied] = useState(false);

  // ProductPicker state
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerRowIndex, setPickerRowIndex] = useState(null);

  // form transaksi & items
  const [form, setForm] = useState({
    akun_id: 0,
    deskripsi: "",
    tanggal: "",
    share_to_klaster: false,
  });
  const [items, setItems] = useState([{ produk_id: 0, qty: 1, harga_satuan: 0 }]);
  const [hargaDisplay, setHargaDisplay] = useState([""]);

  // ====== effects
  useEffect(() => {
    loadInitialData();
    loadAkunKas();
    prepareAllowedKategori(); // pemasukan + modal
  }, []);

  async function loadInitialData() {
    try {
      const data = await getPendapatan(token, { user_id: userId });
      setPendapatan(data || []);
    } catch (err) {
      console.error("Gagal ambil pendapatan:", err);
      setPendapatan([]);
      toastr?.error?.("Gagal memuat riwayat pendapatan.", "Gagal");
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
      toastr?.error?.("Gagal memuat akun kas.", "Gagal");
    }
  }

  // Ambil kategori_id untuk jenis "pemasukan" dan "modal"
  async function prepareAllowedKategori() {
    try {
      const [resIn, resModal] = await Promise.all([
        listKategoriScopev2(getScopeParams({ jenis: "pemasukan", limit: 300 })),
        listKategoriScopev2(getScopeParams({ jenis: "modal", limit: 300 })),
      ]);
      const arrIn = Array.isArray(resIn.data?.data) ? resIn.data.data : [];
      const arrMd = Array.isArray(resModal.data?.data) ? resModal.data.data : [];
      const ids = new Set([...arrIn, ...arrMd].map((k) => Number(k.kategori_id)));
      setAllowedKategoriIds(ids);
    } catch (e) {
      console.error("Gagal memuat kategori pemasukan/modal:", e);
      setAllowedKategoriIds(new Set());
      toastr?.error?.("Gagal memuat kategori untuk filter produk.", "Gagal");
    }
  }

  // pastikan produk ter-cache saat masuk mode edit
  async function ensureCachedProducts(productIds = []) {
    const missing = productIds.filter((id) => !produkCache.has(id));
    if (!missing.length) return;
    try {
      const fetched = await Promise.all(missing.map((id) => getProductById(id)));
      const next = new Map(produkCache);
      fetched.forEach((res) => {
        const p = res?.data?.data || res?.data || null;
        if (p?.produk_id) next.set(p.produk_id, p);
      });
      setProdukCache(next);
    } catch (e) {
      // abaikan quietly
    }
  }

  // ====== items handlers
  const subtot = (row) => Number(row.qty || 0) * Number(row.harga_satuan || 0);
  const total = useMemo(() => items.reduce((s, r) => s + subtot(r), 0), [items]);

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
  const onHargaChange = (idx, e) => {
    const raw = e.target.value.replace(/\D/g, "");
    const num = Number(raw || 0);
    updateRow(idx, { harga_satuan: num });
    setHargaDisplay((d) => d.map((s, i) => (i === idx ? (raw ? formatRupiah(num) : "") : s)));
  };
  const onHargaBlur = (idx) => {
    setHargaDisplay((d) => d.map((s, i) => (i === idx ? formatRupiah(items[idx].harga_satuan) : s)));
  };

  // ProductPicker open/close/select
  const openPicker = (idx) => {
    setPickerRowIndex(idx);
    setPickerOpen(true);
  };
  const closePicker = () => {
    setPickerOpen(false);
    setPickerRowIndex(null);
  };
  const handleSelectProduct = (p) => {
    if (pickerRowIndex == null) return;
    updateRow(pickerRowIndex, { produk_id: Number(p.produk_id || 0) });
    setProdukCache((m) => {
      const next = new Map(m);
      next.set(p.produk_id, p);
      return next;
    });
    closePicker();
  };

  // ====== CRUD
  async function submitLaporan(e) {
    e.preventDefault();

    // validasi singkat
    if (!form.akun_id) return toastr?.warning?.("Pilih Akun Kas dulu.", "Perhatian");
    if (!form.tanggal) return toastr?.warning?.("Isi tanggal dulu.", "Perhatian");
    if (items.length === 0) return toastr?.warning?.("Tambahkan minimal 1 produk.", "Perhatian");
    for (const r of items) {
      if (!r.produk_id) return toastr?.warning?.("Ada baris tanpa produk.", "Perhatian");
      if (!r.qty || r.qty <= 0) return toastr?.warning?.("Qty harus > 0.", "Perhatian");
      if (!r.harga_satuan || r.harga_satuan <= 0)
        return toastr?.warning?.("Harga satuan harus > 0.", "Perhatian");
    }

    const details = items.map((r) => ({
      produk_id: r.produk_id,
      jumlah: Number(r.qty),
      harga_satuan: Number(r.harga_satuan),
      subtotal: subtot(r),
    }));

    const pendingToast =
      toastr?.info?.(editingId ? "Menyimpan perubahan…" : "Menyimpan…", "", {
        timeOut: 0,
        extendedTimeOut: 0,
        tapToDismiss: false,
        closeButton: true,
      }) ?? null;

    try {
      if (editingId) {
        await updatePendapatan(token, editingId, {
          jenis: "pemasukan",
          debit: total,
          kredit: 0,
          akun_id: form.akun_id,
          deskripsi: form.deskripsi,
          tanggal: form.tanggal,
          share_klaster: !!form.share_to_klaster,
          ...(replaceItems ? { items: details } : {}),
        });
      } else {
        await addPendapatan(token, {
          jenis: "pemasukan",
          debit: total,
          kredit: 0,
          akun_id: form.akun_id,
          deskripsi: form.deskripsi,
          tanggal: form.tanggal,
          share_klaster: !!form.share_to_klaster,
          items: details,
        });
      }

      toastr?.clear?.(pendingToast);
      toastr?.success?.("Pendapatan berhasil disimpan.", "Berhasil");

      setForm({ akun_id: 0, deskripsi: "", tanggal: "", share_to_klaster: false });
      setItems([{ produk_id: 0, qty: 1, harga_satuan: 0 }]);
      setHargaDisplay([""]);
      setEditingId(null);
      setReplaceItems(true);
      setShowModal(false);
      loadInitialData();
    } catch (err) {
      console.error("Gagal simpan pendapatan:", err);
      toastr?.clear?.(pendingToast);
      toastr?.error?.(err?.response?.data?.message || "Gagal menyimpan pendapatan.", "Gagal");
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
        await ensureCachedProducts(its.map((x) => x.produk_id).filter(Boolean));
      } else {
        setItems([{ produk_id: 0, qty: 1, harga_satuan: 0 }]);
        setHargaDisplay([""]);
        setReplaceItems(true);
      }
    } catch (e) {
      console.error("Gagal ambil detail laporan:", e);
      toastr?.error?.("Gagal memuat detail laporan.", "Gagal");
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

  const onDelete = async (row) => {
    const pretty = new Intl.NumberFormat("id-ID").format(row.debit || 0);
    if (
      !window.confirm(
        `Hapus laporan ini?\nJumlah: Rp ${pretty}\nTanggal: ${new Date(
          row.tanggal
        ).toLocaleDateString("id-ID")}`
      )
    ) {
      return;
    }

    const pendingToast =
      toastr?.info?.("Menghapus…", "", {
        timeOut: 0,
        extendedTimeOut: 0,
        tapToDismiss: false,
        closeButton: true,
      }) ?? null;

    try {
      setDeletingId(row.id_laporan);
      await deletePendapatan(token, row.id_laporan);
      toastr?.clear?.(pendingToast);
      toastr?.success?.("Pendapatan berhasil dihapus.", "Berhasil");
      await loadInitialData();
    } catch (err) {
      console.error("Gagal hapus pendapatan:", err);
      toastr?.clear?.(pendingToast);
      toastr?.error?.(err?.response?.data?.message || "Gagal menghapus pendapatan.", "Gagal");
    } finally {
      setDeletingId(null);
    }
  };

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(editingId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
      toastr?.success?.("ID laporan disalin ke clipboard.", "Tersalin");
    } catch {
      toastr?.error?.("Gagal menyalin ID.", "Gagal");
    }
  };

  // ====== derived
  const pendapatanFiltered = useMemo(() => {
    if (filterShare === "own") return pendapatan.filter((x) => !isShared(x));
    if (filterShare === "shared") return pendapatan.filter((x) => isShared(x));
    return pendapatan;
  }, [pendapatan, filterShare]);

  const transaksiTerakhir = useMemo(() => {
    if (pendapatanFiltered.length === 0) return null;
    const sorted = [...pendapatanFiltered].sort(
      (a, b) => new Date(b.tanggal) - new Date(a.tanggal)
    );
    return sorted[0];
  }, [pendapatanFiltered]);

  const akunTerakhir = useMemo(() => {
    if (!transaksiTerakhir) return null;
    const acc = akunKas.find((a) => a.akun_id === transaksiTerakhir.akun_id);
    return {
      id: transaksiTerakhir.akun_id,
      nama: transaksiTerakhir.akun_nama || acc?.nama || null,
      saldo: acc?.saldo_akhir,
    };
  }, [transaksiTerakhir, akunKas]);

  const productName = (id) => {
    if (!id) return "";
    const p = produkCache.get(id);
    return p?.nama || `Produk #${id}`;
  };

  // ====== render
  return (
    <>
      {/* Header */}
      <div className="bg-white rounded-xl shadow-md p-4 md:p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <h2 className="text-xl md:text-2xl font-bold">Pendapatan Pertanian</h2>

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
              className="bg-green-600 text-white px-3 py-2 md:px-4 md:py-2 rounded text-sm md:text-base"
              onClick={() => {
                setEditingId(null);
                setForm({
                  akun_id: 0,
                  deskripsi: "",
                  tanggal: "",
                  share_to_klaster: false,
                });
                setItems([{ produk_id: 0, qty: 1, harga_satuan: 0 }]);
                setHargaDisplay([""]);
                setShowModal(true);
              }}
            >
              + Tambah Pendapatan
            </button>
          </div>
        </div>
      </div>

      {/* Transaksi Terakhir */}
      {transaksiTerakhir && (
        <div className="bg-white rounded-xl shadow-md p-4 md:p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Transaksi Terakhir</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs md:text-sm text-gray-500">Tanggal</p>
              <p className="font-medium">
                {new Date(transaksiTerakhir.tanggal).toLocaleDateString("id-ID")}
              </p>
            </div>
            <div>
              <p className="text-xs md:text-sm text-gray-500">Jumlah</p>
              <p className="font-medium text-green-600">
                Rp {transaksiTerakhir.debit?.toLocaleString("id-ID")}
              </p>
            </div>
            <div>
              <p className="text-xs md:text-sm text-gray-500">Akun</p>
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
            <div>
              <p className="text-xs md:text-sm text-gray-500">Share</p>
              <p className="font-medium">{isShared(transaksiTerakhir) ? "Klaster" : "Pribadi"}</p>
            </div>
          </div>
        </div>
      )}

      {/* ====== Riwayat (Mobile Cards) ====== */}
      <div className="md:hidden bg-white rounded-xl shadow-md p-4">
        <h3 className="text-lg font-semibold mb-4">Riwayat Pendapatan</h3>

        {pendapatanFiltered.length === 0 ? (
          <div className="text-center text-gray-500 py-6">Tidak ada data.</div>
        ) : (
          <div className="space-y-3">
            {pendapatanFiltered.map((item) => (
              <div key={item.id_laporan} className="rounded-lg border p-4">
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <div className="text-sm text-gray-500">
                      {new Date(item.tanggal).toLocaleDateString("id-ID")}
                    </div>
                    <div className="text-base font-semibold text-green-700">
                      Rp {item.debit?.toLocaleString("id-ID")}
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
        <h3 className="text-lg font-semibold mb-4">Riwayat Pendapatan</h3>
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
              {pendapatanFiltered.map((item, i) => (
                <tr key={item.id_laporan} className="border-t">
                  <td className="p-2">{i + 1}</td>
                  <td className="p-2">Rp {item.debit?.toLocaleString("id-ID")}</td>
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
              {pendapatanFiltered.length === 0 && (
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

      {/* ====== Modal Tambah/Edit Pendapatan ====== */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box w-full max-w-none md:max-w-3xl h-[100dvh] md:h-auto rounded-none md:rounded-xl overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {editingId ? "Edit Pendapatan" : "Tambah Pendapatan"}
            </h3>

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
                    {a.nama}{" "}
                    {typeof a.saldo_akhir === "number" ? `— Rp ${a.saldo_akhir.toLocaleString("id-ID")}` : ""}
                  </option>
                ))}
              </select>

              {/* ITEMS */}
              <div className="border rounded p-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                  <div className="font-semibold">Item Produk</div>
                  <button
                    type="button"
                    className="px-2 py-1 rounded bg-emerald-600 text-white text-sm md:text-base"
                    onClick={addRow}
                  >
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
                        <div className="flex gap-2">
                          <input
                            className="w-full border rounded px-3 py-2"
                            readOnly
                            placeholder="Belum dipilih"
                            value={r.produk_id ? productName(r.produk_id) : ""}
                          />
                          <button
                            type="button"
                            className="px-2 py-1 rounded bg-indigo-600 text-white"
                            onClick={() => openPicker(idx)}
                          >
                            Pilih
                          </button>
                        </div>
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
                        <button
                          type="button"
                          className="text-red-600 text-xs underline"
                          onClick={() => removeRow(idx)}
                        >
                          Hapus baris
                        </button>
                      )}
                    </div>

                    {/* Desktop: grid */}
                    <div className="hidden md:grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-6">
                        <div className="flex gap-2">
                          <input
                            className="w-full border rounded px-2 py-1"
                            readOnly
                            placeholder="Belum dipilih"
                            value={r.produk_id ? productName(r.produk_id) : ""}
                          />
                          <button
                            type="button"
                            className="px-2 py-1 rounded bg-indigo-600 text-white"
                            onClick={() => openPicker(idx)}
                          >
                            Pilih
                          </button>
                        </div>
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
                          <button
                            type="button"
                            className="text-red-600 text-xs underline"
                            onClick={() => removeRow(idx)}
                          >
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

              {/* Replace items hint (saat edit) & total */}
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
                  Total: <span className="text-green-700">{formatRupiah(total)}</span>
                </div>
              </div>

              <textarea
                className="border rounded px-3 py-2"
                placeholder="Deskripsi pendapatan..."
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

              {/* Sticky action bar di mobile */}
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

      {/* Product Picker Modal */}
      <ProductPicker
        isOpen={pickerOpen}
        onClose={closePicker}
        onSelect={handleSelectProduct}
        allowedKategoriIds={allowedKategoriIds}
      />
    </>
  );
}
