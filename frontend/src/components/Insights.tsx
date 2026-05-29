import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AlertCircle, BarChart3, Package, Star } from "lucide-react";
import apiClient from "@/services/api";
import { useBusinessContext } from "@/context";
import { formatRupiahCompact } from "@/lib/utils";

interface AiApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

interface AiRecommendationItem {
  product_name: string;
  current_stock: number;
  predicted_demand_7d: number;
  reorder_qty: number;
  status: "critical" | "normal" | "increasing" | "overstock";
}

interface InsightCard {
  id: string;
  type: "positive" | "warning" | "neutral";
  title: string;
  description: string;
  metric?: string;
  icon: ReactNode;
}

interface ProductSalesAggregate {
  productId: string;
  productName: string;
  totalQuantity: number;
  totalRevenue: number;
}

interface RestockInsightCard {
  id: string;
  productName: string;
  currentStock: number;
  predictedDemand: number;
  reorderQty: number;
  status: AiRecommendationItem["status"];
}

const formatQuantity = (value: number) => `${Math.max(0, Math.round(value))} unit`;

const formatPercentChange = (value: number) => {
  const rounded = Math.abs(value).toFixed(1).replace(/\.0$/, "");
  const prefix = value > 0 ? "+" : value < 0 ? "-" : "";
  return `${prefix}${rounded}%`;
};

const getRangeTotals = (
  salesRecords: { date: Date; totalAmount: number; quantity: number }[],
  startDate: Date,
  endDate: Date,
) => {
  return salesRecords.reduce(
    (accumulator, record) => {
      const recordDate = record.date instanceof Date ? record.date : new Date(record.date);

      if (recordDate < startDate || recordDate > endDate) {
        return accumulator;
      }

      return {
        totalAmount: accumulator.totalAmount + (Number(record.totalAmount) || 0),
        totalQuantity: accumulator.totalQuantity + (Number(record.quantity) || 0),
        totalTransactions: accumulator.totalTransactions + 1,
      };
    },
    { totalAmount: 0, totalQuantity: 0, totalTransactions: 0 },
  );
};

