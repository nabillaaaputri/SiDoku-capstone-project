import { Link } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import Insights from "@/components/Insights";
import SalesChart from "@/components/SalesChart";
import { Badge } from "@/ui/badge";
import { useBusinessContext } from "@/context";
import {
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Package,
  CircleDollarSign,
  Banknote,
  Activity,
  ShieldAlert,
  ChevronRight,
} from "lucide-react";

export default function Dashboard() {
  const { products } = useBusinessContext();

  // Get low stock products from actual data (max 3)
  const lowStockProducts = products.filter(p => p.stock <= p.minimumStock).slice(0, 3);
  const hasLowStock = lowStockProducts.length > 0;
  const hasProducts = products.length > 0;

  return (
    <DashboardLayout>
      <div className="space-y-3 sm:space-y-3.5 w-full max-w-full overflow-x-hidden">
        <section className="section-shell overflow-hidden">
          <div className="bg-[linear-gradient(135deg,_rgba(29,78,216,0.06),_rgba(56,189,248,0.04))] p-4 sm:p-4.5 lg:p-5">
            <div className="flex flex-col gap-3.5 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-2 max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/90 px-3 py-1.5 text-xs font-semibold text-blue-700 shadow-sm">
                  <Sparkles size={14} />
                  SiDoku Analytics
                </div>
                <div className="space-y-1.5">
                  <h1 className="text-2xl sm:text-[2.2rem] lg:text-[2.35rem] font-black tracking-tight text-slate-900 leading-tight">
                    Selamat Datang Kembali, Nabilla
                  </h1>
                  <p className="text-sm sm:text-[15px] text-slate-600 max-w-2xl leading-relaxed">
                    Pantau ringkasan usaha, insight penting, stok menipis, dan tren performa dalam satu tampilan.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  {!hasProducts && (
                    <Badge className="rounded-full bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 text-xs font-semibold shadow-sm">
                      Data Contoh
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3 lg:justify-end">
                <Link
                  to="/stok-masuk"
                  className="inline-flex items-center gap-2 rounded-2xl border border-blue-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-blue-700 shadow-sm hover:border-blue-300 hover:bg-blue-50"
                  aria-label="Restock"
                >
                  <ArrowUpRight size={18} />
                  Restock
                </Link>
                <Link
                  to="/stok-keluar"
                  className="inline-flex items-center gap-2 rounded-2xl bg-[linear-gradient(135deg,_#0f172a,_#1d4ed8)] px-3.5 py-2.5 text-sm font-semibold text-white shadow-[0_18px_30px_rgba(29,78,216,0.18)] hover:brightness-105"
                  aria-label="Stok Keluar"
                >
                  <ArrowDownRight size={18} />
                  Stok Keluar
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="section-shell p-4 sm:p-4.5 lg:p-5 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="section-heading">Ringkasan Keuangan</h2>
              <p className="mt-1 text-sm text-slate-500">Empat angka utama untuk membaca performa bisnis dengan cepat.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5">
            <div className="group relative overflow-hidden rounded-[28px] border border-blue-100 bg-[linear-gradient(180deg,_#ffffff,_#eff6ff)] p-3.5 shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(37,99,235,0.14)]">
              <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,_#60a5fa,_#2563eb)]" />
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-blue-700">Uang Masuk</p>
                  <p className="mt-2 text-[1.7rem] sm:text-[2.1rem] font-black text-slate-950 leading-none tabular-nums tracking-tight">{hasProducts ? "Rp 2.4jt" : "Rp 0"}</p>
                  <p className="mt-1.5 text-xs font-medium text-slate-500">dari penjualan</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,_rgba(37,99,235,0.16),_rgba(96,165,250,0.1))] text-blue-600 shadow-inner shrink-0 mt-0.5 ring-1 ring-blue-100">
                  <CircleDollarSign size={22} />
                </div>
              </div>
              <div className="mt-3.5 h-1.5 overflow-hidden rounded-full bg-blue-100/80">
                <div className="h-full w-[78%] rounded-full bg-[linear-gradient(90deg,_#60a5fa,_#2563eb)]" />
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,_#ffffff,_#f8fafc)] p-3.5 shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(15,23,42,0.11)]">
              <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,_#94a3b8,_#475569)]" />
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-600">Uang Keluar</p>
                  <p className="mt-2 text-[1.7rem] sm:text-[2.1rem] font-black text-slate-950 leading-none tabular-nums tracking-tight">{hasProducts ? "Rp 750rb" : "Rp 0"}</p>
                  <p className="mt-1.5 text-xs font-medium text-slate-500">biaya operasional</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,_rgba(100,116,139,0.16),_rgba(148,163,184,0.1))] text-slate-600 shadow-inner shrink-0 mt-0.5 ring-1 ring-slate-200">
                  <Banknote size={22} />
                </div>
              </div>
              <div className="mt-3.5 h-1.5 overflow-hidden rounded-full bg-slate-200/80">
                <div className="h-full w-[42%] rounded-full bg-[linear-gradient(90deg,_#94a3b8,_#475569)]" />
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-[28px] border border-sky-100 bg-[linear-gradient(180deg,_#ffffff,_#eff6ff)] p-3.5 shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(14,165,233,0.14)]">
              <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,_#7dd3fc,_#0284c7)]" />
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-sky-700">Keuntungan</p>
                  <p className="mt-2 text-[1.7rem] sm:text-[2.1rem] font-black text-slate-950 leading-none tabular-nums tracking-tight">{hasProducts ? "Rp 1.65jt" : "Rp 0"}</p>
                  <p className="mt-1.5 text-xs font-medium text-slate-500">uang masuk - keluar</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,_rgba(14,165,233,0.16),_rgba(125,211,252,0.1))] text-sky-600 shadow-inner shrink-0 mt-0.5 ring-1 ring-sky-100">
                  <Package size={22} />
                </div>
              </div>
              <div className="mt-3.5 h-1.5 overflow-hidden rounded-full bg-sky-100/80">
                <div className="h-full w-[66%] rounded-full bg-[linear-gradient(90deg,_#7dd3fc,_#0284c7)]" />
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-[28px] border border-cyan-100 bg-[linear-gradient(180deg,_#ffffff,_#ecfeff)] p-3.5 shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(6,182,212,0.14)]">
              <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,_#67e8f9,_#06b6d4)]" />
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-700">ROI</p>
                  <p className="mt-2 text-[1.7rem] sm:text-[2.1rem] font-black text-slate-950 leading-none tabular-nums tracking-tight">{hasProducts ? "220%" : "0%"}</p>
                  <p className="mt-1.5 text-xs font-medium text-slate-500">return on investment</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,_rgba(6,182,212,0.16),_rgba(103,232,249,0.1))] text-cyan-600 shadow-inner shrink-0 mt-0.5 ring-1 ring-cyan-100">
                  <ShieldAlert size={22} />
                </div>
              </div>
              <div className="mt-3.5 h-1.5 overflow-hidden rounded-full bg-cyan-100/80">
                <div className="h-full w-[88%] rounded-full bg-[linear-gradient(90deg,_#67e8f9,_#06b6d4)]" />
              </div>
            </div>
          </div>
        </section>

        <section className="section-shell p-4 sm:p-4.5 lg:p-5 space-y-3">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="section-heading">Insight Singkat</h2>
              <p className="mt-1 text-sm text-slate-500">Saran yang lebih ringkas dan lebih cepat dipindai.</p>
            </div>
          </div>
          <Insights />
        </section>

        <section className="section-shell p-4 sm:p-4.5 lg:p-5 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="section-heading">Produk Hampir Habis ({lowStockProducts.length})</h2>
              <p className="mt-1 text-sm text-slate-500">Prioritaskan restock untuk menjaga ketersediaan barang.</p>
            </div>
            {hasLowStock && (
              <Link to="/products" className="inline-flex items-center gap-1 text-sm font-semibold text-blue-700 hover:text-blue-800">
                Lihat semua
                <ChevronRight size={16} />
              </Link>
            )}
          </div>

          {hasLowStock ? (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="grid grid-cols-12 gap-2 border-b border-slate-100 bg-slate-50/90 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                <div className="col-span-6 sm:col-span-5">Produk</div>
                <div className="col-span-2 text-center">Satuan</div>
                <div className="col-span-2 text-center">Stok</div>
                <div className="col-span-2 text-center">Min</div>
                <div className="col-span-2 text-center hidden sm:block">Perlu</div>
              </div>

              <div className="divide-y divide-slate-100">
                {lowStockProducts.map((product) => (
                  <div
                    key={product.id}
                    className="grid grid-cols-12 gap-2 px-4 py-3 hover:bg-blue-50/50 transition"
                  >
                    <div className="col-span-6 sm:col-span-5 min-w-0">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                          <Package size={20} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 truncate">{product.name}</p>
                          <p className="text-xs text-slate-500 truncate">{product.stock} tersisa dari batas minimum</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-span-2 flex items-center justify-center text-sm font-semibold text-slate-600">{product.unit}</div>
                    <div className="col-span-2 flex items-center justify-center text-sm font-bold text-red-600">{product.stock}</div>
                    <div className="col-span-2 flex items-center justify-center text-sm text-slate-600">{product.minimumStock}</div>
                    <div className="col-span-2 hidden sm:flex items-center justify-center">
                      <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700 border border-red-100">
                        {Math.max(0, product.minimumStock - product.stock)} item
                      </span>
                    </div>
                    <div className="col-span-12 sm:hidden mt-2 flex items-center justify-between rounded-2xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
                      <span>Perlu restock</span>
                      <span>{Math.max(0, product.minimumStock - product.stock)} item</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-6 text-center">
              <p className="text-sm font-semibold text-slate-700">Tidak ada produk yang menipis.</p>
              <p className="mt-1 text-sm text-slate-500">Semua stok masih aman untuk saat ini.</p>
            </div>
          )}
        </section>

        <section className="space-y-2.5 sm:space-y-3 w-full">
          <div className="flex items-end justify-between gap-3 px-1">
            <div>
              <h2 className="section-heading">Tren 7 Hari Terakhir</h2>
              <p className="mt-1 text-sm text-slate-500">Visualisasi yang lebih bersih untuk membaca arah performa.</p>
            </div>
          </div>
          <SalesChart />
        </section>
      </div>
    </DashboardLayout>
  );
}
