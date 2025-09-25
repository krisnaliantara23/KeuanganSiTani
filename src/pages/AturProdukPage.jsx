// src/pages/AturProdukPage.jsx
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  getProducts,          // masih dipakai untuk kompatibilitas (tidak wajib)
  createProduct,
  updateProduct,
  deleteProduct,
} from "../services/productService";
import {
  listAkunKas,
  createAkunKas,
  updateAkunKas,
  deleteAkunKas,
} from "../services/akunKasService";
import {
  listKategoriScope,
  listKategoriScopev2,
  createKategori,
  deleteKategori as deleteKategoriApi,
} from "../services/kategoriService";
import "../styles/pendapatan.css";
import { getCurrentUser } from "../lib/auth";

// util kecil
const formatRupiah = (v) =>
  !v
    ? ""
    : new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(v);

// ===== helper panggil produk ber-parameter (tanpa ubah service) =====
const API_BASE = "https://be-laporankeuangan.up.railway.app/api";

async function fetchProdukPaged({ page = 1, limit = 10, scope = "mine", search = "" }) {
  const token = localStorage.getItem("token");
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));
  if (scope) params.set("scope", scope);
  if (search?.trim()) params.set("search", search.trim());
  const url = `${API_BASE}/produk?${params.toString()}`;
  return axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
}

