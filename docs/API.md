# API Documentation - SiDoku

Dokumentasi lengkap semua endpoint API backend SiDoku.

## Base URL
- Development: `http://localhost:3001`
- Production: `https://sidoku-api.railway.app` (TBD)

## Authentication

Semua request (kecuali `/auth/login` dan `/auth/register`) memerlukan JWT token di header:

```
Authorization: Bearer <your_jwt_token>
```

---

## 🔐 Authentication Endpoints

### Register User
**POST** `/api/auth/register`

Request:
```json
{
  "name": "Pemilik Usaha",
  "email": "user@example.com",
  "password": "securepassword",
  "business_name": "Toko Kelontong Saya"
}
```

Response:
```json
{
  "message": "Registration successful",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Pemilik Usaha"
  }
}
```

---

### Login
**POST** `/api/auth/login`

Request:
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

Response:
```json
{
  "message": "Login successful",
  "token": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Pemilik Usaha"
  }
}
```

---

## 📊 Dashboard Endpoints

### Get Dashboard Summary
**GET** `/api/dashboard/summary`

Query Parameters:
- `startDate`: (optional) Format: YYYY-MM-DD
- `endDate`: (optional) Format: YYYY-MM-DD

Response:
```json
{
  "totalIncome": 5000000,
  "totalExpense": 2000000,
  "profit": 3000000,
  "topProducts": [
    { "id": "1", "name": "Produk A", "sales": 50, "revenue": 2500000 }
  ],
  "lowStockItems": [
    { "id": "2", "name": "Produk B", "currentStock": 5 }
  ],
  "salesTrend": [
    { "date": "2026-05-01", "amount": 500000 }
  ]
}
```

---

## 📦 Product Management Endpoints

### Get All Products
**GET** `/api/products`

Query Parameters:
- `page`: (optional) Default: 1
- `limit`: (optional) Default: 10

Response:
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Produk Roti",
      "cost_price": 10000,
      "selling_price": 15000,
      "current_stock": 100,
      "created_at": "2026-05-03T10:00:00Z"
    }
  ],
  "pagination": { "page": 1, "limit": 10, "total": 25 }
}
```

---

### Create Product
**POST** `/api/products`

Request:
```json
{
  "name": "Produk Roti",
  "cost_price": 10000,
  "selling_price": 15000,
  "current_stock": 100
}
```

Response:
```json
{
  "message": "Product created successfully",
  "product": { "id": "uuid", ... }
}
```

---

### Update Product
**PUT** `/api/products/:id`

Request:
```json
{
  "name": "Produk Roti Update",
  "selling_price": 16000,
  "current_stock": 95
}
```

---

### Delete Product
**DELETE** `/api/products/:id`

---

## 💰 Transaction Endpoints

### Record Income Transaction
**POST** `/api/transactions/income`

Request:
```json
{
  "amount": 500000,
  "product_id": "uuid",
  "quantity": 50,
  "date": "2026-05-03",
  "notes": "Penjualan harian"
}
```

---

### Record Expense Transaction
**POST** `/api/transactions/expense`

Request:
```json
{
  "amount": 200000,
  "category": "operational",
  "description": "Biaya listrik bulan Mei",
  "date": "2026-05-03"
}
```

Kategori pengeluaran:
- `operational` - Biaya operasional (listrik, internet, dll)
- `capital` - Pembelian modal/aset
- `inventory` - Pembelian stok barang

---

### Get All Transactions
**GET** `/api/transactions`

Query Parameters:
- `type`: `income` atau `expense`
- `startDate`: Format YYYY-MM-DD
- `endDate`: Format YYYY-MM-DD
- `page`: (optional)

---

## 📈 Reports Endpoints

### Get Profit/Loss Report
**GET** `/api/reports/profit-loss`

Query Parameters:
- `month`: (optional) Format: MM-YYYY
- `year`: (optional) Format: YYYY

Response:
```json
{
  "period": "05-2026",
  "total_income": 5000000,
  "total_expense": 2000000,
  "profit": 3000000,
  "expense_breakdown": {
    "operational": 1000000,
    "capital": 500000,
    "inventory": 500000
  }
}
```

---

### Get Product Performance Report
**GET** `/api/reports/product-performance`

Response:
```json
{
  "products": [
    {
      "id": "uuid",
      "name": "Produk Roti",
      "total_sold": 500,
      "total_revenue": 7500000,
      "total_cost": 5000000,
      "profit": 2500000,
      "profit_margin": "33%"
    }
  ]
}
```

---

## 🤖 AI Service Endpoints

### Classify Transaction (Auto-Classification)
**POST** `/api/ai/classify`

Request:
```json
{
  "description": "Biaya listrik kantor"
}
```

Response:
```json
{
  "category": "operational",
  "confidence": 0.95
}
```

---

### Get Business Insights
**GET** `/api/ai/insights`

Response:
```json
{
  "summary": "Penjualan minggu ini meningkat 20% dibanding minggu lalu",
  "recommendations": [
    "Tingkatkan stok Produk A karena permintaan tinggi",
    "Biaya operasional bulan ini cukup tinggi, coba kurangi pengeluaran non-essential"
  ],
  "trend": "upward"
}
```

---

## Error Responses

Semua error response menggunakan format:

```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Deskripsi error"
  }
}
```

Common HTTP Status:
- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting

API memiliki rate limit: **100 requests per 15 minutes** per user.

Header response:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1620000000
```

---

## 📝 Pagination

Endpoint yang mengembalikan list menggunakan format:

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```
