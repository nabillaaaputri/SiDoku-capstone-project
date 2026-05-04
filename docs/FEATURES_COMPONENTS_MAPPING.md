# Features & Components Mapping - SiDoku

Mapping lengkap antara features yang ada di project plan dengan components dan API endpoints.

## 📋 Feature Overview

Berdasarkan project plan, SiDoku memiliki 5 modul utama + 2 modul advanced:

| # | Modul | Status | Pages | Components |
|---|-------|--------|-------|-----------|
| 1 | Landing Page & Auth | In-Scope | Landing, Login, Register | ✅ |
| 2 | Dashboard Bisnis | In-Scope | Dashboard | ✅ |
| 3 | Manajemen Stok | In-Scope | Products | ✅ |
| 4 | Pencatatan Transaksi | In-Scope | Transactions | ✅ |
| 5 | Laporan Keuangan | In-Scope | Reports | ✅ |
| 6 | Business Insights | In-Scope | Insights | ✅ |
| 7 | AI Chatbot | Advanced | - | (Future) |

---

## 1️⃣ Landing Page & Authentication

### Pages

```
Frontend Routes:
├── / (Landing Page)
├── /login
├── /register
└── /forgot-password (optional)
```

### Components

```
components/
├── Common/
│   ├── Header.jsx              # Navigation bar dengan logo
│   ├── Footer.jsx              # Footer dengan links
│   └── Navigation.jsx          # Menu utama
│
└── Auth/
    ├── LoginForm.jsx           # Form input email & password
    ├── RegisterForm.jsx        # Form untuk register user baru
    ├── ProtectedRoute.jsx      # HOC untuk route protection
    └── ForgotPasswordForm.jsx  # (Optional) Reset password

pages/
├── LandingPage.jsx             # Penjelasan features, benefits, CTA
├── LoginPage.jsx               # Login form + redirect
├── RegisterPage.jsx            # Register form
└── NotFoundPage.jsx            # 404 error page
```

### API Endpoints

```
POST   /api/auth/register       - Register user baru
POST   /api/auth/login          - Login & dapatkan token
POST   /api/auth/logout         - Logout (invalidate token)
POST   /api/auth/refresh-token  - Refresh JWT token
PUT    /api/auth/profile        - Update profile user
GET    /api/auth/me             - Get current user info
POST   /api/auth/forgot-password - Request password reset (optional)
```

### Key Features

- Input validation (email format, password strength)
- JWT token management
- Session persistence
- Auto-logout on token expiry
- Responsive form design
- Error messages display

---

## 2️⃣ Dashboard Bisnis Interaktif

### Pages

```
Frontend Routes:
├── /dashboard                  # Main dashboard view
├── /dashboard/daily            # Daily summary
└── /dashboard/monthly          # Monthly summary (optional)
```

### Components

```
components/
└── Dashboard/
    ├── SummaryCards.jsx        # Cards untuk Total Income, Expense, Profit
    ├── SalesChart.jsx          # Chart tren penjualan (Recharts)
    ├── ExpenseChart.jsx        # Chart breakdown pengeluaran
    ├── TopProducts.jsx         # Tabel produk terlaris
    ├── LowStockAlert.jsx       # Alert produk hampir habis
    ├── RecentTransactions.jsx  # Tabel transaksi terbaru
    ├── QuickActions.jsx        # Tombol quick action
    └── DateRangeFilter.jsx     # Filter date range

pages/
└── DashboardPage.jsx           # Layout utama dashboard
```

### API Endpoints

```
GET   /api/dashboard/summary    - Get ringkasan bisnis (income, expense, profit, etc)
GET   /api/dashboard/trends     - Get trend data untuk chart
GET   /api/dashboard/alerts     - Get alerts (low stock, etc)
GET   /api/dashboard/overview   - Get complete dashboard data
```

### Data Displayed

