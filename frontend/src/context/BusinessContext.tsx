import { createContext, useContext, useState, useEffect, ReactNode } from "react";
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

interface BusinessContextType {
  products: Product[];
  addProduct: (product: Omit<Product, "id" | "createdAt">) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => void;
  archiveProduct: (id: string) => Promise<void>;
  restoreProduct: (id: string) => Promise<void>;
  getProductById: (id: string) => Product | undefined;

  salesRecords: SalesRecord[];
  addSalesRecord: (salesRecord: Omit<SalesRecord, "id">) => void;
  deleteSalesRecord: (id: string) => void;
  getSalesRecordsByDateRange: (startDate: Date, endDate: Date) => SalesRecord[];

  expenses: Expense[];
  addExpense: (expense: Omit<Expense, "id">) => Promise<void>;
deleteExpense: (id: string) => Promise<void>;
  getExpensesByDateRange: (startDate: Date, endDate: Date) => Expense[];
  getExpensesByCategory: (category: string) => Expense[];

  stockIns: StockIn[];
  stockOuts: StockOut[];
  addStockIn: (stockIn: Omit<StockIn, "id">) => void;
  addStockOut: (stockOut: Omit<StockOut, "id">) => void;
  deleteStockIn: (id: string) => void;
  deleteStockOut: (id: string) => void;
  getStockInByDate: (date: Date) => StockIn[];
  getStockOutByDate: (date: Date) => StockOut[];

  getSummary: (startDate?: Date, endDate?: Date) => BusinessSummary;
  getSummaryByMonth: (year: number, month: number) => BusinessSummary;
  getMonthlyComparison: (
    currentMonth: number,
    currentYear: number
  ) => { current: BusinessSummary; previous: BusinessSummary; change: number };

  getDailySalesRecap: (date: Date) => DailySalesRecapSummary;
  getDailySalesRecapByDateRange: (
    startDate: Date,
    endDate: Date
  ) => DailySalesRecapSummary[];
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export function BusinessProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [salesRecords, setSalesRecords] = useState<SalesRecord[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [stockIns, setStockIns] = useState<StockIn[]>([]);
  const [stockOuts, setStockOuts] = useState<StockOut[]>([]);

  // AMBIL PRODUK DARI BACKEND
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await apiClient.get("/products");

        console.log("PRODUCTS RESPONSE:", response.data);

        const data =
          response.data.data?.products ||
          response.data.data ||
          [];

        setProducts(
  data.map((p: any) => ({
    id: p.id,
    name: p.productName,
    costPrice: p.purchasePrice,
    sellPrice: p.sellingPrice,
    stock: p.stock,
    minimumStock: p.minimumStock,
    category: p.category || "Lainnya",
    unit: p.unit || "pcs",
    archived: p.isArchived ?? false,
    createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
  }))
);
      } catch (error) {
        console.error("Gagal ambil produk:", error);
      }
    };

    fetchProducts();
  }, []);

  // DATA LAIN MASIH LOCALSTORAGE DULU
  useEffect(() => {
    const savedSalesRecords = localStorage.getItem("sidoku_sales_records");
    const savedExpenses = localStorage.getItem("sidoku_expenses");
    const savedStockIns = localStorage.getItem("sidoku_stock_ins");
    const savedStockOuts = localStorage.getItem("sidoku_stock_outs");

    if (savedSalesRecords) {
      setSalesRecords(
        JSON.parse(savedSalesRecords).map((t: SalesRecord) => ({
          ...t,
          date: new Date(t.date),
        }))
      );
    }

    if (savedExpenses) {
      setExpenses(
        JSON.parse(savedExpenses).map((e: Expense) => ({
          ...e,
          date: new Date(e.date),
        }))
      );
    }

    if (savedStockIns) {
      setStockIns(
        JSON.parse(savedStockIns).map((s: StockIn) => ({
          ...s,
          date: new Date(s.date),
          createdAt: new Date(s.createdAt),
        }))
      );
    }

    if (savedStockOuts) {
      setStockOuts(
        JSON.parse(savedStockOuts).map((s: StockOut) => ({
          ...s,
          date: new Date(s.date),
          createdAt: new Date(s.createdAt),
        }))
      );
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("sidoku_sales_records", JSON.stringify(salesRecords));
  }, [salesRecords]);

  useEffect(() => {
    localStorage.setItem("sidoku_expenses", JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem("sidoku_stock_ins", JSON.stringify(stockIns));
  }, [stockIns]);

  useEffect(() => {
    localStorage.setItem("sidoku_stock_outs", JSON.stringify(stockOuts));
  }, [stockOuts]);

  // PRODUCT FUNCTIONS KE BACKEND
  const addProduct = async (product: Omit<Product, "id" | "createdAt">) => {
  const payload = {
    productName: product.name,
    purchasePrice: product.costPrice,
    sellingPrice: product.sellPrice,
    minimumStock: product.minimumStock,
    category: product.category,
    unit: product.unit,
    initialStock: product.stock,
  };

  console.log("PAYLOAD KE BACKEND:", payload);

  const response = await apiClient.post("/products", payload);

  console.log("ADD PRODUCT RESPONSE:", response.data);

  const newProduct = response.data.data;

  setProducts((prev) => [
    ...prev,
    {
      id: newProduct.id,
      name: newProduct.productName,
      costPrice: newProduct.purchasePrice,
      sellPrice: newProduct.sellingPrice,
      stock: newProduct.stock,
      minimumStock: newProduct.minimumStock,
      category: newProduct.category,
      unit: newProduct.unit,
      archived: newProduct.isArchived ?? false,
      createdAt: new Date(),
    },
  ]);
};

  const updateProduct = async (id: string, updatedData: Partial<Product>) => {
  const oldProduct = products.find((p) => p.id === id);

  if (!oldProduct) return;

  const mergedProduct = {
    ...oldProduct,
    ...updatedData,
  };

  const payload = {
    productName: mergedProduct.name,
    purchasePrice: mergedProduct.costPrice,
    sellingPrice: mergedProduct.sellPrice,
    stock: mergedProduct.stock,
    minimumStock: mergedProduct.minimumStock,
    category: mergedProduct.category,
    unit: mergedProduct.unit,
  };

  console.log("UPDATE PAYLOAD:", payload);

  const response = await apiClient.put(`/products/${id}`, payload);

  console.log("UPDATE PRODUCT RESPONSE:", response.data);

  const updatedProduct = response.data.data;

  setProducts((prev) =>
    prev.map((p) =>
      p.id === id
        ? {
            id: updatedProduct.id,
            name: updatedProduct.productName,
            costPrice: updatedProduct.purchasePrice,
            sellPrice: updatedProduct.sellingPrice,
            stock: updatedProduct.stock,
            minimumStock: updatedProduct.minimumStock,
            category: updatedProduct.category,
            unit: updatedProduct.unit,
            archived: updatedProduct.isArchived ?? false,
            createdAt: updatedProduct.createdAt
              ? new Date(updatedProduct.createdAt)
              : p.createdAt,
          }
        : p
    )
  );
};

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const archiveProduct = async (id: string) => {
    await apiClient.patch(`/products/${id}/archive`);

    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, archived: true } : p))
    );
  };

  const restoreProduct = async (id: string) => {
    await apiClient.patch(`/products/${id}/restore`);

    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, archived: false } : p))
    );
  };

  const getProductById = (id: string) => {
    return products.find((p) => p.id === id);
  };

  // SALES RECORD
  const addSalesRecord = (salesRecord: Omit<SalesRecord, "id">) => {
    const newSalesRecord: SalesRecord = {
      ...salesRecord,
      id: Date.now().toString(),
    };

    setSalesRecords([...salesRecords, newSalesRecord]);

    const product = getProductById(salesRecord.productId);
    if (product) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === salesRecord.productId
            ? { ...p, stock: p.stock - salesRecord.quantity }
            : p
        )
      );
    }
  };

  const deleteSalesRecord = (id: string) => {
    setSalesRecords(salesRecords.filter((r) => r.id !== id));
  };

  const getSalesRecordsByDateRange = (startDate: Date, endDate: Date) => {
    return salesRecords.filter((r) => {
      const rDate = new Date(r.date);
      return rDate >= startDate && rDate <= endDate;
    });
  };

  // EXPENSE
