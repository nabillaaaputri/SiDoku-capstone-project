import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import axios from "axios";
import apiClient from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import {
  Product,
  SalesRecord,
  Expense,
  BusinessSummary,
  StockIn,
  StockOut,
  DailySalesRecapSummary,
  DailySalesRecapDetail,
} from "@/types";
import { toSafeDate } from "@/lib/timezone";

const STOCK_OUT_ENDPOINTS = ["/stocks-out", "/stock-out"];

interface BackendResponse<T> {
  status: string;
  message: string;
  data: T;
}

interface BackendProduct {
  id: string;
  productName: string;
  category: string;
  unit: string;
  purchasePrice: number;
  sellingPrice: number;
  margin: number;
  stock: number;
  minimumStock: number;
  stockStatus: "low" | "safe";
  isArchived: boolean;
}

interface BackendExpense {
  id: string;
  date: string;
  created_at?: string;
  expenseName: string;
  category: "restock" | "operational" | "others";
  amount: number;
  description?: string;
}

interface BackendStockIn {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  date: string;
  created_at?: string;
  note?: string;
  currentStock: number;
}

interface BackendStockOut {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  date: string;
  time?: string;
  created_at?: string;
  note?: string;
  currentStock: number;
}

interface BusinessContextType {
  products: Product[];
  addProduct: (product: Omit<Product, "id" | "createdAt">) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  archiveProduct: (id: string) => Promise<void>;
  restoreProduct: (id: string) => Promise<void>;
  getProductById: (id: string) => Product | undefined;

  salesRecords: SalesRecord[];
  addSalesRecord: (salesRecord: Omit<SalesRecord, "id">) => Promise<void>;
  deleteSalesRecord: (id: string) => Promise<void>;
  getSalesRecordsByDateRange: (startDate: Date, endDate: Date) => SalesRecord[];

  expenses: Expense[];
  addExpense: (expense: Omit<Expense, "id">) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  getExpensesByDateRange: (startDate: Date, endDate: Date) => Expense[];
  getExpensesByCategory: (category: string) => Expense[];

  stockIns: StockIn[];
  stockOuts: StockOut[];
  addStockIn: (stockIn: Omit<StockIn, "id" | "createdAt">) => Promise<void>;
  addStockOut: (stockOut: Omit<StockOut, "id" | "createdAt">) => Promise<void>;
  deleteStockIn: (id: string) => Promise<void>;
  deleteStockOut: (id: string) => Promise<void>;
  getStockInByDate: (date: Date) => StockIn[];
  getStockOutByDate: (date: Date) => StockOut[];

  getSummary: (startDate?: Date, endDate?: Date) => BusinessSummary;
  getSummaryByMonth: (year: number, month: number) => BusinessSummary;
  getMonthlyComparison: (
    currentMonth: number,
    currentYear: number,
  ) => { current: BusinessSummary; previous: BusinessSummary; change: number };

