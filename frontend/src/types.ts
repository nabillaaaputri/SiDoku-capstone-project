// Product Types
export interface Product {
  id: string;
  name: string;
  costPrice: number;
  sellPrice: number;
  margin?: number;
  stock: number;
  minimumStock: number;
  category: string;
  unit: string;
  archived?: boolean;
  createdAt: Date;
}

// Sales Record Types
export interface SalesRecord {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  sellPrice: number;
  totalAmount: number;
  date: Date;
}

// Expense Types (Pengeluaran)
export interface Expense {
  id: string;
  name: string;
  amount: number;
  category: "restock" | "operasional" | "lain-lain";
  date: Date;
  description?: string;
  createdAt?: Date; // diubah: string → Date (konsisten dengan StockIn/StockOut)
}

// Stock Movement Types
export interface StockIn {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  date: Date;
  createdAt: Date;
  notes?: string;
}

export interface StockOut {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  date: Date;
  createdAt: Date;
  notes?: string;
}

// Business Data Summary
export interface BusinessSummary {
  totalIncome: number;
  totalExpense: number;
  profit: number;
  profitMargin: number;
  totalProductsSold: number;
}

// Daily Sales Recap
export interface DailySalesRecapDetail {
  productId: string;
  productName: string;
  stokAwal: number;
  stokMasuk: number;
  stokKeluar: number;
  stokAkhir: number;
  terjual: number;
  hargaJual: number;
  hargaModal: number;
  nilaiPenjualan: number;
  hppTerpakai: number;
}

export interface DailySalesRecapSummary {
  date: Date;
  details: DailySalesRecapDetail[];
  totalUangMasuk: number;
  totalUangKeluar: number;
  totalTerjual: number;
  totalNilaiPenjualan: number;
  totalHppTerpakai: number;
  labaKotor: number;
  labaBersih: number;
  isComplete: boolean;
}