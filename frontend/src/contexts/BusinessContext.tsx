import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Product, SalesRecord, Expense, BusinessSummary, StockIn, StockOut, DailySalesRecapSummary, DailySalesRecapDetail } from "@/types";

interface BusinessContextType {
  // Products
  products: Product[];
  addProduct: (product: Omit<Product, "id" | "createdAt">) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  archiveProduct: (id: string) => void;
  restoreProduct: (id: string) => void;
  getProductById: (id: string) => Product | undefined;

  // Sales Records (Rekap Penjualan Harian)
  salesRecords: SalesRecord[];
  addSalesRecord: (salesRecord: Omit<SalesRecord, "id">) => void;
  deleteSalesRecord: (id: string) => void;
  getSalesRecordsByDateRange: (startDate: Date, endDate: Date) => SalesRecord[];

  // Expenses (Pengeluaran)
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, "id">) => void;
  deleteExpense: (id: string) => void;
  getExpensesByDateRange: (startDate: Date, endDate: Date) => Expense[];
  getExpensesByCategory: (category: string) => Expense[];

  // Stock Movements
  stockIns: StockIn[];
  stockOuts: StockOut[];
  addStockIn: (stockIn: Omit<StockIn, "id">) => void;
  addStockOut: (stockOut: Omit<StockOut, "id">) => void;
  deleteStockIn: (id: string) => void;
  deleteStockOut: (id: string) => void;
  getStockInByDate: (date: Date) => StockIn[];
  getStockOutByDate: (date: Date) => StockOut[];

  // Summary
  getSummary: (startDate?: Date, endDate?: Date) => BusinessSummary;
  getSummaryByMonth: (year: number, month: number) => BusinessSummary;
  getMonthlyComparison: (
    currentMonth: number,
    currentYear: number
  ) => { current: BusinessSummary; previous: BusinessSummary; change: number };

  // Daily Sales Recap
  getDailySalesRecap: (date: Date) => DailySalesRecapSummary;
  getDailySalesRecapByDateRange: (startDate: Date, endDate: Date) => DailySalesRecapSummary[];
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PRODUCTS: "sidoku_products",
  SALES_RECORDS: "sidoku_sales_records",
  EXPENSES: "sidoku_expenses",
  STOCK_INS: "sidoku_stock_ins",
  STOCK_OUTS: "sidoku_stock_outs",
};

// One-time migration helper: move data from legacy key to new key
const migrateOldStorageKeys = () => {
  const legacyKey = "sidoku_transactions";
  const newKey = STORAGE_KEYS.SALES_RECORDS;

  // Check if new key already exists (migration done before)
  const newKeyExists = localStorage.getItem(newKey);
  if (newKeyExists) return; // Already migrated, skip

  // Try to find legacy data
  const legacyData = localStorage.getItem(legacyKey);
  if (legacyData) {
    // Move data to new key
    localStorage.setItem(newKey, legacyData);
    // Remove legacy key to keep localStorage clean
    localStorage.removeItem(legacyKey);
  }
};

// Run migration once when module loads
migrateOldStorageKeys();

