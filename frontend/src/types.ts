// Product Types
export interface Product {
  id: string;
  name: string;
  costPrice: number; // Harga beli
  sellPrice: number; // Harga jual
  margin?: number;
  stock: number;
  minimumStock: number;
  category: string; // Kategori produk
  unit: string; // Satuan produk (pcs, kg, ml, dll)
  archived?: boolean; // Archived status
  createdAt: Date;
}

// Sales Record Types (Rekap Penjualan Harian)
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
  createdAt?: string;
}

// Stock Movement Types
export interface StockIn {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  date: Date;
  createdAt: Date; // Timestamp saat user submit
  notes?: string;
}

export interface StockOut {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  date: Date;
  createdAt: Date; // Timestamp saat user submit
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

// Daily Sales Recap (Rekap Penjualan Harian)
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
