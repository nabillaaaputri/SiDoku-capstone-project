import { useState } from "react";
import { Download } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useBusinessContext } from "@/context";

type ReportTab = "sales-recap" | "expenses";

interface ExpandedDay {
  [dateStr: string]: boolean;
}

export default function Reports() {
  const { salesRecords, expenses, getDailySalesRecapByDateRange } = useBusinessContext();
  const [activeTab, setActiveTab] = useState<ReportTab>("sales-recap");
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth());
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [expandedDays, setExpandedDays] = useState<ExpandedDay>({});

  const toggleDayExpanded = (dateStr: string) => {
    setExpandedDays((prev) => ({
      ...prev,
      [dateStr]: !prev[dateStr],
    }));
  };

  // Get daily recaps for filtered month
  const startDate = new Date(filterYear, filterMonth, 1);
  const endDate = new Date(filterYear, filterMonth + 1, 0);
  const dailyRecaps = getDailySalesRecapByDateRange(startDate, endDate);

  // Filter sales records by date
  const filteredSalesRecords = salesRecords.filter((record) => {
    const date = new Date(record.date);
    return date.getMonth() === filterMonth && date.getFullYear() === filterYear;
  });

  // Filter expenses by date and category
  const filteredExpenses = expenses.filter((e) => {
    const date = new Date(e.date);
    const sameMonth =
      date.getMonth() === filterMonth && date.getFullYear() === filterYear;
    const sameCategory = filterCategory === "all" || e.category === filterCategory;
    return sameMonth && sameCategory;
  });

  // Calculate totals for sales recap tab
  const totalSalesAmount = filteredSalesRecords.reduce(
    (sum, t) => sum + t.totalAmount,
    0
  );
  const totalExpenseAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const profit = totalTransactionAmount - totalExpenseAmount;

  // Calculate totals for daily recap
  const totalRecapUangMasuk = dailyRecaps.reduce((sum, recap) => sum + recap.totalUangMasuk, 0);
  const totalRecapUangKeluar = dailyRecaps.reduce((sum, recap) => sum + recap.totalUangKeluar, 0);
  const totalRecapTerjual = dailyRecaps.reduce((sum, recap) => sum + recap.totalTerjual, 0);
  const totalRecapNilaiPenjualan = dailyRecaps.reduce((sum, recap) => sum + recap.totalNilaiPenjualan, 0);
  const totalRecapHpp = dailyRecaps.reduce((sum, recap) => sum + recap.totalHppTerpakai, 0);
  const totalRecapLabaKotor = dailyRecaps.reduce((sum, recap) => sum + recap.labaKotor, 0);
  const totalRecapLabaBersih = dailyRecaps.reduce((sum, recap) => sum + recap.labaBersih, 0);

  // Get unique years for filter
  const allDates = [...salesRecords, ...expenses].map((item) =>
    new Date(item.date)
  );
  const uniqueYears = Array.from(
    new Set(allDates.map((d) => d.getFullYear()))
  ).sort((a, b) => b - a);

  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Rekap Penjualan</h1>
        <p className="text-sm text-gray-600">Lihat ringkasan penjualan harian dan riwayat pengeluaran usaha Anda.</p>

        {/* Filter Section */}
        <div className="border-4 border-black p-6 bg-gray-50">
          <h2 className="text-lg font-bold mb-4 border-b-2 border-black pb-2">
            Filter Laporan
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2">Bulan</label>
              <select
                value={filterMonth}
                onChange={(e) => setFilterMonth(parseInt(e.target.value))}
                className="w-full border-2 border-black px-3 py-2"
              >
                {months.map((month, idx) => (
                  <option key={idx} value={idx}>
                    {month}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Tahun</label>
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(parseInt(e.target.value))}
                className="w-full border-2 border-black px-3 py-2"
              >
                {uniqueYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            {activeTab === "expenses" && (
              <div>
                <label className="block text-sm font-bold mb-2">Kategori</label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full border-2 border-black px-3 py-2"
                >
                  <option value="all">Semua Kategori</option>
                  <option value="restock">Restock Barang</option>
                  <option value="operasional">Biaya Operasional</option>
                  <option value="lain-lain">Lainnya</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        {activeTab === "sales-recap" && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="border-3 border-green-500 bg-green-50 p-4">
              <p className="text-sm font-bold text-green-700 mb-2">
                Total Uang Masuk
              </p>
              <p className="text-2xl font-bold text-green-600">
                Rp {totalRecapUangMasuk.toLocaleString("id-ID")}
              </p>
              <p className="text-xs text-green-700 mt-2">
                {months[filterMonth]} {filterYear}
              </p>
            </div>
            <div className="border-3 border-blue-500 bg-blue-50 p-4">
              <p className="text-sm font-bold text-blue-700 mb-2">
                Total Terjual
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {totalRecapTerjual} unit
              </p>
              <p className="text-xs text-blue-700 mt-2">
                Dari {dailyRecaps.filter(r => r.isComplete).length} hari
              </p>
            </div>
            <div className="border-3 border-orange-500 bg-orange-50 p-4">
              <p className="text-sm font-bold text-orange-700 mb-2">
                Laba Kotor
              </p>
              <p className="text-2xl font-bold text-orange-600">
                Rp {totalRecapLabaKotor.toLocaleString("id-ID")}
              </p>
              <p className="text-xs text-orange-700 mt-2">
                Uang Masuk - HPP
              </p>
            </div>
            <div className="border-3 border-purple-500 bg-purple-50 p-4">
              <p className="text-sm font-bold text-purple-700 mb-2">
                Laba Bersih
              </p>
              <p className="text-2xl font-bold text-purple-600">
                Rp {totalRecapLabaBersih.toLocaleString("id-ID")}
              </p>
              <p className="text-xs text-purple-700 mt-2">
                Laba Kotor - Pengeluaran
              </p>
            </div>
          </div>
        )}

        {activeTab === "expenses" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border-3 border-red-500 bg-red-50 p-4">
              <p className="text-sm font-bold text-red-700 mb-2">
                Total Pengeluaran
              </p>
              <p className="text-2xl font-bold text-red-600">
                Rp {totalExpenseAmount.toLocaleString("id-ID")}
              </p>
              <p className="text-xs text-red-700 mt-2">
                Dari {filteredExpenses.length} pengeluaran
              </p>
            </div>
            <div className="border-3 border-blue-500 bg-blue-50 p-4">
              <p className="text-sm font-bold text-blue-700 mb-2">
                Total Pemasukan
              </p>
              <p className="text-2xl font-bold text-blue-600">
                Rp {totalSalesAmount.toLocaleString("id-ID")}
              </p>
              <p className="text-xs text-blue-700 mt-2">
                Untuk periode yang sama
              </p>
            </div>
            <div
              className={`border-3 p-4 ${
                profit >= 0
                  ? "border-green-500 bg-green-50"
                  : "border-red-500 bg-red-50"
              }`}
            >
              <p
                className={`text-sm font-bold mb-2 ${
                  profit >= 0 ? "text-green-700" : "text-red-700"
                }`}
              >
                Laba/Rugi
              </p>
              <p
                className={`text-2xl font-bold ${
                  profit >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                Rp {profit.toLocaleString("id-ID")}
              </p>
              <p
                className={`text-xs mt-2 ${
                  profit >= 0 ? "text-green-700" : "text-red-700"
                }`}
              >
                {profit >= 0 ? "✓ Untung" : "✗ Rugi"}
              </p>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b-2 border-black">
          <button
            onClick={() => {
              setActiveTab("sales-recap");
              setFilterCategory("all");
            }}
            className={`px-4 py-3 font-bold border-b-2 transition ${
              activeTab === "sales-recap"
                ? "border-b-black text-black"
                : "border-b-transparent text-gray-600 hover:text-black"
            }`}
          >
            📈 Rekap Penjualan Harian
          </button>
          <button
            onClick={() => {
              setActiveTab("expenses");
              setFilterCategory("all");
            }}
            className={`px-4 py-3 font-bold border-b-2 transition ${
              activeTab === "expenses"
                ? "border-b-black text-black"
                : "border-b-transparent text-gray-600 hover:text-black"
            }`}
          >
            📉 Riwayat Pengeluaran
          </button>
        </div>

        {/* Sales Recap Tab - Daily Sales Recap */}
        {activeTab === "sales-recap" && (
          <div className="border-4 border-black p-6">
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between border-b-2 border-black pb-2">
                <h2 className="text-lg font-bold">
                  Rekap Penjualan Harian ({dailyRecaps.filter(r => r.isComplete).length} hari)
                </h2>
                <button className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded transition font-bold">
                  <Download size={18} />
                  Export Excel
                </button>
              </div>
              <p className="text-xs text-gray-600">Ringkasan penjualan harian per produk dengan perhitungan laba.</p>
            </div>

            {dailyRecaps.filter(r => r.isComplete).length === 0 ? (
              <div className="text-gray-600 text-center py-12">
                <p className="font-semibold mb-2">Belum ada data rekap penjualan hari ini.</p>
                <p className="text-sm">Lengkapi stok awal, stok masuk, stok akhir, dan catat penjualan untuk melihat rekap.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {[...dailyRecaps]
                  .filter(r => r.isComplete)
                  .reverse()
                  .map((recap) => {
                    const dateStr = recap.date.toDateString();
                    const isExpanded = expandedDays[dateStr];

                    return (
                      <div key={dateStr} className="border-2 border-gray-300 rounded">
                        {/* Daily Summary Header */}
                        <button
                          onClick={() => toggleDayExpanded(dateStr)}
                          className="w-full p-4 bg-gray-50 hover:bg-gray-100 transition flex items-center justify-between font-bold text-left border-b-2 border-gray-300"
                        >
                          <span>{recap.date.toLocaleDateString("id-ID", { weekday: "short", year: "numeric", month: "long", day: "numeric" })}</span>
                          <div className="flex items-center gap-4">
                            <div className="text-right hidden sm:block">
                              <div className="text-xs text-gray-600">Uang Masuk</div>
                              <div className="text-green-600">Rp {recap.totalUangMasuk.toLocaleString("id-ID")}</div>
                            </div>
                            <div className="text-right hidden sm:block">
                              <div className="text-xs text-gray-600">Laba Bersih</div>
                              <div className={recap.labaBersih >= 0 ? "text-green-600" : "text-red-600"}>
                                Rp {recap.labaBersih.toLocaleString("id-ID")}
                              </div>
                            </div>
                            <span className="text-xl">{isExpanded ? "−" : "+"}</span>
                          </div>
                        </button>

                        {/* Daily Details - Expandable */}
                        {isExpanded && (
                          <div className="p-4 bg-white space-y-4">
                            {/* Products Table */}
                            {recap.details.length > 0 && (
                              <div>
                                <h3 className="font-bold text-sm mb-3 border-b-2 border-black pb-2">Detail Produk</h3>
                                <div className="overflow-x-auto">
                                  <table className="w-full text-sm">
                                    <thead>
                                      <tr className="border-b border-gray-300">
                                        <th className="text-left py-2 px-2 font-bold">Produk</th>
                                        <th className="text-right py-2 px-2 font-bold hidden sm:table-cell">Stok Awal</th>
                                        <th className="text-right py-2 px-2 font-bold hidden sm:table-cell">Masuk</th>
                                        <th className="text-right py-2 px-2 font-bold">Keluar</th>
                                        <th className="text-right py-2 px-2 font-bold hidden sm:table-cell">Akhir</th>
                                        <th className="text-right py-2 px-2 font-bold">Terjual</th>
                                        <th className="text-right py-2 px-2 font-bold hidden md:table-cell">Nilai Jual</th>
                                        <th className="text-right py-2 px-2 font-bold hidden md:table-cell">HPP</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {recap.details.map((detail) => (
                                        <tr key={detail.productId} className="border-b border-gray-200 hover:bg-gray-50">
                                          <td className="py-2 px-2 font-medium">{detail.productName}</td>
                                          <td className="text-right py-2 px-2 hidden sm:table-cell text-xs">{detail.stokAwal}</td>
                                          <td className="text-right py-2 px-2 hidden sm:table-cell text-xs text-green-600">+{detail.stokMasuk}</td>
                                          <td className="text-right py-2 px-2 text-xs text-red-600">−{detail.stokKeluar + detail.terjual}</td>
                                          <td className="text-right py-2 px-2 hidden sm:table-cell text-xs">{detail.stokAkhir}</td>
                                          <td className="text-right py-2 px-2 font-bold">{detail.terjual}</td>
                                          <td className="text-right py-2 px-2 hidden md:table-cell text-xs">Rp {detail.nilaiPenjualan.toLocaleString("id-ID")}</td>
                                          <td className="text-right py-2 px-2 hidden md:table-cell text-xs">Rp {detail.hppTerpakai.toLocaleString("id-ID")}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}

                            {/* Summary Cards for This Day */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 border-t-2 border-black pt-4">
                              <div className="bg-green-50 p-3 rounded border border-green-200">
                                <p className="text-xs font-bold text-green-700">Uang Masuk</p>
                                <p className="text-sm font-bold text-green-600">Rp {recap.totalUangMasuk.toLocaleString("id-ID")}</p>
                              </div>
                              <div className="bg-blue-50 p-3 rounded border border-blue-200">
                                <p className="text-xs font-bold text-blue-700">Total Terjual</p>
                                <p className="text-sm font-bold text-blue-600">{recap.totalTerjual} unit</p>
                              </div>
                              <div className="bg-red-50 p-3 rounded border border-red-200">
                                <p className="text-xs font-bold text-red-700">Uang Keluar</p>
                                <p className="text-sm font-bold text-red-600">Rp {recap.totalUangKeluar.toLocaleString("id-ID")}</p>
                              </div>
                              <div className="bg-purple-50 p-3 rounded border border-purple-200">
                                <p className="text-xs font-bold text-purple-700">Total HPP</p>
                                <p className="text-sm font-bold text-purple-600">Rp {recap.totalHppTerpakai.toLocaleString("id-ID")}</p>
                              </div>
                              <div className="bg-orange-50 p-3 rounded border border-orange-200">
                                <p className="text-xs font-bold text-orange-700">Laba Kotor</p>
                                <p className="text-sm font-bold text-orange-600">Rp {recap.labaKotor.toLocaleString("id-ID")}</p>
                              </div>
                              <div className={`p-3 rounded border ${recap.labaBersih >= 0 ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                                <p className={`text-xs font-bold ${recap.labaBersih >= 0 ? "text-green-700" : "text-red-700"}`}>Laba Bersih</p>
                                <p className={`text-sm font-bold ${recap.labaBersih >= 0 ? "text-green-600" : "text-red-600"}`}>
                                  Rp {recap.labaBersih.toLocaleString("id-ID")}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* Expenses Tab */}
        {activeTab === "expenses" && (
          <div className="border-4 border-black p-6">
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between border-b-2 border-black pb-2">
                <h2 className="text-lg font-bold">
                  Riwayat Pengeluaran ({filteredExpenses.length})
                </h2>
                <button className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded transition font-bold">
                  <Download size={18} />
                  Export Excel
                </button>
              </div>
              <p className="text-xs text-gray-600">Catatan biaya operasional dan pengeluaran usaha.</p>
            </div>

            {filteredExpenses.length === 0 ? (
              <p className="text-gray-600 text-center py-8">
                Tidak ada data pengeluaran untuk periode ini.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-black">
                      <th className="text-left py-2 px-2 font-bold text-sm">
                        Tanggal
                      </th>
                      <th className="text-left py-2 px-2 font-bold text-sm">
                        Keterangan
                      </th>
                      <th className="text-center py-2 px-2 font-bold text-sm">
                        Kategori
                      </th>
                      <th className="text-right py-2 px-2 font-bold text-sm">
                        Jumlah
                      </th>
                      <th className="text-left py-2 px-2 font-bold text-sm">
                        Deskripsi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...filteredExpenses]
                      .reverse()
                      .map((expense) => {
                        const categoryLabel = {
                          restock: "Restock",
                          operasional: "Operasional",
                          "lain-lain": "Lainnya",
                        }[expense.category];

                        return (
                          <tr
                            key={expense.id}
                            className="border-b border-gray-200 hover:bg-gray-50"
                          >
                            <td className="py-2 px-2 text-sm">
                              {new Date(expense.date).toLocaleDateString(
                                "id-ID"
                              )}
                            </td>
                            <td className="py-2 px-2 text-sm font-medium">
                              {expense.name}
                            </td>
                            <td className="py-2 px-2 text-center">
                              <span className="text-xs font-bold px-2 py-1 bg-gray-200">
                                {categoryLabel}
                              </span>
                            </td>
                            <td className="py-2 px-2 text-sm text-right font-bold">
                              Rp {expense.amount.toLocaleString("id-ID")}
                            </td>
                            <td className="py-2 px-2 text-sm text-gray-600">
                              {expense.description || "-"}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
