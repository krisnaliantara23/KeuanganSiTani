// src/pages/LaporanPage.jsx
import React, { useEffect, useState } from "react";
import { getPendapatan, getPengeluaran, getNeraca, getNeracaAll } from "../services/financeService";
import { listAkunKas, getArusKasByAkun } from "../services/akunKasService";
import { getCurrentUser } from "../lib/auth";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ---------- util kecil ----------
const fmtTanggal = (val) => {
  const t = val?.tanggal || val?.created_at || val;
  const d = new Date(t);
  return isNaN(d) ? "-" : d.toLocaleDateString("id-ID");
};
const formatRp = (val) => `Rp ${Number(val || 0).toLocaleString("id-ID")}`;
const isClusterNull = (v) => v === null || v === undefined || v === "null" || v === "";

// ---------- halaman ----------
export default function LaporanPage() {
  const [activeTab, setActiveTab] = useState("labaRugi"); // labaRugi | neraca | arusKas
  const me = getCurrentUser() || {};
  const userId = me.user_id || null;
  const token = localStorage.getItem("token");

  // === FILTER SHARE (global untuk 3 tab) ===
  // all | own | cluster
  const [shareFilter, setShareFilter] = useState("all");

  // ===== Laba Rugi =====
  const [pendapatanAll, setPendapatanAll] = useState([]);
  const [pengeluaranAll, setPengeluaranAll] = useState([]);

  // Pagination Laba Rugi
  const [pendPage, setPendPage] = useState(1);
  const [pengPage, setPengPage] = useState(1);
  const pendRowsPerPage = 10;
  const pengRowsPerPage = 10;

  // ===== Arus Kas per akun =====
  const [akunKas, setAkunKas] = useState([]);
  const [selectedAkunId, setSelectedAkunId] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [arusMasukAll, setArusMasukAll] = useState([]);
  const [arusKeluarAll, setArusKeluarAll] = useState([]);

  // ===== Neraca =====
  const [neracaData, setNeracaData] = useState(null);
  const [neracaStart, setNeracaStart] = useState("");
  const [neracaEnd, setNeracaEnd] = useState("");
  const [neracaLoading, setNeracaLoading] = useState(false);

  // ---------- loads awal ----------
  useEffect(() => {
    loadLabaRugi();
    loadAkunList();
  }, []);

  // Arus kas: reload saat tab/akun/periode/filter share berubah
  useEffect(() => {
    if (activeTab !== "arusKas" || !selectedAkunId) return;
    loadArusKasAkun();
  }, [activeTab, selectedAkunId, startDate, endDate, shareFilter]);

  // Neraca: reload saat tab/periode/filter share berubah
  useEffect(() => {
    if (activeTab !== "neraca") return;
    loadNeraca();
  }, [activeTab, neracaStart, neracaEnd, shareFilter]);

  // Reset pagination ketika filter share berubah atau pindah tab ke labaRugi
  useEffect(() => {
    if (activeTab === "labaRugi") {
      setPendPage(1);
      setPengPage(1);
    }
  }, [shareFilter, activeTab]);

  // ---------- fetchers ----------
  async function loadAkunList() {
    try {
      const res = await listAkunKas({ page: 1, limit: 100 });
      const list = Array.isArray(res.data?.data) ? res.data.data : res.data?.data || [];
      setAkunKas(list);
      if (list.length && !selectedAkunId) setSelectedAkunId(list[0].akun_id);
    } catch {
      setAkunKas([]);
    }
  }
  useEffect(() => {
  if (activeTab === "labaRugi") {
    loadLabaRugi();
  }
}, [shareFilter, activeTab]);
  async function loadLabaRugi() {
    try {
      console.log(shareFilter)
      const params = { id_user: userId, klaster_id: undefined };
      if (shareFilter === "cluster" && me.klaster_id !== null) {
        params.klaster_id = me.klaster_id;
      }
      let listPend = await getPendapatan(token, params);   // array laporan pemasukan
      let listPeng = await getPengeluaran(token, params);  // array laporan pengeluaran
      if (shareFilter === "own") {
        listPend = listPend.filter(item => isClusterNull(item.klaster_id));
        listPeng = listPeng.filter(item => isClusterNull(item.klaster_id));
      }
      setPendapatanAll(Array.isArray(listPend) ? listPend : []);
      setPengeluaranAll(Array.isArray(listPeng) ? listPeng : []);
    } catch (e) {
      console.error("Gagal ambil laba rugi:", e);
      setPendapatanAll([]);
      setPengeluaranAll([]);
    }
  }

  async function loadArusKasAkun() {
    try {
      const res = await getArusKasByAkun(token, {
        akun_id: selectedAkunId,
        start: startDate || undefined,
        end: endDate || undefined,
        page: 1,
        limit: 500,
        share: shareFilter,
        ...(shareFilter === "cluster" && me.klaster_id != null
          ? { klaster_id: me.klaster_id }
          : {}),
      });
      const payload = res.data?.data || res.data || {};
      const masuk = Array.isArray(payload.masuk) ? payload.masuk : [];
      const keluar = Array.isArray(payload.keluar) ? payload.keluar : [];

      // FE filter by share
      const pass = (row) =>
        shareFilter === "all"
          ? true
          : shareFilter === "own"
          ? isClusterNull(row.klaster_id)
          : !isClusterNull(row.klaster_id);

      setArusMasukAll(masuk.filter(pass));
      setArusKeluarAll(keluar.filter(pass));
    } catch (e) {
      console.error("Gagal ambil arus kas akun:", e);
      setArusMasukAll([]);
      setArusKeluarAll([]);
    }
  }

  async function loadNeraca() {
    try {
      setNeracaLoading(true);

      const base = {
        start: neracaStart || undefined,
        end:   neracaEnd   || undefined,
      };

      let res;
      if (shareFilter === "all") {
        // gabungan pribadi + klaster (kalau user punya klaster)
        res = await getNeracaAll(token, {
          ...base,
          userId: userId ? String(userId) : undefined,
          klasterId: me.klaster_id != null ? String(me.klaster_id) : undefined,
        });
      } else if (shareFilter === "cluster" && me.klaster_id != null) {
        // hanya klaster aktif user
        res = await getNeraca(token, { ...base, klasterId: String(me.klaster_id) });
      } else {
        // hanya milik pribadi user saat ini
        res = await getNeraca(token, { ...base, userId: userId ? String(userId) : undefined });
      }

      setNeracaData(res?.data?.data || res?.data || null);
    } catch (e) {
      console.error("Gagal ambil neraca:", e);
      setNeracaData(null);
    } finally {
      setNeracaLoading(false);
    }
  }

  // ---------- derived (FE filter Laba Rugi) ----------
  const pendapatan = pendapatanAll || [];
  const pengeluaran = pengeluaranAll || [];
  

  const totalPendapatan = pendapatan.reduce((s, it) => s + Number(it.debit || 0), 0);
  const totalPengeluaran = pengeluaran.reduce((s, it) => s + Number(it.kredit || 0), 0);

  // ---------- Pagination (Laba Rugi) ----------
  // Pendapatan
  const pendTotalPages = Math.max(1, Math.ceil(pendapatan.length / pendRowsPerPage));
  const pendStart = (pendPage - 1) * pendRowsPerPage;
  const pendEnd = pendStart + pendRowsPerPage;
  const pendapatanPageItems = pendapatan.slice(pendStart, pendEnd);

  // Pengeluaran
  const pengTotalPages = Math.max(1, Math.ceil(pengeluaran.length / pengRowsPerPage));
  const pengStart = (pengPage - 1) * pengRowsPerPage;
  const pengEnd = pengStart + pengRowsPerPage;
  const pengeluaranPageItems = pengeluaran.slice(pengStart, pengEnd);

  // ---------- derived Arus Kas ----------
  const arusMasuk = arusMasukAll;
  const arusKeluar = arusKeluarAll;
  const sumMasuk = arusMasuk.reduce((s, r) => s + Number(r.debit || 0), 0);
  const sumKeluar = arusKeluar.reduce((s, r) => s + Number(r.kredit || 0), 0);
  const net = sumMasuk - sumKeluar;

  // ---------- Export PDF (pakai data yang sudah terfilter; tidak terpengaruh pagination) ----------
  function exportPDF() {
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    const margin = 14;
    let finalY = 0;

    const addHeader = (title) => {
      doc.setFontSize(18);
      doc.setFont(undefined, "bold");
      doc.text("Laporan Keuangan SiTani", margin, 22);
      doc.setFontSize(14);
      doc.setFont(undefined, "normal");
      doc.text(title, margin, 30);
      doc.setFontSize(10);
      doc.text(`Pengguna: ${me.username || "N/A"}`, pageWidth - margin, 22, { align: "right" });
      doc.text(
        `Tanggal: ${new Date().toLocaleDateString("id-ID")} — Filter: ${
          shareFilter === "all" ? "Semua" : shareFilter === "own" ? "Milik Saya" : "Klaster"
        }`,
        pageWidth - margin,
        30,
        { align: "right" }
      );
      finalY = 40;
    };
    const addFooter = () => {
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(`Halaman ${i} dari ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: "center" });
      }
    };

    if (activeTab === "labaRugi") {
      addHeader("Laporan Laba Rugi");

      autoTable(doc, {
        startY: finalY,
        body: [
          ["Total Pendapatan", formatRp(totalPendapatan)],
          ["Total Pengeluaran", formatRp(totalPengeluaran)],
          ["Laba/Rugi Bersih", formatRp(totalPendapatan - totalPengeluaran)],
        ],
        theme: "grid",
        styles: { fontStyle: "bold", fillColor: [230, 247, 255] },
        columnStyles: { 0: { fontStyle: "bold" } },
      });
      finalY = doc.lastAutoTable.finalY + 10;

      doc.setFontSize(12);
      doc.text("Detail Pendapatan", margin, finalY);
      finalY += 5;
      autoTable(doc, {
        startY: finalY,
        head: [["Tanggal", "Deskripsi", "Jumlah"]],
        body: pendapatan.map((p) => [fmtTanggal(p), p.deskripsi || "-", formatRp(p.debit)]),
        theme: "striped",
        headStyles: { fillColor: [22, 163, 74] },
      });
      finalY = doc.lastAutoTable.finalY + 10;

      doc.setFontSize(12);
      doc.text("Detail Pengeluaran", margin, finalY);
      finalY += 5;
      autoTable(doc, {
        startY: finalY,
        head: [["Tanggal", "Deskripsi", "Jumlah"]],
        body: pengeluaran.map((p) => [fmtTanggal(p), p.deskripsi || "-", formatRp(p.kredit)]),
        theme: "striped",
        headStyles: { fillColor: [220, 38, 38] },
      });
    } else if (activeTab === "neraca" && neracaData) {
      addHeader("Laporan Neraca");
      if (neracaStart && neracaEnd) {
        doc.setFontSize(10);
        doc.text(`Periode: ${fmtTanggal(neracaStart)} - ${fmtTanggal(neracaEnd)}`, margin, finalY - 5);
      }

      // Aset
      doc.setFontSize(14);
      doc.text("ASET", margin, finalY);
      finalY += 8;

      autoTable(doc, {
        startY: finalY,
        head: [["Aset Lancar", "Jumlah"]],
        body: (neracaData.aset_lancar?.items || []).map((i) => [i.produk_nama, formatRp(i.saldo)]),
        foot: [["Total Aset Lancar", formatRp(neracaData.aset_lancar?.saldo)]],
        theme: "striped",
        headStyles: { fillColor: [37, 99, 235] },
        footStyles: { fontStyle: "bold" },
      });
      finalY = doc.lastAutoTable.finalY + 5;

      autoTable(doc, {
        startY: finalY,
        head: [["Aset Tetap", "Jumlah"]],
        body: (neracaData.aset_tetap?.items || []).map((i) => [i.produk_nama, formatRp(i.saldo)]),
        foot: [["Total Aset Tetap", formatRp(neracaData.aset_tetap?.saldo)]],
        theme: "striped",
        headStyles: { fillColor: [37, 99, 235] },
        footStyles: { fontStyle: "bold" },
      });
      finalY = doc.lastAutoTable.finalY + 10;

      autoTable(doc, {
        startY: finalY,
        body: [["Total Aset", formatRp(neracaData.total_aset)]],
        theme: "grid",
        bodyStyles: { fontStyle: "bold", fontSize: 12, fillColor: [226, 232, 240] },
      });
      finalY = doc.lastAutoTable.finalY + 10;

      // Kewajiban & Ekuitas
      doc.setFontSize(14);
      doc.text("KEWAJIBAN & EKUITAS", margin, finalY);
      finalY += 8;

      autoTable(doc, {
        startY: finalY,
        head: [["Kewajiban Lancar", "Jumlah"]],
        body: (neracaData.kewajiban_lancar?.items || []).map((i) => [i.produk_nama, formatRp(i.saldo)]),
        foot: [["Total Kewajiban Lancar", formatRp(neracaData.kewajiban_lancar?.saldo)]],
        theme: "striped",
        headStyles: { fillColor: [217, 119, 6] },
        footStyles: { fontStyle: "bold" },
      });
      finalY = doc.lastAutoTable.finalY + 5;

      autoTable(doc, {
        startY: finalY,
        head: [["Kewajiban Jangka Panjang", "Jumlah"]],
        body: (neracaData.kewajiban_jangka_panjang?.items || []).map((i) => [i.produk_nama, formatRp(i.saldo)]),
        foot: [
          ["Total Kewajiban Jangka Panjang", formatRp(neracaData.kewajiban_jangka_panjang?.saldo)],
        ],
        theme: "striped",
        headStyles: { fillColor: [217, 119, 6] },
        footStyles: { fontStyle: "bold" },
      });
      finalY = doc.lastAutoTable.finalY + 10;

      autoTable(doc, {
        startY: finalY,
        body: [
          ["Total Kewajiban", formatRp(neracaData.total_kewajiban)],
          ["Ekuitas (Aset - Kewajiban)", formatRp(neracaData.total)],
        ],
        theme: "grid",
        bodyStyles: { fontStyle: "bold", fontSize: 12, fillColor: [226, 232, 240] },
      });
    } else if (activeTab === "arusKas") {
      const acc = akunKas.find((a) => a.akun_id === selectedAkunId);
      addHeader("Laporan Arus Kas");
      doc.setFontSize(11);
      doc.text(`Akun Kas: ${acc ? acc.nama : "Semua Akun"}`, margin, finalY - 8);
      if (startDate && endDate) {
        doc.text(`Periode: ${fmtTanggal(startDate)} - ${fmtTanggal(endDate)}`, margin, finalY - 2);
      }
      finalY += 5;

      autoTable(doc, {
        startY: finalY,
        body: [
          ["Total Pemasukan", formatRp(sumMasuk)],
          ["Total Pengeluaran", formatRp(sumKeluar)],
          ["Arus Kas Bersih", formatRp(net)],
        ],
        theme: "grid",
        styles: { fontStyle: "bold", fillColor: [230, 247, 255] },
      });
      finalY = doc.lastAutoTable.finalY + 10;

      doc.setFontSize(12);
      doc.text("Detail Pemasukan (Masuk)", margin, finalY);
      finalY += 5;
      autoTable(doc, {
        startY: finalY,
        head: [["Tanggal", "Deskripsi", "Jumlah"]],
        body: arusMasuk.map((r) => [fmtTanggal(r), r.deskripsi || "-", formatRp(r.debit)]),
        theme: "striped",
        headStyles: { fillColor: [22, 163, 74] },
      });
      finalY = doc.lastAutoTable.finalY + 10;

      doc.setFontSize(12);
      doc.text("Detail Pengeluaran (Keluar)", margin, finalY);
      finalY += 5;
      autoTable(doc, {
        startY: finalY,
        head: [["Tanggal", "Deskripsi", "Jumlah"]],
        body: arusKeluar.map((r) => [fmtTanggal(r), r.deskripsi || "-", formatRp(r.kredit)]),
        theme: "striped",
        headStyles: { fillColor: [220, 38, 38] },
      });
    }

    addFooter();
    doc.save(`laporan-${activeTab}-${new Date().toISOString().slice(0, 10)}.pdf`);
  }

  // ---------- UI kecil ----------
  const GroupCard = ({ title, items = [], total = 0 }) => (
    <div className="border rounded-lg p-3">
      <div className="font-semibold mb-2">{title}</div>
      {items?.length ? (
        <ul className="text-sm space-y-1 max-h-40 overflow-auto">
          {items.slice(0, 6).map((it, i) => (
            <li key={i} className="flex justify-between">
              <span>{it.produk_nama || it.nama || `Item ${i + 1}`}</span>
              <span>{formatRp(it.saldo ?? it.subtotal ?? 0)}</span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-gray-500 text-sm">Tidak ada item.</div>
      )}
      <div className="mt-2 text-right font-semibold">Total: {formatRp(total)}</div>
    </div>
  );

  const Stat = ({ label, value }) => (
    <div className="bg-gray-50 rounded-lg p-3">
      <div className="text-sm text-gray-600">{label}</div>
      <div className="text-xl font-bold">{formatRp(value)}</div>
    </div>
  );

  // ---------- render per tab ----------
  const renderLabaRugi = () => (
    <>
      {/* Ringkasan */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-green-100 p-4 rounded-xl shadow">
          <h3 className="text-lg font-semibold">Total Pendapatan</h3>
          <p className="text-2xl font-bold text-green-700">{formatRp(totalPendapatan)}</p>
        </div>
        <div className="bg-red-100 p-4 rounded-xl shadow">
          <h3 className="text-lg font-semibold">Total Pengeluaran</h3>
          <p className="text-2xl font-bold text-red-700">{formatRp(totalPengeluaran)}</p>
        </div>
        <div className="bg-blue-100 p-4 rounded-xl shadow">
          <h3 className="text-lg font-semibold">Saldo Akhir</h3>
          <p className="text-2xl font-bold text-blue-700">
            {formatRp(totalPendapatan - totalPengeluaran)}
          </p>
        </div>
      </div>

      {/* Tabel Pendapatan */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Detail Pendapatan</h3>
          <div className="text-sm text-gray-600">
            Menampilkan {pendapatan.length ? pendStart + 1 : 0}
            –{Math.min(pendEnd, pendapatan.length)} dari {pendapatan.length} data
          </div>
        </div>

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
            {pendapatanPageItems.length ? (
              pendapatanPageItems.map((p, i) => (
                <tr key={pendStart + i}>
                  <td className="border p-2 text-center">{pendStart + i + 1}</td>
                  <td className="border p-2">{formatRp(p.debit)}</td>
                  <td className="border p-2">{p.deskripsi || "-"}</td>
                  <td className="border p-2">{fmtTanggal(p)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="border p-2 text-center">
                  Tidak ada data pendapatan
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination controls pendapatan */}
        <div className="mt-4 flex items-center justify-between">
          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            onClick={() => setPendPage((p) => Math.max(1, p - 1))}
            disabled={pendPage === 1}
          >
            ‹ Sebelumnya
          </button>
          <div className="text-sm">
            Halaman <span className="font-semibold">{pendPage}</span> / {pendTotalPages}
          </div>
          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            onClick={() => setPendPage((p) => Math.min(pendTotalPages, p + 1))}
            disabled={pendPage === pendTotalPages}
          >
            Berikutnya ›
          </button>
        </div>
      </div>

      {/* Tabel Pengeluaran */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Detail Pengeluaran</h3>
          <div className="text-sm text-gray-600">
            Menampilkan {pengeluaran.length ? pengStart + 1 : 0}
            –{Math.min(pengEnd, pengeluaran.length)} dari {pengeluaran.length} data
          </div>
        </div>

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
            {pengeluaranPageItems.length ? (
              pengeluaranPageItems.map((p, i) => (
                <tr key={pengStart + i}>
                  <td className="border p-2 text-center">{pengStart + i + 1}</td>
                  <td className="border p-2">{formatRp(p.kredit)}</td>
                  <td className="border p-2">{p.deskripsi || "-"}</td>
                  <td className="border p-2">{fmtTanggal(p)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="border p-2 text-center">
                  Tidak ada data pengeluaran
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination controls pengeluaran */}
        <div className="mt-4 flex items-center justify-between">
          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            onClick={() => setPengPage((p) => Math.max(1, p - 1))}
            disabled={pengPage === 1}
          >
            ‹ Sebelumnya
          </button>
          <div className="text-sm">
            Halaman <span className="font-semibold">{pengPage}</span> / {pengTotalPages}
          </div>
          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            onClick={() => setPengPage((p) => Math.min(pengTotalPages, p + 1))}
            disabled={pengPage === pengTotalPages}
          >
            Berikutnya ›
          </button>
        </div>
      </div>
    </>
  );

  const renderArusKasPerAkun = () => (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-xl font-semibold mb-4">Laporan Arus Kas</h3>

      {/* Filter bar */}
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
        <button className="px-4 py-2 bg-gray-100 rounded border" onClick={loadArusKasAkun}>
          Terapkan
        </button>
      </div>

      {/* Ringkasan */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-green-100 rounded p-3">
          <div className="text-sm text-green-900">Total Pemasukan</div>
          <div className="text-xl font-bold text-green-700">{formatRp(sumMasuk)}</div>
        </div>
        <div className="bg-red-100 rounded p-3">
          <div className="text-sm text-red-900">Total Pengeluaran</div>
          <div className="text-xl font-bold text-red-700">{formatRp(sumKeluar)}</div>
        </div>
        <div className="bg-blue-100 rounded p-3">
          <div className="text-sm text-blue-900">Net (Masuk - Keluar)</div>
          <div className="text-xl font-bold text-blue-700">{formatRp(net)}</div>
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
                  <td className="border p-2">{formatRp(r.debit)}</td>
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
                  <td className="border p-2">{formatRp(r.kredit)}</td>
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
        <button type="button" className="px-4 py-2 bg-gray-100 rounded border" onClick={loadNeraca}>
          Muat Neraca
        </button>
      </div>

      {neracaLoading ? (
        <div className="text-gray-500">Memuat…</div>
      ) : !neracaData ? (
        <div className="text-gray-500">
          Belum ada data neraca.
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 gap-4">
            <GroupCard
              title="Aset Lancar"
              items={neracaData.aset_lancar?.items}
              total={neracaData.aset_lancar?.saldo}
            />
            <GroupCard
              title="Aset Tetap"
              items={neracaData.aset_tetap?.items}
              total={neracaData.aset_tetap?.saldo}
            />
            <GroupCard
              title="Kewajiban Lancar"
              items={neracaData.kewajiban_lancar?.items}
              total={neracaData.kewajiban_lancar?.saldo}
            />
            <GroupCard
              title="Kewajiban Jangka Panjang"
              items={neracaData.kewajiban_jangka_panjang?.items}
              total={neracaData.kewajiban_jangka_panjang?.saldo}
            />
          </div>

          <div className="mt-6 grid md:grid-cols-3 gap-4">
            <Stat label="Total Aset" value={neracaData.total_aset} />
            <Stat label="Total Kewajiban" value={neracaData.total_kewajiban} />
            <Stat label="Total (Aset - Kewajiban)" value={neracaData.total} />
          </div>
        </>
      )}
    </div>
  );

  // ---------- layout utama ----------
  return (
    <div className="p-6">
      {/* Header + Export */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold">Laporan Keuangan</h2>

        {/* Global Share Filter + Export */}
        <div className="flex items-center gap-3">
          <div>Pilih Filter</div>
          <select
            className="border rounded px-3 py-2"
            value={shareFilter}
            onChange={(e) => setShareFilter(e.target.value)}
            title="Filter Share Global"
          >
            <option value="all">Semua</option>
            <option value="own">Milik Saya</option>
            <option value="cluster">Milik Klaster</option>
          </select>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onClick={exportPDF}>
            Export PDF
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex border-b">
        <button
          onClick={() => setActiveTab("labaRugi")}
          className={`py-2 px-4 font-semibold ${
            activeTab === "labaRugi" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"
          }`}
        >
          Laporan Laba Rugi
        </button>
        <button
          onClick={() => setActiveTab("neraca")}
          className={`py-2 px-4 font-semibold ${
            activeTab === "neraca" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"
          }`}
        >
          Laporan Neraca
        </button>
        <button
          onClick={() => setActiveTab("arusKas")}
          className={`py-2 px-4 font-semibold ${
            activeTab === "arusKas" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"
          }`}
        >
          Laporan Arus Kas
        </button>
      </div>

      {/* Content */}
      {activeTab === "labaRugi" ? renderLabaRugi() : activeTab === "neraca" ? renderNeraca() : renderArusKasPerAkun()}
    </div>
  );
}
