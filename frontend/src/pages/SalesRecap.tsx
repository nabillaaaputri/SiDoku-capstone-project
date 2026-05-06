import { useState, useMemo } from "react";
import { Download } from "lucide-react";
import * as XLSX from "xlsx";
import DashboardLayout from "@/components/DashboardLayout";
import { useBusinessContext } from "@/context";
import { formatIDR } from "@/lib/utils";

export default function SalesRecap() {
  const { getDailySalesRecap, products } = useBusinessContext();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  // Get recap for selected date
  const recap = useMemo(() => {
    return getDailySalesRecap(new Date(selectedDate));
  }, [selectedDate, getDailySalesRecap]);

  // Calculate total expenses per day
  const totalUangKeluar = recap.totalUangKeluar;
  const totalUntung = recap.labaBersih;

  // Export to Excel function
  const handleExportExcel = () => {
    if (!recap.isComplete || recap.details.length === 0) return;

    const dateStr = new Date(recap.date).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

    // Prepare data for export
    const exportData = [
      ["REKAP PENJUALAN", "", "", "", "", "", "", ""],
      [`Tanggal: ${new Date(recap.date).toLocaleDateString("id-ID", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}`, "", "", "", "", "", "", ""],
      [],
      ["RINGKASAN"],
      ["Total Uang Masuk", recap.totalUangMasuk],
      ["Total HPP", recap.totalHppTerpakai],
      ["Total Untung", totalUntung],
      ["Total Uang Keluar", totalUangKeluar],
      [],
      ["DETAIL PENJUALAN PER PRODUK"],
      [
        "Produk",
        "Stok Awal",
        "Stok Masuk",
        "Stok Akhir",
        "Terjual",
        "HPP",
        "Nilai Penjualan",
        "Untung",
      ],
      ...recap.details.map((detail) => [
        detail.productName,
        detail.stokAwal,
        detail.stokMasuk,
        detail.stokAkhir,
        detail.terjual,
        detail.hppTerpakai,
        detail.nilaiPenjualan,
        detail.nilaiPenjualan - detail.hppTerpakai,
      ]),
    ];

    // Create workbook and worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(exportData);

    // Set column widths
    worksheet["!cols"] = [
      { wch: 20 }, // Produk
      { wch: 12 }, // Stok Awal
      { wch: 12 }, // Stok Masuk
      { wch: 12 }, // Stok Akhir
      { wch: 10 }, // Terjual
      { wch: 15 }, // HPP
      { wch: 18 }, // Nilai Penjualan
      { wch: 15 }, // Untung
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Rekap Penjualan");

    // Generate filename with date
    const filename = `Rekap_Penjualan_${dateStr}.xlsx`;

    // Download file
    XLSX.writeFile(workbook, filename);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Rekap Penjualan</h1>
          <p className="text-sm text-gray-600 mt-2">
            Lihat detail penjualan, HPP, dan keuntungan per produk
          </p>
        </div>

        {/* Date Picker */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <label className="text-sm font-bold">Pilih Tanggal:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border-2 border-gray-300 px-4 py-2 rounded text-sm"
          />
        </div>

        {/* Data Not Complete Warning */}
        {!recap.isComplete && products.length > 0 && (
          <div className="border-4 border-yellow-300 bg-yellow-50 p-6 rounded-lg">
            <p className="text-gray-700 font-semibold">
              ⚠️ Lengkapi stok awal, stok masuk, dan stok akhir untuk melihat rekap penjualan.
            </p>
          </div>
        )}

        {/* Summary Cards */}
        {recap.isComplete && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="border-2 border-blue-300 bg-blue-50 p-4 rounded-lg">
              <p className="text-xs font-bold text-gray-600 mb-1">Total Uang Masuk</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatIDR(recap.totalUangMasuk)}
              </p>
            </div>

            <div className="border-2 border-red-300 bg-red-50 p-4 rounded-lg">
              <p className="text-xs font-bold text-gray-600 mb-1">Total HPP</p>
              <p className="text-2xl font-bold text-red-600">
                {formatIDR(recap.totalHppTerpakai)}
              </p>
            </div>

            <div className="border-2 border-green-300 bg-green-50 p-4 rounded-lg">
              <p className="text-xs font-bold text-gray-600 mb-1">Total Untung</p>
              <p className="text-2xl font-bold text-green-600">
                {formatIDR(totalUntung)}
              </p>
            </div>

            <div className="border-2 border-orange-300 bg-orange-50 p-4 rounded-lg">
              <p className="text-xs font-bold text-gray-600 mb-1">Total Uang Keluar</p>
              <p className="text-2xl font-bold text-orange-600">
                {formatIDR(totalUangKeluar)}
              </p>
            </div>
          </div>
        )}

        {/* Detail Table */}
        {recap.isComplete ? (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Detail Penjualan Per Produk</h2>
                <p className="text-sm text-gray-600">Tanggal: {new Date(recap.date).toLocaleDateString("id-ID", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}</p>
              </div>
              <button
                onClick={handleExportExcel}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-bold rounded hover:bg-green-700 transition"
              >
                <Download size={18} />
                Export Excel
              </button>
            </div>

            {recap.details.length === 0 ? (
              <div className="border-2 border-gray-300 bg-gray-50 rounded-lg p-8 text-center">
                <p className="text-gray-600 text-sm">Tidak ada catatan penjualan pada tanggal ini.</p>
              </div>
            ) : (
              <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-100 border-b-2 border-gray-300">
                        <th className="text-left py-3 px-3 text-xs font-bold text-gray-700">
                          Produk
                        </th>
                        <th className="text-center py-3 px-3 text-xs font-bold text-gray-700">
                          Stok Awal
                        </th>
                        <th className="text-center py-3 px-3 text-xs font-bold text-gray-700">
                          Stok Masuk
                        </th>
                        <th className="text-center py-3 px-3 text-xs font-bold text-gray-700">
                          Stok Akhir
                        </th>
                        <th className="text-center py-3 px-3 text-xs font-bold text-gray-700">
                          Terjual
                        </th>
                        <th className="text-right py-3 px-3 text-xs font-bold text-gray-700">
                          HPP
                        </th>
                        <th className="text-right py-3 px-3 text-xs font-bold text-gray-700">
                          Nilai Penjualan
                        </th>
                        <th className="text-right py-3 px-3 text-xs font-bold text-gray-700">
                          Untung
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {recap.details.map((detail) => (
                        <tr key={detail.productId} className="hover:bg-gray-50 transition">
                          <td className="py-3 px-3 font-semibold text-gray-900">
                            {detail.productName}
                          </td>
                          <td className="py-3 px-3 text-center text-gray-700">
                            {detail.stokAwal}
                          </td>
                          <td className="py-3 px-3 text-center text-green-600 font-semibold">
                            +{detail.stokMasuk}
                          </td>
                          <td className="py-3 px-3 text-center text-gray-700">
                            {detail.stokAkhir}
                          </td>
                          <td className="py-3 px-3 text-center text-red-600 font-semibold">
                            {detail.terjual}
                          </td>
                          <td className="py-3 px-3 text-right text-gray-700">
                            {formatIDR(detail.hppTerpakai)}
                          </td>
                          <td className="py-3 px-3 text-right text-gray-700">
                            {formatIDR(detail.nilaiPenjualan)}
                          </td>
                          <td className="py-3 px-3 text-right font-bold">
                            <span className={detail.nilaiPenjualan - detail.hppTerpakai >= 0 ? "text-green-600" : "text-red-600"}>
                              {formatIDR(detail.nilaiPenjualan - detail.hppTerpakai)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        ) : products.length === 0 ? (
          <div className="border-4 border-gray-300 bg-gray-50 p-6 rounded-lg text-center">
            <p className="text-gray-700">Belum ada produk. Tambahkan produk terlebih dahulu.</p>
          </div>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