export default function Insights() {
  const { products, salesRecords, isLoading: isBusinessLoading } = useBusinessContext();
  const [recommendationItems, setRecommendationItems] = useState<AiRecommendationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isSectionLoading = isLoading || isBusinessLoading;

  const activeProducts = useMemo(
    () => products.filter((product) => product.archived !== true),
    [products],
  );
  const activeProductIdSet = useMemo(
    () => new Set(activeProducts.map((product) => product.id)),
    [activeProducts],
  );
  const activeProductNameSet = useMemo(
    () => new Set(activeProducts.map((product) => product.name.toLowerCase())),
    [activeProducts],
  );

  useEffect(() => {
    let isCancelled = false;

    const loadInsights = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const recommendationsResponse = await apiClient.get<AiApiResponse<{ recommendations: AiRecommendationItem[] }>>(
          "/ai/recommendations",
          {
            params: { historyDays: 60 },
          },
        );

        if (isCancelled) {
          return;
        }

        setRecommendationItems(recommendationsResponse.data.data?.recommendations || []);
      } catch (loadError) {
        if (!isCancelled) {
          setRecommendationItems([]);
          setError(loadError instanceof Error ? loadError.message : "Insight AI belum tersedia saat ini.");
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadInsights();

    return () => {
      isCancelled = true;
    };
  }, []);

  const salesAggregates = useMemo<ProductSalesAggregate[]>(() => {
    const aggregates = new Map<string, ProductSalesAggregate>();

    for (const record of salesRecords.filter((item) => activeProductIdSet.has(item.productId))) {
      const existing = aggregates.get(record.productId);

      if (existing) {
        existing.totalQuantity += Number(record.quantity) || 0;
        existing.totalRevenue += Number(record.totalAmount) || 0;
        continue;
      }

      aggregates.set(record.productId, {
        productId: record.productId,
        productName: record.productName || "Produk tanpa nama",
        totalQuantity: Number(record.quantity) || 0,
        totalRevenue: Number(record.totalAmount) || 0,
      });
    }

    return Array.from(aggregates.values()).sort((a, b) => {
      if (b.totalQuantity !== a.totalQuantity) {
        return b.totalQuantity - a.totalQuantity;
      }

      return b.totalRevenue - a.totalRevenue;
    });
  }, [activeProductIdSet, salesRecords]);

  const topSellerCard = useMemo<InsightCard | null>(() => {
    const topSeller = salesAggregates[0];

    if (!topSeller) {
      return null;
    }

    return {
      id: `top-seller-${topSeller.productId}`,
      type: "positive",
      title: "Produk Paling Laris",
      description: `${topSeller.productName} memimpin penjualan dengan ${formatQuantity(topSeller.totalQuantity)} dan omzet ${formatRupiahCompact(topSeller.totalRevenue)}.`,
      metric: formatQuantity(topSeller.totalQuantity),
      icon: <Star size={20} />,
    };
  }, [salesAggregates]);

  const restockCards = useMemo<RestockInsightCard[]>(() => {
    return [...recommendationItems]
      .filter((item) => activeProductNameSet.has(item.product_name.toLowerCase()))
      .sort((a, b) => {
        const statusPriority = (status: AiRecommendationItem["status"]) => {
          if (status === "critical") return 0;
          if (status === "increasing") return 1;
          if (status === "normal") return 2;
          return 3;
        };

        const priorityDiff = statusPriority(a.status) - statusPriority(b.status);

        if (priorityDiff !== 0) {
          return priorityDiff;
        }

        return b.reorder_qty - a.reorder_qty;
      })
      .slice(0, 2)
      .map((item, index) => ({
        id: `restock-${item.product_name}-${index}`,
        productName: item.product_name,
        currentStock: Number(item.current_stock) || 0,
        predictedDemand: Number(item.predicted_demand_7d) || 0,
        reorderQty: Number(item.reorder_qty) || 0,
        status: item.status,
      }));
  }, [activeProductNameSet, recommendationItems]);

  const restockCard = useMemo<InsightCard | null>(() => {
    const restock = restockCards[0];

    if (!restock) {
      return null;
    }

    const isCritical = restock.status === "critical";
    const isIncreasing = restock.status === "increasing";

    return {
      id: restock.id,
      type: isCritical ? "warning" : isIncreasing ? "positive" : "neutral",
      title: "Restok Prioritas",
      description: isCritical
        ? `${restock.productName} perlu restock sekitar ${formatQuantity(restock.reorderQty)} agar tidak kehabisan stok.`
        : `${restock.productName} disarankan tambah ${formatQuantity(restock.reorderQty)} berdasarkan stok ${formatQuantity(restock.currentStock)} dan prediksi ${formatQuantity(restock.predictedDemand)}.`,
      metric: formatQuantity(restock.reorderQty),
      icon: <Package size={20} />,
    };
  }, [restockCards]);

  const performanceCard = useMemo<InsightCard | null>(() => {
    const now = new Date();
    const currentWeekEnd = new Date(now);
    currentWeekEnd.setHours(23, 59, 59, 999);
    const currentWeekStart = new Date(now);
    currentWeekStart.setDate(currentWeekStart.getDate() - 6);
    currentWeekStart.setHours(0, 0, 0, 0);

    const previousWeekEnd = new Date(currentWeekStart);
    previousWeekEnd.setDate(previousWeekEnd.getDate() - 1);
    previousWeekEnd.setHours(23, 59, 59, 999);

    const previousWeekStart = new Date(previousWeekEnd);
    previousWeekStart.setDate(previousWeekStart.getDate() - 6);
    previousWeekStart.setHours(0, 0, 0, 0);

    const activeSalesRecords = salesRecords.filter((item) => activeProductIdSet.has(item.productId));
    const currentWeekTotals = getRangeTotals(activeSalesRecords, currentWeekStart, currentWeekEnd);
    const previousWeekTotals = getRangeTotals(activeSalesRecords, previousWeekStart, previousWeekEnd);
    const difference = currentWeekTotals.totalAmount - previousWeekTotals.totalAmount;
    const percentChange = previousWeekTotals.totalAmount > 0
      ? (difference / previousWeekTotals.totalAmount) * 100
      : currentWeekTotals.totalAmount > 0
        ? 100
        : 0;
    const isStable = Math.abs(percentChange) < 5;
    const status = isStable ? "Stabil" : difference > 0 ? "Naik" : difference < 0 ? "Turun" : "Stabil";
    const paceLabel = status === "Naik" ? "sedang laris" : status === "Turun" ? "sedang sepi" : "relatif stabil";

    return {
      id: "sales-performance-summary",
      type: isStable ? "neutral" : difference > 0 ? "positive" : "warning",
      title: "Rangkuman Performa Penjualan",
      description: `Minggu ini ${formatRupiahCompact(currentWeekTotals.totalAmount)} dari ${currentWeekTotals.totalTransactions} catatan penjualan, dibanding ${formatRupiahCompact(previousWeekTotals.totalAmount)} pada minggu sebelumnya. Performa ${status.toLowerCase()} dan penjualan ${paceLabel}.`,
      metric: `${status} ${formatPercentChange(percentChange)}`.trim(),
      icon: <BarChart3 size={20} />,
    };
  }, [activeProductIdSet, salesRecords]);

  const insightCards = useMemo(() => {
    return [topSellerCard, restockCard, performanceCard].filter(
      (card): card is InsightCard => Boolean(card),
    );
  }, [performanceCard, restockCard, topSellerCard]);

  const hasData = insightCards.length > 0;

  if (isSectionLoading) {
    return (
      <div className="space-y-2.5 sm:space-y-3">
        <div className="space-y-2.5 sm:space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-start gap-2.5 rounded-2xl border border-slate-200 bg-white px-3 py-3 shadow-sm sm:items-center sm:gap-3 sm:px-4">
              <div className="h-10 w-10 shrink-0 rounded-2xl bg-slate-100 animate-pulse sm:h-11 sm:w-11" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-4 w-28 rounded-full bg-slate-100 animate-pulse sm:w-32" />
                <div className="h-3 w-full rounded-full bg-slate-100 animate-pulse" />
                <div className="h-3 w-4/5 rounded-full bg-slate-100 animate-pulse" />
              </div>
              <div className="h-6 w-12 shrink-0 rounded-full bg-slate-100 animate-pulse sm:w-14" />
            </div>
          ))}
        </div>

        <div className="rounded-[20px] border border-blue-100 bg-[linear-gradient(135deg,_rgba(239,246,255,0.6),_rgba(255,255,255,0.8))] p-3.5 shadow-sm mt-3 sm:p-4 sm:mt-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-extrabold text-slate-900 sm:gap-2.5 sm:mb-3.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-200 sm:h-9 sm:w-9">
              <AlertCircle size={16} className="sm:h-[18px] sm:w-[18px]" />
            </span>
            Apa yang bisa kamu lakukan?
          </div>
          <div className="flex flex-col gap-2">
            {Array.from({ length: 2 }).map((_, index) => (
              <div
                key={index}
                className="h-10 rounded-[14px] border border-blue-50 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.02)] animate-pulse sm:h-12"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2.5 sm:space-y-3">
      <div className="space-y-2.5 sm:space-y-3">
        {hasData ? (
          insightCards.slice(0, 3).map((insight) => (
            <div
              key={insight.id}
              className={`group flex w-full items-start gap-2.5 rounded-2xl border p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:gap-3 sm:p-4 ${
                insight.type === "positive"
                  ? "border-emerald-100 bg-[linear-gradient(180deg,_#ffffff,_#f0fdf4)]"
                  : insight.type === "warning"
                    ? "border-amber-100 bg-[linear-gradient(180deg,_#ffffff,_#fff7ed)]"
                    : "border-blue-100 bg-[linear-gradient(180deg,_#ffffff,_#eff6ff)]"
              }`}
            >
              <div
                className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border sm:h-11 sm:w-11 ${
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
                <div className="flex items-start justify-between gap-2.5 sm:gap-3">
                  <div className="min-w-0">
                    <h3 className="text-[13px] font-bold leading-tight text-slate-900 sm:text-sm">{insight.title}</h3>
                    <p className="mt-1 text-[12px] leading-relaxed text-slate-600 sm:mt-1.5 sm:text-[13px]">
                      {insight.description}
                    </p>
                  </div>
                  {insight.metric && (
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold sm:px-2.5 sm:py-1 sm:text-[11px] ${
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
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-6 py-10 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <AlertCircle size={24} />
            </div>
            <p className="text-sm font-semibold text-slate-900">Belum ada insight AI</p>
            <p className="mt-1 text-sm text-slate-500">
              {error || "Coba lagi beberapa saat setelah data sinkron dengan backend."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}