```json
{
  "totalIncome": 5000000,
  "totalExpense": 2000000,
  "profit": 3000000,
  "profitMargin": "60%",
  "topProducts": [...],
  "lowStockItems": [...],
  "salesTrend": [...],
  "expenseBreakdown": {
    "operational": 1000000,
    "capital": 500000,
    "inventory": 500000
  }
}
```

### Key Features

- Real-time data display
- Multiple chart types (line, pie, bar)
- Responsive grid layout
- Date range filtering
- Quick action buttons
- Clickable elements linking to detail pages

---

## 3️⃣ Manajemen Produk & Stok

### Pages

```
Frontend Routes:
├── /products                   # List produk
├── /products/new               # Form tambah produk
├── /products/:id               # Detail produk
├── /products/:id/edit          # Edit produk
└── /products/low-stock         # Produk hampir habis (optional)
```

### Components

```
components/
└── Products/
    ├── ProductTable.jsx        # Tabel daftar produk
    ├── ProductForm.jsx         # Form add/edit produk
    ├── ProductCard.jsx         # Card view produk (optional)
    ├── ProductSearch.jsx       # Search & filter
    ├── StockInput.jsx          # Input untuk stock update
    ├── PriceInput.jsx          # Input untuk harga
    ├── ProductActions.jsx      # Edit/Delete/View buttons
    └── BulkStockUpdate.jsx     # Update multiple produk sekaligus

pages/
├── ProductsPage.jsx            # Main products list page
├── ProductDetailPage.jsx       # Detail produk + history
└── AddProductPage.jsx          # Form untuk tambah/edit
```

### API Endpoints

```
GET    /api/products            - Get list produk (paginated)
GET    /api/products/:id        - Get detail produk
POST   /api/products            - Create produk baru
PUT    /api/products/:id        - Update produk
DELETE /api/products/:id        - Hapus produk
GET    /api/products/low-stock  - Get produk dengan stok rendah
POST   /api/products/bulk-update - Update multiple produk
```

### Form Fields

```
- Nama Produk (required)
- Harga Modal / HPP (required)
- Harga Jual (required)
- Stok Awal (required)
- Min Stock (untuk alert)
- Kategori (select)
- Supplier (optional)
- Deskripsi (optional)
- Unit (e.g., pcs, kg, ltr)
```

### Key Features

- CRUD operations
- Stock tracking with history
- Profit margin calculation
- Search & filter
- Pagination
- Bulk operations
- Stock alerts
- Cost vs. Selling price visualization

---

## 4️⃣ Pencatatan Transaksi Keuangan

### Pages

```
Frontend Routes:
├── /transactions               # List semua transaksi
├── /transactions/new           # Form input transaksi
├── /transactions/income        # Khusus income transactions
├── /transactions/expense       # Khusus expense transactions
└── /transactions/:id/edit      # Edit transaksi
```

### Components

```
components/
└── Transactions/
    ├── TransactionTable.jsx    # Tabel daftar transaksi
    ├── TransactionForm.jsx     # Form add/edit transaksi
    ├── IncomeForm.jsx          # Form khusus income
    ├── ExpenseForm.jsx         # Form khusus expense
    ├── TransactionFilter.jsx   # Filter by date, type, category
    ├── CategorySelect.jsx      # Select kategori (with AI suggestion)
    ├── TransactionSearch.jsx   # Search transaksi
    ├── AmountInput.jsx         # Input dengan formatting
    ├── DatePicker.jsx          # Date selection
    └── TransactionDetails.jsx  # Detail modal/drawer
```

### API Endpoints

```
GET    /api/transactions         - Get semua transaksi
GET    /api/transactions/:id     - Get detail transaksi
POST   /api/transactions/income  - Record penjualan/income
POST   /api/transactions/expense - Record pengeluaran
PUT    /api/transactions/:id     - Update transaksi
DELETE /api/transactions/:id     - Hapus transaksi
GET    /api/transactions/summary - Get ringkasan transaksi
```

### Transaction Categories

**Income:**
- `sales` - Penjualan produk

