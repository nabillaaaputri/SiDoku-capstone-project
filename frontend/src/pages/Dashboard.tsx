import { useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import Insights from "@/components/Insights";
import SalesChart from "@/components/SalesChart";
import { Badge } from "@/ui/badge";
import { useBusinessContext } from "@/context";
import { ArrowUp, ArrowDown } from "lucide-react";

export default function Dashboard() {
  const { products } = useBusinessContext();

  // Get low stock products from actual data (max 3)
  const lowStockProducts = products.filter(p => p.stock <= p.minimumStock).slice(0, 3);
  const hasLowStock = lowStockProducts.length > 0;
  const hasProducts = products.length > 0;

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6 md:space-y-6 w-full max-w-full overflow-x-hidden">
        {/* ========== HEADER SECTION ========== */}
        <section className="section-shell p-3 sm:p-4 md:p-5 space-y-2.5">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <h1 className="text-lg sm:text-2xl md:text-3xl font-bold leading-tight text-slate-900">Ringkasan Usaha Hari Ini</h1>
            {!hasProducts && (
              <Badge className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 whitespace-nowrap flex-shrink-0">
                Data Contoh
              </Badge>
            )}
            <div className="flex gap-2 ml-auto">
              <Link
                to="/stok-masuk"
                className="flex items-center gap-1 px-2 sm:px-3 py-2 border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition font-semibold text-xs sm:text-sm whitespace-nowrap"
                aria-label="Restock"
              >
                <ArrowUp size={16} />
                <span className="hidden sm:inline">Restock</span>
              </Link>
              <Link
                to="/stok-keluar"
                className="flex items-center gap-1 px-2 sm:px-3 py-2 border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg transition font-semibold text-xs sm:text-sm whitespace-nowrap"
                aria-label="Stok Keluar"
              >
                <ArrowDown size={16} />
                <span className="hidden sm:inline">Stok Keluar</span>
              </Link>
            </div>
          </div>
          <div className="h-px w-full bg-slate-200" />
          <p className="text-slate-600 text-xs sm:text-sm md:text-base">Lihat kondisi toko kamu dalam sekali lihat.</p>
        </section>

        {/* ========== RINGKASAN KEUANGAN SECTION ========== */}
        <section className="section-shell p-3 sm:p-4 md:p-5 space-y-3 md:space-y-4 w-full">
          <h2 className="section-heading">Ringkasan Keuangan</h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 w-full">
            {/* Uang Masuk */}
            <div className="border border-slate-200 bg-gradient-to-br from-white to-green-50/40 p-2 sm:p-3 md:p-4 rounded-xl hover:shadow-md transition min-w-0">
              <p className="text-xs font-bold text-gray-600 mb-1 sm:mb-2">UANG MASUK</p>
              <p className="text-sm sm:text-base md:text-lg lg:text-2xl xl:text-3xl font-bold text-green-600 mb-1 leading-tight">
                {hasProducts ? "Rp 2.4jt" : "Rp 0"}
              </p>
              <p className="text-xs text-gray-500 leading-tight">dari penjualan</p>
            </div>

            {/* Uang Keluar */}
            <div className="border border-slate-200 bg-gradient-to-br from-white to-orange-50/40 p-2 sm:p-3 md:p-4 rounded-xl hover:shadow-md transition min-w-0">
              <p className="text-xs font-bold text-gray-600 mb-1 sm:mb-2">UANG KELUAR</p>
              <p className="text-sm sm:text-base md:text-lg lg:text-2xl xl:text-3xl font-bold text-orange-600 mb-1 leading-tight">
                {hasProducts ? "Rp 750rb" : "Rp 0"}
              </p>
              <p className="text-xs text-gray-500 leading-tight">biaya operasional</p>
            </div>

            {/* Estimasi Keuntungan */}
            <div className="border border-slate-200 bg-gradient-to-br from-white to-blue-50/50 p-2 sm:p-3 md:p-4 rounded-xl hover:shadow-md transition min-w-0">
              <p className="text-xs font-bold text-gray-600 mb-1 sm:mb-2">KEUNTUNGAN</p>
              <p className="text-sm sm:text-base md:text-lg lg:text-2xl xl:text-3xl font-bold text-blue-600 mb-1 leading-tight">
                {hasProducts ? "Rp 1.65jt" : "Rp 0"}
              </p>
              <p className="text-xs text-gray-500 leading-tight">uang masuk - keluar</p>
            </div>

            {/* Hide 4th card on mobile & tablet, show on lg */}
            <div className="hidden lg:block border border-slate-200 bg-gradient-to-br from-white to-purple-50/50 p-2 sm:p-3 md:p-4 rounded-xl hover:shadow-md transition min-w-0">
              <p className="text-xs font-bold text-gray-600 mb-1 sm:mb-2">ROI</p>
              <p className="text-sm sm:text-base md:text-lg lg:text-2xl xl:text-3xl font-bold text-purple-600 mb-1 leading-tight">
                {hasProducts ? "220%" : "0%"}
              </p>
              <p className="text-xs text-gray-500 leading-tight">return on investment</p>
            </div>
          </div>
        </section>

        {/* ========== INSIGHT SINGKAT SECTION (MOVED UP) ========== */}
        <section className="section-shell p-3 sm:p-4 md:p-5 space-y-3 md:space-y-4 w-full">
          <h2 className="section-heading">Insight Singkat</h2>
          <Insights />
        </section>

        {/* ========== PRODUK HAMPIR HABIS DETAIL SECTION ========== */}
        <section className="section-shell p-3 sm:p-4 md:p-5 space-y-3 w-full">
          <h2 className="section-heading">
            Produk Hampir Habis ({lowStockProducts.length})
          </h2>

          {hasLowStock ? (
            <>
              <p className="text-xs sm:text-sm text-gray-600">Berikut produk yang perlu segera diisi ulang.</p>
              <div className="border border-red-200 rounded-xl overflow-x-auto w-full bg-white">
                {/* Table Header */}
                <div className="bg-red-50/80 border-b border-red-200 px-2 sm:px-3 md:px-4 py-2 sm:py-3 grid grid-cols-5 gap-1 sm:gap-2 text-xs font-bold text-gray-700 min-w-full">
                  <div className="truncate">Produk</div>
                  <div className="text-center whitespace-nowrap">Satuan</div>
                  <div className="text-center whitespace-nowrap">Stok</div>
                  <div className="text-center whitespace-nowrap">Min</div>
                  <div className="text-center whitespace-nowrap">Butuh</div>
                </div>

                {/* Table Rows */}
                <div className="divide-y divide-red-100">
                  {lowStockProducts.map((product) => (
                    <div
                      key={product.id}
                      className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 grid grid-cols-5 gap-1 sm:gap-2 items-center hover:bg-red-50 transition text-xs sm:text-sm min-w-full"
                    >
                      <div className="font-semibold text-gray-900 truncate">{product.name}</div>
                      <div className="text-center text-gray-600 font-semibold">{product.unit}</div>
                      <div className="text-center text-red-600 font-bold">{product.stock}</div>
                      <div className="text-center text-gray-600">{product.minimumStock}</div>
                      <div className="text-center">
                        <span className="bg-red-100 text-red-600 font-bold px-1 py-1 rounded text-xs whitespace-nowrap">
                          {Math.max(0, product.minimumStock - product.stock)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {products.filter(p => p.stock <= p.minimumStock).length > 3 && (
                <Link
                  to="/products"
                  className="text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline inline-block"
                >
                  Lihat Semua →
                </Link>
              )}
            </>
          ) : (
            <div className="border border-slate-200 bg-slate-50 rounded-xl p-6 text-center">
              <p className="text-gray-600 text-sm">Tidak ada produk yang menipis.</p>
            </div>
          )}
        </section>

        {/* ========== TREN 7 HARI SECTION ========== */}
        <section className="space-y-3 md:space-y-4 w-full">
          <h2 className="section-heading">Tren 7 Hari Terakhir</h2>
          <SalesChart />
        </section>

      </div>
    </DashboardLayout>
  );
}
