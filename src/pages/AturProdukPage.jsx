// src/pages/AturProdukPage.jsx
import React, { useEffect, useState } from "react";
import {
  getProducts,
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

export default function AturProdukPage() {
  // ====== state list ======
  const [products, setProducts] = useState([]);
  const [akunKas, setAkunKas] = useState([]);
  const [kategori, setKategori] = useState([]);

    //   userinfo
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

  // ====== filter kategori list (opsional) ======
  const [katFilterJenis, setKatFilterJenis] = useState(""); // "", "pemasukan", "pengeluaran", "produk"
  const [katFilterScope, setKatFilterScope] = useState("all"); // all | own | klaster
  const [katSearch, setKatSearch] = useState("");

  // ====== scope helper (user_id / klaster_id) ======
  function getScopeParams(extra = {}) {
    try {
      const raw = localStorage.getItem("user");
      const obj = raw ? JSON.parse(raw) : null;
      const user_id = obj?.user_id || obj || null; // support string
      const klaster_id = obj?.klaster_id || null;
      const p = { ...extra };
      if (user_id) p.user_id = user_id;
      if (klaster_id) p.klaster_id = klaster_id;
      return p;
    } catch {
      return { ...extra };
    }
  }

  // ====== Loaders ======
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    loadProducts();
    loadAkunKas();
    loadKategori();
  }, []);

  async function loadProducts() {
    try {
      setLoadingProduk(true);
      const res = await getProducts();
      console.log(res)
      const list = Array.isArray(res.data?.data) ? res.data.data : res.data || [];
      setProducts(list);
    } catch (e) {
      console.error("Gagal ambil produk:", e);
      setProducts([]);
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
// panggil berulang apiFn({...baseParams, page, limit}) sampai habis
    async function fetchAll(apiFn, baseParams = {}, pageSize = 100) {
        let page = 1;
        let all = [];
        let total = Infinity;

    while (all.length < total) {
        const res = await apiFn({ ...baseParams, page, limit: pageSize });

        // normalisasi payload
        const payload = res?.data || {};
        const rows =
        Array.isArray(payload.data) ? payload.data :
        Array.isArray(payload)     ? payload     : [];
        const t = payload.total ?? payload.pagination?.total ?? (all.length + rows.length);

        all.push(...rows);
        if (!rows.length) break;

        total = t;
        page++;
    }
    return all;
    }

  async function loadKategori() {
  try {
    setLoadingKategori(true);

    const base = {
      user_id: userId || undefined,
      klaster_id: klasterId,
      jenis: katFilterJenis || undefined,
      search: katSearch || undefined,
    };

    if (katFilterScope === "own") {
      base.user_id = localStorage.getItem("user_id") || userId || undefined;
    } else if (katFilterScope === "klaster") {
      base.klaster_id = localStorage.getItem("klaster_id") || undefined;
    }

    // ⬇️ kirim REFERENSI FUNGSI + PARAMS
    const list = await fetchAll(listKategoriScope, base, 200);
    setKategori(list);
  } catch (e) {
    console.error("Gagal ambil kategori:", e);
    setKategori([]);
  } finally {
    setLoadingKategori(false);
  }
}

  // opsi kategori untuk dropdown produk
  async function loadKategoriDropdown() {
    try {
      setCatLoading(true);
      // ambil semua kategori (biar bisa pilih bebas), tampilkan label dengan jenis/sub_kelompok
      const res = await listKategoriScopev2(getScopeParams({ limit: 300, user_id: userId}));
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
      await loadProducts();
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

  // ====== Kategori: create & delete (update jika API tersedia) ======
  async function submitCreateKategori(e) {
    e.preventDefault();
    try {
      await createKategori({
        nama: katForm.nama,
        jenis: katForm.jenis, // pemasukan | pengeluaran | produk
        share_klaster: !!katForm.share_klaster
      });
      setShowAddKategori(false);
      setKatForm({ nama: "", jenis: "produk", share_klaster: false });
      await loadKategori();
      await loadKategoriDropdown(); // refresh opsi dropdown di produk
    } catch (e2) {
      alert(e2?.response?.data?.message || "Gagal membuat kategori");
    }
  }

  async function onDeleteKategori(k) {
    if (!window.confirm(`Hapus kategori "${k.nama}"?`)) return;
    try {
      await deleteKategoriApi(k.kategori_id);
      await loadKategori();
      await loadKategoriDropdown();
    } catch (e2) {
      alert(e2?.response?.data?.message || "Gagal menghapus kategori");
    }
  }

  // ====== RENDER ======
  return (
    <div className="p-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6 flex flex-wrap gap-3 justify-between items-center">
        <h2 className="text-2xl font-bold">Atur Produk, Akun Kas & Kategori</h2>
        <div className="flex gap-2">
          <button className="bg-indigo-600 text-white px-4 py-2 rounded" onClick={openCreateProduk}>
            + Tambah Kategori/Produk
          </button>
          <button className="bg-sky-600 text-white px-4 py-2 rounded" onClick={openCreateAkun}>
            + Tambah Akun Kas
          </button>
           <button className="bg-emerald-600 ..." onClick={() => {
            setKatForm({ nama: "", jenis: "pemasukan", share_klaster: false });
            setShowAddKategori(true);}}>
            + Tambah Kategori
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ====== Produk ====== */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Kelola Produk</h3>
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
                  <td className="p-3 text-center text-gray-500" colSpan={4}>
                    Memuat…
                  </td>
                </tr>
              ) : products.length ? (
                products.map((p) => (
                  <tr key={p.produk_id} className="border-t">
                    <td className="p-2">{p.nama}</td>
                    <td className="p-2">{p.kategori.nama || "-"}</td>
                    <td className="p-2">{p.kategori.jenis || "-"}</td>
                    <td className="p-2">{(p.share_to_klaster ?? p.share_klaster ?? p.klaster_id) ? "Klaster" : "Pribadi"}</td>
                    <td className="p-2">
                      <div className="flex gap-2">
                        <button className="px-2 py-1 rounded bg-amber-500 text-white" onClick={() => openEditProduk(p)}>
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
                  <td className="p-3 text-center text-gray-500" colSpan={4}>
                    Tidak ada produk.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* ===== Modal CREATE Produk ===== */}
          {showAddProduk && (
            <div className="modal-overlay">
              <div className="modal-box">
                <h3 className="text-xl font-bold mb-4">Tambah Produk</h3>
                <form onSubmit={submitCreateProduk} className="flex flex-col gap-3">
                  <input
                    type="text"
                    className="border rounded px-2 py-1"
                    placeholder="Nama produk"
                    value={produkForm.nama}
                    onChange={(e) => setProdukForm({ ...produkForm, nama: e.target.value })}
                    required
                  />

                  <div className="font-bold">Kategori (opsional)</div>
                  <select
                    className="border rounded px-2 py-1"
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

                  <div className="flex justify-end gap-2">
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
              <div className="modal-box">
                <h3 className="text-xl font-bold mb-4">Edit Produk</h3>
                <form onSubmit={submitEditProduk} className="flex flex-col gap-3">
                  <input
                    type="text"
                    className="border rounded px-2 py-1"
                    placeholder="Nama produk"
                    value={produkForm.nama}
                    onChange={(e) => setProdukForm({ ...produkForm, nama: e.target.value })}
                    required
                  />

                  <div className="font-bold">Kategori</div>
                  <select
                    className="border rounded px-2 py-1"
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

                  <div className="flex justify-end gap-2">
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
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Kelola Akun Kas</h3>
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
                        <button className="px-2 py-1 rounded bg-amber-500 text-white" onClick={() => openEditAkun(a)}>
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

          {/* Modal CREATE Akun */}
          {showAddAkun && (
            <div className="modal-overlay">
              <div className="modal-box">
                <h3 className="text-xl font-bold mb-4">Tambah Akun Kas</h3>
                <form onSubmit={submitCreateAkun} className="flex flex-col gap-3">
                  <input
                    type="text"
                    className="border rounded px-2 py-1"
                    placeholder="Nama akun"
                    value={akunForm.nama}
                    onChange={(e) => setAkunForm({ ...akunForm, nama: e.target.value })}
                    required
                  />
                  <input
                    type="text"
                    className="border rounded px-2 py-1"
                    placeholder="Deskripsi"
                    value={akunForm.deskripsi}
                    onChange={(e) => setAkunForm({ ...akunForm, deskripsi: e.target.value })}
                  />
                  <input
                    type="text"
                    className="border rounded px-2 py-1"
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

                  <div className="flex justify-end gap-2">
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
              <div className="modal-box">
                <h3 className="text-xl font-bold mb-4">Edit Akun Kas</h3>
                <form onSubmit={submitEditAkun} className="flex flex-col gap-3">
                  <input
                    type="text"
                    className="border rounded px-2 py-1"
                    placeholder="Nama akun"
                    value={akunForm.nama}
                    onChange={(e) => setAkunForm({ ...akunForm, nama: e.target.value })}
                    required
                  />
                  <input
                    type="text"
                    className="border rounded px-2 py-1"
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

                  <div className="flex justify-end gap-2">
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
      <div className="bg-white rounded-xl shadow-md p-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Kelola Kategori</h3>
          <div className="flex gap-2">
            <select
              className="border rounded px-2 py-1"
              value={katFilterJenis}
              onChange={(e) => setKatFilterJenis(e.target.value)}
            >
              <option value="">Semua Jenis</option>
              <option value="pemasukan">Pemasukan</option>
              <option value="pengeluaran">Pengeluaran</option>
              <option value="produk">Produk</option>
            </select>
            <select
              className="border rounded px-2 py-1"
              value={katFilterScope}
              onChange={(e) => setKatFilterScope(e.target.value)}
              title="Scope"
            >
              <option value="all">Semua</option>
              <option value="own">Milik Saya</option>
              <option value="klaster">Klaster</option>
            </select>
            <input
              className="border rounded px-2 py-1"
              placeholder="Cari kategori…"
              value={katSearch}
              onChange={(e) => setKatSearch(e.target.value)}
            />
            <button className="px-3 py-1 bg-gray-100 rounded border" onClick={loadKategori}>
              Terapkan
            </button>
          </div>
        </div>

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
                  <td className="p-2">   {(k.share_to_klaster ?? k.share_klaster) ? "Klaster" : "Pribadi"} </td>
                  <td className="p-2">
                    <button
                      className="px-2 py-1 rounded bg-rose-600 text-white"
                      onClick={() => onDeleteKategori(k)}
                    >
                      Hapus
                    </button>
                    {/* NOTE: Jika API updateKategori tersedia, buat tombol Edit di sini */}
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

      {/* Modal Tambah Kategori */}
      {showAddKategori && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3 className="text-xl font-bold mb-4">Tambah Kategori</h3>
            <form onSubmit={submitCreateKategori} className="flex flex-col gap-3">
              <input
                className="border rounded px-2 py-1"
                placeholder="Nama Produk"
                value={katForm.nama}
                onChange={(e) => setKatForm({ ...katForm, nama: e.target.value })}
                required
              />
              <select
                className="border rounded px-2 py-1"
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

              <div className="flex justify-end gap-2">
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
