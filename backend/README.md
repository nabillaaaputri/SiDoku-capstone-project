# SiDoku Backend API

Sistem manajemen inventori (stok) untuk toko dengan fitur lengkap termasuk autentikasi, manajemen produk, stok masuk/keluar, pengeluaran, laporan penjualan, dan AI chatbot.

## Daftar Isi

- [Overview](#overview)
- [Struktur Folder](#struktur-folder)
- [Setup & Installation](#setup--installation)
- [Environment Variables](#environment-variables)
- [Menjalankan Aplikasi](#menjalankan-aplikasi)
- [API Endpoints](#api-endpoints)
- [Autentikasi](#autentikasi)
- [Response Format](#response-format)
- [Error Handling](#error-handling)

---

## Overview

**SiDoku Backend** adalah REST API yang dibangun dengan:

- **Framework**: Express.js (Node.js)
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Token)
- **Password Encryption**: bcryptjs
- **Validation**: Joi
- **CORS**: Enabled

API ini menyediakan layanan untuk mengelola:

- ✅ Autentikasi pengguna (Register, Login, Logout)
- ✅ Manajemen profil dan akun toko
- ✅ Katalog produk dengan kategori
- ✅ Stok masuk dan stok keluar
- ✅ Pencatatan pengeluaran
- ✅ Laporan penjualan
- ✅ Dashboard dengan ringkasan dan insight
- ✅ AI Chatbot untuk bantuan

---

## Struktur Folder

```
sidoku-backend/
│
├── src/
│   ├── config/              # Konfigurasi database
│   │   └── database.js      # Pool PostgreSQL connection
│   │
│   ├── constants/           # Konstanta aplikasi
│   │   └── productCategories.js
│   │
│   ├── controllers/         # Business logic layer
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── dashboardController.js
│   │   ├── settingsController.js
│   │   ├── stockInController.js
│   │   ├── stockOutController.js
│   │   ├── expenseController.js
│   │   ├── sellingRecapController.js
│   │   └── aiChatbotController.js
│   │
│   ├── repositories/        # Data access layer (Database queries)
│   │   ├── authenticationRepository.js
│   │   ├── userRepository.js
│   │   ├── productRepository.js
│   │   ├── dashboardRepository.js
│   │   ├── settingsRepository.js
│   │   ├── stockInRepository.js
│   │   ├── stockOutRepository.js
│   │   ├── expenseRepository.js
│   │   └── sellingRecapRepository.js
│   │
│   ├── routes/              # API endpoints definition
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── dashboardRoutes.js
│   │   ├── settingsRoutes.js
│   │   ├── stockInsRoutes.js
│   │   ├── stockOutsRoutes.js
│   │   ├── expenseRoutes.js
│   │   ├── sellingRecapRoutes.js
│   │   └── aiChatbotRoutes.js
│   │
│   ├── validators/          # Input validation schemas (Joi)
│   │   ├── authValidator.js
│   │   ├── productValidator.js
│   │   ├── settingsValidator.js
│   │   ├── stockInValidator.js
│   │   ├── stockOutValidator.js
│   │   ├── expenseValidator.js
│   │   ├── sellingRecapValidator.js
│   │   └── aiChatbotValidator.js
│   │
│   ├── middlewares/         # Express middleware
│   │   ├── auth.js          # JWT authentication
│   │   ├── validatePayload.js  # Request body validation
│   │   ├── validateQuery.js    # Query parameter validation
│   │   └── error.js         # Error handling middleware
│   │
│   ├── exceptions/          # Custom error classes
│   │   ├── client-error.js
│   │   ├── not-found-error.js
│   │   ├── conflict-error.js
│   │   ├── invariant-error.js
│   │   ├── authentication-error.js
│   │   ├── authorization-error.js
│   │   └── index.js
│   │
│   ├── data/                # Static data / seed data
│   │   ├── users.js
│   │   ├── product.js
│   │   ├── stockIns.js
│   │   ├── stockOuts.js
│   │   ├── expenses.js
│   │   └── settings.js
│   │
│   ├── utils/               # Utility functions
│   │   └── response.js      # Standard response formatter
│   │
│   ├── app.js               # Express app setup
│   ├── server.js            # Server entry point
│   └── test-db.js           # Database connection test
│
├── docs/                    # Documentation (if any)
├── .env                     # Environment variables
├── .gitignore              # Git ignore rules
├── eslint.config.js        # ESLint configuration
├── package.json            # Project dependencies
├── package-lock.json       # Lock file for dependencies
└── README.md               # This file
```

---

## Setup & Installation

### Prerequisites

- Node.js versi 14+
- npm atau yarn
- PostgreSQL database

### Langkah-langkah Instalasi

1. **Clone repository**

   ```bash
   git clone <repository-url>
   cd sidoku-backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Setup environment variables** (lihat [Environment Variables](#environment-variables))

   ```bash
   cp .env.example .env
   # Edit .env dengan konfigurasi Anda
   ```

4. **Test database connection**
   ```bash
   npm run test-db
   # atau jika ingin menjalankan test script
   node src/test-db.js
   ```

---

## Environment Variables

Buat file `.env` di root directory dengan konfigurasi berikut:

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# Database
DATABASE_URL=postgresql://username:password@hostname:port/database_name

# JWT Secrets
JWT_SECRET=your-access-token-secret-key
JWT_REFRESH_SECRET=your-refresh-token-secret-key
```

### Penjelasan:

- **PORT**: Port dimana server berjalan (default: 5000)
- **NODE_ENV**: Environment (`development` atau `production`)
- **DATABASE_URL**: Connection string PostgreSQL (format: `postgresql://user:password@host:port/database`)
- **JWT_SECRET**: Secret key untuk access token (expire dalam 1 hari)
- **JWT_REFRESH_SECRET**: Secret key untuk refresh token (expire dalam 7 hari)

---

## Menjalankan Aplikasi

### Development Mode (dengan auto-reload)

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

Server akan berjalan di `http://localhost:5000`

### Verify Server Status

```bash
curl http://localhost:5000/
```

**Response:**

```json
{
  "status": "success",
  "message": "SiDoku Backend API is running"
}
```

---

## API Endpoints

### Base URL

```
http://localhost:5000/v1
```

### Quick Reference

| Module            | Endpoint                       | Method | Auth | Deskripsi             |
| ----------------- | ------------------------------ | ------ | ---- | --------------------- |
| **Auth**          | `/auth/register`               | POST   | ❌   | Register user baru    |
|                   | `/auth/login`                  | POST   | ❌   | Login user            |
|                   | `/auth/logout`                 | POST   | ✅   | Logout user           |
|                   | `/auth/refresh`                | PUT    | ❌   | Refresh access token  |
|                   | `/auth/users`                  | GET    | ✅   | Get semua user        |
| **Products**      | `/products/categories`         | GET    | ✅   | Get kategori produk   |
|                   | `/products`                    | GET    | ✅   | Get daftar produk     |
|                   | `/products`                    | POST   | ✅   | Tambah produk         |
|                   | `/products/:productId`         | PUT    | ✅   | Edit produk           |
|                   | `/products/:productId/archive` | PATCH  | ✅   | Archive produk        |
|                   | `/products/:productId/restore` | PATCH  | ✅   | Restore produk        |
| **Dashboard**     | `/dashboard/summary`           | GET    | ✅   | Ringkasan dashboard   |
|                   | `/dashboard/insights`          | GET    | ✅   | Insight analitik      |
|                   | `/dashboard/low-stocks`        | GET    | ✅   | Stok yang menipis     |
|                   | `/dashboard/trends`            | GET    | ✅   | Trend penjualan       |
| **Settings**      | `/settings/profile`            | GET    | ✅   | Get profil user       |
|                   | `/settings/profile`            | PUT    | ✅   | Update profil         |
|                   | `/settings/store-account`      | GET    | ✅   | Get akun toko         |
|                   | `/settings/store-account`      | PUT    | ✅   | Update akun toko      |
|                   | `/settings/password`           | PUT    | ✅   | Update password       |
| **Stock In**      | `/stocks-in`                   | GET    | ✅   | Get stok masuk        |
|                   | `/stocks-in`                   | POST   | ✅   | Tambah stok masuk     |
|                   | `/stocks-in/:stockInId`        | DELETE | ✅   | Hapus stok masuk      |
| **Stock Out**     | `/stocks-out`                  | GET    | ✅   | Get stok keluar       |
|                   | `/stocks-out`                  | POST   | ✅   | Tambah stok keluar    |
|                   | `/stocks-out/:stockOutId`      | DELETE | ✅   | Hapus stok keluar     |
| **Expenses**      | `/expenses`                    | GET    | ✅   | Get pengeluaran       |
|                   | `/expenses`                    | POST   | ✅   | Tambah pengeluaran    |
|                   | `/expenses/:expenseId`         | DELETE | ✅   | Hapus pengeluaran     |
| **Selling Recap** | `/selling-recap`               | GET    | ✅   | Get laporan penjualan |
| **AI Chatbot**    | `/ai-chatbot/ask`              | POST   | ✅   | Tanya ke AI           |

---

## Autentikasi

API menggunakan **JWT (JSON Web Token)** untuk autentikasi.

### Token Types

1. **Access Token**
   - Digunakan untuk mengakses protected endpoints
   - Expires dalam 1 hari (24 jam)
   - Dikirim di header: `Authorization: Bearer <access_token>`

2. **Refresh Token**
   - Digunakan untuk mendapatkan access token baru
   - Expires dalam 7 hari
   - Disimpan di database untuk validasi

### Cara Menggunakan

1. **Register**

   ```bash
   POST /v1/auth/register
   ```

2. **Login untuk mendapatkan tokens**

   ```bash
   POST /v1/auth/login
   ```

3. **Gunakan access token untuk request yang memerlukan autentikasi**

   ```bash
   GET /v1/products
   Headers:
   Authorization: Bearer <access_token>
   ```

4. **Refresh access token ketika expired**

   ```bash
   PUT /v1/auth/refresh
   Body: { "refreshToken": "<refresh_token>" }
   ```

5. **Logout**
   ```bash
   POST /v1/auth/logout
   Body: { "refreshToken": "<refresh_token>" }
   ```

---

## Response Format

Semua response API mengikuti format standar:

### Success Response (2xx)

```json
{
  "status": "success",
  "message": "Deskripsi operasi",
  "data": {
    // response data (optional, bergantung endpoint)
  }
}
```

### Client Error Response (4xx)

```json
{
  "status": "fail",
  "message": "Deskripsi error"
}
```

### Server Error Response (5xx)

```json
{
  "status": "error",
  "message": "Internal server error"
}
```

### Contoh Response Sukses

```json
{
  "status": "success",
  "message": "Login success",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

## Error Handling

API menggunakan custom error classes untuk handling error yang lebih baik.

### Error Types

| Error Type            | HTTP Code | Keterangan                                         |
| --------------------- | --------- | -------------------------------------------------- |
| `ConflictError`       | 409       | Resource sudah ada (contoh: email sudah terdaftar) |
| `NotFoundError`       | 404       | Resource tidak ditemukan                           |
| `AuthenticationError` | 401       | Autentikasi gagal (email/password salah)           |
| `AuthorizationError`  | 403       | User tidak memiliki akses                          |
| `InvariantError`      | 400       | Validasi input gagal                               |
| `ClientError`         | 400       | Error dari client                                  |

### Middleware Error Handling

Semua error ditangani oleh middleware error handler di `src/middlewares/error.js` yang mengubah custom error menjadi response format standar.

---

## Detailed Endpoints Documentation

### 1. AUTHENTICATION

#### Register User

```bash
POST /v1/auth/register
```

**Request Body:**

```json
{
  "storeName": "Toko Saya",
  "email": "user@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

**Validation Rules:**

- `storeName`: Required, string
- `email`: Required, valid email format
- `password`: Required, minimum 5 characters
- `confirmPassword`: Required, must match password

**Response (201):**

```json
{
  "status": "success",
  "message": "Register success",
  "data": {
    "id": "user-id-123",
    "storeName": "Toko Saya",
    "email": "user@example.com"
  }
}
```

---

#### Login User

```bash
POST /v1/auth/login
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**

```json
{
  "status": "success",
  "message": "Login success",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

#### Get All Users

```bash
GET /v1/auth/users
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "status": "success",
  "message": "Get all users",
  "data": [
    {
      "id": "user-id-1",
      "storeName": "Toko A",
      "email": "toko-a@example.com"
    },
    {
      "id": "user-id-2",
      "storeName": "Toko B",
      "email": "toko-b@example.com"
    }
  ]
}
```

---

#### Refresh Access Token

```bash
PUT /v1/auth/refresh
```

**Request Body:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**

```json
{
  "status": "success",
  "message": "Access token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

#### Logout User

```bash
POST /v1/auth/logout
```

**Request Body:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**

```json
{
  "status": "success",
  "message": "Logout successful"
}
```

---

### 2. PRODUCTS

#### Get Product Categories

```bash
GET /v1/products/categories
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "status": "success",
  "message": "Get product categories",
  "data": ["Elektronik", "Pakaian", "Makanan"]
}
```

---

#### Get All Products

```bash
GET /v1/products?category=Elektronik&isArchived=false
Authorization: Bearer <access_token>
```

**Query Parameters:**

- `category` (optional): Filter berdasarkan kategori
- `isArchived` (optional): true/false untuk filter produk archived

**Response (200):**

```json
{
  "status": "success",
  "message": "Get products",
  "data": [
    {
      "id": "prod-123",
      "name": "Laptop",
      "category": "Elektronik",
      "price": 5000000,
      "stock": 10,
      "isArchived": false,
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

---

#### Add Product

```bash
POST /v1/products
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "name": "Laptop",
  "category": "Elektronik",
  "price": 5000000,
  "stock": 10,
  "description": "Laptop gaming terbaru"
}
```

**Validation Rules:**

- `name`: Required, string
- `category`: Required, string
- `price`: Required, number > 0
- `stock`: Required, number >= 0
- `description` (optional): string

**Response (201):**

```json
{
  "status": "success",
  "message": "Produk berhasil ditambahkan",
  "data": {
    "id": "prod-123",
    "name": "Laptop",
    "category": "Elektronik",
    "price": 5000000,
    "stock": 10,
    "description": "Laptop gaming terbaru",
    "isArchived": false,
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

---

#### Edit Product

```bash
PUT /v1/products/:productId
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "name": "Laptop Gaming Pro",
  "category": "Elektronik",
  "price": 6000000,
  "stock": 15,
  "description": "Laptop gaming terbaru dengan spesifikasi tinggi"
}
```

**Response (200):**

```json
{
  "status": "success",
  "message": "Produk berhasil diperbarui",
  "data": {
    "id": "prod-123",
    "name": "Laptop Gaming Pro",
    "category": "Elektronik",
    "price": 6000000,
    "stock": 15,
    "updatedAt": "2024-01-15T11:00:00Z"
  }
}
```

---

#### Archive Product

```bash
PATCH /v1/products/:productId/archive
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "status": "success",
  "message": "Produk berhasil diarsipkan"
}
```

---

#### Restore Product

```bash
PATCH /v1/products/:productId/restore
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "status": "success",
  "message": "Produk berhasil dipulihkan"
}
```

---

### 3. DASHBOARD

#### Get Dashboard Summary

```bash
GET /v1/dashboard/summary
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "status": "success",
  "message": "Get dashboard summary",
  "data": {
    "totalProducts": 50,
    "totalStock": 500,
    "totalRevenue": 50000000,
    "totalExpenses": 5000000,
    "netProfit": 45000000
  }
}
```

---

#### Get Dashboard Insights

```bash
GET /v1/dashboard/insights
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "status": "success",
  "message": "Get insights",
  "data": {
    "bestSellingProduct": "Laptop",
    "lowestStockProduct": "Mouse",
    "averageRevenue": 1000000,
    "growthRate": 15.5
  }
}
```

---

#### Get Low Stocks

```bash
GET /v1/dashboard/low-stocks
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "status": "success",
  "message": "Get low stocks",
  "data": [
    {
      "id": "prod-456",
      "name": "Mouse Wireless",
      "stock": 2,
      "minimumStock": 5
    },
    {
      "id": "prod-789",
      "name": "Keyboard",
      "stock": 3,
      "minimumStock": 10
    }
  ]
}
```

---

#### Get Trends

```bash
GET /v1/dashboard/trends
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "status": "success",
  "message": "Get trends",
  "data": {
    "monthly": [
      {
        "month": "January",
        "revenue": 10000000,
        "sales": 50
      },
      {
        "month": "February",
        "revenue": 12000000,
        "sales": 60
      }
    ],
    "dailyTrend": [
      {
        "date": "2024-01-15",
        "revenue": 500000,
        "sales": 5
      }
    ]
  }
}
```

---

### 4. SETTINGS

#### Get User Profile

```bash
GET /v1/settings/profile
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "status": "success",
  "message": "Get profile",
  "data": {
    "id": "user-123",
    "storeName": "Toko Saya",
    "email": "user@example.com",
    "phone": "081234567890",
    "address": "Jl. Merdeka No. 1"
  }
}
```

---

#### Update User Profile

```bash
PUT /v1/settings/profile
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "storeName": "Toko Saya Baru",
  "phone": "081987654321",
  "address": "Jl. Sudirman No. 10"
}
```

**Response (200):**

```json
{
  "status": "success",
  "message": "Profil berhasil diperbarui",
  "data": {
    "id": "user-123",
    "storeName": "Toko Saya Baru",
    "phone": "081987654321",
    "address": "Jl. Sudirman No. 10"
  }
}
```

---

#### Get Store Account

```bash
GET /v1/settings/store-account
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "status": "success",
  "message": "Get store account",
  "data": {
    "storeId": "store-123",
    "storeName": "Toko Saya",
    "accountNumber": "1234567890",
    "bankName": "BCA",
    "accountHolder": "Nama Pemilik"
  }
}
```

---

#### Update Store Account

```bash
PUT /v1/settings/store-account
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "accountNumber": "1234567890",
  "bankName": "BCA",
  "accountHolder": "Nama Pemilik"
}
```

**Response (200):**

```json
{
  "status": "success",
  "message": "Akun toko berhasil diperbarui"
}
```

---

#### Update Password

```bash
PUT /v1/settings/password
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "oldPassword": "oldPassword123",
  "newPassword": "newPassword123",
  "confirmPassword": "newPassword123"
}
```

**Response (200):**

```json
{
  "status": "success",
  "message": "Password berhasil diperbarui"
}
```

---

### 5. STOCK IN (Stok Masuk)

#### Get Stock In Records

```bash
GET /v1/stocks-in?startDate=2024-01-01&endDate=2024-01-31&productId=prod-123
Authorization: Bearer <access_token>
```

**Query Parameters:**

- `startDate` (optional): Filter berdasarkan tanggal mulai (format: YYYY-MM-DD)
- `endDate` (optional): Filter berdasarkan tanggal akhir
- `productId` (optional): Filter berdasarkan produk

**Response (200):**

```json
{
  "status": "success",
  "message": "Get stock in",
  "data": [
    {
      "id": "in-001",
      "productId": "prod-123",
      "productName": "Laptop",
      "quantity": 10,
      "date": "2024-01-15",
      "notes": "Pembelian dari supplier A",
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

---

#### Add Stock In

```bash
POST /v1/stocks-in
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "productId": "prod-123",
  "quantity": 10,
  "date": "2024-01-15",
  "notes": "Pembelian dari supplier A"
}
```

**Validation Rules:**

- `productId`: Required, string (must exist)
- `quantity`: Required, number > 0
- `date`: Required, valid date format
- `notes` (optional): string

**Response (201):**

```json
{
  "status": "success",
  "message": "Stok masuk berhasil ditambahkan",
  "data": {
    "id": "in-001",
    "productId": "prod-123",
    "productName": "Laptop",
    "quantity": 10,
    "date": "2024-01-15",
    "notes": "Pembelian dari supplier A"
  }
}
```

---

#### Delete Stock In Record

```bash
DELETE /v1/stocks-in/:stockInId
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "status": "success",
  "message": "Stok masuk berhasil dihapus"
}
```

---

### 6. STOCK OUT (Stok Keluar)

#### Get Stock Out Records

```bash
GET /v1/stocks-out?startDate=2024-01-01&endDate=2024-01-31&productId=prod-123
Authorization: Bearer <access_token>
```

**Query Parameters:**

- `startDate` (optional): Filter berdasarkan tanggal mulai
- `endDate` (optional): Filter berdasarkan tanggal akhir
- `productId` (optional): Filter berdasarkan produk

**Response (200):**

```json
{
  "status": "success",
  "message": "Get stock out",
  "data": [
    {
      "id": "out-001",
      "productId": "prod-123",
      "productName": "Laptop",
      "quantity": 2,
      "date": "2024-01-16",
      "reason": "Penjualan",
      "notes": "Penjualan ke customer A",
      "createdAt": "2024-01-16T14:00:00Z"
    }
  ]
}
```

---

#### Add Stock Out

```bash
POST /v1/stocks-out
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "productId": "prod-123",
  "quantity": 2,
  "date": "2024-01-16",
  "reason": "Penjualan",
  "notes": "Penjualan ke customer A"
}
```

**Validation Rules:**

- `productId`: Required, string
- `quantity`: Required, number > 0
- `date`: Required, valid date format
- `reason`: Required, string
- `notes` (optional): string

**Response (201):**

```json
{
  "status": "success",
  "message": "Stok keluar berhasil ditambahkan",
  "data": {
    "id": "out-001",
    "productId": "prod-123",
    "quantity": 2,
    "date": "2024-01-16",
    "reason": "Penjualan"
  }
}
```

---

#### Delete Stock Out Record

```bash
DELETE /v1/stocks-out/:stockOutId
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "status": "success",
  "message": "Stok keluar berhasil dihapus"
}
```

---

### 7. EXPENSES (Pengeluaran)

#### Get Expenses

```bash
GET /v1/expenses?startDate=2024-01-01&endDate=2024-01-31&category=Operasional
Authorization: Bearer <access_token>
```

**Query Parameters:**

- `startDate` (optional): Filter berdasarkan tanggal mulai
- `endDate` (optional): Filter berdasarkan tanggal akhir
- `category` (optional): Filter berdasarkan kategori pengeluaran

**Response (200):**

```json
{
  "status": "success",
  "message": "Get expenses",
  "data": [
    {
      "id": "exp-001",
      "description": "Biaya sewa toko",
      "amount": 2000000,
      "category": "Operasional",
      "date": "2024-01-01",
      "notes": "Sewa bulan Januari",
      "createdAt": "2024-01-01T08:00:00Z"
    }
  ]
}
```

---

#### Add Expense

```bash
POST /v1/expenses
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "description": "Biaya sewa toko",
  "amount": 2000000,
  "category": "Operasional",
  "date": "2024-01-01",
  "notes": "Sewa bulan Januari"
}
```

**Validation Rules:**

- `description`: Required, string
- `amount`: Required, number > 0
- `category`: Required, string
- `date`: Required, valid date format
- `notes` (optional): string

**Response (201):**

```json
{
  "status": "success",
  "message": "Pengeluaran berhasil ditambahkan",
  "data": {
    "id": "exp-001",
    "description": "Biaya sewa toko",
    "amount": 2000000,
    "category": "Operasional",
    "date": "2024-01-01"
  }
}
```

---

#### Delete Expense

```bash
DELETE /v1/expenses/:expenseId
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "status": "success",
  "message": "Pengeluaran berhasil dihapus"
}
```

---

### 8. SELLING RECAP (Laporan Penjualan)

#### Get Selling Recap

```bash
GET /v1/selling-recap?startDate=2024-01-01&endDate=2024-01-31&productId=prod-123
Authorization: Bearer <access_token>
```

**Query Parameters:**

- `startDate` (optional): Filter berdasarkan tanggal mulai
- `endDate` (optional): Filter berdasarkan tanggal akhir
- `productId` (optional): Filter berdasarkan produk

**Response (200):**

```json
{
  "status": "success",
  "message": "Get selling recap",
  "data": [
    {
      "productId": "prod-123",
      "productName": "Laptop",
      "totalQuantitySold": 5,
      "totalRevenue": 25000000,
      "averagePrice": 5000000,
      "date": "2024-01-15"
    },
    {
      "productId": "prod-456",
      "productName": "Mouse Wireless",
      "totalQuantitySold": 20,
      "totalRevenue": 600000,
      "averagePrice": 30000,
      "date": "2024-01-15"
    }
  ]
}
```

---

### 9. AI CHATBOT

#### Ask AI Chatbot

```bash
POST /v1/ai-chatbot/ask
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "question": "Berapa total penjualan hari ini?"
}
```

**Validation Rules:**

- `question`: Required, non-empty string

**Response (200):**

```json
{
  "status": "success",
  "message": "Pertanyaan berhasil diproses",
  "data": {
    "question": "Berapa total penjualan hari ini?",
    "answer": "Total penjualan hari ini adalah Rp 5.000.000 dari 10 transaksi penjualan."
  }
}
```

---

## Development Notes

### Architecture Pattern

API ini mengikuti **Clean Architecture** dengan pemisahan layer:

- **Routes**: Mendefinisikan endpoint
- **Controllers**: Menangani business logic
- **Repositories**: Mengelola akses database
- **Validators**: Memvalidasi input request
- **Middlewares**: Menangani authentication, validation, error handling

### Coding Standards

- ESLint digunakan untuk code quality
- Joi untuk request validation
- Custom error handling untuk error consistency
- JWT untuk secure authentication

### Database

- PostgreSQL dengan connection pooling
- Transactions untuk operasi multi-step
- Proper indexing untuk performa query

### Security

- Password hashing dengan bcryptjs
- JWT token dengan secret keys
- CORS enabled untuk cross-origin requests
- Input validation di setiap endpoint

---

## Troubleshooting

### Database Connection Error

```
Error: connect ECONNREFUSED
```

**Solusi:**

- Pastikan PostgreSQL server berjalan
- Cek DATABASE_URL di .env
- Verifikasi username dan password

### Token Expired

```
Error: jwt expired
```

**Solusi:**

- Gunakan refresh token untuk mendapatkan access token baru
- Endpoint: `PUT /v1/auth/refresh`

### Validation Error

```
Error: "Input register tidak valid."
```

**Solusi:**

- Periksa request body sesuai dokumentasi
- Pastikan tipe data dan format benar

---

## License

ISC

---

## Support & Contact

Untuk pertanyaan atau masalah, silakan hubungi tim development.

---

**Last Updated:** 2024-01-15
**Version:** 1.0.0
