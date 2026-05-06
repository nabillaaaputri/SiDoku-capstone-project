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
      const changePercent = ((incomeChange / previous.totalIncome) * 100).toFixed(1);
      insights.push({
        id: "1",
        type: "positive",
        title: "Penjualan Naik",
        description: `Penjualan bulan ini naik ${changePercent}%. Kerja keras kamu terbayar!`,
        icon: <TrendingUp size={20} />,
        metric: `+${changePercent}%`,
      });
    } else if (incomeChange < 0) {
      const changePercent = ((Math.abs(incomeChange) / previous.totalIncome) * 100).toFixed(1);
      insights.push({
        id: "1",
        type: "warning",
        title: "Penjualan Turun",
        description: `Penjualan bulan ini turun ${changePercent}%. Coba tambah promosi atau variasi produk.`,
        icon: <TrendingDown size={20} />,
        metric: `-${changePercent}%`,
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

    // 2. Expense Insight
    const expenseChange = current.totalExpense - previous.totalExpense;
    if (expenseChange > 0) {
      const changePercent = ((expenseChange / previous.totalExpense) * 100).toFixed(1);
      insights.push({
        id: "2",
        type: "warning",
        title: "Biaya Operasional Naik",
        description: `Biaya bulan ini ${changePercent}% lebih tinggi. Cek apakah ada pengeluaran yang tidak perlu.`,
        icon: <TrendingDown size={20} />,
        metric: `+${changePercent}%`,
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
    <div className="space-y-4">
      {/* Key Insights (max 2-3) - 1 per row on mobile, responsive on larger screens */}
      <div className="space-y-2 sm:space-y-3 w-full">
        {insights.slice(0, 3).map((insight) => (
          <div
            key={insight.id}
            className={`border-3 p-2 sm:p-3 md:p-4 rounded flex gap-2 sm:gap-3 w-full min-w-0 ${
              insight.type === "positive"
                ? "border-green-500 bg-green-50"
                : insight.type === "warning"
                  ? "border-orange-500 bg-orange-50"
                  : "border-blue-500 bg-blue-50"
            }`}
          >
            <div className="flex-shrink-0 text-lg sm:text-xl md:text-2xl leading-none pt-0.5">{insight.type === "positive" ? "📈" : insight.type === "warning" ? "⚠️" : "ℹ️"}</div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-xs sm:text-sm leading-tight break-words">{insight.title}</h3>
              <p className="text-xs text-gray-700 mt-1 leading-tight break-words">{insight.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Simple Tips Section */}
      {maxRecommendations.length > 0 && (
        <div className="border-3 border-yellow-500 bg-yellow-50 p-2 sm:p-3 md:p-4 rounded w-full min-w-0">
          <p className="font-bold text-xs sm:text-sm mb-2">💡 Apa yang bisa kamu lakukan?</p>
          <ul className="text-xs space-y-1 text-gray-700">
            {maxRecommendations.map((rec, idx) => (
              <li key={idx} className="flex gap-2 leading-tight min-w-0">
                <span className="flex-shrink-0">•</span>
                <span className="break-words">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
