import { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import { AlertCircle, Sparkles } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/ui/chart";
import { formatRupiah } from "@/lib/utils";

interface SalesTrendPoint {
  label: string;
  revenue: number;
  quantity: number;
}

interface SalesTrendChartProps {
  data: SalesTrendPoint[];
  isLoading?: boolean;
  error?: string | null;
  sourceLabel?: string;
}

const chartConfig = {
  revenue: {
    label: "Penjualan",
    color: "#2563eb",
  },
} as const;

export default function SalesTrendChart({
  data,
  isLoading = false,
  error = null,
  sourceLabel,
}: SalesTrendChartProps) {
  const totals = useMemo(() => {
    return data.reduce(
      (accumulator, item) => ({
        revenue: accumulator.revenue + item.revenue,
        quantity: accumulator.quantity + item.quantity,
      }),
      { revenue: 0, quantity: 0 },
    );
  }, [data]);

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
        <div className="border-b border-slate-100 bg-[linear-gradient(135deg,_rgba(29,78,216,0.05),_rgba(56,189,248,0.025))] p-4 sm:p-4.5 lg:p-5">
          <div className="h-6 w-56 rounded-full bg-slate-100 animate-pulse" />
          <div className="mt-2 h-4 w-80 max-w-full rounded-full bg-slate-100 animate-pulse" />
        </div>
        <div className="space-y-3 p-4 sm:p-4.5 lg:p-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={`sales-trend-skeleton-${index}`} className="h-16 rounded-2xl bg-slate-100 animate-pulse" />
            ))}
          </div>
          <div className="h-[320px] rounded-[24px] bg-slate-100 animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !data.length) {
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
        <div className="border-b border-slate-100 bg-[linear-gradient(135deg,_rgba(29,78,216,0.05),_rgba(56,189,248,0.025))] p-4 sm:p-4.5 lg:p-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
              <Sparkles size={18} />
            </span>
            <div>
              <p className="mt-1 text-sm font-medium text-slate-500">
                {sourceLabel ? `Berdasarkan ${sourceLabel}.` : "Ringkasan rekap penjualan 7 hari terakhir."}
              </p>
            </div>
          </div>
        </div>
        <div className="p-4 sm:p-4.5 lg:p-5">
          <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50/80 px-6 py-12 text-center">
            <AlertCircle className="mx-auto text-slate-400" size={24} />
            <p className="mt-3 text-sm font-semibold text-slate-700">
              {error || "Belum ada data penjualan untuk ditampilkan."}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Grafik akan muncul setelah data penjualan tersedia.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
      <div className="flex flex-col gap-3 border-b border-slate-100 bg-[linear-gradient(135deg,_rgba(29,78,216,0.05),_rgba(56,189,248,0.025))] p-4 sm:p-4.5 lg:p-5 xl:flex-row xl:items-end xl:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
              <Sparkles size={18} />
            </span>
            <div>
              <p className="mt-1 text-sm font-medium text-slate-500">Omzet harian 7 hari terakhir</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 min-w-0 sm:grid-cols-2">
          <div className="rounded-2xl border border-blue-100 bg-white px-3 py-2 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-700">Total Omzet</p>
            <p className="mt-1 text-sm font-black text-slate-950 tabular-nums">{formatRupiah(totals.revenue)}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">Total Unit</p>
            <p className="mt-1 text-sm font-black text-slate-950 tabular-nums">{totals.quantity.toFixed(1).replace(/\.0$/, "")}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-4 sm:p-4.5 lg:p-5">
        <div className="flex flex-wrap items-center gap-5 px-1 text-[13px] font-semibold text-slate-600">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#2563eb] shadow-[0_0_8px_rgba(37,99,235,0.6)]" />
            Penjualan
          </div>
        </div>

        <ChartContainer config={chartConfig} className="aspect-auto h-[320px] w-full rounded-[24px] border border-slate-200/60 bg-[linear-gradient(180deg,_#ffffff,_#f8fafc)] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.75),0_4px_24px_rgba(15,23,42,0.04)] sm:p-4">
          <LineChart data={data} margin={{ top: 16, right: 16, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="4 8" stroke="#e2e8f0" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={12}
              stroke="#64748b"
              fontSize={12}
              fontWeight={600}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              width={76}
              stroke="#64748b"
              tickFormatter={(value) => formatRupiah(Number(value))}
              fontSize={12}
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
                  formatter={(value) => (
                    <div className="flex w-full items-center justify-between gap-4">
                      <span className="text-slate-600">Penjualan</span>
                      <span className="font-mono font-semibold tabular-nums text-slate-900">{formatRupiah(Number(value))}</span>
                    </div>
                  )}
                />
              }
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="var(--color-revenue)"
              strokeWidth={3}
              dot={{ r: 4, fill: "var(--color-revenue)", strokeWidth: 2, stroke: "#ffffff" }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </LineChart>
        </ChartContainer>
      </div>
    </div>
  );
}