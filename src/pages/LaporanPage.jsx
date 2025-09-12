import React, { useEffect, useState } from "react";
import { getPendapatan, getPengeluaran } from "../services/financeService";
import { listAkunKas, getArusKasByAkun } from "../services/akunKasService";
import Neraca from "../component/Neraca";
import ArusKas from "../component/ArusKas";
import { getNeraca } from "../services/financeService";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function LaporanPage() {
  const [activeTab, setActiveTab] = useState("labaRugi");

  // Laba Rugi
  const [pendapatan, setPendapatan] = useState([]);
  const [pengeluaran, setPengeluaran] = useState([]);
  const [totalPendapatan, setTotalPendapatan] = useState(0);
  const [totalPengeluaran, setTotalPengeluaran] = useState(0);

  // (opsional) Neraca & Arus Kas – biar tetap ada tabnya
  const [arusKasData, setArusKasData] = useState([]);

  const token = localStorage.getItem("token");

   // ---- state khusus arus kas per akun
  const [akunKas, setAkunKas] = useState([]);
  const [selectedAkunId, setSelectedAkunId] = useState(0);
  const [startDate, setStartDate] = useState(""); // ex: "2025-09-01"
  const [endDate, setEndDate] = useState("");     // ex: "2025-09-30"
  const [arusMasuk, setArusMasuk] = useState([]);
  const [arusKeluar, setArusKeluar] = useState([]);

  // State Neraca
  const [neracaData, setNeracaData] = useState(null);
  const [neracaStart, setNeracaStart] = useState("");
  const [neracaEnd, setNeracaEnd] = useState("");
  const [neracaLoading, setNeracaLoading] = useState(false);



  useEffect(() => {
    loadLabaRugi();
    // loadNeracaDanArusKas(); // optional summary
    // load daftar akun buat selector
    loadNeraca();
    (async () => {
      try {
        const res = await listAkunKas({ page: 1, limit: 100 });
        const list = Array.isArray(res.data?.data) ? res.data.data : res.data?.data || [];
        setAkunKas(list);
        if (list.length && !selectedAkunId) setSelectedAkunId(list[0].akun_id);
      } catch {}
    })();
  }, []);

  useEffect(() => {
    if (activeTab !== "arusKas" || !selectedAkunId) return;
    loadArusKasAkun();
    loadNeraca();
  }, [activeTab, selectedAkunId, startDate, endDate]);

  useEffect(() => {
  if (activeTab === "neraca") loadNeraca();
  }, [activeTab, neracaStart, neracaEnd]);

  //  Load Neraca
 async function loadNeraca() {
  try {
    setNeracaLoading(true);
    const res = await getNeraca(token, {
      start: neracaStart || undefined,
      end: neracaEnd || undefined,
    });
    const payload = res.data?.data || res.data || null;

    // 👉 ini yang kamu minta: lihat strukturnya di console
    console.log("Neraca summary:", payload);
    console.log("aset_lancar:", payload?.aset_lancar);
    console.log("aset_tetap:", payload?.aset_tetap);
    console.log("kewajiban_lancar:", payload?.kewajiban_lancar);
    console.log("kewajiban_jangka_panjang:", payload?.kewajiban_jangka_panjang);

    setNeracaData(payload);
  } catch (e) {
    console.error("Gagal ambil neraca:", e);
    setNeracaData(null);
  } finally {
    setNeracaLoading(false);
  }
}
  // Arus kas akun load
  async function loadArusKasAkun() {
    try {
      const res = await getArusKasByAkun(token, {
        akun_id: selectedAkunId,
        start: startDate || undefined,
        end: endDate || undefined,
        page: 1,
        limit: 500,
      });
      const payload = res.data?.data || res.data || {};
      setArusMasuk(payload.masuk || []);
      setArusKeluar(payload.keluar || []);
    } catch (e) {
      console.error("Gagal ambil arus kas akun:", e);
      setArusMasuk([]);
      setArusKeluar([]);
    }
  }
  //  Lanjutan arus kas
  const sumMasuk = arusMasuk.reduce((s, r) => s + Number(r.debit || 0), 0);
  const sumKeluar = arusKeluar.reduce((s, r) => s + Number(r.kredit || 0), 0);
  const net = sumMasuk - sumKeluar;
  //  Load Laba Rugi
  async function loadLabaRugi() {
    try {
      const listPendapatan = await getPendapatan(token);   // << langsung array
      const listPengeluaran = await getPengeluaran(token); // << langsung array

      setPendapatan(listPendapatan);
      setPengeluaran(listPengeluaran);

      setTotalPendapatan(
        listPendapatan.reduce((sum, it) => sum + Number(it.debit || 0), 0)
      );
      setTotalPengeluaran(
        listPengeluaran.reduce((sum, it) => sum + Number(it.kredit || 0), 0)
      );
    } catch (e) {
      console.error("Gagal ambil laba rugi:", e);
      setPendapatan([]);
      setPengeluaran([]);
      setTotalPendapatan(0);
      setTotalPengeluaran(0);
    }
  }
  
  const fmtTanggal = (val) => {
    const t = val?.tanggal || val?.created_at || val;
    const d = new Date(t);
    return isNaN(d) ? "-" : d.toLocaleDateString("id-ID");
  };

  function exportPDF() {
    const doc = new jsPDF();
    doc.text("Laporan Keuangan Pertanian", 14, 16);

    if (activeTab === "labaRugi") {
      doc.text("Laporan Laba Rugi", 14, 22);

      // Pendapatan
      autoTable(doc, {
        head: [["Kategori", "Jumlah", "Deskripsi", "Tanggal"]],
        body: pendapatan.map((p) => [
          p.kategori_nama || p.kategori_id || "-",
          `Rp ${Number(p.debit || 0).toLocaleString("id-ID")}`,
          p.deskripsi || "-",
          fmtTanggal(p),
        ]),
        startY: 30,
      });

      // Pengeluaran
      autoTable(doc, {
        head: [["Kategori", "Jumlah", "Deskripsi", "Tanggal"]],
        body: pengeluaran.map((p) => [
          p.kategori_nama || p.kategori_id || "-",
          `Rp ${Number(p.kredit || 0).toLocaleString("id-ID")}`,
          p.deskripsi || "-",
          fmtTanggal(p),
        ]),
        startY: (doc.lastAutoTable?.finalY || 30) + 10,
      });

      const y = (doc.lastAutoTable?.finalY || 22) + 12;
      doc.text(`Total Pendapatan: Rp ${totalPendapatan.toLocaleString("id-ID")}`, 14, y);
      doc.text(`Total Pengeluaran: Rp ${totalPengeluaran.toLocaleString("id-ID")}`, 14, y + 8);
      doc.text(
        `Saldo Akhir: Rp ${(totalPendapatan - totalPengeluaran).toLocaleString("id-ID")}`,
        14,
        y + 16
      );
    } else if (activeTab === "neraca" && neracaData) {
      doc.text("Laporan Neraca", 14, 22);
      autoTable(doc, {
        head: [["Kelompok", "Nama Akun/Produk", "Jumlah"]],
        body: [
          ...(neracaData.aset_lancar?.items || []).map((i) => ["Aset Lancar", i.produk_nama, `Rp ${i.saldo.toLocaleString("id-ID")}`]),
          ...(neracaData.aset_tetap?.items || []).map((i) => ["Aset Tetap", i.produk_nama, `Rp ${i.saldo.toLocaleString("id-ID")}`]),
          ["", "Total Aset", `Rp ${neracaData.total_aset?.toLocaleString("id-ID")}`],
          ...(neracaData.kewajiban_lancar?.items || []).map((i) => ["Kewajiban Lancar", i.produk_nama, `Rp ${i.saldo.toLocaleString("id-ID")}`]),
          ...(neracaData.kewajiban_jangka_panjang?.items || []).map((i) => ["Kewajiban Jangka Panjang", i.produk_nama, `Rp ${i.saldo.toLocaleString("id-ID")}`]),
          ["", "Total Kewajiban", `Rp ${neracaData.total_kewajiban?.toLocaleString("id-ID")}`],
        ],
        startY: 30,
      });
      const y = (doc.lastAutoTable?.finalY || 22) + 12;
      doc.text(`Total (Aset - Kewajiban): Rp ${neracaData.total?.toLocaleString("id-ID")}`, 14, y);
    } else if (activeTab === "arusKas") {
      doc.text("Laporan Arus Kas", 14, 22);
      autoTable(doc, {
        head: [["Nama Akun Kas", "Saldo Akhir"]],
        body: arusKasData.map((r) => [r.nama_akun, `Rp ${Number(r.saldo_akhir || 0).toLocaleString("id-ID")}`]),
        startY: 30,
        foot: [[
          "Total Saldo Kas",
          `Rp ${arusKasData.reduce((s, r) => s + Number(r.saldo_akhir || 0), 0).toLocaleString("id-ID")}`,
        ]],
      });
    }

    doc.save("laporan-keuangan.pdf");
  }

  const renderLabaRugi = () => (
    <>
      {/* Ringkasan */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-green-100 p-4 rounded-xl shadow">
          <h3 className="text-lg font-semibold">Total Pendapatan</h3>
          <p className="text-2xl font-bold text-green-700">Rp {totalPendapatan.toLocaleString("id-ID")}</p>
        </div>
        <div className="bg-red-100 p-4 rounded-xl shadow">
          <h3 className="text-lg font-semibold">Total Pengeluaran</h3>
          <p className="text-2xl font-bold text-red-700">Rp {totalPengeluaran.toLocaleString("id-ID")}</p>
        </div>
        <div className="bg-blue-100 p-4 rounded-xl shadow">
          <h3 className="text-lg font-semibold">Saldo Akhir</h3>
          <p className="text-2xl font-bold text-blue-700">
            Rp {(totalPendapatan - totalPengeluaran).toLocaleString("id-ID")}
          </p>
        </div>
      </div>

      {/* Tabel Pendapatan */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">Detail Pendapatan</h3>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Nomor</th>
              <th className="border p-2">Jumlah</th>
              <th className="border p-2">Deskripsi</th>
              <th className="border p-2">Tanggal</th>
            </tr>
          </thead>
          <tbody>
            {pendapatan.length ? (
              pendapatan.map((p, i) => (
                <tr key={i}>
                  <td className="border p-2 text-center">{i+1}</td>
                  <td className="border p-2">Rp {Number(p.debit || 0).toLocaleString("id-ID")}</td>
                  <td className="border p-2">{p.deskripsi || "-"}</td>
                  <td className="border p-2">{fmtTanggal(p)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="border p-2 text-center">Tidak ada data pendapatan</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Tabel Pengeluaran */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4">Detail Pengeluaran</h3>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Nomor</th>
              <th className="border p-2">Jumlah</th>
              <th className="border p-2">Deskripsi</th>
              <th className="border p-2">Tanggal</th>
            </tr>
          </thead>
          <tbody>
            {pengeluaran.length ? (
              pengeluaran.map((p, i) => (
                <tr key={i}>
                  <td className="border p-2 text-center">{i+1}</td>
                  <td className="border p-2">Rp {Number(p.kredit || 0).toLocaleString("id-ID")}</td>
                  <td className="border p-2">{p.deskripsi || "-"}</td>
                  <td className="border p-2">{fmtTanggal(p)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="border p-2 text-center">Tidak ada data pengeluaran</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );

  // Render Arus Kas
   const renderArusKasPerAkun = () => (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-xl font-semibold mb-4">Laporan Arus Kas</h3>

      {/* Filter */}
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <select
          className="border rounded px-3 py-2"
          value={selectedAkunId}
          onChange={(e) => setSelectedAkunId(Number(e.target.value))}
        >
          {akunKas.map((a) => (
            <option key={a.akun_id} value={a.akun_id}>
              {a.nama}
            </option>
          ))}
        </select>

        <input
          type="date"
          className="border rounded px-3 py-2"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <input
          type="date"
          className="border rounded px-3 py-2"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <button
          className="px-4 py-2 bg-gray-100 rounded border"
          onClick={() => loadArusKasAkun()}
        >
          Terapkan
        </button>
      </div>

      {/* Ringkasan */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-green-100 rounded p-3">
          <div className="text-sm text-green-900">Total Pemasukan</div>
          <div className="text-xl font-bold text-green-700">Rp {sumMasuk.toLocaleString("id-ID")}</div>
        </div>
        <div className="bg-red-100 rounded p-3">
          <div className="text-sm text-red-900">Total Pengeluaran</div>
          <div className="text-xl font-bold text-red-700">Rp {sumKeluar.toLocaleString("id-ID")}</div>
        </div>
        <div className="bg-blue-100 rounded p-3">
          <div className="text-sm text-blue-900">Net (Masuk - Keluar)</div>
          <div className="text-xl font-bold text-blue-700">Rp {net.toLocaleString("id-ID")}</div>
        </div>
      </div>

      {/* Tabel Masuk */}
      <div className="mb-6">
        <h4 className="font-semibold mb-2">Pemasukan (Masuk)</h4>
        {arusMasuk.length ? (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Nomor</th>
                <th className="border p-2">Jumlah</th>
                <th className="border p-2">Deskripsi</th>
                <th className="border p-2">Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {arusMasuk.map((r, i) => (
                <tr key={`m-${i}`}>
                  <td className="border p-2 text-center">{i + 1}</td>
                  <td className="border p-2">Rp {Number(r.debit || 0).toLocaleString("id-ID")}</td>
                  <td className="border p-2">{r.deskripsi || "-"}</td>
                  <td className="border p-2">{fmtTanggal(r)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-gray-500">Tidak ada data pemasukan.</div>
        )}
      </div>

      {/* Tabel Keluar */}
      <div>
        <h4 className="font-semibold mb-2">Pengeluaran (Keluar)</h4>
        {arusKeluar.length ? (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Nomor</th>
                <th className="border p-2">Jumlah</th>
                <th className="border p-2">Deskripsi</th>
                <th className="border p-2">Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {arusKeluar.map((r, i) => (
                <tr key={`k-${i}`}>
                  <td className="border p-2 text-center">{i + 1}</td>
                  <td className="border p-2">Rp {Number(r.kredit || 0).toLocaleString("id-ID")}</td>
                  <td className="border p-2">{r.deskripsi || "-"}</td>
                  <td className="border p-2">{fmtTanggal(r)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-gray-500">Tidak ada data pengeluaran.</div>
        )}
      </div>
    </div>
  );
  // Render Neraca
  const renderNeraca = () => (
  <div className="bg-white rounded-xl shadow-md p-6">
    <h3 className="text-xl font-semibold mb-4">Laporan Neraca</h3>

    <div className="flex flex-col md:flex-row gap-3 mb-4">
      <input
        type="date"
        className="border rounded px-3 py-2"
        value={neracaStart}
        onChange={(e) => setNeracaStart(e.target.value)}
      />
      <input
        type="date"
        className="border rounded px-3 py-2"
        value={neracaEnd}
        onChange={(e) => setNeracaEnd(e.target.value)}
      />
      <button
        type="button"
        className="px-4 py-2 bg-gray-100 rounded border"
        onClick={loadNeraca}
      >
        Muat Neraca
      </button>
    </div>

    {neracaLoading ? (
      <div className="text-gray-500">Memuat…</div>
    ) : !neracaData ? (
      <div className="text-gray-500">Belum ada data neraca.</div>
    ) : (
      <>
        {/* preview ringkas sambil kamu cek di console */}
        <div className="grid md:grid-cols-2 gap-4">
          <GroupCard title="Aset Lancar" items={neracaData.aset_lancar?.items} total={neracaData.aset_lancar?.saldo}/>
          <GroupCard title="Aset Tetap" items={neracaData.aset_tetap?.items} total={neracaData.aset_tetap?.saldo}/>
          <GroupCard title="Kewajiban Lancar" items={neracaData.kewajiban_lancar?.items} total={neracaData.kewajiban_lancar?.saldo}/>
          <GroupCard title="Kewajiban Jangka Panjang" items={neracaData.kewajiban_jangka_panjang?.items} total={neracaData.kewajiban_jangka_panjang?.saldo}/>
        </div>

        <div className="mt-6 grid md:grid-cols-3 gap-4">
          <Stat label="Total Aset" value={neracaData.total_aset}/>
          <Stat label="Total Kewajiban" value={neracaData.total_kewajiban}/>
          <Stat label="Total (Aset - Kewajiban)" value={neracaData.total}/>
        </div>
      </>
    )}
  </div>
);

// komponen kecil buat preview
const GroupCard = ({ title, items = [], total = 0 }) => (
  <div className="border rounded-lg p-3">
    <div className="font-semibold mb-2">{title}</div>
    {items.length ? (
      <ul className="text-sm space-y-1 max-h-40 overflow-auto">
        {items.slice(0, 6).map((it, i) => (
          <li key={i} className="flex justify-between">
            <span>{it.produk_nama || it.nama || `Item ${i + 1}`}</span>
            <span>Rp {Number(it.saldo ?? it.subtotal ?? 0).toLocaleString("id-ID")}</span>
          </li>
        ))}
      </ul>
    ) : (
      <div className="text-gray-500 text-sm">Tidak ada item.</div>
    )}
    <div className="mt-2 text-right font-semibold">
      Total: Rp {Number(total || 0).toLocaleString("id-ID")}
    </div>
  </div>
);

const Stat = ({ label, value }) => (
  <div className="bg-gray-50 rounded-lg p-3">
    <div className="text-sm text-gray-600">{label}</div>
    <div className="text-xl font-bold">Rp {Number(value || 0).toLocaleString("id-ID")}</div>
  </div>
);
  return (
    <div className="p-6">
      {/* Header + Export */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold">Laporan Keuangan</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onClick={exportPDF}>
          Export PDF
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex border-b">
        <button
          onClick={() => setActiveTab("labaRugi")}
          className={`py-2 px-4 font-semibold ${activeTab === "labaRugi" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"}`}
        >
          Laporan Laba Rugi
        </button>
        <button
          onClick={() => setActiveTab("neraca")}
          className={`py-2 px-4 font-semibold ${activeTab === "neraca" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"}`}
        >
          Laporan Neraca
        </button>
        <button
          onClick={() => setActiveTab("arusKas")}
          className={`py-2 px-4 font-semibold ${activeTab === "arusKas" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"}`}
        >
          Laporan Arus Kas
        </button>
      </div>

      {/* Content */}
      {activeTab === "labaRugi" ? (
        renderLabaRugi()
      ) : activeTab === "neraca" ? (
        renderNeraca()
      ) : (
        renderArusKasPerAkun()
      )}
    </div>
  );
}
