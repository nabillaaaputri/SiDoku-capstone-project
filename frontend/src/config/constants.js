// Frontend configuration and constants

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
export const AI_SERVICE_URL = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8000'

export const TRANSACTION_CATEGORIES = {
  INCOME: {
    SALES: 'sales',
  },
  EXPENSE: {
    OPERATIONAL: 'operational',
    CAPITAL: 'capital',
    INVENTORY: 'inventory',
  },
}

export const TRANSACTION_TYPES = {
  INCOME: 'income',
  EXPENSE: 'expense',
}

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  LOGOUT: '/api/auth/logout',
  REFRESH_TOKEN: '/api/auth/refresh-token',
  GET_ME: '/api/auth/me',
  UPDATE_PROFILE: '/api/auth/profile',

  // Dashboard
  DASHBOARD_SUMMARY: '/api/dashboard/summary',
  DASHBOARD_TRENDS: '/api/dashboard/trends',
  DASHBOARD_ALERTS: '/api/dashboard/alerts',

  // Products
  GET_PRODUCTS: '/api/products',
  GET_PRODUCT: '/api/products/:id',
  CREATE_PRODUCT: '/api/products',
  UPDATE_PRODUCT: '/api/products/:id',
  DELETE_PRODUCT: '/api/products/:id',
  LOW_STOCK_PRODUCTS: '/api/products/low-stock',

  // Transactions
  GET_TRANSACTIONS: '/api/transactions',
  GET_TRANSACTION: '/api/transactions/:id',
  RECORD_INCOME: '/api/transactions/income',
  RECORD_EXPENSE: '/api/transactions/expense',
  UPDATE_TRANSACTION: '/api/transactions/:id',
  DELETE_TRANSACTION: '/api/transactions/:id',

  // Reports
  PROFIT_LOSS_REPORT: '/api/reports/profit-loss',
  PRODUCT_PERFORMANCE_REPORT: '/api/reports/product-perf',
  CASH_FLOW_REPORT: '/api/reports/cash-flow',
  EXPORT_REPORT: '/api/reports/export',

  // AI Services
  CLASSIFY_TRANSACTION: '/api/ai/classify',
  GET_INSIGHTS: '/api/ai/insights',
  PREDICT_SALES: '/api/ai/predict',
  GET_RECOMMENDATIONS: '/api/ai/recommendations',
}
