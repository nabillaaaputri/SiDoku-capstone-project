import axios, { AxiosHeaders } from "axios";

const DEFAULT_API_BASE_URL = "https://sidoku.up.railway.app";

const normalizeBaseUrl = (value?: string) => {
  const trimmedValue = value?.trim().replace(/\/$/, "");

  if (!trimmedValue) {
    return `${DEFAULT_API_BASE_URL}/v1`;
  }

  return trimmedValue.endsWith("/v1") ? trimmedValue : `${trimmedValue}/v1`;
};

const API_BASE_URL = normalizeBaseUrl(import.meta.env.VITE_API_URL);
const AUTH_API_URL = normalizeBaseUrl(
  import.meta.env.VITE_AUTH_API_URL || import.meta.env.VITE_API_URL,
);

export const clearStoredAuthTokens = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("refreshToken");
};

const handleUnauthorizedError = (error: unknown) => {
  if (axios.isAxiosError(error) && error.response?.status === 401) {
    const requestUrl = error.config?.url || "";

    if (!requestUrl.includes("/auth/login") && !requestUrl.includes("/auth/register")) {
      clearStoredAuthTokens();
    }
  }

  return Promise.reject(error);
};

// Client untuk endpoint utama (products, dashboard, stok, pengeluaran, rekap)
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Client khusus untuk auth (login, register, logout)
const authApiClient = axios.create({
  baseURL: AUTH_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");

  if (token) {
    config.headers = config.headers ?? new AxiosHeaders();
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use((response) => response, handleUnauthorizedError);

authApiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");

  if (token) {
    config.headers = config.headers ?? new AxiosHeaders();
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

authApiClient.interceptors.response.use((response) => response, handleUnauthorizedError);

export default apiClient;
export { authApiClient };