const addExpense = async (expense: Omit<Expense, "id">) => {
  const payload = {
    expenseName: expense.name,
    amount: expense.amount,
    category: expense.category,
    date: expense.date,
    description: expense.description,
  };

  console.log("EXPENSE PAYLOAD:", payload);

  const response = await apiClient.post("/expenses", payload);

  console.log("ADD EXPENSE RESPONSE:", response.data);

  const newExpense = response.data.data;

  setExpenses((prev) => [
    ...prev,
    {
      id: newExpense.id,
      name: newExpense.expenseName,
      amount: newExpense.amount,
      category: newExpense.category,
      date: new Date(newExpense.date),
      description: newExpense.description || "",
    },
  ]);
};

const deleteExpense = async (id: string) => {
  await apiClient.delete(`/expenses/${id}`);

  setExpenses((prev) => prev.filter((e) => e.id !== id));
};

const getExpensesByDateRange = (startDate: Date, endDate: Date) => {
  return expenses.filter((e) => {
    const eDate = new Date(e.date);
    return eDate >= startDate && eDate <= endDate;
  });
};

const getExpensesByCategory = (category: string) => {
  return expenses.filter((e) => e.category === category);
};

  // SUMMARY
  const getSummary = (startDate?: Date, endDate?: Date): BusinessSummary => {
    let relevantSalesRecords = salesRecords;
    let relevantExpenses = expenses;

    if (startDate && endDate) {
      relevantSalesRecords = getSalesRecordsByDateRange(startDate, endDate);
      relevantExpenses = getExpensesByDateRange(startDate, endDate);
    }

    const totalIncome = relevantSalesRecords.reduce(
      (sum, t) => sum + t.totalAmount,
      0
    );
    const totalExpense = relevantExpenses.reduce((sum, e) => sum + e.amount, 0);
    const profit = totalIncome - totalExpense;
    const profitMargin = totalIncome > 0 ? (profit / totalIncome) * 100 : 0;
    const totalProductsSold = relevantSalesRecords.reduce(
      (sum, t) => sum + t.quantity,
      0
    );

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
    const endDate = new Date(year, month + 1, 0, 23, 59, 59);
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

  // DAILY SALES RECAP
  const getDailySalesRecap = (date: Date): DailySalesRecapSummary => {
    const dateStr = date.toDateString();

    const dailySalesRecords = salesRecords.filter(
      (r) => new Date(r.date).toDateString() === dateStr
    );

    const dailyStockIns = stockIns.filter(
      (s) => new Date(s.date).toDateString() === dateStr
    );

    const dailyStockOuts = stockOuts.filter(
      (s) => new Date(s.date).toDateString() === dateStr
    );

    const dailyExpenses = expenses.filter(
      (e) => new Date(e.date).toDateString() === dateStr
    );

    const recapByProduct = new Map<string, DailySalesRecapDetail>();

    products.forEach((product) => {
      const prodSalesRecords = dailySalesRecords.filter(
        (r) => r.productId === product.id
      );
      const prodStockIns = dailyStockIns.filter(
        (s) => s.productId === product.id
      );
      const prodStockOuts = dailyStockOuts.filter(
        (s) => s.productId === product.id
      );

      const stokMasuk = prodStockIns.reduce((sum, s) => sum + s.quantity, 0);
      const stokKeluar = prodStockOuts.reduce((sum, s) => sum + s.quantity, 0);
      const stokAkhir = product.stock;
      const terjualDariCatatan = prodSalesRecords.reduce(
        (sum, r) => sum + r.quantity,
        0
      );

      const stokAwal = Math.max(
        0,
        stokAkhir + stokKeluar + terjualDariCatatan - stokMasuk
      );

      const terjual = Math.max(0, stokAwal + stokMasuk - stokAkhir);
      const nilaiPenjualan = terjual * product.sellPrice;
      const hppTerpakai = terjual * product.costPrice;

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
          nilaiPenjualan,
          hppTerpakai,
        });
      }
    });

    const details = Array.from(recapByProduct.values());

    const totalUangMasuk = dailySalesRecords.reduce(
      (sum, r) => sum + r.totalAmount,
      0
    );
    const totalUangKeluar = dailyExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalTerjual = dailySalesRecords.reduce((sum, r) => sum + r.quantity, 0);
    const totalNilaiPenjualan = details.reduce(
      (sum, d) => sum + d.nilaiPenjualan,
      0
    );
    const totalHppTerpakai = details.reduce((sum, d) => sum + d.hppTerpakai, 0);
    const labaKotor = totalUangMasuk - totalHppTerpakai;
    const labaBersih = labaKotor - totalUangKeluar;

    return {
      date,
      details: details.sort((a, b) =>
        a.productName.localeCompare(b.productName)
      ),
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

  const getDailySalesRecapByDateRange = (
    startDate: Date,
    endDate: Date
  ): DailySalesRecapSummary[] => {
    const recaps: DailySalesRecapSummary[] = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      recaps.push(getDailySalesRecap(new Date(current)));
      current.setDate(current.getDate() + 1);
    }

    return recaps;
  };

  // STOCK
  const addStockIn = (stockIn: Omit<StockIn, "id" | "createdAt">) => {
    const newStockIn: StockIn = {
      ...stockIn,
      id: Date.now().toString(),
      createdAt: new Date(),
    };

    setStockIns([...stockIns, newStockIn]);

    const product = getProductById(stockIn.productId);
    if (product) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === stockIn.productId
            ? { ...p, stock: p.stock + stockIn.quantity }
            : p
        )
      );
    }
  };

  const addStockOut = (stockOut: Omit<StockOut, "id" | "createdAt">) => {
    const newStockOut: StockOut = {
      ...stockOut,
      id: Date.now().toString(),
      createdAt: new Date(),
    };

    setStockOuts([...stockOuts, newStockOut]);

    const product = getProductById(stockOut.productId);
    if (product) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === stockOut.productId
            ? { ...p, stock: p.stock - stockOut.quantity }
            : p
        )
      );
    }
  };

  const deleteStockIn = (id: string) => {
    setStockIns(stockIns.filter((s) => s.id !== id));
  };

  const deleteStockOut = (id: string) => {
    setStockOuts(stockOuts.filter((s) => s.id !== id));
  };

  const getStockInByDate = (date: Date) => {
    return stockIns.filter((s) => {
      const sDate = new Date(s.date);
      return sDate.toDateString() === date.toDateString();
    });
  };

  const getStockOutByDate = (date: Date) => {
    return stockOuts.filter((s) => {
      const sDate = new Date(s.date);
      return sDate.toDateString() === date.toDateString();
    });
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

  return (
    <BusinessContext.Provider value={value}>
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusinessContext() {
  const context = useContext(BusinessContext);

  if (context === undefined) {
    throw new Error("useBusinessContext must be used within a BusinessProvider");
  }

  return context;
}