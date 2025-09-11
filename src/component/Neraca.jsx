
import React from 'react';

const NeracaSection = ({ title, items, debitLabel = "Debit", kreditLabel = "Kredit" }) => {
  if (!items || items.length === 0) {
    return null;
  }

  const totalDebit = items.reduce((sum, item) => sum + (item.debit || 0), 0);
  const totalKredit = items.reduce((sum, item) => sum + (item.kredit || 0), 0);

  return (
    <div className="mb-8">
      <h4 className="text-lg font-semibold mb-2">{title}</h4>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2 text-left">Nama Akun</th>
            <th className="border p-2 text-right">{debitLabel}</th>
            <th className="border p-2 text-right">{kreditLabel}</th>
            <th className="border p-2 text-right">Saldo</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index}>
              <td className="border p-2">{item.produk_nama}</td>
              <td className="border p-2 text-right">{item.debit > 0 ? `Rp ${item.debit.toLocaleString('id-ID')}` : '-'}</td>
              <td className="border p-2 text-right">{item.kredit > 0 ? `Rp ${item.kredit.toLocaleString('id-ID')}` : '-'}</td>
              <td className="border p-2 text-right">Rp {item.saldo.toLocaleString('id-ID')}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-gray-50 font-bold">
            <td className="border p-2 text-right" colSpan="3">Total Saldo {title}</td>
            <td className="border p-2 text-right">Rp {(totalDebit - totalKredit).toLocaleString('id-ID')}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

const Neraca = ({ data }) => {
  if (!data) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 mt-6">
        <h3 className="text-xl font-semibold mb-4">Laporan Neraca</h3>
        <p>Memuat data neraca...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mt-6">
      <h3 className="text-xl font-semibold mb-4">Laporan Neraca</h3>
      
      {/* Aset */}
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-4">Aset</h3>
        <NeracaSection title="Aset Lancar" items={data.aset_lancar?.items} />
        <NeracaSection title="Aset Tetap" items={data.aset_tetap?.items} />
        <div className="text-right font-bold text-lg pr-2 py-2 bg-gray-100 rounded">
            Total Aset: Rp {data.total_aset?.toLocaleString('id-ID')}
        </div>
      </div>

      {/* Kewajiban */}
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-4">Kewajiban</h3>
        <NeracaSection title="Kewajiban Lancar" items={data.kewajiban_lancar?.items} />
        <NeracaSection title="Kewajiban Jangka Panjang" items={data.kewajiban_jangka_panjang?.items} />
        <div className="text-right font-bold text-lg pr-2 py-2 bg-gray-100 rounded">
            Total Kewajiban: Rp {data.total_kewajiban?.toLocaleString('id-ID')}
        </div>
      </div>

      {/* Total Keseluruhan */}
      <div className="mt-8 text-right bg-blue-100 p-4 rounded-xl">
        <span className="text-xl font-bold text-blue-800">Total (Aset - Kewajiban): Rp {data.total?.toLocaleString('id-ID')}</span>
      </div>
    </div>
  );
};

export default Neraca;
