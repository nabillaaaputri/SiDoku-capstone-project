import { TrendingUp, TrendingDown, AlertCircle, Star, Package } from "lucide-react";
import { useBusinessContext } from "@/context";
import { useMemo } from "react";

interface Insight {
  id: string;
  type: "positive" | "warning" | "neutral";
  title: string;
  description: string;
  icon: React.ReactNode;
  metric?: string;
}

export default function Insights() {
  const {
    products,
    salesRecords,
    expenses,
    getMonthlyComparison,
  } = useBusinessContext();

  const insights = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Get current and previous month summary
    const { current, previous, change: incomeChange } = getMonthlyComparison(
      currentMonth,
      currentYear
    );

    const insights: Insight[] = [];

    // 1. Income Trend Insight
    if (incomeChange > 0) {
      const isInfinity = previous.totalIncome === 0;
      const changePercent = isInfinity ? 0 : ((incomeChange / previous.totalIncome) * 100);
      
      insights.push({
        id: "1",
        type: "positive",
        title: "Penjualan Naik",
        description: isInfinity 
          ? `Penjualan bulan ini meningkat tajam! Kerja keras kamu terbayar.`
          : `Penjualan bulan ini naik ${changePercent.toFixed(1)}%. Kerja keras kamu terbayar!`,
        icon: <TrendingUp size={20} />,
        metric: isInfinity ? "Naik Signifikan" : `+${changePercent.toFixed(1)}%`,
      });
    } else if (incomeChange < 0) {
      const isInfinity = previous.totalIncome === 0;
      const changePercent = isInfinity ? 0 : ((Math.abs(incomeChange) / previous.totalIncome) * 100);
      
      insights.push({
        id: "1",
        type: "warning",
        title: "Penjualan Turun",
        description: `Penjualan bulan ini turun ${isInfinity ? "signifikan" : changePercent.toFixed(1) + "%"}. Coba tambah promosi.`,
        icon: <TrendingDown size={20} />,
        metric: isInfinity ? "Turun Tajam" : `-${changePercent.toFixed(1)}%`,
      });
    } else {
      insights.push({
        id: "1",
        type: "neutral",
        title: "Penjualan Stabil",
        description: "Penjualan bulan ini sama seperti bulan lalu. Pertahankan konsistensinya!",
        icon: <TrendingUp size={20} />,
        metric: "0%",
      });
    }

    const expenseChange = current.totalExpense - previous.totalExpense;
    if (expenseChange > 0) {
      const isInfinity = previous.totalExpense === 0;
      const changePercent = isInfinity ? 0 : ((expenseChange / previous.totalExpense) * 100);
      
      insights.push({
        id: "2",
        type: "warning",
        title: "Biaya Operasional Naik",
        description: isInfinity 
          ? `Biaya bulan ini meningkat tajam. Cek pengeluaran yang tidak perlu.`
          : `Biaya bulan ini ${changePercent.toFixed(1)}% lebih tinggi. Cek pengeluaran yang tidak perlu.`,
        icon: <TrendingDown size={20} />,
        metric: isInfinity ? "Pengeluaran Meningkat" : `+${changePercent.toFixed(1)}%`,
      });
    } else {
      insights.push({
        id: "2",
        type: "positive",
        title: "Biaya Terkontrol",
        description: "Biaya operasional bulan ini lebih hemat dari bulan lalu. Bagus!",
        icon: <TrendingUp size={20} />,
        metric: "✓",
      });
    }

    // 3. Top Product Insight
    if (salesRecords.length > 0) {
      const productSales = salesRecords.reduce(
        (acc, t) => {
          const existing = acc.find((p) => p.productId === t.productId);
          if (existing) {
            existing.amount += t.totalAmount;
            existing.quantity += t.quantity;
          } else {
            acc.push({
              productId: t.productId,
              productName: t.productName,
              amount: t.totalAmount,
              quantity: t.quantity,
            });
          }
          return acc;
        },
        [] as Array<{
          productId: string;
          productName: string;
          amount: number;
          quantity: number;
        }>
      );

      const topProduct = productSales.sort((a, b) => b.amount - a.amount)[0];
      if (topProduct) {
        const percentage = (
          (topProduct.amount / current.totalIncome) *
          100
        ).toFixed(1);
        insights.push({
          id: "3",
          type: "positive",
          title: "Produk Favorit",
          description: `${topProduct.productName} paling banyak terjual (${percentage}% dari total uang masuk).`,
          icon: <Star size={20} />,
          metric: `${percentage}%`,
        });
      }
    }

    // 4. Low Stock Alert
    const lowStockProducts = products.filter((p) => p.stock <= p.minimumStock);
    if (lowStockProducts.length > 0) {
      const criticalStock = lowStockProducts.filter((p) => p.stock === 0);
      if (criticalStock.length > 0) {
        insights.push({
          id: "4",
          type: "warning",
          title: "Produk Habis!",
          description: `${criticalStock.length} produk sudah habis terjual. Segera pesan ulang: ${criticalStock
            .map((p) => p.name)
            .join(", ")}`,
          icon: <AlertCircle size={20} />,
          metric: `${criticalStock.length}`,
        });
      } else {
        insights.push({
          id: "4",
          type: "warning",
          title: "Produk Hampir Habis",
          description: `${lowStockProducts.length} produk stoknya sudah tinggal sedikit. Buruan pesan ulang sebelum terlambat!`,
          icon: <AlertCircle size={20} />,
          metric: `${lowStockProducts.length}`,
        });
      }
    }

    // 5. Profit Insight (Simplified)
    if (current.totalIncome > 0) {
      const profitMargin = current.profitMargin;
      if (profitMargin > 40) {
        insights.push({
          id: "5",
          type: "positive",
          title: "Keuntungan Bagus",
          description: `Dari setiap Rp 100 penjualan, kamu untung Rp ${profitMargin.toFixed(0)}. Luar biasa!`,
          icon: <Package size={20} />,
          metric: `${profitMargin.toFixed(0)}%`,
        });
      } else if (profitMargin > 20) {
        insights.push({
          id: "5",
          type: "neutral",
          title: "Keuntungan Normal",
          description: `Dari setiap Rp 100 penjualan, kamu untung Rp ${profitMargin.toFixed(0)}. Cukup baik!`,
          icon: <Package size={20} />,
          metric: `${profitMargin.toFixed(0)}%`,
        });
      } else {
        insights.push({
          id: "5",
          type: "warning",
          title: "Keuntungan Rendah",
          description: `Dari setiap Rp 100 penjualan, kamu untung Rp ${profitMargin.toFixed(0)}. Coba naikkan harga atau hemat biaya.`,
          icon: <Package size={20} />,
          metric: `${profitMargin.toFixed(0)}%`,
        });
      }
    }

    return insights;
  }, [salesRecords, expenses, products, getMonthlyComparison]);

  // Generate simple recommendations
  const recommendations = useMemo(() => {
    const recs: string[] = [];

    const negativeInsights = insights.filter((i) => i.type === "warning");
    const noData = salesRecords.length === 0 && expenses.length === 0;

    if (noData) {
      recs.push("Mulai input data penjualan dan pengeluaran untuk melihat saran untuk kamu.");
      return recs;
    }

    if (negativeInsights.length > 0) {
      negativeInsights.forEach((insight) => {
        if (insight.title.includes("Habis")) {
          recs.push("Produk habis, segera pesan ulang atau ganti dengan alternatif lain.");
        } else if (insight.title.includes("Biaya")) {
          recs.push("Cek pengeluaran bulan ini, apakah ada yang bisa dihemat?");
        } else if (insight.title.includes("Keuntungan Rendah")) {
          recs.push("Keuntungan kecil, coba pertimbangkan naikkan harga jual atau hemat biaya.");
        } else if (insight.title.includes("Turun")) {
          recs.push("Penjualan turun, coba buat promosi atau tawarkan produk baru.");
        }
      });
    }

    const topProductInsight = insights.find((i) =>
      i.title.includes("Favorit")
    );
    if (topProductInsight && recs.length < 3) {
      recs.push("Produk favorit kamu laris, stok banyak-banyak supaya tidak kehabisan.");
    }

    if (recs.length === 0) {
      recs.push("Bisnis kamu berjalan baik! Terus jaga momentum dan konsistensi.");
    }

    return recs.slice(0, 3); // Show max 3 recommendations
  }, [insights, salesRecords, expenses]);

  // Get max 3 recommendations for simpler display
  const maxRecommendations = recommendations.slice(0, 3);

  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-2">
        {insights.slice(0, 2).map((insight) => (
          <div
            key={insight.id}
            className={`group rounded-2xl border p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
              insight.type === "positive"
                ? "border-emerald-100 bg-[linear-gradient(180deg,_#ffffff,_#f0fdf4)]"
                : insight.type === "warning"
                  ? "border-amber-100 bg-[linear-gradient(180deg,_#ffffff,_#fff7ed)]"
                  : "border-blue-100 bg-[linear-gradient(180deg,_#ffffff,_#eff6ff)]"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${
                  insight.type === "positive"
                    ? "border-emerald-100 bg-emerald-50 text-emerald-600"
                    : insight.type === "warning"
                      ? "border-amber-100 bg-amber-50 text-amber-600"
                      : "border-blue-100 bg-blue-50 text-blue-600"
                }`}
              >
                {insight.icon}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">{insight.title}</h3>
                  {insight.metric && (
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                        insight.type === "positive"
                          ? "bg-emerald-100 text-emerald-700"
                          : insight.type === "warning"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {insight.metric}
                    </span>
                  )}
                </div>
                <p className="mt-1.5 text-[13px] leading-relaxed text-slate-600">{insight.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {maxRecommendations.length > 0 && (
        <div className="rounded-[20px] border border-blue-100 bg-[linear-gradient(135deg,_rgba(239,246,255,0.6),_rgba(255,255,255,0.8))] p-4 shadow-sm mt-4">
          <div className="flex items-center gap-2.5 text-sm font-extrabold text-slate-900 mb-3.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-200">
              <AlertCircle size={18} />
            </span>
            Apa yang bisa kamu lakukan?
          </div>
          <div className="flex flex-col gap-2.5">
            {maxRecommendations.map((rec, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 rounded-[14px] border border-blue-50 bg-white px-4 py-3 text-[13px] font-medium leading-relaxed text-slate-700 shadow-[0_2px_10px_rgba(15,23,42,0.02)] transition hover:border-blue-200"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
