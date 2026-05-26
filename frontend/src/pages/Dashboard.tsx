import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import Insights from "@/components/Insights";
import SalesChart from "@/components/SalesChart";
import { Badge } from "@/ui/badge";
import { useBusinessContext } from "@/context";
import { useAuth } from "@/context/AuthContext";
import apiClient from "@/services/api";
import { getPreferredUserName } from "@/services/auth.service";
import { formatRupiahCompact } from "@/lib/utils";
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

interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

interface DashboardSummary {
  income: number;
  expense: number;
  profit: number;
  roi: number;
}

interface DashboardTrendItem {
  day: string;
  income: number;
  expense: number;
}

interface DashboardTrends {
  period: string;
  items: DashboardTrendItem[];
  totalIncome: number;
  totalExpense: number;
}

interface ChartPoint {
  label: string;
  income: number;
  expense: number;
  profit: number;
}

export default function Dashboard() {
  const { products } = useBusinessContext();
  const { user } = useAuth();
  const displayName = getPreferredUserName(user);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [trends, setTrends] = useState<DashboardTrendItem[]>([]);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      setIsLoadingDashboard(true);

      try {
        const [summaryResponse, trendsResponse] = await Promise.all([
          apiClient.get<ApiResponse<DashboardSummary>>("/dashboard/summary"),
          apiClient.get<ApiResponse<DashboardTrends>>("/dashboard/trends"),
        ]);

        if (!isMounted) {
          return;
        }

        setSummary(summaryResponse.data.data || null);
        setTrends(trendsResponse.data.data?.items || []);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);

        if (isMounted) {
          setSummary(null);
          setTrends([]);
        }
      } finally {
        if (isMounted) {
          setIsLoadingDashboard(false);
        }
      }
    };

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const chartData = useMemo<ChartPoint[]>(() => {
    return trends.map((item) => ({
      label: item.day,
      income: Number(item.income) || 0,
      expense: Number(item.expense) || 0,
      profit: (Number(item.income) || 0) - (Number(item.expense) || 0),
    }));
  }, [trends]);

  const financialSummary = summary || {
    income: 0,
    expense: 0,
    profit: 0,
    roi: 0,
  };

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
                <div className="space-y-1">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tighter text-slate-900 leading-tight">
                    Selamat Datang Kembali, {displayName}
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
                  Stok Masuk
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

          {isLoadingDashboard ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={`summary-skeleton-${index}`}
                  className="rounded-[28px] border border-slate-200 bg-white p-3.5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]"
                >
                  <div className="h-3 w-24 rounded-full bg-slate-100 animate-pulse" />
                  <div className="mt-4 h-8 w-32 rounded-full bg-slate-100 animate-pulse" />
                  <div className="mt-3 h-3 w-20 rounded-full bg-slate-100 animate-pulse" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5">
            <div className="group relative overflow-hidden rounded-[28px] border border-blue-100 bg-[linear-gradient(180deg,_#ffffff,_#eff6ff)] p-3.5 shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(37,99,235,0.14)]">
              <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,_#60a5fa,_#2563eb)]" />
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-600/80">Uang Masuk</p>
                  <p className="mt-2.5 text-xl sm:text-2xl font-extrabold text-slate-900 leading-none tabular-nums tracking-tight">{formatRupiahCompact(financialSummary.income)}</p>
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
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Uang Keluar</p>
                  <p className="mt-2.5 text-xl sm:text-2xl font-extrabold text-slate-900 leading-none tabular-nums tracking-tight">{formatRupiahCompact(financialSummary.expense)}</p>
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
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-sky-600/80">Keuntungan</p>
                  <p className="mt-2.5 text-xl sm:text-2xl font-extrabold text-slate-900 leading-none tabular-nums tracking-tight">{formatRupiahCompact(financialSummary.profit)}</p>
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
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-cyan-600/80">Tingkat Keuntungan</p>
                  <p className="mt-2.5 text-xl sm:text-2xl font-extrabold text-slate-900 leading-none tabular-nums tracking-tight">{`${financialSummary.roi.toFixed(2).replace(/\.00$/, "")}%`}</p>
                  <p className="mt-1.5 text-xs font-medium text-slate-500">persentase laba dari modal</p>
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
          )}
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
            <div className="overflow-x-auto rounded-[20px] border border-slate-200/60 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.02)]">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50/50 text-[11px] font-bold uppercase tracking-widest text-slate-500 border-b border-slate-200/60">
                  <tr>
                    <th className="px-5 py-3.5 font-semibold w-[35%]">Produk</th>
                    <th className="px-4 py-3.5 font-semibold text-center w-[12%]">Satuan</th>
                    <th className="px-4 py-3.5 font-semibold text-center w-[14%]">Sisa Stok</th>
                    <th className="px-4 py-3.5 font-semibold text-center w-[12%]">Min.</th>
                    <th className="px-4 py-3.5 font-semibold text-center w-[12%]">Status</th>
                    <th className="px-5 py-3.5 font-semibold text-right w-[15%]">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lowStockProducts.map((product) => {
                    const isCritical = product.stock === 0;
                    const shortage = product.minimumStock - product.stock;
                    
                    return (
                      <tr key={product.id} className="hover:bg-slate-50/40 transition-colors group">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] ${isCritical ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'} group-hover:shadow-sm transition-all`}>
                              <Package size={16} />
                            </div>
                            <span className="font-bold text-slate-800">{product.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center font-medium text-slate-500">{product.unit}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`font-extrabold ${isCritical ? 'text-red-600' : 'text-amber-600'}`}>{product.stock}</span>
                        </td>
                        <td className="px-4 py-3 text-center font-medium text-slate-400">{product.minimumStock}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            isCritical 
                              ? 'bg-red-50 text-red-700 ring-1 ring-red-200/50' 
                              : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200/50'
                          }`}>
                            {isCritical ? "Kritis" : "Low"}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <span className="text-[12.5px] font-semibold text-slate-500">
                            {isCritical ? "Segera restok" : `Butuh ${shortage > 0 ? shortage : 1} ${product.unit}`}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-6 text-center">
              <p className="text-sm font-semibold text-slate-700">Tidak ada produk yang menipis.</p>
              <p className="mt-1 text-sm text-slate-500">Semua stok masih aman untuk saat ini.</p>
            </div>
          )}
        </section>

        <section className="space-y-2.5 sm:space-y-3 w-full">
          <div className="hidden">
            {/* Kept wrapper but hidden header to avoid duplication since SalesChart has its own header */}
          </div>
          <SalesChart data={chartData} isLoading={isLoadingDashboard} />
        </section>
      </div>
    </DashboardLayout>
  );
}
