import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import Insights from "@/components/Insights";
import ForecastTrendChart from "@/components/ForecastTrendChart";
import SalesChart from "@/components/SalesChart";
import { useBusinessContext } from "@/context";
import { useAuth } from "@/context/AuthContext";
import apiClient from "@/services/api";
import { getPreferredUserName } from "@/services/auth.service";
import { formatRupiahCompact } from "@/lib/utils";
import { getJakartaDateInputValue } from "@/lib/timezone";
import {
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Package,
  CircleDollarSign,
  Banknote,
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

interface ForecastTrendPoint {
  label: string;
  predictedRevenue: number;
  predictedQuantity: number;
}

export default function Dashboard() {
  const { products, salesRecords } = useBusinessContext();
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
  const isProfitNegative = financialSummary.profit < 0;
  const isRoiNegative = financialSummary.roi < 0;

  const activeProducts = products.filter((product) => product.archived !== true);
  const lowStockProducts = activeProducts.filter((product) => product.stock <= product.minimumStock).slice(0, 3);
  const hasLowStock = lowStockProducts.length > 0;

  const restockRecommendations = useMemo(() => {
    return [...activeProducts]
      .filter((product) => product.stock <= product.minimumStock)
      .sort((left, right) => {
        const leftShortage = left.minimumStock - left.stock;
        const rightShortage = right.minimumStock - right.stock;
        return rightShortage - leftShortage;
      })
      .slice(0, 3)
      .map((product) => ({
        id: product.id,
        name: product.name,
        shortage: Math.max(1, product.minimumStock - product.stock),
        stock: product.stock,
        unit: product.unit,
      }));
  }, [activeProducts]);

  const salesTrendData = useMemo<ForecastTrendPoint[]>(() => {
    const today = new Date();
    const points = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - index));
      date.setHours(0, 0, 0, 0);

      return {
        date,
        key: getJakartaDateInputValue(date),
        label: new Intl.DateTimeFormat("id-ID", {
          timeZone: "Asia/Jakarta",
          weekday: "short",
          day: "2-digit",
          month: "2-digit",
        }).format(date),
        predictedRevenue: 0,
        predictedQuantity: 0,
      };
    });

    const pointMap = new Map(points.map((point) => [point.key, point]));

    for (const record of salesRecords) {
      const recordDate = new Date(record.date);
      const key = getJakartaDateInputValue(recordDate);
      const targetPoint = pointMap.get(key);

      if (!targetPoint) {
        continue;
      }

      targetPoint.predictedRevenue += Number(record.totalAmount) || 0;
      targetPoint.predictedQuantity += Number(record.quantity) || 0;
    }

    return points.map(({ key, date: _date, ...point }) => point);
  }, [salesRecords]);

  return (
    <DashboardLayout>
      <div className="w-full max-w-full space-y-3 overflow-x-hidden sm:space-y-3.5">
        <section className="section-shell overflow-hidden">
          <div className="bg-[linear-gradient(135deg,_rgba(29,78,216,0.06),_rgba(56,189,248,0.04))] p-4 sm:p-4.5 lg:p-5">
            <div className="flex flex-col gap-3.5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/90 px-3 py-1.5 text-xs font-semibold text-blue-700 shadow-sm">
                  <Sparkles size={14} />
                  SiDoku Analytics
                </div>
                <div className="space-y-1">
                  <h1 className="text-2xl font-black leading-tight tracking-tighter text-slate-900 sm:text-3xl lg:text-4xl">
                    Selamat Datang Kembali, {displayName}
                  </h1>
                  <p className="max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-[15px]">
                    Pantau ringkasan usaha, insight penting, stok menipis, dan tren performa dalam satu tampilan.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3 lg:justify-end">
                <Link
                  to="/stok-masuk"
                  className="inline-flex items-center gap-2 rounded-2xl border border-blue-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-blue-700 shadow-sm hover:border-blue-300 hover:bg-blue-50"
                >
                  <ArrowUpRight size={18} />
                  Stok Masuk
                </Link>
                <Link
                  to="/stok-keluar"
                  className="inline-flex items-center gap-2 rounded-2xl bg-[linear-gradient(135deg,_#0f172a,_#1d4ed8)] px-3.5 py-2.5 text-sm font-semibold text-white shadow-[0_18px_30px_rgba(29,78,216,0.18)] hover:brightness-105"
                >
                  <ArrowDownRight size={18} />
                  Stok Keluar
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="section-shell space-y-3 p-4 sm:p-4.5 lg:p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="section-heading">Ringkasan Keuangan</h2>
              <p className="mt-1 text-sm text-slate-500">Empat angka utama untuk membaca performa bisnis dengan cepat.</p>
            </div>
          </div>

          {isLoadingDashboard ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-3.5 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={`summary-skeleton-${index}`}
                  className="rounded-[28px] border border-slate-200 bg-white p-3.5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]"
                >
                  <div className="h-3 w-24 animate-pulse rounded-full bg-slate-100" />
                  <div className="mt-4 h-8 w-32 animate-pulse rounded-full bg-slate-100" />
                  <div className="mt-3 h-3 w-20 animate-pulse rounded-full bg-slate-100" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-3.5 lg:grid-cols-4">
              <div className="group relative overflow-hidden rounded-[28px] border border-blue-100 bg-[linear-gradient(180deg,_#ffffff,_#eff6ff)] p-3.5 shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(37,99,235,0.14)]">
                <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,_#60a5fa,_#2563eb)]" />
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-600/80">Uang Masuk</p>
                    <p className="mt-2.5 text-xl font-extrabold leading-none tracking-tight text-slate-900 tabular-nums sm:text-2xl">
                      {formatRupiahCompact(financialSummary.income)}
                    </p>
                    <p className="mt-1.5 text-xs font-medium text-slate-500">dari penjualan</p>
                  </div>
                  <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,_rgba(37,99,235,0.16),_rgba(96,165,250,0.1))] text-blue-600 ring-1 ring-blue-100 shadow-inner">
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
                    <p className="mt-2.5 text-xl font-extrabold leading-none tracking-tight text-slate-900 tabular-nums sm:text-2xl">
                      {formatRupiahCompact(financialSummary.expense)}
                    </p>
                    <p className="mt-1.5 text-xs font-medium text-slate-500">biaya operasional</p>
                  </div>
                  <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,_rgba(100,116,139,0.16),_rgba(148,163,184,0.1))] text-slate-600 ring-1 ring-slate-200 shadow-inner">
                    <Banknote size={22} />
                  </div>
                </div>
                <div className="mt-3.5 h-1.5 overflow-hidden rounded-full bg-slate-200/80">
                  <div className="h-full w-[42%] rounded-full bg-[linear-gradient(90deg,_#94a3b8,_#475569)]" />
                </div>
              </div>

              <div className={`group relative overflow-hidden rounded-[28px] border p-3.5 shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 ${isProfitNegative ? "border-amber-200 bg-[linear-gradient(180deg,_#fffaf0,_#fff7ed)] hover:shadow-[0_18px_40px_rgba(217,119,6,0.12)]" : "border-sky-100 bg-[linear-gradient(180deg,_#ffffff,_#eff6ff)] hover:shadow-[0_18px_40px_rgba(14,165,233,0.14)]"}`}>
                <div className={`absolute inset-x-0 top-0 h-1 ${isProfitNegative ? "bg-[linear-gradient(90deg,_#f59e0b,_#ea580c)]" : "bg-[linear-gradient(90deg,_#7dd3fc,_#0284c7)]"}`} />
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className={`text-[11px] font-semibold uppercase tracking-wider ${isProfitNegative ? "text-amber-700/80" : "text-sky-600/80"}`}>Keuntungan</p>
                    <p className={`mt-2.5 text-xl font-extrabold leading-none tracking-tight tabular-nums sm:text-2xl ${isProfitNegative ? "text-amber-700" : "text-slate-900"}`}>
                      {formatRupiahCompact(financialSummary.profit)}
                    </p>
                    <p className="mt-1.5 text-xs font-medium text-slate-500">uang masuk - keluar</p>
                  </div>
                  <div className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-inner ring-1 ${isProfitNegative ? "bg-[linear-gradient(135deg,_rgba(245,158,11,0.16),_rgba(251,191,36,0.1))] text-amber-600 ring-amber-100" : "bg-[linear-gradient(135deg,_rgba(14,165,233,0.16),_rgba(125,211,252,0.1))] text-sky-600 ring-sky-100"}`}>
                    <Package size={22} />
                  </div>
                </div>
                <div className={`mt-3.5 h-1.5 overflow-hidden rounded-full ${isProfitNegative ? "bg-amber-100/80" : "bg-sky-100/80"}`}>
                  <div className={`h-full rounded-full ${isProfitNegative ? "w-[52%] bg-[linear-gradient(90deg,_#fbbf24,_#ea580c)]" : "w-[66%] bg-[linear-gradient(90deg,_#7dd3fc,_#0284c7)]"}`} />
                </div>
              </div>

              <div className={`group relative overflow-hidden rounded-[28px] border p-3.5 shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 ${isRoiNegative ? "border-amber-200 bg-[linear-gradient(180deg,_#fffaf0,_#fff7ed)] hover:shadow-[0_18px_40px_rgba(217,119,6,0.12)]" : "border-cyan-100 bg-[linear-gradient(180deg,_#ffffff,_#ecfeff)] hover:shadow-[0_18px_40px_rgba(6,182,212,0.14)]"}`}>
                <div className={`absolute inset-x-0 top-0 h-1 ${isRoiNegative ? "bg-[linear-gradient(90deg,_#fbbf24,_#ea580c)]" : "bg-[linear-gradient(90deg,_#67e8f9,_#06b6d4)]"}`} />
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className={`text-[11px] font-semibold uppercase tracking-wider ${isRoiNegative ? "text-amber-700/80" : "text-cyan-600/80"}`}>Tingkat Keuntungan</p>
                    <p className={`mt-2.5 text-xl font-extrabold leading-none tracking-tight tabular-nums sm:text-2xl ${isRoiNegative ? "text-amber-700" : "text-slate-900"}`}>
                      {`${financialSummary.roi.toFixed(2).replace(/\.00$/, "")}%`}
                    </p>
                    <p className="mt-1.5 text-xs font-medium text-slate-500">persentase laba dari modal</p>
                  </div>
                  <div className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-inner ring-1 ${isRoiNegative ? "bg-[linear-gradient(135deg,_rgba(245,158,11,0.16),_rgba(251,191,36,0.1))] text-amber-600 ring-amber-100" : "bg-[linear-gradient(135deg,_rgba(6,182,212,0.16),_rgba(103,232,249,0.1))] text-cyan-600 ring-cyan-100"}`}>
                    <ShieldAlert size={22} />
                  </div>
                </div>
                <div className={`mt-3.5 h-1.5 overflow-hidden rounded-full ${isRoiNegative ? "bg-amber-100/80" : "bg-cyan-100/80"}`}>
                  <div className={`h-full rounded-full ${isRoiNegative ? "w-[52%] bg-[linear-gradient(90deg,_#fbbf24,_#ea580c)]" : "w-[88%] bg-[linear-gradient(90deg,_#67e8f9,_#06b6d4)]"}`} />
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="section-shell p-4 space-y-3 sm:p-4.5 lg:p-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="section-heading">Insight Singkat</h2>
              <p className="mt-1 text-sm text-slate-500">Saran yang lebih ringkas dan lebih cepat dipindai.</p>
            </div>
          </div>
          <Insights />
        </section>

        <section className="section-shell p-4 space-y-3 sm:p-4.5 lg:p-5">
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
              <table className="w-full whitespace-nowrap text-left text-sm">
                <thead className="border-b border-slate-200/60 bg-slate-50/50 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                  <tr>
                    <th className="w-[35%] px-5 py-3.5 font-semibold">Produk</th>
                    <th className="w-[12%] px-4 py-3.5 font-semibold text-center">Satuan</th>
                    <th className="w-[14%] px-4 py-3.5 font-semibold text-center">Sisa Stok</th>
                    <th className="w-[12%] px-4 py-3.5 font-semibold text-center">Min.</th>
                    <th className="w-[12%] px-4 py-3.5 font-semibold text-center">Status</th>
                    <th className="w-[15%] px-5 py-3.5 font-semibold text-right">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lowStockProducts.map((product) => {
                    const isCritical = product.stock === 0;
                    const shortage = product.minimumStock - product.stock;

                    return (
                      <tr key={product.id} className="group transition-colors hover:bg-slate-50/40">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] ${isCritical ? "bg-red-50 text-red-500" : "bg-amber-50 text-amber-500"} transition-all group-hover:shadow-sm`}>
                              <Package size={16} />
                            </div>
                            <span className="font-bold text-slate-800">{product.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center font-medium text-slate-500">{product.unit}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`font-extrabold ${isCritical ? "text-red-600" : "text-amber-600"}`}>{product.stock}</span>
                        </td>
                        <td className="px-4 py-3 text-center font-medium text-slate-400">{product.minimumStock}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${isCritical ? "bg-red-50 text-red-700 ring-1 ring-red-200/50" : "bg-amber-50 text-amber-700 ring-1 ring-amber-200/50"}`}>
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

          <div className="rounded-[22px] border border-blue-100 bg-[linear-gradient(135deg,_rgba(239,246,255,0.8),_rgba(255,255,255,0.95))] p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Rekomendasi Restock</h3>
                <p className="mt-1 text-xs text-slate-500">Produk prioritas yang paling perlu diisi ulang.</p>
              </div>
            </div>

            {restockRecommendations.length > 0 ? (
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {restockRecommendations.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-blue-50 bg-white px-3 py-3 shadow-sm">
                    <p className="text-sm font-bold text-slate-900">{item.name}</p>
                    <p className="mt-1 text-xs text-slate-500">Sisa stok {item.stock} {item.unit}</p>
                    <p className="mt-2 text-sm font-semibold text-blue-700">Butuh restock {item.shortage} {item.unit}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-3 rounded-2xl border border-dashed border-blue-100 bg-white px-4 py-4 text-sm text-slate-600">
                Belum ada rekomendasi restock tambahan.
              </div>
            )}
          </div>
        </section>

        <section className="section-shell p-4 space-y-3 sm:p-4.5 lg:p-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="section-heading">Tren Penjualan Selama 7 Hari</h2>
              <p className="mt-1 text-sm text-slate-500">Pantau arah penjualan mingguan dalam satu grafik ringkas.</p>
            </div>
          </div>
          <ForecastTrendChart data={salesTrendData} isLoading={false} />
        </section>

        <section className="w-full space-y-2.5 sm:space-y-3">
          <div className="hidden">
            {/* Kept wrapper but hidden header to avoid duplication since SalesChart has its own header */}
          </div>
          <SalesChart data={chartData} isLoading={isLoadingDashboard} />
        </section>
      </div>
    </DashboardLayout>
  );
}