import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/v1";

const AUTH_API_URL =
  import.meta.env.VITE_AUTH_API_URL || import.meta.env.VITE_API_URL || "http://localhost:5000/v1";

console.log("API URL:", API_BASE_URL);
console.log("AUTH API URL:", AUTH_API_URL);

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
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

authApiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default apiClient;
export { authApiClient };