export default function AturProdukPage() {
  // ====== state list ======
  const [products, setProducts] = useState([]);
  const [akunKas, setAkunKas] = useState([]);
  const [kategori, setKategori] = useState([]);

  // userinfo
  const currentUser = getCurrentUser();
  const userId = currentUser?.user_id || null;
  const klasterId = currentUser?.klaster_id || null;

  // ====== loading ======
  const [loadingProduk, setLoadingProduk] = useState(false);
  const [loadingAkun, setLoadingAkun] = useState(false);
  const [loadingKategori, setLoadingKategori] = useState(false);

  // ====== modal flags ======
  const [showAddProduk, setShowAddProduk] = useState(false);
  const [showEditProdukId, setShowEditProdukId] = useState(null);

  const [showAddAkun, setShowAddAkun] = useState(false);
  const [editAkunId, setEditAkunId] = useState(null);

  const [showAddKategori, setShowAddKategori] = useState(false);

  // ====== form: Produk (create/update) ======
  const [produkForm, setProdukForm] = useState({
    nama: "",
    share_to_klaster: false,
  });

  // dropdown kategori utk produk (create & edit)
  const [catOpts, setCatOpts] = useState([]);
  const [catLoading, setCatLoading] = useState(false);
  const [produkKategoriId, setProdukKategoriId] = useState("");

  // ====== form: Akun Kas ======
  const [akunForm, setAkunForm] = useState({
    nama: "",
    deskripsi: "",
    saldo_awal: 0,
    share_to_klaster: false,
  });
  const [displaySaldo, setDisplaySaldo] = useState("");

  // ====== form: Kategori (create) ======
  const [katForm, setKatForm] = useState({
    nama: "",
    jenis: "produk", // pemasukan | pengeluaran | produk
    share_klaster: false,
  });

  // ====== filter kategori list ======
  const [katFilterJenis, setKatFilterJenis] = useState(""); // "", "pemasukan", "pengeluaran", "produk"
  const [katFilterScope, setKatFilterScope] = useState("all"); // all | own | klaster
  const [katSearch, setKatSearch] = useState("");

  // ====== search produk (opsional) ======
  const [produkSearch, setProdukSearch] = useState("");

  // ====== PAGINATION: Produk ======
  const [prodPage, setProdPage] = useState(1);
  const [prodLimit, setProdLimit] = useState(10);
  const [prodTotal, setProdTotal] = useState(0);

  // ====== PAGINATION: Kategori ======
  const [katPage, setKatPage] = useState(1);
  const [katLimit, setKatLimit] = useState(10);
  const [katTotal, setKatTotal] = useState(0);

  // ====== scope helper (produk) ======
  const role = String(currentUser?.role || "").toLowerCase();
  const isAdmin = ["admin", "superadmin"].includes(role);
  const produkScope = isAdmin ? "all" : (klasterId ? "mine_or_cluster" : "mine");

  // ====== Loaders ======
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    loadProducts();
    loadAkunKas();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prodPage, prodLimit, produkScope]); // reload saat page/limit/scope berubah

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    loadKategori();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [katPage, katLimit, katFilterScope, katFilterJenis]); // apply saat page/limit/filter scope/jenis berubah

  // mencari produk (enter klik)
  function handleProdukSearchApply() {
    setProdPage(1);
    loadProducts();
  }

  // mencari kategori
  function handleKategoriSearchApply() {
    setKatPage(1);
    loadKategori();
  }

  async function loadProducts() {
    try {
      setLoadingProduk(true);
      const res = await fetchProdukPaged({
        page: prodPage,
        limit: prodLimit,
        scope: produkScope,
        search: produkSearch,
      });
      const payload = res?.data || {};
      const list = Array.isArray(payload.data) ? payload.data : [];
      setProducts(list);
      setProdTotal(payload.total ?? list.length ?? 0);

      // jika page kepenuhan (misal setelah delete) mundurkan 1 page dan reload
      const maxPage = Math.max(1, Math.ceil((payload.total ?? 0) / prodLimit));
      if (prodPage > maxPage) setProdPage(maxPage);
    } catch (e) {
      console.error("Gagal ambil produk:", e);
      setProducts([]);
      setProdTotal(0);
    } finally {
      setLoadingProduk(false);
    }
  }

  async function loadAkunKas(params = { page: 1, limit: 100 }) {
    try {
      setLoadingAkun(true);
      const res = await listAkunKas(params);
      const list = Array.isArray(res.data?.data) ? res.data.data : res.data?.data || [];
      setAkunKas(list);
    } catch (e) {
      console.error("Gagal ambil akun kas:", e);
      setAkunKas([]);
    } finally {
      setLoadingAkun(false);
    }
  }

  // Kategori paged
  const normKlaster = (v) => {
    if (v === null || v === undefined) return null;
    if (v === "" || v === "null") return null;
    return v;
  };

  async function loadKategori() {
    try {
      setLoadingKategori(true);

      const base = {
        user_id: userId || undefined,
        klaster_id: klasterId || undefined,
        jenis: katFilterJenis || undefined,
        search: katSearch || undefined,
        page: katPage,
        limit: katLimit,
      };

      // batasi di FE sesuai filter scope
      const res = await listKategoriScope(base);
      const payload = res?.data || {};
      const raw = Array.isArray(payload.data) ? payload.data : [];
      let list = raw;

      if (katFilterScope === "own") {
        list = raw.filter((k) => normKlaster(k.klaster_id) === null);
      } else if (katFilterScope === "klaster") {
        list = raw.filter((k) => normKlaster(k.klaster_id) !== null);
      }

      setKategori(list);
      // gunakan total dari BE jika ada, kalau tidak, pakai panjang raw (bukan list) agar akurat untuk page
      setKatTotal(payload.total ?? payload.pagination?.total ?? raw.length ?? 0);

      const maxPage = Math.max(1, Math.ceil((payload.total ?? raw.length ?? 0) / katLimit));
      if (katPage > maxPage) setKatPage(maxPage);
    } catch (e) {
      console.error("Gagal ambil kategori:", e);
      setKategori([]);
      setKatTotal(0);
    } finally {
      setLoadingKategori(false);
    }
  }

  // opsi kategori untuk dropdown produk
  async function loadKategoriDropdown() {
    try {
      setCatLoading(true);
      const res = await listKategoriScopev2({ limit: 300, user_id: userId });
      const list = Array.isArray(res.data?.data) ? res.data.data : [];
      setCatOpts(list);
    } catch (e) {
      console.error("Gagal load kategori dropdown:", e);
      setCatOpts([]);
    } finally {
      setCatLoading(false);
    }
  }

  // ====== handlers saldo awal formatting ======
  const handleChangeSaldoAwal = (e) => {
    const raw = e.target.value.replace(/\D/g, "");
    const num = Number(raw || 0);
    setAkunForm((f) => ({ ...f, saldo_awal: num }));
    setDisplaySaldo(raw ? formatRupiah(num) : "");
  };

  // ====== CRUD Produk ======
  function openCreateProduk() {
    setProdukForm({ nama: "", share_to_klaster: false });
    setProdukKategoriId("");
    setShowAddProduk(true);
    loadKategoriDropdown();
  }

  async function submitCreateProduk(e) {
    e.preventDefault();
    try {
      await createProduct({
        nama: produkForm.nama,
        ...(produkKategoriId ? { kategori_id: Number(produkKategoriId) } : {}),
        share_klaster: !!produkForm.share_to_klaster,
      });
      setShowAddProduk(false);
      // reload ke halaman pertama agar item baru terlihat
      setProdPage(1);
      await loadProducts();
    } catch (e2) {
      alert(e2?.response?.data?.message || "Gagal membuat produk");
    }
  }

  function openEditProduk(p) {
    setShowEditProdukId(p.produk_id);
    setProdukForm({
      nama: p.nama || "",
      share_to_klaster: Boolean(p.share_to_klaster ?? p.share_klaster ?? p.klaster_id),
    });
    setProdukKategoriId(p.kategori_id ? String(p.kategori_id) : "");
    loadKategoriDropdown();
  }

  async function submitEditProduk(e) {
    e.preventDefault();
    try {
      await updateProduct(showEditProdukId, {
        nama: produkForm.nama,
        kategori_id: produkKategoriId ? Number(produkKategoriId) : undefined,
        share_klaster: !!produkForm.share_to_klaster,
      });
      setShowEditProdukId(null);
      await loadProducts();
    } catch (e2) {
      alert(e2?.response?.data?.message || "Gagal memperbarui produk");
    }
  }

  async function onDeleteProduk(id, nama) {
    if (!window.confirm(`Hapus produk "${nama}"?`)) return;
    try {
      await deleteProduct(id);
      // Jika baris tinggal 1 di halaman ini, mundurkan halaman agar tidak kosong
      if (products.length === 1 && prodPage > 1) {
        setProdPage((p) => p - 1);
      } else {
        await loadProducts();
      }
    } catch (e2) {
      alert(e2?.response?.data?.message || "Gagal menghapus produk");
    }
  }

  // ====== CRUD Akun Kas ======
  function openCreateAkun() {
    setAkunForm({ nama: "", deskripsi: "", saldo_awal: 0, share_to_klaster: false });
    setDisplaySaldo("");
    setShowAddAkun(true);
  }

  async function submitCreateAkun(e) {
    e.preventDefault();
    try {
      await createAkunKas({
        nama: akunForm.nama,
        deskripsi: akunForm.deskripsi,
        saldo_awal: akunForm.saldo_awal,
        share_klaster: !!akunForm.share_to_klaster,
      });
      setShowAddAkun(false);
      await loadAkunKas();
    } catch (e2) {
      alert(e2?.response?.data?.message || "Gagal membuat akun kas");
    }
  }

  function openEditAkun(a) {
    setEditAkunId(a.akun_id);
    setAkunForm({
      nama: a.nama || "",
      deskripsi: a.deskripsi || "",
      saldo_awal: 0, // tidak dipakai saat edit
      share_to_klaster: Boolean(a.share_to_klaster ?? a.share_klaster ?? a.klaster_id),
    });
    setShowAddAkun(false);
  }

  async function submitEditAkun(e) {
    e.preventDefault();
    try {
      await updateAkunKas(editAkunId, {
        nama: akunForm.nama,
        deskripsi: akunForm.deskripsi,
        share_klaster: !!akunForm.share_to_klaster,
      });
      setEditAkunId(null);
      await loadAkunKas();
    } catch (e2) {
      alert(e2?.response?.data?.message || "Gagal memperbarui akun kas");
    }
  }

  async function onDeleteAkun(id, nama) {
    if (!window.confirm(`Hapus akun kas "${nama}"?`)) return;
    try {
      await deleteAkunKas(id);
      await loadAkunKas();
    } catch (e2) {
      alert(e2?.response?.data?.message || "Gagal menghapus akun kas");
    }
  }

  // ====== Kategori: create & delete ======
  async function submitCreateKategori(e) {
    e.preventDefault();
    try {
      const base = {
        nama: katForm.nama,
        jenis: katForm.jenis,
        share_klaster: katForm.share_klaster,
      };
      await createKategori(base);
      setShowAddKategori(false);
      setKatForm({ nama: "", jenis: "produk", share_klaster: false });
      // kembali ke halaman 1 agar item baru terlihat
      setKatPage(1);
      await loadKategori();
      await loadKategoriDropdown();
    } catch (e2) {
      alert(e2?.response?.data?.message || "Gagal membuat kategori");
      console.log(e2);
    }
  }

  async function onDeleteKategori(k) {
    if (!window.confirm(`Hapus kategori "${k.nama}"?`)) return;
    try {
      await deleteKategoriApi(k.kategori_id);
      if (kategori.length === 1 && katPage > 1) {
        setKatPage((p) => p - 1);
      } else {
        await loadKategori();
      }
      await loadKategoriDropdown();
    } catch (e2) {
      alert(e2?.response?.data?.message || "Gagal menghapus kategori");
    }
  }

  // ====== Komponen Pagination ======
  function Pagination({ total, page, limit, onPageChange, onLimitChange }) {
    const totalPages = Math.max(1, Math.ceil((total ?? 0) / (limit || 10)));
    const canPrev = page > 1;
    const canNext = page < totalPages;

    // buat window halaman kecil (misal 5)
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
            className={`px-3 py-1 border rounded ${p === page ? "bg-gray-200 font-semibold" : ""}`}
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

        <select
          className="ml-3 border rounded px-2 py-1"
          value={limit}
          onChange={(e) => {
            onLimitChange(Number(e.target.value));
            onPageChange(1);
          }}
          title="Items per page"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>
    );
  }

  // ====== RENDER ======
  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-md p-4 md:p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <h2 className="text-xl md:text-2xl font-bold">Atur Produk, Akun Kas & Kategori</h2>

          {/* action buttons → stack di mobile */}
          <div className="flex gap-2 flex-wrap">
            <button
              className="bg-indigo-600 text-white px-3 py-2 md:px-4 md:py-2 rounded text-sm md:text-base"
              onClick={openCreateProduk}
            >
              + Tambah Kategori/Produk
            </button>
            <button
              className="bg-sky-600 text-white px-3 py-2 md:px-4 md:py-2 rounded text-sm md:text-base"
              onClick={openCreateAkun}
            >
              + Tambah Akun Kas
            </button>
            <button
              className="bg-emerald-600 text-white px-3 py-2 md:px-4 md:py-2 rounded text-sm md:text-base"
              onClick={() => {
                setKatForm({ nama: "", jenis: "pemasukan", share_klaster: false });
                setShowAddKategori(true);
              }}
            >
              + Tambah Kategori
            </button>
          </div>
        </div>
      </div>

      {/* GRID konten → jadi 1 kolom di mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ====== Produk ====== */}
        <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Kelola Produk</h3>
            <div className="flex gap-2">
              <input
                className="border rounded px-2 py-1"
                placeholder="Cari produk…"
                value={produkSearch}
                onChange={(e) => setProdukSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleProdukSearchApply()}
              />
              <button className="px-3 py-2 bg-gray-100 rounded border" onClick={handleProdukSearchApply}>
                Cari
              </button>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {loadingProduk ? (
              <div className="text-center text-gray-500 py-6">Memuat…</div>
            ) : products.length ? (
              products.map((p) => (
                <div
                  key={p.produk_id}
                  className="rounded-lg border p-4 flex flex-col gap-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold">{p.nama}</div>
                      <div className="text-xs text-gray-500">
                        {(p.share_to_klaster ?? p.share_klaster ?? p.klaster_id) ? "Klaster" : "Pribadi"}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="px-2 py-1 rounded bg-amber-500 text-white text-sm"
                        onClick={() => openEditProduk(p)}
                      >
                        Edit
                      </button>
                      <button
                        className="px-2 py-1 rounded bg-rose-600 text-white text-sm"
                        onClick={() => onDeleteProduk(p.produk_id, p.nama)}
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                  <div className="text-sm text-gray-700">
                    <span className="font-medium">Kategori:</span>{" "}
                    {p.kategori?.nama ?? "-"}
                  </div>
                  <div className="text-sm text-gray-700">
                    <span className="font-medium">Jenis:</span>{" "}
                    {p.kategori?.jenis ?? "-"}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-6">Tidak ada produk.</div>
            )}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2">Nama</th>
                  <th className="p-2">Kategori</th>
                  <th className="p-2">Jenis</th>
                  <th className="p-2">Share</th>
                  <th className="p-2">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loadingProduk ? (
                  <tr>
                    <td className="p-3 text-center text-gray-500" colSpan={5}>
                      Memuat…
                    </td>
                  </tr>
                ) : products.length ? (
                  products.map((p) => (
                    <tr key={p.produk_id} className="border-t">
                      <td className="p-2">{p.nama}</td>
                      <td className="p-2">{p.kategori?.nama || "-"}</td>
                      <td className="p-2">{p.kategori?.jenis || "-"}</td>
                      <td className="p-2">
                        {(p.share_to_klaster ?? p.share_klaster ?? p.klaster_id) ? "Klaster" : "Pribadi"}
                      </td>
                      <td className="p-2">
                        <div className="flex gap-2">
                          <button
                            className="px-2 py-1 rounded bg-amber-500 text-white"
                            onClick={() => openEditProduk(p)}
                          >
                            Edit
                          </button>
                          <button
                            className="px-2 py-1 rounded bg-rose-600 text-white"
                            onClick={() => onDeleteProduk(p.produk_id, p.nama)}
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="p-3 text-center text-gray-500" colSpan={5}>
                      Tidak ada produk.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Produk */}
          <Pagination
            total={prodTotal}
            page={prodPage}
            limit={prodLimit}
            onPageChange={setProdPage}
            onLimitChange={setProdLimit}
          />

          {/* ===== Modal CREATE Produk ===== */}
          {showAddProduk && (
            <div className="modal-overlay">
              <div className="modal-box w-full max-w-none md:max-w-lg h-[100dvh] md:h-auto rounded-none md:rounded-xl overflow-y-auto">
                <h3 className="text-xl font-bold mb-4">Tambah Produk</h3>
                <form onSubmit={submitCreateProduk} className="flex flex-col gap-3">
                  <input
                    type="text"
                    className="border rounded px-3 py-2"
                    placeholder="Nama produk"
                    value={produkForm.nama}
                    onChange={(e) => setProdukForm({ ...produkForm, nama: e.target.value })}
                    required
                  />

                  <div className="font-bold">Kategori (opsional)</div>
                  <select
                    className="border rounded px-3 py-2"
                    value={produkKategoriId}
                    onChange={(e) => setProdukKategoriId(e.target.value)}
                    disabled={catLoading}
                  >
                    <option value="">{catLoading ? "Memuat kategori…" : "— Pilih kategori —"}</option>
                    {catOpts.map((k) => (
                      <option key={k.kategori_id} value={k.kategori_id}>
                        {k.nama}{k.jenis ? ` — ${k.jenis}` : ""}{k.sub_kelompok ? ` / ${k.sub_kelompok}` : ""}
                      </option>
                    ))}
                  </select>

                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={produkForm.share_to_klaster}
                      onChange={(e) =>
                        setProdukForm({ ...produkForm, share_to_klaster: e.target.checked })
                      }
                    />
                    Bagikan ke klaster
                  </label>

                  <div className="flex justify-end gap-2 sticky bottom-0 bg-white pt-2">
                    <button type="button" className="btn-cancel" onClick={() => setShowAddProduk(false)}>
                      Batal
                    </button>
                    <button type="submit" className="btn-simpan">
                      Simpan
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ===== Modal EDIT Produk ===== */}
          {showEditProdukId != null && (
            <div className="modal-overlay">
              <div className="modal-box w-full max-w-none md:max-w-lg h-[100dvh] md:h-auto rounded-none md:rounded-xl overflow-y-auto">
                <h3 className="text-xl font-bold mb-4">Edit Produk</h3>
                <form onSubmit={submitEditProduk} className="flex flex-col gap-3">
                  <input
                    type="text"
                    className="border rounded px-3 py-2"
                    placeholder="Nama produk"
                    value={produkForm.nama}
                    onChange={(e) => setProdukForm({ ...produkForm, nama: e.target.value })}
                    required
                  />

                  <div className="font-bold">Kategori</div>
                  <select
                    className="border rounded px-3 py-2"
                    value={produkKategoriId}
                    onChange={(e) => setProdukKategoriId(e.target.value)}
                    disabled={catLoading}
                  >
                    <option value="">{catLoading ? "Memuat kategori…" : "— Pilih kategori —"}</option>
                    {catOpts.map((k) => (
                      <option key={k.kategori_id} value={k.kategori_id}>
                        {k.nama}{k.jenis ? ` — ${k.jenis}` : ""}{k.sub_kelompok ? ` / ${k.sub_kelompok}` : ""}
                      </option>
                    ))}
                  </select>

                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={produkForm.share_to_klaster}
                      onChange={(e) =>
                        setProdukForm({ ...produkForm, share_to_klaster: e.target.checked })
                      }
                    />
                    Bagikan ke klaster
                  </label>

                  <div className="flex justify-end gap-2 sticky bottom-0 bg-white pt-2">
                    <button type="button" className="btn-cancel" onClick={() => setShowEditProdukId(null)}>
                      Batal
                    </button>
                    <button type="submit" className="btn-simpan">
                      Simpan
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* ====== Akun Kas ====== */}
        <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
          <h3 className="text-lg font-semibold mb-4">Kelola Akun Kas</h3>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {loadingAkun ? (
              <div className="text-center text-gray-500 py-6">Memuat…</div>
            ) : akunKas.length ? (
              akunKas.map((a) => (
                <div
                  key={a.akun_id}
                  className="rounded-lg border p-4 flex flex-col gap-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold">{a.nama}</div>
                      <div className="text-xs text-gray-500">
                        {(a.share_to_klaster ?? a.share_klaster ?? a.klaster_id) ? "Klaster" : "Pribadi"}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="px-2 py-1 rounded bg-amber-500 text-white text-sm"
                        onClick={() => openEditAkun(a)}
                      >
                        Edit
                      </button>
                      <button
                        className="px-2 py-1 rounded bg-rose-600 text-white text-sm"
                        onClick={() => onDeleteAkun(a.akun_id, a.nama)}
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                  <div className="text-sm text-gray-700">
                    <span className="font-medium">Deskripsi:</span>{" "}
                    {a.deskripsi || "-"}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-6">Tidak ada akun kas.</div>
            )}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2">Nama</th>
                  <th className="p-2">Deskripsi</th>
                  <th className="p-2">Share</th>
                  <th className="p-2">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loadingAkun ? (
                  <tr>
                    <td className="p-3 text-center text-gray-500" colSpan={4}>
                      Memuat…
                    </td>
                  </tr>
                ) : akunKas.length ? (
                  akunKas.map((a) => (
                    <tr key={a.akun_id} className="border-t">
                      <td className="p-2">{a.nama}</td>
                      <td className="p-2">{a.deskripsi || "-"}</td>
                      <td className="p-2">
                        {(a.share_to_klaster ?? a.share_klaster ?? a.klaster_id) ? "Klaster" : "Pribadi"}
                      </td>
                      <td className="p-2">
                        <div className="flex gap-2">
                          <button
                            className="px-2 py-1 rounded bg-amber-500 text-white"
                            onClick={() => openEditAkun(a)}
                          >
                            Edit
                          </button>
                          <button
                            className="px-2 py-1 rounded bg-rose-600 text-white"
                            onClick={() => onDeleteAkun(a.akun_id, a.nama)}
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="p-3 text-center text-gray-500" colSpan={4}>
                      Tidak ada akun kas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* (Akun kas tidak dipaginasi di UI ini) */}
          {/* Modal CREATE Akun */}
          {showAddAkun && (
            <div className="modal-overlay">
              <div className="modal-box w-full max-w-none md:max-w-lg h-[100dvh] md:h-auto rounded-none md:rounded-xl overflow-y-auto">
                <h3 className="text-xl font-bold mb-4">Tambah Akun Kas</h3>
                <form onSubmit={submitCreateAkun} className="flex flex-col gap-3">
                  <input
                    type="text"
                    className="border rounded px-3 py-2"
                    placeholder="Nama akun"
                    value={akunForm.nama}
                    onChange={(e) => setAkunForm({ ...akunForm, nama: e.target.value })}
                    required
                  />
                  <input
                    type="text"
                    className="border rounded px-3 py-2"
                    placeholder="Deskripsi"
                    value={akunForm.deskripsi}
                    onChange={(e) => setAkunForm({ ...akunForm, deskripsi: e.target.value })}
                  />
                  <input
                    type="text"
                    className="border rounded px-3 py-2"
                    placeholder="Saldo awal (Rp)"
                    value={displaySaldo}
                    onChange={handleChangeSaldoAwal}
                    onBlur={() => setDisplaySaldo(formatRupiah(akunForm.saldo_awal))}
                  />
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={akunForm.share_to_klaster}
                      onChange={(e) => setAkunForm({ ...akunForm, share_to_klaster: e.target.checked })}
                    />
                    Bagikan ke klaster
                  </label>

                  <div className="flex justify-end gap-2 sticky bottom-0 bg-white pt-2">
                    <button type="button" className="btn-cancel" onClick={() => setShowAddAkun(false)}>
                      Batal
                    </button>
                    <button type="submit" className="btn-simpan">
                      Simpan
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal EDIT Akun */}
          {editAkunId != null && (
            <div className="modal-overlay">
              <div className="modal-box w-full max-w-none md:max-w-lg h-[100dvh] md:h-auto rounded-none md:rounded-xl overflow-y-auto">
                <h3 className="text-xl font-bold mb-4">Edit Akun Kas</h3>
                <form onSubmit={submitEditAkun} className="flex flex-col gap-3">
                  <input
                    type="text"
                    className="border rounded px-3 py-2"
                    placeholder="Nama akun"
                    value={akunForm.nama}
                    onChange={(e) => setAkunForm({ ...akunForm, nama: e.target.value })}
                    required
                  />
                  <input
                    type="text"
                    className="border rounded px-3 py-2"
                    placeholder="Deskripsi"
                    value={akunForm.deskripsi}
                    onChange={(e) => setAkunForm({ ...akunForm, deskripsi: e.target.value })}
                  />
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={akunForm.share_to_klaster}
                      onChange={(e) => setAkunForm({ ...akunForm, share_to_klaster: e.target.checked })}
                    />
                    Bagikan ke klaster
                  </label>

                  <div className="flex justify-end gap-2 sticky bottom-0 bg-white pt-2">
                    <button type="button" className="btn-cancel" onClick={() => setEditAkunId(null)}>
                      Batal
                    </button>
                    <button type="submit" className="btn-simpan">
                      Simpan
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ====== Kategori ====== */}
      <div className="bg-white rounded-xl shadow-md p-4 md:p-6 mt-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <h3 className="text-lg font-semibold">Kelola Kategori</h3>
          <div className="flex gap-2 flex-wrap">
            <select
              className="border rounded px-2 py-2 text-sm md:text-base"
              value={katFilterJenis}
              onChange={(e) => { setKatFilterJenis(e.target.value); setKatPage(1); }}
            >
              <option value="">Semua Jenis</option>
              <option value="pemasukan">Pemasukan</option>
              <option value="pengeluaran">Pengeluaran</option>
              <option value="produk">Produk</option>
            </select>
            <select
              className="border rounded px-2 py-2 text-sm md:text-base"
              value={katFilterScope}
              onChange={(e) => { setKatFilterScope(e.target.value); setKatPage(1); }}
              title="Scope"
            >
              <option value="all">Semua</option>
              <option value="own">Milik Saya</option>
              <option value="klaster">Klaster</option>
            </select>
            <input
              className="border rounded px-2 py-2 text-sm md:text-base"
              placeholder="Cari kategori…"
              value={katSearch}
              onChange={(e) => setKatSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleKategoriSearchApply()}
            />
            <button className="px-3 py-2 bg-gray-100 rounded border text-sm md:text-base" onClick={handleKategoriSearchApply}>
              Terapkan
            </button>
          </div>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {loadingKategori ? (
            <div className="text-center text-gray-500 py-6">Memuat…</div>
          ) : kategori.length ? (
            kategori.map((k) => (
              <div key={k.kategori_id} className="rounded-lg border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold">{k.nama}</div>
                    <div className="text-xs text-gray-500">
                      {(k.share_to_klaster ?? k.share_klaster) ? "Klaster" : "Pribadi"}
                    </div>
                  </div>
                  <button
                    className="px-2 py-1 rounded bg-rose-600 text-white text-sm"
                    onClick={() => onDeleteKategori(k)}
                  >
                    Hapus
                  </button>
                </div>
                <div className="text-sm text-gray-700 mt-1">
                  <span className="font-medium">Jenis:</span> {k.jenis || "-"}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-6">Tidak ada kategori.</div>
          )}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2">Nama</th>
                <th className="p-2">Jenis</th>
                <th className="p-2">Share</th>
                <th className="p-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loadingKategori ? (
                <tr>
                  <td className="p-3 text-center text-gray-500" colSpan={4}>
                    Memuat…
                  </td>
                </tr>
              ) : kategori.length ? (
                kategori.map((k) => (
                  <tr key={k.kategori_id} className="border-t">
                    <td className="p-2">{k.nama}</td>
                    <td className="p-2">{k.jenis || "-"}</td>
                    <td className="p-2">
                      {(k.share_to_klaster ?? k.share_klaster) ? "Klaster" : "Pribadi"}
                    </td>
                    <td className="p-2">
                      <button
                        className="px-2 py-1 rounded bg-rose-600 text-white"
                        onClick={() => onDeleteKategori(k)}
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="p-3 text-center text-gray-500" colSpan={4}>
                    Tidak ada kategori.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Kategori */}
        <Pagination
          total={katTotal}
          page={katPage}
          limit={katLimit}
          onPageChange={setKatPage}
          onLimitChange={setKatLimit}
        />
      </div>

      {/* Modal Tambah Kategori */}
      {showAddKategori && (
        <div className="modal-overlay">
          <div className="modal-box w-full max-w-none md:max-w-lg h-[100dvh] md:h-auto rounded-none md:rounded-xl overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Tambah Kategori</h3>
            <form onSubmit={submitCreateKategori} className="flex flex-col gap-3">
              <input
                className="border rounded px-2 py-1"
                placeholder="Nama kategori"
                value={katForm.nama}
                onChange={(e) => setKatForm({ ...katForm, nama: e.target.value })}
                required
              />
              <select
                className="border rounded px-3 py-2"
                value={katForm.jenis}
                onChange={(e) => setKatForm({ ...katForm, jenis: e.target.value })}
              >
                <option value="pemasukan">Pemasukan</option>
                <option value="pengeluaran">Pengeluaran</option>
                <option value="produk">Produk</option>
              </select>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={katForm.share_klaster}
                  onChange={(e) => setKatForm({ ...katForm, share_klaster: e.target.checked })}
                />
                Bagikan ke klaster
              </label>

              <div className="flex justify-end gap-2 sticky bottom-0 bg-white pt-2">
                <button type="button" className="btn-cancel" onClick={() => setShowAddKategori(false)}>
                  Batal
                </button>
                <button type="submit" className="btn-simpan">
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