**Expense:**
- `operational` - Biaya operasional (listrik, internet, gaji, dll)
- `capital` - Pembelian modal/aset
- `inventory` - Pembelian stok barang

### Transaction Form Fields

```
Common:
- Tanggal (date picker)
- Jumlah (amount in Rp)
- Kategori (select)
- Deskripsi/Notes (textarea)

Income:
- Product (select - optional)
- Quantity sold
- Unit Price
- Auto-calculated total

Expense:
- Expense Type (operational/capital/inventory)
- Detail/Tujuan (e.g., "Beli bahan baku")
- Supplier (optional)
- Receipt/Bukti (file upload - optional)
```

### Key Features

- Dual forms (income & expense)
- AI-assisted categorization
- Date range filtering
- Category breakdown
- Currency formatting
- Quantity tracking for products
- Receipt/attachment support (future)
- Bulk import (future)

---

## 5️⃣ Laporan Keuangan Otomatis

### Pages

```
Frontend Routes:
├── /reports                    # Main reports page
├── /reports/profit-loss        # Laporan rugi-laba
├── /reports/product-performance - Performa produk
└── /reports/cash-flow          # Laporan arus kas (optional)
```

### Components

```
components/
└── Reports/
    ├── ProfitLossReport.jsx    # Laporan L/R dengan breakdown
    ├── ProductPerformance.jsx  # Tabel performa per produk
    ├── ReportFilters.jsx       # Filter period/date
    ├── ReportChart.jsx         # Visualisasi laporan
    ├── ReportTable.jsx         # Detail data laporan
    ├── ExportButton.jsx        # Export (PDF, Excel, CSV)
    └── PrintReport.jsx         # Print-friendly view

pages/
├── ReportsPage.jsx             # Main reports hub
├── ProfitLossPage.jsx          # Detail profit/loss report
└── ProductPerformancePage.jsx  # Product report detail
```

### API Endpoints

```
GET   /api/reports/profit-loss     - Laporan laba rugi (period-based)
GET   /api/reports/product-perf    - Performa setiap produk
GET   /api/reports/cash-flow       - Laporan arus kas (optional)
POST  /api/reports/export          - Export laporan (PDF/Excel/CSV)
```

### Report Data Structure

**Profit & Loss Report:**
```json
{
  "period": "Mei 2026",
  "total_income": 5000000,
  "total_expense": 2000000,
  "gross_profit": 3000000,
  "profit_margin": "60%",
  "expense_breakdown": {
    "operational": 1000000,
    "capital": 500000,
    "inventory": 500000
  }
}
```

**Product Performance:**
```json
[
  {
    "product_id": "uuid",
    "product_name": "Roti",
    "units_sold": 500,
    "revenue": 7500000,
    "cogs": 5000000,
    "profit": 2500000,
    "margin": "33%",
    "rank": 1
  }
]
```

### Key Features

- Period-based filtering (daily, weekly, monthly, yearly)
- Multiple report types
- Detailed breakdown by category
- Product ranking
- Profit margin calculation
- Export functionality (PDF, Excel, CSV)
- Print-friendly format
- Trend comparison (vs previous period)
- Customizable date ranges

---

## 6️⃣ Business Insights & Performance Analysis

### Pages

```
Frontend Routes:
├── /insights                   # Main insights page
├── /insights/trends            # Trend analysis
├── /insights/recommendations   # AI recommendations
└── /insights/alerts            # Business alerts
```

### Components

```
components/
└── Insights/
    ├── InsightCard.jsx         # Individual insight display
    ├── TrendChart.jsx          # Trend visualization
    ├── RecommendationCard.jsx  # Rekomendasi dari AI
    ├── AlertBox.jsx            # Alert/warning messages
    ├── SentimentIndicator.jsx  # Business health indicator
    ├── MetricsDisplay.jsx      # KPI metrics
    └── InsightFilter.jsx       # Filter insights

pages/
├── InsightsPage.jsx            # Main insights hub
├── TrendsPage.jsx              # Detailed trend analysis
└── RecommendationsPage.jsx     # AI recommendations
```