  getDailySalesRecap: (date: Date) => DailySalesRecapSummary;
  getDailySalesRecapByDateRange: (startDate: Date, endDate: Date) => DailySalesRecapSummary[];
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

// ─── Helpers ────────────────────────────────────────────────────────────────

const mapProductResponse = (product: BackendProduct): Product => ({
  id: product.id,
  name: product.productName,
  costPrice: Number(product.purchasePrice),
  sellPrice: Number(product.sellingPrice),
  margin: Number(product.margin),
  stock: Number(product.stock),
  minimumStock: Number(product.minimumStock),
  category: product.category,
  unit: product.unit,
  archived: product.isArchived,
  createdAt: new Date(),
});

const mapUiCategoryToBackend = (category: string) => {
  if (category === "operasional") return "operational";
  if (category === "lain-lain") return "others";
  return category;
};

const mapBackendCategoryToUi = (category: string) => {
  if (category === "operational") return "operasional";
  if (category === "others") return "lain-lain";
  return category;
};

/**
 * Cek apakah string dari backend hanya berisi tanggal (YYYY-MM-DD)
 * tanpa informasi jam. Kalau iya, parsing-nya tidak valid untuk jam.
 */
const isDateOnly = (value: string): boolean => /^\d{4}-\d{2}-\d{2}$/.test(value.trim());

/**
 * Ambil createdAt yang valid dari backend.
 * Kembalikan null kalau tidak ada atau hanya format tanggal.
 */
const parseBackendCreatedAt = (raw: string | undefined): Date | null => {
  if (!raw || isDateOnly(raw)) return null;
  return toSafeDate(raw) || null;
};

const mapExpenseResponse = (expense: BackendExpense, knownCreatedAt?: Date): Expense => ({
  id: expense.id,
  name: expense.expenseName,
  amount: Number(expense.amount),
  category: mapBackendCategoryToUi(expense.category) as Expense["category"],
  date: toSafeDate(expense.date) || new Date(),
  description: expense.description || undefined,
  // Pakai knownCreatedAt kalau ada, lalu coba dari backend, fallback ke date
  createdAt: knownCreatedAt
    ?? parseBackendCreatedAt(expense.created_at)
    ?? toSafeDate(expense.date)
    ?? new Date(),
});

const mapStockInResponse = (stockIn: BackendStockIn, knownCreatedAt?: Date): StockIn => {
  // Mengonversi string tanggal dari backend menjadi objek Date yang valid
  const fallbackDate = toSafeDate(stockIn.date) || new Date();

  return {
    id: stockIn.id,
    productId: stockIn.productId,
    productName: stockIn.productName,
    quantity: Number(stockIn.quantity),
    date: fallbackDate,
    // Kunci jam: utamakan waktu lokal saat klik, lalu backend created_at, 
    // jika keduanya tidak ada, fallback ke jam asli yang melekat di data 'date'
    createdAt: knownCreatedAt
      ?? parseBackendCreatedAt(stockIn.created_at)
      ?? fallbackDate, 
    notes: stockIn.note || undefined,
  };
};

const mapStockOutResponse = (stockOut: BackendStockOut, knownCreatedAt?: Date): StockOut => {
  // Mengonversi string tanggal dari backend menjadi objek Date yang valid
  const fallbackDate = toSafeDate(stockOut.date) || new Date();

  const fromBackend =
    parseBackendCreatedAt(stockOut.created_at) ||
    (stockOut.time && stockOut.time !== "00:00:00"
      ? toSafeDate(`${stockOut.date}T${stockOut.time}`)
      : null);

  return {
    id: stockOut.id,
    productId: stockOut.productId,
    productName: stockOut.productName,
    quantity: Number(stockOut.quantity),
    date: fallbackDate,
    // Jika backend tidak melempar info jam di 'created_at', gunakan 'fallbackDate' (jam dari properti date asli)
    createdAt: knownCreatedAt ?? fromBackend ?? fallbackDate,
    notes: stockOut.note || undefined,
  };
};

const toApiDateTime = (date: Date) => date.toISOString();

const toApiDate = (date: Date) => {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().split("T")[0];
};

const isNotFoundError = (error: unknown) => {
  if (!axios.isAxiosError(error)) return false;
  return error.response?.status === 404;
};

const requestStockOut = async <T,>(request: (path: string) => Promise<T>) => {
  let lastError: unknown = null;
  for (const endpoint of STOCK_OUT_ENDPOINTS) {
    try {
      return await request(endpoint);
    } catch (error) {
      lastError = error;
      if (!isNotFoundError(error)) throw error;
    }
  }
  throw lastError;
};

const buildSalesRecords = (products: Product[], stockOuts: StockOut[]): SalesRecord[] =>
  stockOuts.map((stockOut) => {
    const product = products.find((item) => item.id === stockOut.productId);
    const sellPrice = product?.sellPrice ?? 0;
    return {
      id: stockOut.id,
      productId: stockOut.productId,
      productName: stockOut.productName || product?.name || "",
      quantity: Number(stockOut.quantity),
      sellPrice,
      totalAmount: sellPrice * Number(stockOut.quantity),
      date: new Date(stockOut.date),
    };
  });

const buildDailyRecap = (
  date: Date,
  products: Product[],
  salesRecords: SalesRecord[],
  expenses: Expense[],
  stockIns: StockIn[],
  stockOuts: StockOut[],
): DailySalesRecapSummary => {
  const dateKey = toApiDate(date);
  const dailySalesRecords = salesRecords.filter((r) => toApiDate(new Date(r.date)) === dateKey);
  const dailyStockIns = stockIns.filter((s) => toApiDate(new Date(s.date)) === dateKey);
  const dailyStockOuts = stockOuts.filter((s) => toApiDate(new Date(s.date)) === dateKey);
  const dailyExpenses = expenses.filter((e) => toApiDate(new Date(e.date)) === dateKey);

  const recapByProduct = new Map<string, DailySalesRecapDetail>();
  products.forEach((product) => {
    const productSalesRecords = dailySalesRecords.filter((r) => r.productId === product.id);
    const productStockIns = dailyStockIns.filter((s) => s.productId === product.id);
    const productStockOuts = dailyStockOuts.filter((s) => s.productId === product.id);

    const stokMasuk = productStockIns.reduce((sum, item) => sum + item.quantity, 0);
    const stokKeluar = productStockOuts.reduce((sum, item) => sum + item.quantity, 0);
    const stokAkhir = product.stock;
    const terjualDariCatatan = productSalesRecords.reduce((sum, item) => sum + item.quantity, 0);
    const stokAwal = Math.max(0, stokAkhir + stokKeluar + terjualDariCatatan - stokMasuk);
    const terjual = Math.max(0, stokAwal + stokMasuk - stokAkhir);

    if (terjual > 0 || stokMasuk > 0 || stokKeluar > 0) {
      recapByProduct.set(product.id, {
        productId: product.id,
        productName: product.name,
        stokAwal,
        stokMasuk,
        stokKeluar,
        stokAkhir,
        terjual,
        hargaJual: product.sellPrice,
        hargaModal: product.costPrice,
        nilaiPenjualan: terjual * product.sellPrice,
        hppTerpakai: terjual * product.costPrice,
      });
    }
  });

  const details = Array.from(recapByProduct.values());
  const totalUangMasuk = dailySalesRecords.reduce((sum, r) => sum + r.totalAmount, 0);
  const totalUangKeluar = dailyExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalTerjual = dailySalesRecords.reduce((sum, r) => sum + r.quantity, 0);
  const totalNilaiPenjualan = details.reduce((sum, item) => sum + item.nilaiPenjualan, 0);
  const totalHppTerpakai = details.reduce((sum, item) => sum + item.hppTerpakai, 0);
  const labaKotor = totalUangMasuk - totalHppTerpakai;
  const labaBersih = labaKotor - totalUangKeluar;

  return {
    date,
    details: details.sort((a, b) => a.productName.localeCompare(b.productName)),
    totalUangMasuk,
    totalUangKeluar,
    totalTerjual,
    totalNilaiPenjualan,
    totalHppTerpakai,
    labaKotor,
    labaBersih,
    isComplete: details.length > 0,
  };
};

// ─── Provider ───────────────────────────────────────────────────────────────

export function BusinessProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [salesRecords, setSalesRecords] = useState<SalesRecord[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [stockIns, setStockIns] = useState<StockIn[]>([]);
  const [stockOuts, setStockOuts] = useState<StockOut[]>([]);

  // Simpan createdAt yang sudah kita tahu (dari waktu user klik simpan)
  // supaya refreshData tidak menimpa jam yang benar dengan new Date()
  const knownStockInCreatedAt = useRef<Map<string, Date>>(new Map());
  const knownStockOutCreatedAt = useRef<Map<string, Date>>(new Map());
  const knownExpenseCreatedAt = useRef<Map<string, Date>>(new Map());

  const resetBusinessState = () => {
    setProducts([]);
    setSalesRecords([]);
    setExpenses([]);
    setStockIns([]);
    setStockOuts([]);
    knownStockInCreatedAt.current.clear();
    knownStockOutCreatedAt.current.clear();
    knownExpenseCreatedAt.current.clear();
  };

  const refreshData = async () => {
    try {
      const [productsResult, expensesResult, stockInsResult, stockOutsResult] =
        await Promise.allSettled([
          apiClient.get<BackendResponse<BackendProduct[]>>("/products"),
          apiClient.get<BackendResponse<{ summary: unknown; records: BackendExpense[] }>>("/expenses"),
          apiClient.get<BackendResponse<BackendStockIn[]>>("/stocks-in"),
          requestStockOut((endpoint) =>
            apiClient.get<BackendResponse<{ totalStockOut: number; records: BackendStockOut[] }>>(endpoint),
          ),
        ]);

      if (productsResult.status === "fulfilled") {
        setProducts(productsResult.value.data.data.map(mapProductResponse));
      }
      if (expensesResult.status === "fulfilled") {
        setExpenses(
          expensesResult.value.data.data.records.map((e) =>
            // Gunakan jam yang kita simpan kalau ada, supaya tidak berubah saat refresh
            mapExpenseResponse(e, knownExpenseCreatedAt.current.get(e.id)),
          ),
        );
      }
      if (stockInsResult.status === "fulfilled") {
        setStockIns(
          stockInsResult.value.data.data.map((s) =>
            mapStockInResponse(s, knownStockInCreatedAt.current.get(s.id)),
          ),
        );
      }
      if (stockOutsResult.status === "fulfilled") {
        setStockOuts(
          stockOutsResult.value.data.data.records.map((s) =>
            mapStockOutResponse(s, knownStockOutCreatedAt.current.get(s.id)),
          ),
        );
      }
    } catch (error) {
      console.error("Failed to load business data:", error);
    }
  };

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      resetBusinessState();
      return;
    }
    resetBusinessState();
    refreshData();
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    setSalesRecords(buildSalesRecords(products, stockOuts));
  }, [products, stockOuts]);

  const getProductById = (id: string) => products.find((p) => p.id === id);

  const addProduct = async (product: Omit<Product, "id" | "createdAt">) => {
    const response = await apiClient.post<BackendResponse<BackendProduct>>("/products", {
      productName: product.name,
      purchasePrice: product.costPrice,
      sellingPrice: product.sellPrice,
      minimumStock: product.minimumStock,
      category: product.category,
      unit: product.unit,
      initialStock: product.stock,
    });
    setProducts((current) => [...current, mapProductResponse(response.data.data)]);
  };

  const updateProduct = async (id: string, updatedData: Partial<Product>) => {
    const currentProduct = getProductById(id);
    if (!currentProduct) return;
    const response = await apiClient.put<BackendResponse<BackendProduct>>(`/products/${id}`, {
      productName: updatedData.name ?? currentProduct.name,
      purchasePrice: updatedData.costPrice ?? currentProduct.costPrice,
      sellingPrice: updatedData.sellPrice ?? currentProduct.sellPrice,
      minimumStock: updatedData.minimumStock ?? currentProduct.minimumStock,
      category: updatedData.category ?? currentProduct.category,
      unit: updatedData.unit ?? currentProduct.unit,
    });
    setProducts((current) =>
      current.map((p) => (p.id === id ? mapProductResponse(response.data.data) : p)),
    );
  };

  const archiveProduct = async (id: string) => {
    const response = await apiClient.patch<BackendResponse<BackendProduct>>(`/products/${id}/archive`);
    setProducts((current) =>
      current.map((p) => (p.id === id ? mapProductResponse(response.data.data) : p)),
    );
    await refreshData();
  };

  const restoreProduct = async (id: string) => {
    const response = await apiClient.patch<BackendResponse<BackendProduct>>(`/products/${id}/restore`);
    setProducts((current) =>
      current.map((p) => (p.id === id ? mapProductResponse(response.data.data) : p)),
    );
    await refreshData();
  };

  const deleteProduct = async (id: string) => {
    await archiveProduct(id);
  };

  const addSalesRecord = async (_salesRecord: Omit<SalesRecord, "id">) => { return; };
  const deleteSalesRecord = async (_id: string) => { return; };

  const getSalesRecordsByDateRange = (startDate: Date, endDate: Date) =>
    salesRecords.filter((record) => {
      const d = toSafeDate(record.date);
      return d ? d >= startDate && d <= endDate : false;
    });

  const addExpense = async (expense: Omit<Expense, "id">) => {
    const submittedAt = new Date();
    const response = await apiClient.post<BackendResponse<BackendExpense>>("/expenses", {
      expenseName: expense.name,
      category: mapUiCategoryToBackend(expense.category),
      amount: expense.amount,
      date: toApiDateTime(expense.date),
      description: expense.description || undefined,
    });
    const id = response.data.data.id;
    knownExpenseCreatedAt.current.set(id, submittedAt);
    setExpenses((current) => [
      ...current,
      mapExpenseResponse(response.data.data, submittedAt),
    ]);
  };

  const deleteExpense = async (id: string) => {
    await apiClient.delete(`/expenses/${id}`);
    knownExpenseCreatedAt.current.delete(id);
    setExpenses((current) => current.filter((e) => e.id !== id));
  };

  const getExpensesByDateRange = (startDate: Date, endDate: Date) =>
    expenses.filter((expense) => {
      const d = toSafeDate(expense.date);
      return d ? d >= startDate && d <= endDate : false;
    });

  const getExpensesByCategory = (category: string) =>
    expenses.filter((e) => e.category === category);

  const addStockIn = async (stockIn: Omit<StockIn, "id" | "createdAt">) => {
    const submittedAt = new Date();
    const response = await apiClient.post<BackendResponse<BackendStockIn>>("/stocks-in", {
      productId: stockIn.productId,
      quantity: stockIn.quantity,
      date: toApiDateTime(stockIn.date),
      note: stockIn.notes || undefined,
    });
    const id = response.data.data.id;
    // Simpan jam ini supaya refreshData tidak menimpanya
    knownStockInCreatedAt.current.set(id, submittedAt);
    const mapped = mapStockInResponse(response.data.data, submittedAt);
    setStockIns((current) => [...current, mapped]);
    setProducts((current) =>
      current.map((p) =>
        p.id === stockIn.productId
          ? { ...p, stock: response.data.data.currentStock, archived: p.archived ?? false }
          : p,
      ),
    );
    await refreshData();
  };

  const addStockOut = async (stockOut: Omit<StockOut, "id" | "createdAt">) => {
    const submittedAt = new Date();
    const response = await requestStockOut((endpoint) =>
      apiClient.post<BackendResponse<BackendStockOut>>(endpoint, {
        productId: stockOut.productId,
        quantity: stockOut.quantity,
        date: toApiDateTime(stockOut.date),
        note: stockOut.notes || undefined,
      }),
    );
    const id = response.data.data.id;
    knownStockOutCreatedAt.current.set(id, submittedAt);
    const mapped = mapStockOutResponse(response.data.data, submittedAt);
    setStockOuts((current) => [...current, mapped]);
    setProducts((current) =>
      current.map((p) =>
        p.id === stockOut.productId
          ? { ...p, stock: response.data.data.currentStock, archived: p.archived ?? false }
          : p,
      ),
    );
    await refreshData();
  };

  const deleteStockIn = async (id: string) => {
    const stockIn = stockIns.find((item) => item.id === id);
    await apiClient.delete(`/stocks-in/${id}`);
    knownStockInCreatedAt.current.delete(id);
    if (stockIn) {
      setProducts((current) =>
        current.map((p) =>
          p.id === stockIn.productId
            ? { ...p, stock: Math.max(0, p.stock - stockIn.quantity), archived: p.archived ?? false }
            : p,
        ),
      );
    }
    setStockIns((current) => current.filter((item) => item.id !== id));
    await refreshData();
  };

  const deleteStockOut = async (id: string) => {
    const stockOut = stockOuts.find((item) => item.id === id);
    await requestStockOut((endpoint) => apiClient.delete(`${endpoint}/${id}`));
    knownStockOutCreatedAt.current.delete(id);
    if (stockOut) {
      setProducts((current) =>
        current.map((p) =>
          p.id === stockOut.productId
            ? { ...p, stock: p.stock + stockOut.quantity, archived: p.archived ?? false }
            : p,
        ),
      );
    }
    setStockOuts((current) => current.filter((item) => item.id !== id));
    await refreshData();
  };

  const getStockInByDate = (date: Date) =>
    stockIns.filter((s) => {
      const d = toSafeDate(s.date);
      return d ? d.toDateString() === date.toDateString() : false;
    });

  const getStockOutByDate = (date: Date) =>
    stockOuts.filter((s) => {
      const d = toSafeDate(s.date);
      return d ? d.toDateString() === date.toDateString() : false;
    });

  const getSummary = (startDate?: Date, endDate?: Date): BusinessSummary => {
    const relevantSalesRecords =
      startDate && endDate ? getSalesRecordsByDateRange(startDate, endDate) : salesRecords;
    const relevantExpenses =
      startDate && endDate ? getExpensesByDateRange(startDate, endDate) : expenses;
    const totalIncome = relevantSalesRecords.reduce((sum, r) => sum + r.totalAmount, 0);
    const totalExpense = relevantExpenses.reduce((sum, e) => sum + e.amount, 0);
    const profit = totalIncome - totalExpense;
    const profitMargin = totalIncome > 0 ? (profit / totalIncome) * 100 : 0;
    const totalProductsSold = relevantSalesRecords.reduce((sum, r) => sum + r.quantity, 0);
    return { totalIncome, totalExpense, profit, profitMargin, totalProductsSold };
  };

  const getSummaryByMonth = (year: number, month: number): BusinessSummary => {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);
    return getSummary(startDate, endDate);
  };

  const getMonthlyComparison = (currentMonth: number, currentYear: number) => {
    const current = getSummaryByMonth(currentYear, currentMonth);
    let prevMonth = currentMonth - 1;
    let prevYear = currentYear;
    if (prevMonth < 0) { prevMonth = 11; prevYear -= 1; }
    const previous = getSummaryByMonth(prevYear, prevMonth);
    return { current, previous, change: current.totalIncome - previous.totalIncome };
  };

  const getDailySalesRecap = (date: Date): DailySalesRecapSummary =>
    buildDailyRecap(date, products, salesRecords, expenses, stockIns, stockOuts);

  const getDailySalesRecapByDateRange = (startDate: Date, endDate: Date): DailySalesRecapSummary[] => {
    const recaps: DailySalesRecapSummary[] = [];
    const current = new Date(startDate);
    while (current <= endDate) {
      recaps.push(getDailySalesRecap(new Date(current)));
      current.setDate(current.getDate() + 1);
    }
    return recaps;
  };

  const value: BusinessContextType = {
    products, addProduct, updateProduct, deleteProduct, archiveProduct, restoreProduct, getProductById,
    salesRecords, addSalesRecord, deleteSalesRecord, getSalesRecordsByDateRange,
    expenses, addExpense, deleteExpense, getExpensesByDateRange, getExpensesByCategory,
    stockIns, stockOuts, addStockIn, addStockOut, deleteStockIn, deleteStockOut,
    getStockInByDate, getStockOutByDate,
    getSummary, getSummaryByMonth, getMonthlyComparison,
    getDailySalesRecap, getDailySalesRecapByDateRange,
  };

  return <BusinessContext.Provider value={value}>{children}</BusinessContext.Provider>;
}

export function useBusinessContext() {
  const context = useContext(BusinessContext);
  if (context === undefined) {
    throw new Error("useBusinessContext must be used within a BusinessProvider");
  }
  return context;
}