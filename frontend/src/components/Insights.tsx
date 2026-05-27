import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AlertCircle, Package, Star, TrendingDown, TrendingUp } from "lucide-react";
import apiClient from "@/services/api";
import { useBusinessContext } from "@/context";

interface AiApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

interface AiProductInsightItem {
  product_name: string;
  stok: number;
  predicted_demand_7d: number;
  status: "critical" | "normal" | "increasing" | "overstock";
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

const statusMeta: Record<
  AiProductInsightItem["status"],
  {
    type: InsightCard["type"];
    title: string;
    description: (item: AiProductInsightItem) => string;
    metric: (item: AiProductInsightItem) => string;
    icon: ReactNode;
  }
> = {
  critical: {
    type: "warning",
    title: "Stok Kritis",
    description: (item) =>
      `${item.product_name} diprediksi butuh ${item.predicted_demand_7d.toFixed(1)} unit dalam 7 hari ke depan, sementara stok sekarang tinggal ${item.stok}.`,
    metric: (item) => `-${Math.max(0, item.predicted_demand_7d - item.stok).toFixed(0)}`,
    icon: <AlertCircle size={20} />,
  },
  normal: {
    type: "neutral",
    title: "Stok Aman",
    description: (item) =>
      `${item.product_name} masih aman untuk 7 hari ke depan dengan stok ${item.stok} dan kebutuhan prediksi ${item.predicted_demand_7d.toFixed(1)} unit.`,
    metric: (item) => `${Math.max(0, item.stok - item.predicted_demand_7d).toFixed(0)}`,
    icon: <Package size={20} />,
  },
  increasing: {
    type: "positive",
    title: "Permintaan Naik",
    description: (item) =>
      `${item.product_name} menunjukkan tren permintaan naik dengan prediksi ${item.predicted_demand_7d.toFixed(1)} unit dalam 7 hari.`,
    metric: (item) => `+${item.predicted_demand_7d.toFixed(0)}`,
    icon: <TrendingUp size={20} />,
  },
  overstock: {
    type: "neutral",
    title: "Stok Berlebih",
    description: (item) =>
      `${item.product_name} diprediksi hanya terpakai ${item.predicted_demand_7d.toFixed(1)} unit dalam 7 hari, sementara stok saat ini ${item.stok}.`,
    metric: (item) => `+${Math.max(0, item.stok - item.predicted_demand_7d).toFixed(0)}`,
    icon: <TrendingDown size={20} />,
  },
};

const toRecommendationText = (item: AiRecommendationItem) => {
  if (item.status === "critical") {
    return `${item.product_name} perlu segera restock sekitar ${item.reorder_qty} unit agar tidak kehabisan stok.`;
  }

  if (item.status === "increasing") {
    return `${item.product_name} sedang naik, pertimbangkan tambah stok sekitar ${item.reorder_qty || Math.max(1, Math.ceil(item.predicted_demand_7d - item.current_stock))} unit.`;
  }

  if (item.status === "overstock") {
    return `${item.product_name} stoknya relatif aman/berlebih, fokuskan penjualan dulu sebelum restock.`;
  }

  return `${item.product_name} masih aman, pantau stok secara berkala dan pertahankan ritme penjualan.`;
};

export default function Insights() {
  const { products } = useBusinessContext();
  const [insightItems, setInsightItems] = useState<AiProductInsightItem[]>([]);
  const [recommendationItems, setRecommendationItems] = useState<AiRecommendationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const loadInsights = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [insightsResponse, recommendationsResponse] = await Promise.allSettled([
          apiClient.get<AiApiResponse<{ insights: AiProductInsightItem[] }>>("/ai/insights", {
            params: { historyDays: 60 },
          }),
          apiClient.get<AiApiResponse<{ recommendations: AiRecommendationItem[] }>>("/ai/recommendations", {
            params: { historyDays: 60 },
          }),
        ]);

        if (isCancelled) {
          return;
        }

        if (insightsResponse.status === "fulfilled") {
          setInsightItems(insightsResponse.value.data.data?.insights || []);
        } else {
          setInsightItems([]);
          setError(
            insightsResponse.reason?.response?.data?.message ||
              insightsResponse.reason?.message ||
              "Insight AI belum tersedia saat ini.",
          );
        }

        if (recommendationsResponse.status === "fulfilled") {
          setRecommendationItems(recommendationsResponse.value.data.data?.recommendations || []);
        } else {
          setRecommendationItems([]);
        }
      } catch (loadError) {
        if (!isCancelled) {
          setInsightItems([]);
          setRecommendationItems([]);
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Insight AI belum tersedia saat ini.",
          );
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
  }, [products]);

  const insights = useMemo<InsightCard[]>(() => {
    return insightItems.slice(0, 4).map((item, index) => {
      const meta = statusMeta[item.status];

      return {
        id: `${item.product_name}-${index}`,
        type: meta.type,
        title: meta.title,
        description: meta.description(item),
        metric: meta.metric(item),
        icon: meta.icon,
      };
    });
  }, [insightItems]);

  const recommendations = useMemo(() => {
    return recommendationItems.slice(0, 3).map(toRecommendationText);
  }, [recommendationItems]);

  const hasData = insights.length > 0;
  const hasRecommendations = recommendations.length > 0;

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="grid gap-3 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="h-11 w-11 shrink-0 rounded-2xl bg-slate-100 animate-pulse" />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="h-4 w-32 rounded-full bg-slate-100 animate-pulse" />
                  <div className="h-3 w-full rounded-full bg-slate-100 animate-pulse" />
                  <div className="h-3 w-4/5 rounded-full bg-slate-100 animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-[20px] border border-blue-100 bg-[linear-gradient(135deg,_rgba(239,246,255,0.6),_rgba(255,255,255,0.8))] p-4 shadow-sm mt-4">
          <div className="flex items-center gap-2.5 text-sm font-extrabold text-slate-900 mb-3.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-200">
              <AlertCircle size={18} />
            </span>
            Apa yang bisa kamu lakukan?
          </div>
          <div className="flex flex-col gap-2.5">
            {Array.from({ length: 2 }).map((_, index) => (
              <div
                key={index}
                className="h-12 rounded-[14px] border border-blue-50 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.02)] animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-2">
        {hasData ? (
          insights.map((insight) => (
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
          ))
        ) : (
          <div className="md:col-span-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-6 py-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-3">
              <AlertCircle size={24} />
            </div>
            <p className="text-sm font-semibold text-slate-900">Belum ada insight AI</p>
            <p className="text-sm text-slate-500 mt-1">
              {error || "Coba lagi beberapa saat setelah data sinkron dengan backend."}
            </p>
          </div>
        )}
      </div>

      <div className="rounded-[20px] border border-blue-100 bg-[linear-gradient(135deg,_rgba(239,246,255,0.6),_rgba(255,255,255,0.8))] p-4 shadow-sm mt-4">
        <div className="flex items-center gap-2.5 text-sm font-extrabold text-slate-900 mb-3.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-200">
            <Star size={18} />
          </span>
          Apa yang bisa kamu lakukan?
        </div>

        {hasRecommendations ? (
          <div className="flex flex-col gap-2.5">
            {recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 rounded-[14px] border border-blue-50 bg-white px-4 py-3 text-[13px] font-medium leading-relaxed text-slate-700 shadow-[0_2px_10px_rgba(15,23,42,0.02)] transition hover:border-blue-200"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                <span>{rec}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[14px] border border-blue-50 bg-white px-4 py-3 text-[13px] font-medium leading-relaxed text-slate-700 shadow-[0_2px_10px_rgba(15,23,42,0.02)]">
            {error ? "Rekomendasi AI belum tersedia saat ini." : "Belum ada rekomendasi dari AI untuk ditampilkan."}
          </div>
        )}
      </div>
    </div>
  );
}