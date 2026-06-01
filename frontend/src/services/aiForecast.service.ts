import axios from "axios";

import apiClient from "./api";

interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

interface BackendForecastPoint {
  date: string;
  predicted_qty: number;
}

interface BackendForecastResponse {
  productId: string;
  product_name: string;
  predictions: BackendForecastPoint[];
}

export interface SalesForecastPoint {
  date: string;
  predictedQty: number | null;
}

export interface SalesForecastResult {
  productId: string;
  productName: string;
  predictions: SalesForecastPoint[];
}

export interface SalesForecastOptions {
  daysAhead?: number;
  historyDays?: number;
}

export const getSalesForecast = async (
  productId: string,
  options: SalesForecastOptions = {},
): Promise<SalesForecastResult> => {
  const params = new URLSearchParams();

  if (options.daysAhead) {
    params.set("daysAhead", String(options.daysAhead));
  }

  if (options.historyDays) {
    params.set("historyDays", String(options.historyDays));
  }

  const queryString = params.toString();
  const response = await apiClient.get<ApiResponse<BackendForecastResponse>>(
    `/ai/forecast/${productId}${queryString ? `?${queryString}` : ""}`,
  );

  const forecast = response.data.data;

  return {
    productId: forecast.productId || productId,
    productName: forecast.product_name,
    predictions: (forecast.predictions || []).map((point) => ({
      date: point.date,
      predictedQty:
        point.predicted_qty === null || point.predicted_qty === undefined
          ? null
          : Number(point.predicted_qty),
    })),
  };
};

export const getAiForecastErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data as
      | {
          message?: unknown;
          data?: { message?: unknown };
          error?: unknown;
          detail?: unknown;
        }
      | undefined;

    const candidates = [
      responseData?.message,
      responseData?.detail,
      responseData?.data?.message,
      responseData?.error,
      error.message,
    ];

    const message = candidates.find(
      (value) => typeof value === "string" && value.trim().length > 0,
    );

    if (typeof message === "string") {
      return message;
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return "Prediksi tren penjualan belum tersedia saat ini.";
};