export function BusinessProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [salesRecords, setSalesRecords] = useState<SalesRecord[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [stockIns, setStockIns] = useState<StockIn[]>([]);
  const [stockOuts, setStockOuts] = useState<StockOut[]>([]);

  // Load data dari localStorage
  useEffect(() => {
    const savedProducts = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    const savedSalesRecords = localStorage.getItem(STORAGE_KEYS.SALES_RECORDS);
    const savedExpenses = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    const savedStockIns = localStorage.getItem(STORAGE_KEYS.STOCK_INS);
    const savedStockOuts = localStorage.getItem(STORAGE_KEYS.STOCK_OUTS);

    if (savedProducts) {
      setProducts(
        JSON.parse(savedProducts).map((p: Product) => ({
          ...p,
          createdAt: new Date(p.createdAt),
          // Data migration: provide defaults for existing products without category/unit
          category: p.category || "Lainnya",
          unit: p.unit || "pcs",
          archived: p.archived ?? false,
        }))
      );
    }

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

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SALES_RECORDS, JSON.stringify(salesRecords));
  }, [salesRecords]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STOCK_INS, JSON.stringify(stockIns));
  }, [stockIns]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STOCK_OUTS, JSON.stringify(stockOuts));
  }, [stockOuts]);

  // Product Functions
  const addProduct = (product: Omit<Product, "id" | "createdAt">) => {
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
      createdAt: new Date(),
      category: product.category || "Barang",
      unit: product.unit || "pcs",
      archived: product.archived ?? false,
    };
    setProducts([...products, newProduct]);
  };

  const updateProduct = (id: string, updatedData: Partial<Product>) => {
    setProducts(
      products.map((p) => (p.id === id ? { ...p, ...updatedData } : p))
    );
  };

  const deleteProduct = (id: string) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  const archiveProduct = (id: string) => {
    setProducts(
      products.map((p) => (p.id === id ? { ...p, archived: true } : p))
    );
  };

  const restoreProduct = (id: string) => {
    setProducts(
      products.map((p) => (p.id === id ? { ...p, archived: false } : p))
    );
  };

  const getProductById = (id: string) => {
    return products.find((p) => p.id === id);
  };

  // Sales Record Functions
  const addSalesRecord = (salesRecord: Omit<SalesRecord, "id">) => {
    const newSalesRecord: SalesRecord = {
      ...salesRecord,
      id: Date.now().toString(),
    };
    setSalesRecords([...salesRecords, newSalesRecord]);

    // Update product stock
    const product = getProductById(salesRecord.productId);
    if (product) {
      updateProduct(salesRecord.productId, {
        stock: product.stock - salesRecord.quantity,
      });
    }
  };

  const deleteSalesRecord = (id: string) => {
    const salesRecord = salesRecords.find((r) => r.id === id);
    if (salesRecord) {
      const product = getProductById(salesRecord.productId);
      if (product) {
        updateProduct(salesRecord.productId, {
          stock: product.stock + salesRecord.quantity,
        });
      }
    }
    setSalesRecords(salesRecords.filter((r) => r.id !== id));
  };

  const getSalesRecordsByDateRange = (startDate: Date, endDate: Date) => {
    return salesRecords.filter((r) => {
      const rDate = new Date(r.date);
      return rDate >= startDate && rDate <= endDate;
    });
  };

  // Expense Functions
  const addExpense = (expense: Omit<Expense, "id">) => {
    const newExpense: Expense = {
      ...expense,
      id: Date.now().toString(),
    };
    setExpenses([...expenses, newExpense]);
  };

  const deleteExpense = (id: string) => {
    setExpenses(expenses.filter((e) => e.id !== id));
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

  // Summary Functions
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

    // Get previous month
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

  // Daily Sales Recap Functions
  const getDailySalesRecap = (date: Date): DailySalesRecapSummary => {
    const dateStr = date.toDateString();

    // Get all sales records for this day per product
    const dailySalesRecords = salesRecords.filter(
      (r) => new Date(r.date).toDateString() === dateStr
    );

    // Get all stock movements for this day per product
    const dailyStockIns = stockIns.filter(
      (s) => new Date(s.date).toDateString() === dateStr
    );

    const dailyStockOuts = stockOuts.filter(
      (s) => new Date(s.date).toDateString() === dateStr
    );

    // Get all expenses for this day
    const dailyExpenses = expenses.filter(
      (e) => new Date(e.date).toDateString() === dateStr
    );

    // Build recap details per product
    const recapByProduct = new Map<string, DailySalesRecapDetail>();

    // Process products
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

      // Stok akhir = current stock
      const stokAkhir = product.stock;

      // Stok awal = calculated backwards from current state
      // Rumus: stokAwal = stokAkhir - stokMasuk + terjualTotal
      // But we need to find terjual first, so: stokAwal + stokMasuk - stokKeluar - terjual = stokAkhir
      // We use sales records as terjual quantity
      const terjualDariCatatan = prodSalesRecords.reduce((sum, r) => sum + r.quantity, 0);

      // Stok awal backward calculation: stokAwal = stokAkhir + stokKeluar + terjualDariCatatan - stokMasuk
      // This represents: initial + received - sold - other_out = final
      const stokAwal = Math.max(0, stokAkhir + stokKeluar + terjualDariCatatan - stokMasuk);

      // Terjual per formula: stokAwal + stokMasuk - stokAkhir
      // This represents total outflow (sold + other losses)
      const terjual = Math.max(0, stokAwal + stokMasuk - stokAkhir);

      const nilaiPenjualan = terjual * product.sellPrice;
      const hppTerpakai = terjual * product.costPrice;

      // Only include if there's activity (terjual, stok masuk, atau stok keluar)
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
    const totalUangMasuk = dailySalesRecords.reduce((sum, r) => sum + r.totalAmount, 0);
    const totalUangKeluar = dailyExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalTerjual = dailySalesRecords.reduce((sum, r) => sum + r.quantity, 0);
    const totalNilaiPenjualan = details.reduce((sum, d) => sum + d.nilaiPenjualan, 0);
    const totalHppTerpakai = details.reduce((sum, d) => sum + d.hppTerpakai, 0);
    const labaKotor = totalUangMasuk - totalHppTerpakai;
    const labaBersih = labaKotor - totalUangKeluar;

    // Data dianggap lengkap jika ada produk dengan aktivitas
    const isComplete = details.length > 0;

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
      isComplete,
    };
  };

  const getDailySalesRecapByDateRange = (
    startDate: Date,
    endDate: Date
  ): DailySalesRecapSummary[] => {
    const recaps: DailySalesRecapSummary[] = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      const recap = getDailySalesRecap(current);
      recaps.push(recap);
      current.setDate(current.getDate() + 1);
    }

    return recaps;
  };

  // Stock Movement Functions
  const addStockIn = (stockIn: Omit<StockIn, "id" | "createdAt">) => {
    const newStockIn: StockIn = {
      ...stockIn,
      id: Date.now().toString(),
      createdAt: new Date(), // Simpan waktu submit saat ini
    };
    setStockIns([...stockIns, newStockIn]);

    // Update product stock
    const product = getProductById(stockIn.productId);
    if (product) {
      updateProduct(stockIn.productId, {
        stock: product.stock + stockIn.quantity,
      });
    }
  };

  const addStockOut = (stockOut: Omit<StockOut, "id" | "createdAt">) => {
    const newStockOut: StockOut = {
      ...stockOut,
      id: Date.now().toString(),
      createdAt: new Date(), // Simpan waktu submit saat ini
    };
    setStockOuts([...stockOuts, newStockOut]);

    // Update product stock
    const product = getProductById(stockOut.productId);
    if (product) {
      updateProduct(stockOut.productId, {
        stock: product.stock - stockOut.quantity,
      });
    }
  };

  const deleteStockIn = (id: string) => {
    const stockIn = stockIns.find((s) => s.id === id);
    if (stockIn) {
      const product = getProductById(stockIn.productId);
      if (product) {
        updateProduct(stockIn.productId, {
          stock: product.stock - stockIn.quantity,
        });
      }
    }
    setStockIns(stockIns.filter((s) => s.id !== id));
  };

  const deleteStockOut = (id: string) => {
    const stockOut = stockOuts.find((s) => s.id === id);
    if (stockOut) {
      const product = getProductById(stockOut.productId);
      if (product) {
        updateProduct(stockOut.productId, {
          stock: product.stock + stockOut.quantity,
        });
      }
    }
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
    <BusinessContext.Provider value={value}>{children}</BusinessContext.Provider>
  );
}

export function useBusinessContext() {
  const context = useContext(BusinessContext);
  if (context === undefined) {
    throw new Error(
      "useBusinessContext must be used within a BusinessProvider"
    );
  }
  return context;
}
