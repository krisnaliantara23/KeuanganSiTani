// BerandaPage.jsx
import { Card, CardContent } from "@/components/ui/card";

export default function BerandaPage() {
  return (
    <div className="space-y-6">
      {/* Header Welcome */}
      <div className="bg-green-200 rounded-2xl p-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-green-900">
            Selamat Datang Budi!
          </h2>
          <p className="text-green-800">
            Kelola keuangan pendapatan & biaya dengan mudah dan efisien
          </p>
        </div>
        <div className="w-16 h-16 bg-white rounded-full"></div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-green-500 border-t-4">
          <CardContent className="p-4">
            <p className="text-sm">Pendapatan</p>
            <h3 className="text-xl font-bold text-green-700">Rp 7.500.000</h3>
          </CardContent>
        </Card>
        <Card className="border-red-500 border-t-4">
          <CardContent className="p-4">
            <p className="text-sm">Pengeluaran</p>
            <h3 className="text-xl font-bold text-red-700">Rp 15.000.000</h3>
          </CardContent>
        </Card>
        <Card className="border-blue-500 border-t-4">
          <CardContent className="p-4">
            <p className="text-sm">Sisa Saldo</p>
            <h3 className="text-xl font-bold text-blue-700">Rp 17.000.000</h3>
          </CardContent>
        </Card>
      </div>

      {/* Chart + Transaksi Terakhir */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <h3 className="font-bold mb-2">Pendapatan vs Pengeluaran</h3>
            {/* Chart library (misalnya recharts) taruh di sini */}
            <div className="h-48 bg-gray-100 rounded"></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <h3 className="font-bold mb-2">Transaksi Terakhir</h3>
            <ul className="space-y-2 text-sm">
              <li>+ Rp 500.000 (Pendapatan)</li>
              <li>- Rp 200.000 (Pengeluaran)</li>
              <li>- Rp 100.000 (Pengeluaran)</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Aksi Cepat */}
      <div>
        <h3 className="font-bold mb-2">Aksi Cepat</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="text-center p-6 hover:shadow-lg cursor-pointer">
            Tambah Pendapatan
          </Card>
          <Card className="text-center p-6 hover:shadow-lg cursor-pointer">
            Tambah Pengeluaran
          </Card>
          <Card className="text-center p-6 hover:shadow-lg cursor-pointer">
            Lihat Laporan
          </Card>
        </div>
      </div>
    </div>
  );
}
