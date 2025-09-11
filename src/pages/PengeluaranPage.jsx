import React, { useEffect, useMemo, useState } from "react";
import { getPengeluaran, addPengeluaran } from "../services/financeService";
import { getProducts, createProduct } from "../services/productService";
import { listAkunKas, createAkunKas } from "../services/akunKasService";
import "../styles/pendapatan.css";

export default function PengeluaranPage() {
  const [pengeluaran, setPengeluaran] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // Produk
  const [products, setProducts] = useState([]);
  const [showProductModal, setShowProductModal] = useState(false);

  // Akun kas
  const [akunKas, setAkunKas] = useState([]);
  const [showAkunModal, setShowAkunModal] = useState(false);

  // Form transaksi pengeluaran
  const [form, setForm] = useState({
    akun_id: 0,      // ✅ wajib
    produk_id: 0,    // ✅ wajib
    jumlah: 0,
    deskripsi: "",
    tanggal: "",
  });

  // Display string untuk input rupiah (jumlah pengeluaran)
  const [display, setDisplay] = useState("");

  // Form tambah produk/kategori
  const [productForm, setProductForm] = useState({ nama: "", kategori_nama: "" });

  // Form tambah akun kas
  const [akunForm, setAkunForm] = useState({ nama: "", deskripsi: "", saldo_awal: 0 });
  const [displaySaldo, setDisplaySaldo] = useState("");

  useEffect(() => {
    loadData();
    loadProducts();
    loadAkunKas();
  }, []);

  async function loadData() {
    try {
      const data = await getPengeluaran(localStorage.getItem("token"));
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

  // --- formatter Rupiah ---
  const formatRupiah = (value) =>
    !value
      ? ""
      : new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          minimumFractionDigits: 0,
        }).format(value);

  // jumlah (pengeluaran)
  const handleChangeJumlah = (e) => {
    const raw = e.target.value.replace(/\D/g, "");
    const num = Number(raw);
    setForm({ ...form, jumlah: num });
    setDisplay(raw ? formatRupiah(num) : "");
  };

  // saldo awal (akun kas)
  const handleChangeSaldoAwal = (e) => {
    const raw = e.target.value.replace(/\D/g, "");
    const num = Number(raw);
    setAkunForm({ ...akunForm, saldo_awal: num });
    setDisplaySaldo(raw ? formatRupiah(num) : "");
  };

  // Submit pengeluaran
  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.akun_id) return alert("Pilih Akun Kas dahulu.");
    if (!form.produk_id) return alert("Pilih Produk dahulu.");
    if (!form.jumlah || form.jumlah <= 0) return alert("Jumlah harus > 0.");

    try {
      await addPengeluaran(localStorage.getItem("token"), {
        akun_id: form.akun_id,       // ✅ penting
        produk_id: form.produk_id,   // ✅ penting
        jumlah: form.jumlah,         // BE akan memasukkan ke kredit
        deskripsi: form.deskripsi,
        tanggal: form.tanggal,
      });
      setForm({ akun_id: 0, produk_id: 0, jumlah: 0, deskripsi: "", tanggal: "" });
      setDisplay("");
      setShowModal(false);
      loadData();
    } catch (err) {
      console.error("Gagal tambah pengeluaran:", err);
      alert(err?.response?.data?.message || "Gagal menambah pengeluaran");
    }
  }

  // Submit tambah produk
  async function handleSubmitProduct(e) {
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
  }

  // Submit tambah akun kas
  async function handleSubmitAkun(e) {
    e.preventDefault();
    try {
      await createAkunKas({
        nama: akunForm.nama,
        deskripsi: akunForm.deskripsi,
        saldo_awal: akunForm.saldo_awal,
      });
      setAkunForm({ nama: "", deskripsi: "", saldo_awal: 0 });
      setDisplaySaldo("");
      setShowAkunModal(false);
      await loadAkunKas();
    } catch (err) {
      console.error("Gagal tambah akun kas:", err);
      alert(err?.response?.data?.message || "Gagal menambah akun kas");
    }
  }

  const transaksiTerakhir = useMemo(() => {
    if (pengeluaran.length === 0) return null;
    const sorted = [...pengeluaran].sort(
      (a, b) => new Date(b.tanggal) - new Date(a.tanggal)
    );
    return sorted[0];
  }, [pengeluaran]);

  return (
    <>
      {/* Header */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6 flex flex-wrap gap-3 justify-between items-center">
        <h2 className="text-2xl font-bold">Pengeluaran Pertanian</h2>
        <div className="flex gap-2">
          <button
            className="bg-red-600 text-white px-4 py-2 rounded"
            onClick={() => setShowModal(true)}
          >
            + Tambah Pengeluaran
          </button>
          <button
            className="bg-indigo-600 text-white px-4 py-2 rounded"
            onClick={() => setShowProductModal(true)}
          >
            + Tambah Kategori/Produk
          </button>
          <button
            className="bg-sky-600 text-white px-4 py-2 rounded"
            onClick={() => setShowAkunModal(true)}
          >
            + Tambah Akun Kas
          </button>
        </div>
      </div>

      {/* Transaksi Terakhir */}
      {transaksiTerakhir && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">
            Transaksi Terakhir
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
              <p className="text-sm text-gray-500">Kategori</p>
              <p className="font-medium">
                {transaksiTerakhir.kategori_nama || transaksiTerakhir.kategori_id}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Deskripsi</p>
              <p className="font-medium">
                {transaksiTerakhir.deskripsi || "-"}
              </p>
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
              <th className="p-2">Kategori</th>
              <th className="p-2">Jumlah</th>
              <th className="p-2">Deskripsi</th>
              <th className="p-2">Tanggal</th>
            </tr>
          </thead>
          <tbody>
            {pengeluaran.map((item) => (
              <tr key={item.id_laporan} className="border-t">
                <td className="p-2">
                  {item.kategori_nama || item.kategori_id}
                </td>
                <td className="p-2">
                  Rp {item.kredit?.toLocaleString("id-ID")}
                </td>
                <td className="p-2">{item.deskripsi}</td>
                <td className="p-2">
                  {new Date(item.tanggal).toLocaleDateString("id-ID")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Tambah Pengeluaran */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3 className="text-xl font-bold mb-4">Tambah Pengeluaran</h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              {/* Pilih Akun Kas */}
              <select
                value={form.akun_id}
                onChange={(e) => setForm({ ...form, akun_id: Number(e.target.value) })}
                size={8}
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

              {/* Pilih Produk */}
              <select
                value={form.produk_id}
                onChange={(e) => setForm({ ...form, produk_id: Number(e.target.value) })}
                size={8}
                className="block w-full border rounded"
                required
              >
                <option value={0}>Pilih produk</option>
                {products.map((p) => (
                  <option key={p.produk_id} value={p.produk_id}>
                    {p.nama}{p.kategori_nama ? ` — ${p.kategori_nama}` : ""}
                  </option>
                ))}
              </select>

              {/* Jumlah */}
              <input
                type="text"
                placeholder="Jumlah (Rp)"
                value={display}
                onChange={handleChangeJumlah}
                onBlur={() => setDisplay(formatRupiah(form.jumlah))}
                required
              />

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
                  onClick={() => { setShowModal(false); setDisplay(""); }}
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

      {/* Modal Tambah Kategori/Produk */}
      {showProductModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3 className="text-xl font-bold mb-4">Tambah Kategori / Produk</h3>
            <form onSubmit={handleSubmitProduct} className="flex flex-col gap-3">
              <label className="text-sm text-gray-600">
                Isi kedua field untuk menambah produk baru dengan kategori. Isi hanya
                field Kategori untuk menambah kategori baru tanpa produk.
              </label>

              <div className="font-bold">Nama Produk</div>
              <input
                type="text"
                placeholder='Nama Produk (mis. "Pupuk Urea", "Sewa Traktor")'
                value={productForm.nama}
                onChange={(e) => setProductForm({ ...productForm, nama: e.target.value })}
                required
              />

              <div className="font-bold">Kategori Produk</div>
              <input
                type="text"
                placeholder='Kategori (mis. "Biaya Operasional", "Investasi Alat")'
                value={productForm.kategori_nama}
                onChange={(e) =>
                  setProductForm({ ...productForm, kategori_nama: e.target.value })
                }
                required
              />

              <div className="flex justify-end gap-3 mt-3">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowProductModal(false)}
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

      {/* Modal Tambah Akun Kas */}
      {showAkunModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3 className="text-xl font-bold mb-4">Tambah Akun Kas</h3>
            <form onSubmit={handleSubmitAkun} className="flex flex-col gap-3">
              <div className="font-bold">Nama Akun</div>
              <input
                type="text"
                placeholder='Mis. "BRI Operasional", "Kas Besar"'
                value={akunForm.nama}
                onChange={(e) => setAkunForm({ ...akunForm, nama: e.target.value })}
                required
              />

              <div className="font-bold">Deskripsi</div>
              <input
                type="text"
                placeholder="Catatan singkat (opsional)"
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

              <div className="flex justify-end gap-3 mt-3">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => { setShowAkunModal(false); setDisplaySaldo(""); }}
                >
                  Batal
                </button>
                <button type="submit" className="btn-simpan">
                  Simpan
                </button>
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
