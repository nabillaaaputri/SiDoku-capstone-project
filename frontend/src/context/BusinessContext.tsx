import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import apiClient from "@/services/api";
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
  getDailySalesRecapByDateRange: (
    startDate: Date,
    endDate: Date,
  ) => DailySalesRecapSummary[];
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

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
  if (category === "operasional") {
    return "operational";
  }

  if (category === "lain-lain") {
    return "others";
  }

  return category;
};

const mapBackendCategoryToUi = (category: string) => {
  if (category === "operational") {
    return "operasional";
  }

  if (category === "others") {
    return "lain-lain";
  }

  return category;
};

const mapExpenseResponse = (expense: BackendExpense): Expense => ({
  id: expense.id,
  name: expense.expenseName,
  amount: Number(expense.amount),
  category: mapBackendCategoryToUi(expense.category) as Expense["category"],
  date: new Date(expense.date),
  description: expense.description || undefined,
  createdAt: expense.date,
});

const mapStockInResponse = (stockIn: BackendStockIn): StockIn => ({
  id: stockIn.id,
  productId: stockIn.productId,
  productName: stockIn.productName,
  quantity: Number(stockIn.quantity),
  date: new Date(stockIn.date),
  createdAt: new Date(stockIn.date),
  notes: stockIn.note || undefined,
});

const mapStockOutResponse = (stockOut: BackendStockOut): StockOut => ({
  id: stockOut.id,
  productId: stockOut.productId,
  productName: stockOut.productName,
  quantity: Number(stockOut.quantity),
  date: new Date(stockOut.date),
  createdAt: new Date(stockOut.date),
  notes: stockOut.note || undefined,
});

const toApiDateTime = (date: Date) => date.toISOString();

const toApiDate = (date: Date) => {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().split("T")[0];
};

const getStockStatus = (stock: number, minimumStock: number): "low" | "safe" => {
  return stock <= minimumStock ? "low" : "safe";
};

