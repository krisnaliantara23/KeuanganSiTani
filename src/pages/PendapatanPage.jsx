import React, { useEffect, useMemo, useState } from "react";
import {
  getPendapatan,
  addPendapatan,
  updatePendapatan,
  getLaporanById,
  deletePendapatan,
} from "../services/financeService";
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
import { listKategoriScope, deleteKategori as deleteKategoriApi } from "../services/kategoriService";
import { createKategori } from "../services/kategoriService";
import { listKategoriScopev2 } from "../services/kategoriService";
import { getCurrentUser } from "../lib/auth";
import "../styles/pendapatan.css";

export default function PendapatanPage() {
  const token = localStorage.getItem("token");
  const me = getCurrentUser() || {};
  const userId = me.user_id || null;
  const klasterId = me.klaster_id || null;
  // data list
  const [pendapatan, setPendapatan] = useState([]);
  const [products, setProducts] = useState([]);
  const [akunKas, setAkunKas] = useState([]);
  const [produkPemasukan, setProdukPemasukan] = useState([]);

  // filter laporan: all | own | shared
  const [filterShare, setFilterShare] = useState("all");

  // modal
  const [showModal, setShowModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showAkunModal, setShowAkunModal] = useState(false);

  // edit transaksi
  const [editingId, setEditingId] = useState(null);
  const [replaceItems, setReplaceItems] = useState(true);
  const [copied, setCopied] = useState(false);

  // Show KatModal
  const [showKatModal, setShowKatModal] = useState(false);
  const [katForm, setKatForm] = useState({
    nama: "",
    jenis: "pemasukan",
    share_klaster: false,
  });
  // delete transaksi
  const [deletingId, setDeletingId] = useState(null);

  // state untuk dropdown kategori di modal "Tambah Produk"
  const [createCatOpts, setCreateCatOpts] = useState([]);
  const [createCatId, setCreateCatId] = useState("");
  const [createCatLoading, setCreateCatLoading] = useState(false)

  // Kategori untuk panel Edit Produk
  const [kategori, setKategori] = useState([]);
  const [kategoriLoading, setKategoriLoading] = useState(false);
  const [kategoriScope, setKategoriScope] = useState("all");     // all | own | klaster
  const [kategoriJenis, setKategoriJenis] = useState("");         // "" | "produk" | "pemasukan" | "pengeluaran"
  const [kategoriSearch, setKategoriSearch] = useState("");

    // shared klaster state
  const isShared = (obj) => Boolean(
  obj?.share_to_klaster ?? obj?.share_klaster ?? obj?.klaster_id
);

  // State Produk edit
  const [productCatOpts, setProductCatOpts] = useState([]);
  const [productCatId, setProductCatId] = useState("");   // kategori terpilih
  const [catLoading, setCatLoading] = useState(false);

  // form transaksi (multi item)
  const [form, setForm] = useState({
    akun_id: 0,
    deskripsi: "",
    tanggal: "",
    share_to_klaster: false, // ⬅️ baru
  });

  // items (baris dinamis)
  const [items, setItems] = useState([{ produk_id: 0, qty: 1, harga_satuan: 0 }]);
  const [hargaDisplay, setHargaDisplay] = useState([""]);

  // form tambah produk/kategori
  const [productForm, setProductForm] = useState({
    nama: "",
    kategori_nama: "",
    share_to_klaster: false, // ⬅️ baru
  });

  // form akun kas
  const [akunForm, setAkunForm] = useState({
    nama: "",
    deskripsi: "",
    saldo_awal: 0,
    share_to_klaster: false, // ⬅️ baru
  });
  const [displaySaldo, setDisplaySaldo] = useState("");

  // kelola produk (edit)
  const [productEditId, setProductEditId] = useState(null);
  const [productEditForm, setProductEditForm] = useState({
    nama: "",
    kategori_nama: "",
    share_to_klaster: false,
  });

  // kelola akun (edit)
  const [akunEditId, setAkunEditId] = useState(null);
  const [akunEditForm, setAkunEditForm] = useState({
    nama: "",
    deskripsi: "",
    share_to_klaster: false,
  });

  useEffect(() => {
    loadInitialData();
    loadProducts();
    loadAkunKas();
  }, []);

  // Get Scope Params
  function getScopeParams(extra = {}) {
  let user_id = null, klaster_id = null;
  try {
    const raw = localStorage.getItem("user");
    if (raw) {
      const obj = JSON.parse(raw);
      user_id   = obj?.user_id || obj;       // support string/plain
      klaster_id = obj?.klaster_id || null;
    }
  } catch {}
  const p = { ...extra };
  if (user_id)   p.user_id = user_id;
  if (klaster_id) p.klaster_id = klaster_id;
  return p;
}

  // Load Init Data
  async function loadInitialData() {
    try {
      const data = await getPendapatan(token);
      console.log(data)
      setPendapatan(data);
    } catch (err) {
      console.error("Gagal ambil pendapatan:", err);
    }
  }
  async function loadProducts() {
    try {
      const [resProduk, resKat] = await Promise.all([
      getProducts(),
      listKategoriScopev2(getScopeParams({ jenis: "pemasukan", limit: 200 })),
    ]);

    const list = Array.isArray(resProduk.data?.data) ? resProduk.data.data : resProduk.data || [];
    setProducts(list);

    const katIncome = Array.isArray(resKat.data?.data) ? resKat.data.data : [];
    const incomeIds = new Set(katIncome.map(k => Number(k.kategori_id)));

    // Prefer pakai field jenis bila ada; kalau tidak, pakai mapping kategori_id dari scope
    const onlyIncome = list.filter(p => {
      const jenis = (p.kategori_jenis || p.jenis_kategori || p.kategori?.jenis || p.jenis || "").toLowerCase();
      if (jenis) return jenis === "pemasukan";
      return incomeIds.size ? incomeIds.has(Number(p.kategori_id)) : false;
    });
    setProdukPemasukan(onlyIncome);
      

    } catch (err) {
      console.error("Gagal ambil produk/kategori:", err);
      setProducts([]);
      setProdukPemasukan([]);
    }
  }
  // Load Akun kas
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

  // Load kategori for create
  async function loadKategoriForCreate() {
  try {
    setCreateCatLoading(true);
    // filter sesuai kebutuhan: di Pendapatan → ambil kategori jenis "pemasukan"
    const res = await listKategoriScopev2(getScopeParams({ jenis: "pemasukan", limit: 200 }));
    const list = Array.isArray(res.data?.data) ? res.data.data : [];
    setCreateCatOpts(list);
  } catch (e) {
    console.error("Gagal load kategori (create product):", e);
    setCreateCatOpts([]);
  } finally {
    setCreateCatLoading(false);
  }
}

  // Load Kategori for edit
  async function loadKategoriForEdit(prefillNama = "") {
  try {
    setCatLoading(true);
    const user_id = userId
    const klaster_id = klasterId

    const params = { };
    if (user_id) params.user_id = user_id;
    // if (klaster_id) params.klaster_id = klaster_id;

    const res = await listKategoriScope(params);
    const list = Array.isArray(res.data?.data) ? res.data.data : res.data || [];
    setProductCatOpts(list);

    // kalau ada prefill nama kategori lama, otomatis pilih jika match
    if (!productCatId && prefillNama) {
      const found = list.find(k => (k.nama || "").toLowerCase() === prefillNama.toLowerCase());
      if (found) setProductCatId(String(found.kategori_id));
    }
  } catch (e) {
    console.error("Gagal load kategori scope:", e);
    setProductCatOpts([]);
  } finally {
    setCatLoading(false);
  }
}


  // Load Kategori (untuk produk)
  async function loadKategori() {
  setKategoriLoading(true);
  try {
    const params = { page: 1, limit: 50 };
    if (kategoriJenis) params.jenis = kategoriJenis;
    if (kategoriSearch) params.search = kategoriSearch;

    // scope (opsional – kirim kalau tersedia)
    if (kategoriScope === "own") {
      const uid = localStorage.getItem("user_id");
      if (uid) params.user_id = uid;
    }
    if (kategoriScope === "klaster") {
      const kid = localStorage.getItem("klaster_id");
      if (kid) params.klaster_id = kid;
    }

    const res = await listKategoriScope(params);
    const list = Array.isArray(res.data?.data) ? res.data.data : res.data || [];
    setKategori(list);
  } catch (e) {
    console.error("Gagal ambil kategori scope:", e);
    setKategori([]);
  } finally {
    setKategoriLoading(false);
  }
  }
  // Delete Kategori
  async function onDeleteKategori(k) {
  if (!window.confirm(`Hapus kategori "${k.nama}"?`)) return;
  try {
    await deleteKategoriApi(k.kategori_id);
    await loadKategori();
  } catch (e) {
    alert(e?.response?.data?.message || "Gagal hapus kategori");
  }
}

  // utils
  const formatRupiah = (value) =>
    !value ? "" : new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(value);

  // subtotal & total
  const subtot = (row) => Number(row.qty || 0) * Number(row.harga_satuan || 0);
  const total = useMemo(() => items.reduce((s, r) => s + subtot(r), 0), [items]);

  // ===== handlers items =====
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

  // delete transaksi
  const onDelete = async (row) => {
    const pretty = new Intl.NumberFormat("id-ID").format(row.debit || 0);
    if (!window.confirm(`Hapus laporan ini?\nJumlah: Rp ${pretty}\nTanggal: ${new Date(row.tanggal).toLocaleDateString("id-ID")}`)) {
      return;
    }
    try {
      setDeletingId(row.id_laporan);
      await deletePendapatan(token, row.id_laporan);
      alert("Berhasil hapus pendapatan.");
      await loadInitialData();
    } catch (err) {
      console.error("Gagal hapus pendapatan:", err);
      alert(err?.response?.data?.message || "Gagal menghapus pendapatan");
    } finally {
      setDeletingId(null);
    }
  };
  // Add Kategori
  async function submitKategori(e){
  e.preventDefault();
  if(!katForm.nama) return alert("Nama kategori wajib diisi.");
  try{
    await createKategori({
      nama: katForm.nama,
      jenis: katForm.jenis,             // "pemasukan" | "pengeluaran" | "produk"
      share_klaster: !!katForm.share_klaster
    });
    setShowKatModal(false);
    setKatForm({ nama:"", jenis:"", share_klaster:false });
  }catch(err){
    alert(err?.response?.data?.message || "Gagal membuat kategori");
  }
}
  // submit create/update transaksi
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

    const details = items.map((r) => ({
      produk_id: r.produk_id,
      jumlah: Number(r.qty),
      harga_satuan: Number(r.harga_satuan),
      subtotal: subtot(r),
    }));

    try {
      if (editingId) {
        await updatePendapatan(token, editingId, {
          jenis: "pemasukan",
          debit: total,
          kredit: 0,
          akun_id: form.akun_id,
          deskripsi: form.deskripsi,
          tanggal: form.tanggal,
          share_klaster: !!form.share_to_klaster,   // <- kirim nama yang BE minta, // ⬅️ baru
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
          share_klaster: !!form.share_to_klaster,   // <- kirim nama yang BE minta, // ⬅️ baru
          items: details,
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
      console.error("Gagal simpan pendapatan:", err);
      alert(err?.response?.data?.message || "Gagal menyimpan pendapatan");
    }
  }

  // edit transaksi -> load detail
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
        share_to_klaster: Boolean(d.share_to_klaster ?? d.share_klaster ?? d.klaster_id ?? row.klaster_id), // ⬅️ baru
      });

      const det = Array.isArray(d.details) ? d.details : [];
      const its = det.map((it) => {
        const qty = Number(it.jumlah ?? 1);
        const unit =
          it.harga_satuan != null ? Number(it.harga_satuan) : Math.round(Number(it.subtotal ?? 0) / (qty || 1));
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

  // copy id
  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(editingId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  // transaksi terakhir (mengikuti filter)
  const pendapatanFiltered = useMemo(() => {
    if (filterShare === "own")    return pendapatan.filter((x) => !isShared(x));
    if (filterShare === "shared") return pendapatan.filter((x) =>  isShared(x));
    return pendapatan;
  }, [pendapatan, filterShare]);

  const transaksiTerakhir = useMemo(() => {
    if (pendapatanFiltered.length === 0) return null;
    const sorted = [...pendapatanFiltered].sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
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

  // =============== RENDER ===============
  return (
    <>
      {/* Header */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6 flex flex-wrap gap-3 justify-between items-center">
        <h2 className="text-2xl font-bold">Pendapatan Pertanian</h2>

        <div className="flex gap-2 items-center">
          {/* Filter share */}
          <select
            className="border rounded px-2 py-1"
            value={filterShare}
            onChange={(e) => setFilterShare(e.target.value)}
            title="Filter laporan"
          >
            <option value="all">Semua</option>
            <option value="own">Milik Saya</option>
            <option value="shared">Share Klaster</option>
          </select>

          <button
            className="bg-green-600 text-white px-4 py-2 rounded"
            onClick={() => {
              setEditingId(null);
              setForm({ akun_id: 0, deskripsi: "", tanggal: "", share_to_klaster: false });
              setItems([{ produk_id: 0, qty: 1, harga_satuan: 0 }]);
              setHargaDisplay([""]);
              setShowModal(true);
            }}
          >
            + Tambah Pendapatan
          </button>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded"  onClick={() => {
            setShowProductModal(true);
            loadKategoriForCreate(); // ⬅️ fetch kategori untuk dropdown
          }}>
            + Tambah Produk
          </button>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded" onClick={()=>setShowKatModal(true)}>
            + Tambah Kategori
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
            <div>
              <p className="text-sm text-gray-500">Tanggal</p>
              <p className="font-medium">{new Date(transaksiTerakhir.tanggal).toLocaleDateString("id-ID")}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Jumlah</p>
              <p className="font-medium text-green-600">Rp {transaksiTerakhir.debit?.toLocaleString("id-ID")}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Akun</p>
              <p className="font-medium">
                {akunTerakhir?.nama ? akunTerakhir.nama : akunTerakhir?.id ? `Akun #${akunTerakhir.id}` : "-"}
              </p>
              {akunTerakhir?.saldo != null && (
                <p className="text-xs text-gray-500">Saldo: Rp {akunTerakhir.saldo.toLocaleString("id-ID")}</p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500">Share</p>
              <p className="font-medium">{isShared(transaksiTerakhir) ? "Klaster" : "Pribadi"}</p>

            </div>
          </div>
        </div>
      )}

      {/* Tabel Riwayat */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Riwayat Pendapatan</h3>
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
                <td className="p-2">{item.deskripsi}</td>
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

      {/* ====== Kelola Produk & Akun Kas (Card/Tabel) ====== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Produk */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Kelola Produk</h3>
          <table className="w-full text-left border">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2">Nama</th>
                <th className="p-2">Kategori</th>
                <th className="p-2">Share</th>
                <th className="p-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.produk_id} className="border-t">
                  <td className="p-2">{p.nama}</td>
                  <td className="p-2">{p.kategori_nama || "-"}</td>
                  <td className="p-2">{isShared(p) ? "Klaster" : "Pribadi"}</td>
                  <td className="p-2">
                    <div className="flex gap-2">
                      <button
                        className="px-2 py-1 rounded bg-amber-500 text-white"
                        onClick={async () => {
                          setProductEditId(p.produk_id);
                          setProductEditForm({
                            nama: p.nama || "",
                            kategori_nama: p.kategori_nama || "",
                            share_to_klaster: Boolean(p.share_to_klaster ?? p.share_klaster ?? p.klaster_id),
                          });
                          setProductCatId(p.kategori_id ? String(p.kategori_id) : ""); 
                          await loadKategoriForEdit(p.kategori_nama || "");
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="px-2 py-1 rounded bg-rose-600 text-white"
                        onClick={async () => {
                          if (!window.confirm(`Hapus produk "${p.nama}"?`)) return;
                          try {
                            await deleteProduct(p.produk_id);
                            await loadProducts();
                          } catch (e) {
                            alert(e?.response?.data?.message || "Gagal hapus produk");
                          }
                        }}
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td className="p-3 text-center text-gray-500" colSpan={4}>
                    Tidak ada produk.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Modal mini edit produk */}
          {productEditId != null && (
          <div className="mt-3 border rounded p-3 bg-gray-50">
            <div className="font-semibold mb-2">Edit Produk</div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                className="border rounded px-2 py-1"
                placeholder="Nama produk"
                value={productEditForm.nama}
                onChange={(e) => setProductEditForm({ ...productEditForm, nama: e.target.value })}
              />

              {/* Dropdown kategori */}
              <select
                className="border rounded px-2 py-1"
                value={productCatId}
                onChange={(e) => setProductCatId(e.target.value)}
                disabled={catLoading}
              >
                <option value="">{catLoading ? "Memuat kategori..." : "Pilih kategori"}</option>
                {productCatOpts.map((k) => (
                  <option key={k.kategori_id} value={k.kategori_id}>
                    {k.nama} {k.jenis ? `— ${k.jenis}` : ""}{k.sub_kelompok ? ` / ${k.sub_kelompok}` : ""}
                  </option>
                ))}
              </select>
            </div>

            <label className="mt-2 inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={productEditForm.share_to_klaster}
                onChange={(e) => setProductEditForm({ ...productEditForm, share_to_klaster: e.target.checked })}
              />
              Bagikan ke klaster
            </label>

            <div className="flex gap-2 mt-3">
              <button className="px-3 py-1 rounded bg-gray-200" onClick={() => setProductEditId(null)}>Batal</button>
              <button
                className="px-3 py-1 rounded bg-emerald-600 text-white"
                onClick={async () => {
                  try {
                    await updateProduct(productEditId, {
                      nama: productEditForm.nama,
                      kategori_id: productCatId ? Number(productCatId) : undefined, // ⬅ kirim id kategori
                      share_klaster: !!productEditForm.share_to_klaster,
                    });
                    setProductEditId(null);
                    await loadProducts();
                  } catch (e) {
                    alert(e?.response?.data?.message || "Gagal update produk");
                  }
                }}
              >
                Simpan
              </button>
            </div>
          </div>
)}

        </div>

        {/* Akun Kas */}
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
              {akunKas.map((a) => (
                <tr key={a.akun_id} className="border-t">
                  <td className="p-2">{a.nama}</td>
                  <td className="p-2">{a.deskripsi || "-"}</td>
                  <td className="p-2">{isShared(a) ? "Klaster" : "Pribadi"}</td>
                  <td className="p-2">
                    <div className="flex gap-2">
                      <button
                        className="px-2 py-1 rounded bg-amber-500 text-white"
                        onClick={() => {
                          setAkunEditId(a.akun_id);
                          setAkunEditForm({
                            nama: a.nama || "",
                            deskripsi: a.deskripsi || "",
                            share_to_klaster: Boolean(a.share_to_klaster ?? a.share_klaster ?? a.klaster_id),
                          });
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="px-2 py-1 rounded bg-rose-600 text-white"
                        onClick={async () => {
                          if (!window.confirm(`Hapus akun kas "${a.nama}"?`)) return;
                          try {
                            await deleteAkunKas(a.akun_id);
                            await loadAkunKas();
                          } catch (e) {
                            alert(e?.response?.data?.message || "Gagal hapus akun kas");
                          }
                        }}
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {akunKas.length === 0 && (
                <tr>
                  <td className="p-3 text-center text-gray-500" colSpan={4}>
                    Tidak ada akun kas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Modal mini edit akun */}
          {akunEditId != null && (
            <div className="mt-3 border rounded p-3 bg-gray-50">
              <div className="font-semibold mb-2">Edit Akun Kas</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  className="border rounded px-2 py-1"
                  placeholder="Nama akun"
                  value={akunEditForm.nama}
                  onChange={(e) => setAkunEditForm({ ...akunEditForm, nama: e.target.value })}
                />
                <input
                  type="text"
                  className="border rounded px-2 py-1"
                  placeholder="Deskripsi"
                  value={akunEditForm.deskripsi}
                  onChange={(e) => setAkunEditForm({ ...akunEditForm, deskripsi: e.target.value })}
                />
              </div>
              <label className="mt-2 inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={akunEditForm.share_to_klaster}
                  onChange={(e) => setAkunEditForm({ ...akunEditForm, share_to_klaster: e.target.checked })}
                />
                Bagikan ke klaster
              </label>
              <div className="flex gap-2 mt-3">
                <button className="px-3 py-1 rounded bg-gray-200" onClick={() => setAkunEditId(null)}>
                  Batal
                </button>
                <button
                  className="px-3 py-1 rounded bg-emerald-600 text-white"
                  onClick={async () => {
                    try {
                      await updateAkunKas(akunEditId, {
                        nama: akunEditForm.nama,
                        deskripsi: akunEditForm.deskripsi,
                        share_klaster: !!akunEditForm.share_to_klaster,
                      });
                      setAkunEditId(null);
                      await loadAkunKas();
                    } catch (e) {
                      alert(e?.response?.data?.message || "Gagal update akun kas");
                    }
                  }}
                >
                  Simpan
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Tambah/Edit Pendapatan */}
      {showModal && (
        <div className="modal-overlay w-96">
          <div className="modal-box">
            <h3 className="text-xl font-bold mb-4">{editingId ? "Edit Pendapatan" : "Tambah Pendapatan"}</h3>
            {editingId && (
              <div className="flex items-center gap-2 text-xs mb-3">
                <span className="px-2 py-1 bg-gray-100 rounded">
                  ID: <code className="font-mono">{editingId}</code>
                </span>
                <button type="button" onClick={copyId} className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300" title="Salin ID">
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
                        {produkPemasukan.map((p) => (
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

              {/* Share ke klaster */}
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.share_to_klaster}
                  onChange={(e) => setForm({ ...form, share_to_klaster: e.target.checked })}
                />
                Bagikan ke klaster
              </label>

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

              <input type="date" value={form.tanggal} onChange={(e) => setForm({ ...form, tanggal: e.target.value })} required />

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

      {/* Modal Tambah Kategori */}
      {showKatModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3 className="text-lg font-semibold mb-3">Tambah Kategori</h3>
            <form onSubmit={submitKategori} className="flex flex-col gap-3">
              <input className="border rounded px-2 py-1" placeholder="Nama kategori"
                    value={katForm.nama}
                    onChange={e=>setKatForm({...katForm, nama:e.target.value})} required />
              <select className="border rounded px-2 py-1"
                      value={katForm.jenis}
                      onChange={e=>setKatForm({...katForm, jenis:e.target.value})}>
                <option value="pemasukan">Pemasukan</option>
                <option value="pengeluaran">Pengeluaran</option>
              </select>
              <label className="inline-flex items-center gap-2">
                <input type="checkbox"
                      checked={katForm.share_klaster}
                      onChange={e=>setKatForm({...katForm, share_klaster:e.target.checked})}/>
                Bagikan ke klaster
              </label>

              <div className="flex justify-end gap-2">
                <button type="button" className="btn-cancel" onClick={()=>setShowKatModal(false)}>Batal</button>
                <button type="submit" className="btn-simpan">Simpan</button>
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
            await createProduct({
              nama: productForm.nama,
              // kirim kategori_id hasil dropdown (optional)
              ...(createCatId ? { kategori_id: Number(createCatId) } : {}),
              share_klaster: !!productForm.share_to_klaster,
            });
            setProductForm({ nama: "", kategori_nama: "", share_to_klaster: false });
            setCreateCatId("");
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
        <input
          type="text"
          value={productForm.nama}
          onChange={(e) => setProductForm({ ...productForm, nama: e.target.value })}
          required
        />

        <div className="font-bold">Kategori (opsional)</div>
        <select
          className="border rounded px-2 py-1"
          value={createCatId}
          onChange={(e) => setCreateCatId(e.target.value)}
          disabled={createCatLoading}
        >
          <option value="">
            {createCatLoading ? "Memuat kategori…" : "— Pilih kategori —"}
          </option>
          {createCatOpts.map((k) => (
            <option key={k.kategori_id} value={k.kategori_id}>
              {k.nama}
              {k.jenis ? ` — ${k.jenis}` : ""}
              {k.sub_kelompok ? ` / ${k.sub_kelompok}` : ""}
            </option>
          ))}
        </select>

        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={productForm.share_to_klaster}
            onChange={(e) => setProductForm({ ...productForm, share_to_klaster: e.target.checked })}
          />
          Bagikan ke klaster
        </label>

        <div className="flex justify-end gap-3 mt-3">
          <button
            type="button"
            className="btn-cancel"
            onClick={() => {
              setShowProductModal(false);
              setCreateCatId("");
            }}
          >
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

      {/* Modal Edit Produk */}
      

      {/* Modal Tambah Akun Kas */}
      {showAkunModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3 className="text-xl font-bold mb-4">Tambah Akun Kas</h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                   await createAkunKas({
                      nama: akunForm.nama,
                      deskripsi: akunForm.deskripsi,
                      saldo_awal: akunForm.saldo_awal,
                      share_klaster: !!akunForm.share_to_klaster,
                    });
                  setAkunForm({ nama: "", deskripsi: "", saldo_awal: 0, share_to_klaster: false });
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
              <input
                type="text"
                value={akunForm.nama}
                onChange={(e) => setAkunForm({ ...akunForm, nama: e.target.value })}
                required
              />

              <div className="font-bold">Deskripsi</div>
              <input
                type="text"
                value={akunForm.deskripsi}
                onChange={(e) => setAkunForm({ ...akunForm, deskripsi: e.target.value })}
              />

              <div className="font-bold">Saldo Awal</div>
              <input
                type="text"
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

              <div className="flex justify-end gap-3 mt-3">
                <button type="button" className="btn-cancel" onClick={() => { setShowAkunModal(false); setDisplaySaldo(""); }}>
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
    </>
  );
}
