# SiDoku Backend API

Sistem manajemen inventori untuk toko yang menghadirkan REST API dengan dukungan autentikasi, manajemen produk, stok masuk/keluar, pengeluaran, laporan penjualan, dashboard analitik, dan integrasi AI.

## Daftar Isi

- [Overview](#overview)
- [Struktur Folder](#struktur-folder)
- [Setup & Installation](#setup--installation)
- [Environment Variables](#environment-variables)
- [Menjalankan Aplikasi](#menjalankan-aplikasi)
- [API Endpoints](#api-endpoints)
- [Autentikasi](#autentikasi)
- [Response Format](#response-format)
- [Catatan Penting](#catatan-penting)

---

## Overview

**SiDoku Backend** adalah backend API berbasis Node.js dan Express untuk aplikasi manajemen inventori toko.

Fitur utama:

- Autentikasi user dengan JWT
- Manajemen profil dan akun toko
- Katalog produk dengan kategori dan status archive
- Pencatatan stok masuk dan stok keluar
- Pencatatan pengeluaran toko
- Laporan penjualan harian
- Dashboard ringkasan, insight, stok rendah, dan tren 7 hari
- Integrasi AI untuk prediksi penjualan, insight, recommendation, dan chatbot

Teknologi:

- Express.js
- PostgreSQL
- JWT
- bcryptjs
- Joi
- axios
- dotenv
- cors

---

## Struktur Folder

```
sidoku-backend/
├── src/
│   ├── config/
│   │   └── database.js
│   ├── constants/
│   │   └── productCategories.js
│   ├── controllers/
│   ├── exceptions/
│   ├── middlewares/
│   ├── repositories/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── validators/
│   ├── app.js
│   ├── server.js
│   └── test-db.js
├── docs/
├── .env
├── .gitignore
├── eslint.config.js
├── package.json
└── README.md
```

---

## Setup & Installation

### Prasyarat

- Node.js 14+ atau lebih baru
- npm
- PostgreSQL

### Instalasi

```bash
git clone <repository-url>
cd sidoku-backend
npm install
```

### Menjalankan Aplikasi

```bash
npm start
```

Mode development:

```bash
npm run dev
```

Untuk memeriksa koneksi database:

```bash
node src/test-db.js
```

---

## Environment Variables

Tambahkan file `.env` di root folder dengan nilai berikut:

```env
PORT=5000
NODE_ENV=production
DATABASE_URL=postgresql://username:password@hostname:port/database_name
JWT_SECRET=your-access-token-secret-key
JWT_REFRESH_SECRET=your-refresh-token-secret-key
AI_SERVICE_URL=https://your-ai-service-url
```

Deskripsi:

- `PORT`: nomor port server berjalan.
- `NODE_ENV`: `development` atau `production`.
- `DATABASE_URL`: koneksi PostgreSQL.
- `JWT_SECRET`: secret untuk access token.
- `JWT_REFRESH_SECRET`: secret untuk refresh token.
- `AI_SERVICE_URL`: URL layanan AI eksternal.

---

## API Endpoints

Semua endpoint berada di bawah prefix `/v1`.

### Autentikasi

- `POST /v1/auth/register`
  - body: `{ storeName, email, password, confirmPassword }`

- `POST /v1/auth/login`
  - body: `{ email, password }`

- `PUT /v1/auth/refresh`
  - body: `{ refreshToken }`

- `POST /v1/auth/logout`
  - body: `{ refreshToken }`

- `GET /v1/auth/users`
  - membutuhkan header `Authorization: Bearer <accessToken>`

### Produk

- `GET /v1/products/categories`

- `GET /v1/products`
  - query: `status=active|archived`, `category=<nama kategori>`

- `POST /v1/products`
  - body: `{ productName, purchasePrice, sellingPrice, minimumStock, category, unit, initialStock }`

- `PUT /v1/products/:productId`
  - body: `{ productName, category, unit, purchasePrice, sellingPrice, minimumStock }`

- `PATCH /v1/products/:productId/archive`
- `PATCH /v1/products/:productId/restore`

### Dashboard

- `GET /v1/dashboard/summary`
- `GET /v1/dashboard/insights`
- `GET /v1/dashboard/low-stocks`
- `GET /v1/dashboard/trends`

### Settings

- `GET /v1/settings/profile`
- `PUT /v1/settings/profile`
  - body: `{ ownerName, email, phoneNumber, profileImage }`

- `GET /v1/settings/store-account`
- `PUT /v1/settings/store-account`
  - body: `{ storeName, storeCategory, storeAddress, storeDescription }`

- `PUT /v1/settings/password`
  - body: `{ currentPassword, newPassword, confirmNewPassword }`

### Stok Masuk

- `GET /v1/stocks-in`
  - query: `productId`, `startDate`, `endDate`

- `POST /v1/stocks-in`
  - body: `{ productId, quantity, date, note? }`

- `DELETE /v1/stocks-in/:stockInId`

### Stok Keluar

- `GET /v1/stocks-out`
  - query: `productId`, `date`, `startDate`, `endDate`

- `POST /v1/stocks-out`
  - body: `{ productId, quantity, date, note? }`

- `DELETE /v1/stocks-out/:stockOutId`

### Pengeluaran

- `GET /v1/expenses`
  - query: `category=restock|operational|others`, `startDate`, `endDate`

- `POST /v1/expenses`
  - body: `{ expenseName, category, amount, date, description? }`

- `DELETE /v1/expenses/:expenseId`

### Selling Recap

- `GET /v1/selling-recap`
  - query: `date`

### AI Chatbot

- `POST /v1/ai-chatbot/ask`
  - body: `{ question }`

### AI Analytics

- `GET /v1/ai/forecast/:productId`
  - query: `daysAhead`, `historyDays`

- `GET /v1/ai/insights`
  - query: `historyDays`

- `GET /v1/ai/recommendations`
  - query: `historyDays`

---

## Validasi Input

- Semua payload divalidasi menggunakan `Joi`.
- Kategori produk valid: `Bahan Baku`, `Makanan`, `Minuman`, `Peralatan`, `Lainnya`.
- `date` harus ISO date string.
- `password` minimal 5 karakter.
- `confirmPassword` dan `confirmNewPassword` harus cocok dengan nilai password.

---

## Autentikasi

- Gunakan header `Authorization: Bearer <accessToken>` pada semua endpoint yang dilindungi.
- Access token aktif 1 hari.
- Refresh token aktif 7 hari.

---

## Response Format

Semua response menggunakan helper `src/utils/response.js`.

Contoh sukses:

```json
{
  "status": "success",
  "message": "Login success",
  "data": {
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

Contoh error:

```json
{
  "status": "fail",
  "message": "Email atau password salah."
}
```

---

## Catatan Penting

- AI analytics dan chatbot tergantung pada `AI_SERVICE_URL`.
- `AI_SERVICE_URL` harus diarahkan ke layanan AI yang mendukung endpoint dan payload yang disyaratkan oleh `src/services/aiService.js`.
- Endpoint `/v1/products` mendukung archive dan restore produk.
- Konsistensi data sangat penting: gunakan `productId` yang valid untuk stok masuk, stok keluar, dan AI forecast.

---

## Lisensi

ISC