const buildSalesRecords = (
  products: Product[],
  stockOuts: StockOut[],
): SalesRecord[] => {
  return stockOuts.map((stockOut) => {
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
};

const buildDailyRecap = (
  date: Date,
  products: Product[],
  salesRecords: SalesRecord[],
  expenses: Expense[],
  stockIns: StockIn[],
  stockOuts: StockOut[],
): DailySalesRecapSummary => {
  const dateKey = toApiDate(date);

  const dailySalesRecords = salesRecords.filter(
    (record) => toApiDate(new Date(record.date)) === dateKey,
  );
  const dailyStockIns = stockIns.filter(
    (stockIn) => toApiDate(new Date(stockIn.date)) === dateKey,
  );
  const dailyStockOuts = stockOuts.filter(
    (stockOut) => toApiDate(new Date(stockOut.date)) === dateKey,
  );
  const dailyExpenses = expenses.filter(
    (expense) => toApiDate(new Date(expense.date)) === dateKey,
  );

  const recapByProduct = new Map<string, DailySalesRecapDetail>();

  products.forEach((product) => {
    const productSalesRecords = dailySalesRecords.filter(
      (record) => record.productId === product.id,
    );
    const productStockIns = dailyStockIns.filter(
      (stockIn) => stockIn.productId === product.id,
    );
    const productStockOuts = dailyStockOuts.filter(
      (stockOut) => stockOut.productId === product.id,
    );

    const stokMasuk = productStockIns.reduce((sum, item) => sum + item.quantity, 0);
    const stokKeluar = productStockOuts.reduce((sum, item) => sum + item.quantity, 0);
    const stokAkhir = product.stock;
    const terjualDariCatatan = productSalesRecords.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );
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
  const totalUangMasuk = dailySalesRecords.reduce((sum, record) => sum + record.totalAmount, 0);
  const totalUangKeluar = dailyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalTerjual = dailySalesRecords.reduce((sum, record) => sum + record.quantity, 0);
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

export function BusinessProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [salesRecords, setSalesRecords] = useState<SalesRecord[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [stockIns, setStockIns] = useState<StockIn[]>([]);
  const [stockOuts, setStockOuts] = useState<StockOut[]>([]);

  const refreshData = async () => {
    try {
      const [productsResult, expensesResult, stockInsResult, stockOutsResult] = await Promise.allSettled([
        apiClient.get<BackendResponse<BackendProduct[]>>("/products"),
        apiClient.get<BackendResponse<{ summary: unknown; records: BackendExpense[] }>>("/expenses"),
        apiClient.get<BackendResponse<BackendStockIn[]>>("/stocks-in"),
        apiClient.get<BackendResponse<{ totalStockOut: number; records: BackendStockOut[] }>>("/stocks-out"),
      ]);

      if (productsResult.status === "fulfilled") {
        setProducts(productsResult.value.data.data.map(mapProductResponse));
      }

      if (expensesResult.status === "fulfilled") {
        setExpenses(expensesResult.value.data.data.records.map(mapExpenseResponse));
      }

      if (stockInsResult.status === "fulfilled") {
        setStockIns(stockInsResult.value.data.data.map(mapStockInResponse));
      }

      if (stockOutsResult.status === "fulfilled") {
        setStockOuts(stockOutsResult.value.data.data.records.map(mapStockOutResponse));
      }
    } catch (error) {
      console.error("Failed to load business data:", error);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  useEffect(() => {
    setSalesRecords(buildSalesRecords(products, stockOuts));
  }, [products, stockOuts]);

  const getProductById = (id: string) => products.find((product) => product.id === id);

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

    setProducts((currentProducts) => [...currentProducts, mapProductResponse(response.data.data)]);
  };

  const updateProduct = async (id: string, updatedData: Partial<Product>) => {
    const currentProduct = getProductById(id);

    if (!currentProduct) {
      return;
    }

    const response = await apiClient.put<BackendResponse<BackendProduct>>(`/products/${id}`, {
      productName: updatedData.name ?? currentProduct.name,
      purchasePrice: updatedData.costPrice ?? currentProduct.costPrice,
      sellingPrice: updatedData.sellPrice ?? currentProduct.sellPrice,
      minimumStock: updatedData.minimumStock ?? currentProduct.minimumStock,
      category: updatedData.category ?? currentProduct.category,
      unit: updatedData.unit ?? currentProduct.unit,
    });

    const mappedProduct = mapProductResponse(response.data.data);
    setProducts((currentProducts) =>
      currentProducts.map((product) => (product.id === id ? mappedProduct : product)),
    );
  };

  const archiveProduct = async (id: string) => {
    const response = await apiClient.patch<BackendResponse<BackendProduct>>(`/products/${id}/archive`);
    const mappedProduct = mapProductResponse(response.data.data);
    setProducts((currentProducts) =>
      currentProducts.map((product) => (product.id === id ? mappedProduct : product)),
    );
  };

  const restoreProduct = async (id: string) => {
    const response = await apiClient.patch<BackendResponse<BackendProduct>>(`/products/${id}/restore`);
    const mappedProduct = mapProductResponse(response.data.data);
    setProducts((currentProducts) =>
      currentProducts.map((product) => (product.id === id ? mappedProduct : product)),
    );
  };

  const deleteProduct = async (id: string) => {
    await archiveProduct(id);
  };

  const addSalesRecord = async (_salesRecord: Omit<SalesRecord, "id">) => {
    return;
  };

  const deleteSalesRecord = async (_id: string) => {
    return;
  };

  const getSalesRecordsByDateRange = (startDate: Date, endDate: Date) => {
    return salesRecords.filter((record) => {
      const recordDate = new Date(record.date);
      return recordDate >= startDate && recordDate <= endDate;
    });
  };

  const addExpense = async (expense: Omit<Expense, "id">) => {
    const response = await apiClient.post<BackendResponse<BackendExpense>>("/expenses", {
      expenseName: expense.name,
      category: mapUiCategoryToBackend(expense.category),
      amount: expense.amount,
      date: toApiDateTime(expense.date),
      description: expense.description || undefined,
    });

    setExpenses((currentExpenses) => [...currentExpenses, mapExpenseResponse(response.data.data)]);
  };

  const deleteExpense = async (id: string) => {
    await apiClient.delete(`/expenses/${id}`);
    setExpenses((currentExpenses) => currentExpenses.filter((expense) => expense.id !== id));
  };

  const getExpensesByDateRange = (startDate: Date, endDate: Date) => {
    return expenses.filter((expense) => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= startDate && expenseDate <= endDate;
    });
  };

  const getExpensesByCategory = (category: string) => {
    return expenses.filter((expense) => expense.category === category);
  };

  const addStockIn = async (stockIn: Omit<StockIn, "id" | "createdAt">) => {
    const response = await apiClient.post<BackendResponse<BackendStockIn>>("/stocks-in", {
      productId: stockIn.productId,
      quantity: stockIn.quantity,
      date: toApiDateTime(stockIn.date),
      note: stockIn.notes || undefined,
    });

    const mappedStockIn = mapStockInResponse(response.data.data);
    setStockIns((currentStockIns) => [...currentStockIns, mappedStockIn]);

    setProducts((currentProducts) =>
      currentProducts.map((product) =>
        product.id === stockIn.productId
          ? {
              ...product,
              stock: response.data.data.currentStock,
              archived: product.archived ?? false,
            }
          : product,
      ),
    );

    await refreshData();
  };

  const addStockOut = async (stockOut: Omit<StockOut, "id" | "createdAt">) => {
    const response = await apiClient.post<BackendResponse<BackendStockOut>>("/stocks-out", {
      productId: stockOut.productId,
      quantity: stockOut.quantity,
      date: toApiDateTime(stockOut.date),
      note: stockOut.notes || undefined,
    });

    const mappedStockOut = mapStockOutResponse(response.data.data);
    setStockOuts((currentStockOuts) => [...currentStockOuts, mappedStockOut]);

    setProducts((currentProducts) =>
      currentProducts.map((product) =>
        product.id === stockOut.productId
          ? {
              ...product,
              stock: response.data.data.currentStock,
              archived: product.archived ?? false,
            }
          : product,
      ),
    );

    await refreshData();
  };

  const deleteStockIn = async (id: string) => {
    const stockIn = stockIns.find((item) => item.id === id);
    await apiClient.delete(`/stocks-in/${id}`);

    if (stockIn) {
      setProducts((currentProducts) =>
        currentProducts.map((product) =>
          product.id === stockIn.productId
            ? {
                ...product,
                stock: Math.max(0, product.stock - stockIn.quantity),
                archived: product.archived ?? false,
              }
            : product,
        ),
      );
    }

    setStockIns((currentStockIns) => currentStockIns.filter((item) => item.id !== id));
    await refreshData();
  };

  const deleteStockOut = async (id: string) => {
    const stockOut = stockOuts.find((item) => item.id === id);
    await apiClient.delete(`/stocks-out/${id}`);

    if (stockOut) {
      setProducts((currentProducts) =>
        currentProducts.map((product) =>
          product.id === stockOut.productId
            ? {
                ...product,
                stock: product.stock + stockOut.quantity,
                archived: product.archived ?? false,
              }
            : product,
        ),
      );
    }

    setStockOuts((currentStockOuts) => currentStockOuts.filter((item) => item.id !== id));
    await refreshData();
  };

  const getStockInByDate = (date: Date) => {
    return stockIns.filter((stockIn) => new Date(stockIn.date).toDateString() === date.toDateString());
  };

  const getStockOutByDate = (date: Date) => {
    return stockOuts.filter((stockOut) => new Date(stockOut.date).toDateString() === date.toDateString());
  };

  const getSummary = (startDate?: Date, endDate?: Date): BusinessSummary => {
    const relevantSalesRecords = startDate && endDate ? getSalesRecordsByDateRange(startDate, endDate) : salesRecords;
    const relevantExpenses = startDate && endDate ? getExpensesByDateRange(startDate, endDate) : expenses;

    const totalIncome = relevantSalesRecords.reduce((sum, record) => sum + record.totalAmount, 0);
    const totalExpense = relevantExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const profit = totalIncome - totalExpense;
    const profitMargin = totalIncome > 0 ? (profit / totalIncome) * 100 : 0;
    const totalProductsSold = relevantSalesRecords.reduce((sum, record) => sum + record.quantity, 0);

    return {
      totalIncome,
      totalExpense,
      profit,
      profitMargin,
      totalProductsSold,
    };
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

    if (prevMonth < 0) {
      prevMonth = 11;
      prevYear -= 1;
    }

    const previous = getSummaryByMonth(prevYear, prevMonth);
    const change = current.totalIncome - previous.totalIncome;

    return { current, previous, change };
  };

  const getDailySalesRecap = (date: Date): DailySalesRecapSummary => {
    return buildDailyRecap(date, products, salesRecords, expenses, stockIns, stockOuts);
  };

  const getDailySalesRecapByDateRange = (
    startDate: Date,
    endDate: Date,
  ): DailySalesRecapSummary[] => {
    const recaps: DailySalesRecapSummary[] = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      recaps.push(getDailySalesRecap(new Date(current)));
      current.setDate(current.getDate() + 1);
    }

    return recaps;
  };

  const value: BusinessContextType = {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    archiveProduct,
    restoreProduct,
    getProductById,
    salesRecords,
    addSalesRecord,
    deleteSalesRecord,
    getSalesRecordsByDateRange,
    expenses,
    addExpense,
    deleteExpense,
    getExpensesByDateRange,
    getExpensesByCategory,
    stockIns,
    stockOuts,
    addStockIn,
    addStockOut,
    deleteStockIn,
    deleteStockOut,
    getStockInByDate,
    getStockOutByDate,
    getSummary,
    getSummaryByMonth,
    getMonthlyComparison,
    getDailySalesRecap,
    getDailySalesRecapByDateRange,
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
