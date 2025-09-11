import React from 'react';

const ArusKas = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 mt-6">
        <h3 className="text-xl font-semibold mb-4">Laporan Arus Kas</h3>
        <p>Tidak ada data arus kas tersedia.</p>
      </div>
    );
  }

  const totalSaldo = data.reduce((sum, item) => sum + (item.saldo_akhir || 0), 0);

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mt-6">
      <h3 className="text-xl font-semibold mb-4">Laporan Arus Kas</h3>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2 text-left">Nama Akun Kas</th>
            <th className="border p-2 text-right">Saldo Akhir</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td className="border p-2">{item.nama_akun}</td>
              <td className="border p-2 text-right">Rp {item.saldo_akhir.toLocaleString('id-ID')}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-gray-50 font-bold">
            <td className="border p-2 text-right">Total Saldo Kas</td>
            <td className="border p-2 text-right">Rp {totalSaldo.toLocaleString('id-ID')}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default ArusKas;
