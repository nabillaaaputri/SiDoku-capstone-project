import { useState, useMemo } from "react";
import { BarChart3, CircleDollarSign, Download, Package, Search, ShoppingCart, TrendingDown, TrendingUp, X } from "lucide-react";
import * as XLSX from "xlsx";
import DashboardLayout from "@/components/DashboardLayout";
import { useBusinessContext } from "@/context";
import { formatIDR } from "@/lib/utils";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";

const getLocalDateString = () => {
  const date = new Date();
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .split("T")[0];
};

export default function SalesRecap() {
  const { getDailySalesRecap, products } = useBusinessContext();
  const [selectedDate, setSelectedDate] = useState(getLocalDateString());
  const [productSearch, setProductSearch] = useState("");
  const productLookup = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products],
  );

  const selectedDateLabel = useMemo(
    () =>
      new Date(selectedDate).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
    [selectedDate],
  );

  // Get recap for selected date
  const recap = useMemo(() => {
    return getDailySalesRecap(new Date(selectedDate));
  }, [selectedDate, getDailySalesRecap]);

  // Filter details by product search
  const filteredDetails = useMemo(() => {
    const query = productSearch.trim().toLowerCase();
    if (!query) return recap.details;

    return recap.details.filter((detail) => {
      const product = productLookup.get(detail.productId);
      const searchableValues = [
        detail.productName,
        product?.category || "",
        product?.unit || "",
        selectedDate,
        selectedDateLabel,
      ]
        .join(" ")
        .toLowerCase();

      return searchableValues.includes(query);
    });
  }, [productLookup, recap.details, productSearch, selectedDate, selectedDateLabel]);

  const hasSearchQuery = productSearch.trim().length > 0;
  const hasFilteredResults = filteredDetails.length > 0;
  const isNoResultFromSearch = recap.details.length > 0 && !hasFilteredResults;

  const formatProfitValue = (value: number) => {
    if (value < 0) {
      return `Rugi ${formatIDR(Math.abs(value))}`;
    }

    return formatIDR(value);
  };

  // Calculate totals — all from the same details array that renders the table
  const totalPenjualan = recap.totalNilaiPenjualan;
  const totalHPP = recap.totalHppTerpakai;
  const labaKotor = totalPenjualan - totalHPP;
  const totalPengeluaran = recap.totalUangKeluar;
  const labaBersih = labaKotor - totalPengeluaran;
  const labaBersihIsNegative = labaBersih < 0;
  const labaBersihDisplay = formatProfitValue(labaBersih);

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
      ["Total Penjualan", totalPenjualan],
      ["Total HPP", totalHPP],
      ["Laba Kotor", labaKotor],
      ["Pengeluaran", totalPengeluaran],
      ["Laba Bersih", labaBersih],
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
      <div className="space-y-4 sm:space-y-5">
        {/* Header */}
        <section className="section-shell overflow-hidden">
          <div className="flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-[2rem]">
                Rekap Penjualan
              </h1>
              <p className="max-w-2xl text-sm text-slate-600">
                Pantau penjualan, HPP, dan keuntungan usaha Anda.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="h-11 w-full rounded-xl sm:w-44"
              />
              <Button
                onClick={handleExportExcel}
                disabled={!recap.isComplete || recap.details.length === 0}
                className="h-11 w-full rounded-xl bg-emerald-600 px-4 text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50 sm:w-auto"
              >
                <Download size={18} />
                Export Excel
              </Button>
            </div>
          </div>
        </section>

        {/* No products state */}
        {products.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-6 py-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-3">
              <Package size={24} />
            </div>
            <p className="text-sm font-semibold text-slate-900">Belum ada produk</p>
            <p className="text-sm text-slate-500 mt-1">Tambahkan produk terlebih dahulu untuk melihat rekap penjualan.</p>
          </div>
        )}

        {/* Data Not Complete Warning */}
        {!recap.isComplete && products.length > 0 && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
            <p className="text-sm font-medium text-amber-800">
              ⚠️ Lengkapi stok awal, stok masuk, dan stok akhir untuk melihat rekap penjualan pada tanggal ini.
            </p>
          </div>
        )}

        {/* Summary Cards */}
        {recap.isComplete && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <div className="group relative overflow-hidden rounded-[28px] border border-blue-100 bg-[linear-gradient(180deg,_#ffffff,_#eff6ff)] p-3.5 shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(37,99,235,0.14)]">
              <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,_#60a5fa,_#2563eb)]" />
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-600/80">Total Penjualan</p>
                  <p className="mt-2.5 text-xl sm:text-2xl font-extrabold text-slate-900 leading-none tabular-nums tracking-tight">
                    {formatIDR(totalPenjualan)}
                  </p>
                  <p className="mt-1.5 text-xs font-medium text-slate-500">nilai penjualan harian</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,_rgba(37,99,235,0.16),_rgba(96,165,250,0.1))] text-blue-600 shadow-inner shrink-0 mt-0.5 ring-1 ring-blue-100">
                  <CircleDollarSign size={22} />
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-[28px] border border-rose-100 bg-[linear-gradient(180deg,_#ffffff,_#fff1f2)] p-3.5 shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(244,63,94,0.14)]">
              <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,_#fda4af,_#e11d48)]" />
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-rose-600/80">Total HPP</p>
                  <p className="mt-2.5 text-xl sm:text-2xl font-extrabold text-slate-900 leading-none tabular-nums tracking-tight">
                    {formatIDR(totalHPP)}
                  </p>
                  <p className="mt-1.5 text-xs font-medium text-slate-500">harga pokok penjualan</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,_rgba(244,63,94,0.16),_rgba(251,113,133,0.1))] text-rose-600 shadow-inner shrink-0 mt-0.5 ring-1 ring-rose-100">
                  <TrendingDown size={22} />
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-[28px] border border-emerald-100 bg-[linear-gradient(180deg,_#ffffff,_#f0fdf4)] p-3.5 shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(34,197,94,0.14)]">
              <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,_#86efac,_#16a34a)]" />
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600/80">Laba Kotor</p>
                  <p className={`mt-2.5 text-xl sm:text-2xl font-extrabold leading-none tabular-nums tracking-tight ${labaKotor >= 0 ? "text-slate-900" : "text-rose-700"}`}>
                    {formatIDR(labaKotor)}
                  </p>
                  <p className="mt-1.5 text-xs font-medium text-slate-500">sebelum pengeluaran</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,_rgba(34,197,94,0.16),_rgba(134,239,172,0.1))] text-emerald-600 shadow-inner shrink-0 mt-0.5 ring-1 ring-emerald-100">
                  <TrendingUp size={22} />
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-[28px] border border-orange-100 bg-[linear-gradient(180deg,_#ffffff,_#fff7ed)] p-3.5 shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(249,115,22,0.14)]">
              <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,_#fdba74,_#f97316)]" />
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-orange-600/80">Pengeluaran</p>
                  <p className="mt-2.5 text-xl sm:text-2xl font-extrabold text-slate-900 leading-none tabular-nums tracking-tight">
                    {formatIDR(totalPengeluaran)}
                  </p>
                  <p className="mt-1.5 text-xs font-medium text-slate-500">biaya operasional</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,_rgba(249,115,22,0.16),_rgba(251,146,60,0.1))] text-orange-600 shadow-inner shrink-0 mt-0.5 ring-1 ring-orange-100">
                  <ShoppingCart size={22} />
                </div>
              </div>
            </div>

            <div className={`group relative overflow-hidden rounded-[28px] border p-3.5 shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 ${labaBersihIsNegative ? "border-rose-100 bg-[linear-gradient(180deg,_#ffffff,_#fff1f2)] hover:shadow-[0_18px_40px_rgba(244,63,94,0.14)]" : "border-emerald-100 bg-[linear-gradient(180deg,_#ffffff,_#f0fdf4)] hover:shadow-[0_18px_40px_rgba(34,197,94,0.14)]"}`}>
              <div className={`absolute inset-x-0 top-0 h-1 ${labaBersihIsNegative ? "bg-[linear-gradient(90deg,_#fda4af,_#e11d48)]" : "bg-[linear-gradient(90deg,_#86efac,_#16a34a)]"}`} />
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className={`text-[11px] font-semibold uppercase tracking-wider ${labaBersihIsNegative ? "text-rose-600/80" : "text-emerald-600/80"}`}>Laba Bersih</p>
                  <p className={`mt-2.5 text-xl sm:text-2xl font-extrabold leading-none tabular-nums tracking-tight ${labaBersihIsNegative ? "text-rose-700" : "text-slate-900"}`}>
                    {labaBersihDisplay}
                  </p>
                  <p className="mt-1.5 text-xs font-medium text-slate-500">setelah pengeluaran</p>
                </div>
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl shadow-inner shrink-0 mt-0.5 ring-1 ${labaBersihIsNegative ? "bg-[linear-gradient(135deg,_rgba(244,63,94,0.16),_rgba(251,113,133,0.1))] text-rose-600 ring-rose-100" : "bg-[linear-gradient(135deg,_rgba(34,197,94,0.16),_rgba(134,239,172,0.1))] text-emerald-600 ring-emerald-100"}`}>
                  <BarChart3 size={22} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Detail Table */}
        {recap.isComplete && (
          <section className="section-shell p-4 sm:p-5 space-y-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl space-y-1">
                <h2 className="text-lg font-bold text-slate-900">Detail Penjualan Per Produk</h2>
                <p className="text-sm text-slate-600">
                  Ringkasan penjualan pada {selectedDateLabel}.
                </p>
              </div>

              <div className="w-full lg:max-w-sm">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Cari produk, kategori, atau tanggal..."
                    className="h-11 w-full rounded-xl pl-9 pr-10"
                  />
                  {hasSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setProductSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                      aria-label="Hapus pencarian"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-medium text-slate-500">
                {hasSearchQuery
                  ? `Menampilkan ${filteredDetails.length} hasil untuk pencarian "${productSearch}".`
                  : `Menampilkan ${filteredDetails.length} produk untuk tanggal ini.`}
              </p>
              {hasSearchQuery && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setProductSearch("")}
                  className="h-8 rounded-lg text-slate-600 hover:text-slate-900"
                >
                  Reset
                </Button>
              )}
            </div>

            {isNoResultFromSearch ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-6 py-10 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-3">
                  <Search size={24} />
                </div>
                <p className="text-sm font-semibold text-slate-900">Tidak ada hasil yang cocok</p>
                <p className="text-sm text-slate-500 mt-1">
                  Coba kata kunci lain seperti nama produk, kategori, atau tanggal transaksi.
                </p>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse bg-white">
                      <thead>
                        <tr className="border-b border-slate-200 bg-white text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                          <th className="px-5 py-4">Produk</th>
                          <th className="px-5 py-4 text-center">Stok Awal</th>
                          <th className="px-5 py-4 text-center">Stok Masuk</th>
                          <th className="px-5 py-4 text-center">Stok Akhir</th>
                          <th className="px-5 py-4 text-center">Terjual</th>
                          <th className="px-5 py-4 text-right">HPP</th>
                          <th className="px-5 py-4 text-right">Penjualan</th>
                          <th className="px-5 py-4 text-right">Untung</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredDetails.map((detail) => {
                          const untung = detail.nilaiPenjualan - detail.hppTerpakai;
                          return (
                            <tr key={detail.productId} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/60 transition">
                              <td className="px-5 py-4">
                                <p className="font-semibold text-slate-900">{detail.productName}</p>
                              </td>
                              <td className="px-5 py-4 text-center text-sm text-slate-700">
                                {detail.stokAwal}
                              </td>
                              <td className="px-5 py-4 text-center text-sm font-semibold text-emerald-600">
                                +{detail.stokMasuk}
                              </td>
                              <td className="px-5 py-4 text-center text-sm text-slate-700">
                                {detail.stokAkhir}
                              </td>
                              <td className="px-5 py-4 text-center text-sm font-semibold text-red-600">
                                {detail.terjual}
                              </td>
                              <td className="px-5 py-4 text-right text-sm text-slate-700">
                                {formatIDR(detail.hppTerpakai)}
                              </td>
                              <td className="px-5 py-4 text-right text-sm text-slate-700">
                                {formatIDR(detail.nilaiPenjualan)}
                              </td>
                              <td className="px-5 py-4 text-right text-sm font-bold">
                                <span className={untung >= 0 ? "text-emerald-600" : "text-red-600"}>
                                  {formatIDR(untung)}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-3">
                  {filteredDetails.map((detail) => {
                    const untung = detail.nilaiPenjualan - detail.hppTerpakai;
                    return (
                      <div key={detail.productId} className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
                        <p className="font-bold text-slate-900">{detail.productName}</p>

                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="space-y-1.5">
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Stok</p>
                            <div className="space-y-0.5 text-slate-700">
                              <p>Awal: <span className="font-medium">{detail.stokAwal}</span></p>
                              <p>Masuk: <span className="font-medium text-emerald-600">+{detail.stokMasuk}</span></p>
                              <p>Akhir: <span className="font-medium">{detail.stokAkhir}</span></p>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Penjualan</p>
                            <div className="space-y-0.5 text-slate-700">
                              <p>Terjual: <span className="font-medium text-red-600">{detail.terjual}</span></p>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Keuangan</p>
                            <div className="space-y-0.5 text-slate-700">
                              <p>HPP: <span className="font-medium">{formatIDR(detail.hppTerpakai)}</span></p>
                              <p>Penjualan: <span className="font-medium">{formatIDR(detail.nilaiPenjualan)}</span></p>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Untung</p>
                            <p className={`text-lg font-bold ${untung >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                              {formatIDR(untung)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </section>
        )}
      </div>
    </DashboardLayout>
  );
}
