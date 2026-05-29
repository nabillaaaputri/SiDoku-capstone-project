import { useMemo } from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/ui/chart";
import { formatRupiah } from "@/lib/utils";

interface SalesChartProps {
  data: Array<{
    label: string;
    income: number;
    expense: number;
    hpp: number;
    profit: number;
  }>;
  netProfit?: number;
  isLoading?: boolean;
}

const chartConfig = {
  income: {
    label: "Uang Masuk",
    color: "#2563eb",
  },
  expense: {
    label: "Uang Keluar",
    color: "#6b7280",
  },
  hpp: {
    label: "HPP",
    color: "#f97316",
  },
  profit: {
    label: "Keuntungan",
    color: "#16a34a",
  },
} as const;

export default function SalesChart({ data, netProfit, isLoading = false }: SalesChartProps) {
  const totals = useMemo(() => {
    return data.reduce(
      (accumulator, item) => ({
        income: accumulator.income + item.income,
        expense: accumulator.expense + item.expense,
        hpp: accumulator.hpp + item.hpp,
        profit: accumulator.profit + item.profit,
      }),
      { income: 0, expense: 0, hpp: 0, profit: 0 },
    );
  }, [data]);
  const totalProfit = typeof netProfit === "number" ? netProfit : totals.profit;

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
        <div className="border-b border-slate-100 bg-[linear-gradient(135deg,_rgba(29,78,216,0.05),_rgba(56,189,248,0.025))] p-4 sm:p-4.5 lg:p-5">
          <div className="h-6 w-44 rounded-full bg-slate-100 animate-pulse" />
          <div className="mt-2 h-4 w-72 max-w-full rounded-full bg-slate-100 animate-pulse" />
        </div>
        <div className="space-y-3 p-4 sm:p-4.5 lg:p-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={`chart-skeleton-${index}`} className="h-16 rounded-2xl bg-slate-100 animate-pulse" />
            ))}
          </div>
          <div className="h-[320px] sm:h-[360px] rounded-[24px] bg-slate-100 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
        <div className="border-b border-slate-100 bg-[linear-gradient(135deg,_rgba(29,78,216,0.05),_rgba(56,189,248,0.025))] p-4 sm:p-4.5 lg:p-5">
          <p className="text-sm text-slate-500 font-medium">Ringkasan performa uang masuk, uang keluar, dan keuntungan dalam grafik.</p>
        </div>
        <div className="p-4 sm:p-4.5 lg:p-5">
          <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50/80 px-6 py-14 text-center">
            <p className="text-sm font-semibold text-slate-700">Belum ada data transaksi untuk ditampilkan.</p>
            <p className="mt-1 text-sm text-slate-500">Grafik akan muncul setelah data rekap penjualan dan pengeluaran tersedia.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
      <div className="border-b border-slate-100 bg-[linear-gradient(135deg,_rgba(29,78,216,0.05),_rgba(56,189,248,0.025))] p-4 sm:p-4.5 lg:p-5">
        {/* Description kept at section header in Dashboard; remove duplicate here to avoid redundancy */}

        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-blue-100 bg-white px-2 py-1.5 shadow-sm min-h-[56px] flex flex-col justify-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-blue-700">Total Masuk</p>
            <p className="mt-1 text-sm font-black text-slate-900 tabular-nums">{formatRupiah(totals.income)}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white px-2 py-1.5 shadow-sm min-h-[56px] flex flex-col justify-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-600">Total Keluar</p>
            <p className="mt-1 text-sm font-black text-slate-900 tabular-nums">{formatRupiah(totals.expense)}</p>
          </div>

          <div className="rounded-2xl border border-orange-100 bg-white px-2 py-1.5 shadow-sm min-h-[56px] flex flex-col justify-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-orange-600">Total HPP</p>
            <p className="mt-1 text-sm font-black text-slate-900 tabular-nums">{formatRupiah(totals.hpp)}</p>
          </div>

          <div className="rounded-2xl border border-green-100 bg-white px-2 py-1.5 shadow-sm min-h-[56px] flex flex-col justify-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-green-600">Total Keuntungan</p>
            <p className="mt-1 text-sm font-black text-slate-900 tabular-nums">{formatRupiah(totalProfit)}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-4 sm:p-4.5 lg:p-5">
        <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-[12px] sm:text-[13px] font-semibold text-slate-600 px-1">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#2563eb] shadow-[0_0_8px_rgba(37,99,235,0.6)]" />
            Uang Masuk
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#6b7280] shadow-[0_0_8px_rgba(107,114,128,0.6)]" />
            Uang Keluar
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#f97316] shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
            HPP
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#16a34a] shadow-[0_0_8px_rgba(22,163,74,0.6)]" />
            Keuntungan
          </div>
        </div>

        <ChartContainer config={chartConfig} className="aspect-auto h-[320px] sm:h-[360px] w-full rounded-[24px] border border-slate-200/60 bg-[linear-gradient(180deg,_#ffffff,_#f8fafc)] p-2.5 sm:p-3 sm:p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.75),0_4px_24px_rgba(15,23,42,0.04)]">
          <ComposedChart data={data} margin={{ top: 12, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="4 8" stroke="#e2e8f0" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={12}
              stroke="#64748b"
              fontSize={11}
              fontWeight={600}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              width={76}
              stroke="#64748b"
              tickFormatter={(value) => formatRupiah(Number(value))}
              fontSize={11}
              fontWeight={600}
            />
            <ChartTooltip
              cursor={{ fill: "rgba(15, 23, 42, 0.04)" }}
              content={
                <ChartTooltipContent
                  indicator="dot"
                  labelFormatter={(label) => (
                    <span className="font-semibold text-slate-900">{String(label)}</span>
                  )}
                  formatter={(value, name) => (
                    <div className="flex w-full items-center justify-between gap-4">
                      <span className="text-slate-600">{chartConfig[name as keyof typeof chartConfig]?.label || name}</span>
                      <span className="font-mono font-semibold tabular-nums text-slate-900">{formatRupiah(Number(value))}</span>
                    </div>
                  )}
                />
              }
            />
            <Bar dataKey="income" fill="var(--color-income)" radius={[10, 10, 0, 0]} maxBarSize={36} />
            <Bar dataKey="expense" fill="var(--color-expense)" radius={[10, 10, 0, 0]} maxBarSize={36} />
            <Bar dataKey="hpp" fill="var(--color-hpp)" radius={[10, 10, 0, 0]} maxBarSize={36} />
            <Line
              type="monotone"
              dataKey="profit"
              stroke="var(--color-profit)"
              strokeWidth={3}
              dot={{ r: 4, fill: "var(--color-profit)", strokeWidth: 2, stroke: "#ffffff" }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </ComposedChart>
        </ChartContainer>
      </div>
    </div>
  );
}