### API Endpoints

```
GET   /api/ai/insights           - Get business insights
GET   /api/ai/recommendations    - Get AI-generated recommendations
GET   /api/insights/trends       - Get trend analysis
GET   /api/insights/alerts       - Get alerts
POST  /api/ai/analyze            - Request custom analysis
```

### Insight Types

1. **Trends**
   - Revenue increasing/decreasing
   - Top-selling products shift
   - Expense pattern changes

2. **Recommendations**
   - Stock products with high demand
   - Reduce operational costs
   - Focus on high-margin products

3. **Alerts**
   - Low stock items
   - Unusual spending
   - Cash flow warnings

### Example Insight Data

```json
{
  "insights": [
    {
      "type": "trend",
      "title": "Penjualan Meningkat 20%",
      "content": "Penjualan minggu ini 20% lebih tinggi dari minggu lalu",
      "metrics": {
        "current": 5000000,
        "previous": 4000000,
        "change": 25
      },
      "confidence": 0.95,
      "priority": "high"
    }
  ],
  "recommendations": [
    {
      "type": "stock",
      "title": "Tingkatkan Stok Roti",
      "content": "Produk Roti memiliki penjualan tinggi, stok mungkin akan habis"
    }
  ]
}
```

### Key Features

- AI-generated insights
- Real-time alerts
- Trend prediction
- Actionable recommendations
- Confidence scoring
- Historical comparison
- Exportable insights
- Priority-based display

---

## 7️⃣ Advanced Features (Backlog)

### AI Chatbot Assistant

```
components/
└── Chatbot/
    ├── ChatWindow.jsx          # Chat interface
    ├── ChatMessage.jsx         # Individual message
    ├── ChatInput.jsx           # Message input
    └── ChatHistory.jsx         # Conversation history
```

**Features:**
- Natural language Q&A
- Business insights explanation
- Transaction categorization help
- Financial advice based on data
- Quick-reply suggestions

---

## 🎯 Component Development Priority

### Phase 1 (MVP) - Priority: HIGH
1. Auth components (Login, Register)
2. Dashboard components
3. Product CRUD
4. Transaction recording
5. Basic reports

### Phase 2 - Priority: MEDIUM
1. Advanced filtering
2. Insights & recommendations
3. Export functionality
4. Stock history tracking
5. Detailed analytics

### Phase 3 (Future) - Priority: LOW
1. AI Chatbot
2. Mobile app
3. Payment integration
4. Multi-user support
5. Advanced forecasting

---

## 📦 Component Reusability Matrix

| Component | Used In | Instances |
|-----------|---------|-----------|
| Button | All pages | 50+ |
| Card | Dashboard, Reports, Insights | 15+ |
| Table | Products, Transactions, Reports | 8 |
| Chart | Dashboard, Reports | 6 |
| Input | All forms | 20+ |
| Select | Transaction, Product forms | 10+ |
| Modal/Dialog | Delete confirmations, Details | 8 |
| Alert | All pages | 20+ |

---

## 🔄 Data Flow Example

### Recording a Sale Transaction

```
User Input (Transactions Page)
    ↓
TransactionForm Component
    ↓
Submit data to backend: POST /api/transactions/income
    ↓
Backend validates input
    ↓
AI Service classifies category (async)
    ↓
Save to database
    ↓
Update product stock
    ↓
Return success response
    ↓
Update Frontend state
    ↓
Redirect to transactions list
    ↓
Show success toast
    ↓
Dashboard auto-refreshes with new data
```

---

## ✅ Development Checklist

- [ ] Setup project structure
- [ ] Create base components (Button, Input, Card, etc)
- [ ] Setup React Router
- [ ] Setup state management (Context API)
- [ ] Create service layer (Axios)
- [ ] Build Auth flow
- [ ] Build Dashboard
- [ ] Build Products module
- [ ] Build Transactions module
- [ ] Build Reports module
- [ ] Build Insights module
- [ ] Testing
- [ ] Deployment
