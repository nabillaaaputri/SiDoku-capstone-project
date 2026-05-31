import axios, { AxiosHeaders } from "axios";

const DEFAULT_API_BASE_URL = "https://sidoku.up.railway.app";
const ACCESS_TOKEN_KEY = "authToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

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

  if (typeof document !== "undefined") {
    document.cookie = `${ACCESS_TOKEN_KEY}=; path=/; max-age=0`;
    document.cookie = `${REFRESH_TOKEN_KEY}=; path=/; max-age=0`;
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("sidoku-auth-invalidated"));
  }
};

const getCookieValue = (name: string) => {
  if (typeof document === "undefined") {
    return null;
  }

  const cookieEntry = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${name}=`));

  if (!cookieEntry) {
    return null;
  }

  return decodeURIComponent(cookieEntry.slice(name.length + 1));
};

export const getStoredAuthToken = (key: typeof ACCESS_TOKEN_KEY | typeof REFRESH_TOKEN_KEY) => {
  const storedValue = localStorage.getItem(key);

  if (storedValue) {
    return storedValue;
  }

  return getCookieValue(key);
};

export const getStoredAccessToken = () => getStoredAuthToken(ACCESS_TOKEN_KEY);

export const getStoredRefreshToken = () => getStoredAuthToken(REFRESH_TOKEN_KEY);

export const persistAuthToken = (key: typeof ACCESS_TOKEN_KEY | typeof REFRESH_TOKEN_KEY, value: string) => {
  localStorage.setItem(key, value);

  if (typeof document !== "undefined") {
    document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=${AUTH_COOKIE_MAX_AGE}; samesite=lax`;
  }
};

const handleUnauthorizedError = (error: unknown) => {
  const status = axios.isAxiosError(error) ? error.response?.status : undefined;

  if (status === 401 || status === 403) {
    const requestUrl = axios.isAxiosError(error) ? error.config?.url || "" : "";

    if (
      !requestUrl.includes("/auth/login") &&
      !requestUrl.includes("/auth/register") &&
      !requestUrl.includes("/settings/password")
    ) {
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

const attachAuthHeader = (config: any) => {
  const token = getStoredAccessToken();

  if (!token) {
    return config;
  }

  config.headers = AxiosHeaders.from(config.headers);
  config.headers.set("Authorization", `Bearer ${token}`);

  return config;
};

apiClient.interceptors.request.use((config) => {
  const token = getStoredAccessToken();

  if (!token) {
    return config;
  }

  config.headers = AxiosHeaders.from(config.headers);
  config.headers.set("Authorization", `Bearer ${token}`);

  return config;
});

apiClient.interceptors.response.use((response) => response, handleUnauthorizedError);

authApiClient.interceptors.request.use((config) => {
  return attachAuthHeader(config);
});

authApiClient.interceptors.response.use((response) => response, handleUnauthorizedError);

export default apiClient;
export { authApiClient };