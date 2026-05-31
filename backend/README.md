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
│   │   └── database.js               (konfigurasi koneksi PostgreSQL)
│   ├── constants/
│   │   └── productCategories.js      (daftar kategori produk: Bahan Baku, Makanan, Minuman, Peralatan, Lainnya)
│   ├── controllers/                  (logika bisnis untuk setiap fitur)
│   │   ├── aiChatbotController.js
│   │   ├── aiController.js
│   │   ├── authController.js
│   │   ├── dashboardController.js
│   │   ├── expenseController.js
│   │   ├── productController.js
│   │   ├── sellingRecapController.js
│   │   ├── settingsController.js
│   │   ├── stockInController.js
│   │   └── stockOutController.js
│   ├── data/                         (dummy data untuk testing)
│   ├── exceptions/                   (custom error classes)
│   │   ├── authentication-error.js
│   │   ├── authorization-error.js
│   │   ├── client-error.js
│   │   ├── conflict-error.js
│   │   ├── invariant-error.js
│   │   ├── not-found-error.js
│   │   └── index.js
│   ├── middlewares/                  (middleware untuk autentikasi, validasi, error handling)
│   │   ├── auth.js
│   │   ├── error.js
│   │   ├── validatePayload.js
│   │   └── validateQuery.js
│   ├── repositories/                 (akses database untuk setiap fitur)
│   │   ├── aiRepository.js
│   │   ├── authenticationRepository.js
│   │   ├── dashboardRepository.js
│   │   ├── expenseRepository.js
│   │   ├── productRepository.js
│   │   ├── sellingRecapRepository.js
│   │   ├── settingsRepository.js
│   │   ├── stockInRepository.js
│   │   ├── stockOutRepository.js
│   │   └── userRepository.js
│   ├── routes/                       (definisi API endpoints)
│   │   ├── aiChatbotRoutes.js
│   │   ├── aiRoutes.js
│   │   ├── authRoutes.js
│   │   ├── dashboardRoutes.js
│   │   ├── expenseRoutes.js
│   │   ├── productRoutes.js
│   │   ├── sellingRecapRoutes.js
│   │   ├── settingsRoutes.js
│   │   ├── stockInsRoutes.js
│   │   └── stockOutsRoutes.js
│   ├── services/                     (layanan eksternal, e.g., AI service)
│   │   └── aiService.js
│   ├── utils/                        (utilitas helper)
│   │   └── response.js
│   ├── validators/                   (validasi input menggunakan Joi)
│   │   ├── aiChatbotValidator.js
│   │   ├── aiValidator.js
│   │   ├── authValidator.js
│   │   ├── expenseValidator.js
│   │   ├── productValidator.js
│   │   ├── sellingRecapValidator.js
│   │   ├── settingsValidator.js
│   │   ├── stockInValidator.js
│   │   └── stockOutValidator.js
│   ├── seeders/                      (database seeding untuk demo data)
│   │   └── seedDemoData.js
│   ├── app.js                        (konfigurasi Express app)
│   ├── server.js                     (entry point aplikasi)
│   └── test-db.js                    (script untuk test koneksi database)
├── docs/
│   └── SiDoku.txt                    (dokumentasi API detail)
├── .env                              (environment variables - jangan commit)
├── .gitignore
├── eslint.config.js                  (konfigurasi ESLint)
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
  - query: `category=restock|operational|others`, `date`, `startDate`, `endDate`
  - Response mencakup `summary` (total, kategori breakdown, percentage) dan `records`

- `POST /v1/expenses`
  - body: `{ expenseName, category, amount, date, time?, description? }`

- `DELETE /v1/expenses/:expenseId`

### Selling Recap

- `GET /v1/selling-recap`
  - query: `date`

### AI Chatbot

- `POST /v1/ai-chatbot/ask`
  - **Description**: Mengirim pertanyaan ke AI chatbot untuk mendapatkan analisis bisnis interaktif
  - **Authentication**: Membutuhkan header `Authorization: Bearer <accessToken>`
  - **Request Body**: `{ question: string }`
  - **Response**:
    ```json
    {
      "status": "success",
      "message": "AI chatbot response generated successfully",
      "data": {
        "question": "string",
        "answer": "string",
        "aiResponse": "string",
        "action": "string",
        "tag": "string",
        "data": {}
      }
    }
    ```

  **Supported Actions** (AI akan mendeteksi action berdasarkan pertanyaan):
  - `fetch_daily_sales`: Penjualan hari ini
    - Jawaban: Total produk terjual + estimasi pemasukan
  - `fetch_best_selling`: Produk paling laku (7 hari terakhir)
    - Jawaban: Top 3 produk dengan jumlah penjualan
  - `fetch_expenses`: Pengeluaran bulan ini
    - Jawaban: Total pengeluaran bulanan
  - `fetch_profit_loss`: Keuntungan/rugi bulan ini
    - Jawaban: Estimasi profit, total pemasukan, HPP, pengeluaran
  - `fetch_inventory`: Status inventori
    - Jawaban: Daftar produk dengan stok rendah (di bawah minimum)
  - `predict_inventory_depletion`: Prediksi stok yang akan habis
    - Jawaban: Produk dengan stok kritis berdasarkan AI analysis
  - `generate_strategy_recommendation`: Rekomendasi strategi restock
    - Jawaban: Rekomendasi jumlah restock untuk setiap produk
  - `predict_future_sales`: Prediksi penjualan 7 hari ke depan
    - Jawaban: Estimasi jumlah unit yang akan terjual
  - `exit_chat`: Keluar dari sesi chat
    - Jawaban: Konfirmasi penutupan sesi

  **Contoh Request**:

  ```json
  {
    "question": "berapa penjualan hari ini?"
  }
  ```

  **Error Handling**:
  - Status `502`: AI Service tidak tersedia atau error koneksi
  - Status `503`: AI Service overloaded
  - Response error mencakup detail dari AI service

### AI Analytics

- `GET /v1/ai/forecast/:productId`
  - **Description**: Mendapatkan prediksi penjualan produk untuk periode waktu tertentu
  - **Authentication**: Membutuhkan header `Authorization: Bearer <accessToken>`
  - **Parameters**:
    - `productId` (path): ID produk yang akan diprediksi
    - `daysAhead` (query, optional): Jumlah hari ke depan untuk prediksi (default: 7)
    - `historyDays` (query, optional): Jumlah hari riwayat untuk analisis (default: 60)
  - **Response**:
    ```json
    {
      "status": "success",
      "message": "Sales forecast retrieved successfully",
      "data": {
        "productId": "string",
        "product_name": "string",
        "predictions": [
          {
            "date": "string",
            "predicted_qty": number
          }
        ]
      }
    }
    ```
  - **Error**:
    - `404`: Produk tidak ditemukan
    - `400`: Data stok keluar produk belum cukup untuk prediksi

- `GET /v1/ai/insights`
  - **Description**: Mendapatkan insight analisis AI untuk semua produk aktif
  - **Authentication**: Membutuhkan header `Authorization: Bearer <accessToken>`
  - **Parameters**:
    - `historyDays` (query, optional): Jumlah hari riwayat untuk analisis (default: 60)
  - **Response**:
    ```json
    {
      "status": "success",
      "message": "AI insights retrieved successfully",
      "data": {
        "insights": [
          {
            "product_name": "string",
            "status": "critical|warning|safe",
            "stok": number,
            "insight": "string"
          }
        ]
      }
    }
    ```
  - **Error**:
    - `404`: Data produk tidak ditemukan

- `GET /v1/ai/recommendations`
  - **Description**: Mendapatkan rekomendasi restock dari AI untuk semua produk aktif
  - **Authentication**: Membutuhkan header `Authorization: Bearer <accessToken>`
  - **Parameters**:
    - `historyDays` (query, optional): Jumlah hari riwayat untuk analisis (default: 60)
  - **Response**:
    ```json
    {
      "status": "success",
      "message": "AI recommendations retrieved successfully",
      "data": {
        "recommendations": [
          {
            "product_name": "string",
            "current_stock": number,
            "reorder_qty": number,
            "reason": "string"
          }
        ]
      }
    }
    ```
  - **Error**:
    - `404`: Data produk tidak ditemukan

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

## Integrasi AI

### Deskripsi Umum

Sistem ini mengintegrasikan layanan AI eksternal untuk memberikan fitur prediksi, insight, rekomendasi, dan chatbot interaktif. Semua fitur AI bergantung pada `AI_SERVICE_URL` yang dikonfigurasi di environment variables.

### Layanan AI yang Didukung

1. **Sales Forecasting**: Prediksi penjualan berdasarkan riwayat stok keluar
2. **Inventory Insights**: Analisis stok produk dan identifikasi yang kritis
3. **Restock Recommendations**: Rekomendasi jumlah restock optimal
4. **Interactive Chatbot**: Bot conversational untuk analisis bisnis real-time

### Requirements untuk AI Service

AI service yang diarahkan di `AI_SERVICE_URL` harus mendukung endpoint berikut:

1. **Chat Endpoint** (untuk chatbot):
   - Method: `POST`
   - Payload: `{ "message": string }`
   - Response: `{ "response": string, "action": string, "tag": string }`

2. **Forecast Endpoint** (untuk prediksi penjualan):
   - Method: `POST`
   - Payload: `{ "product_name": string, "stok_keluar": array, "stok_masuk": array, "stok": number, "harga_jual": number, "days_ahead": number }`
   - Response: `{ "product_name": string, "predictions": array }`

3. **Insights Endpoint** (untuk analisis stok):
   - Method: `POST`
   - Payload: `{ products: array }`
   - Response: `{ "insights": array }`

4. **Recommendations Endpoint** (untuk rekomendasi restock):
   - Method: `POST`
   - Payload: `{ products: array }`
   - Response: `{ "recommendations": array }`

### Error Handling

Jika AI service mengalami error:

- Status `502`: AI Service tidak tersedia atau error koneksi
- Status `503`: AI Service overloaded/busy
- Pesan error dari AI service akan ditampilkan ke frontend

### Data yang Dikirim ke AI Service

Untuk setiap produk, data yang dikirim ke AI service meliputi:

```json
{
  "product_name": "string",
  "stok": number,
  "harga_jual": number,
  "stok_keluar": [
    {
      "date": "YYYY-MM-DD",
      "qty": number
    }
  ],
  "stok_masuk": [
    {
      "date": "YYYY-MM-DD",
      "qty": number
    }
  ]
}
```

---

## Catatan Penting

### Fitur & Fungsionalitas

1. **Autentikasi**
   - Semua endpoint (kecuali register/login) membutuhkan JWT access token
   - Access token aktif 1 hari, refresh token aktif 7 hari
   - Logout menyimpan refresh token ke blacklist

2. **Manajemen Produk**
   - Produk dapat di-archive dan di-restore
   - Stok tracking otomatis berdasarkan stok masuk dan keluar
   - Support 5 kategori: Bahan Baku, Makanan, Minuman, Peralatan, Lainnya
   - Stok status: Active atau Archived

3. **Dashboard**
   - Summary: ringkasan pemasukan, pengeluaran, profit/loss, jumlah produk
   - Insights: tip & rekomendasi berbasis data
   - Low Stocks: produk dengan stok di bawah minimum
   - Trends: grafik income & expense 7 hari terakhir

4. **Pengeluaran**
   - Kategori: Restock Barang, Biaya Operasional, Lainnya
   - Setiap pengeluaran mencatat waktu pembayaran
   - Response termasuk summary: total, per kategori, dan percentage

5. **Stok Masuk & Stok Keluar**
   - Tracking otomatis update stok produk
   - Support query filter berdasarkan produk, tanggal, atau range tanggal
   - Setiap pencatatan menyimpan note opsional

6. **AI Analytics & Chatbot**
   - Prediksi penjualan per produk (sales forecasting)
   - Analisis stok dan identifikasi kritis (insights)
   - Rekomendasi restock optimal (recommendations)
   - Chat bot interaktif untuk analisis bisnis real-time
   - Semua fitur AI bergantung pada AI_SERVICE_URL

7. **Selling Recap**
   - Laporan penjualan berdasarkan tanggal
   - Menampilkan detail produk terjual, kuantitas, dan total income

8. **Settings**
   - Profile: data owner (nama, email, telepon, foto)
   - Store Account: data toko (nama, kategori, alamat, deskripsi)
   - Password: update password dengan verifikasi password lama

### Validasi Input

- **Semua payload** divalidasi menggunakan Joi schema
- **Kategori Produk** valid: `Bahan Baku`, `Makanan`, `Minuman`, `Peralatan`, `Lainnya`
- **Kategori Pengeluaran** valid: `restock`, `operational`, `others`
- **Date format**: ISO date string (YYYY-MM-DD)
- **Time format**: HH:mm (24-hour format)
- **Password**: minimal 5 karakter
- **Confirmation fields**: confirmPassword dan confirmNewPassword harus cocok

### Error Handling

Middleware error handling menangani semua jenis error:

- `ClientError` (400): Input validation error
- `AuthenticationError` (401): Token tidak valid atau sesi berakhir
- `AuthorizationError` (403): User tidak berhak akses resource
- `NotFoundError` (404): Resource tidak ditemukan
- `ConflictError` (409): Data sudah exist (e.g., email duplikat)
- `InvariantError` (500): Server error umum

### AI Service Integration

- **Requirements**: AI service harus support endpoint POST untuk chat, forecast, insights, dan recommendations
- **Error Handling**: Jika AI service error, akan return status 502/503 dengan pesan error dari service
- **Data Sent**: Product profile lengkap termasuk stok, harga, history stok masuk/keluar

### Debugging & Development

```bash
# Test koneksi database
node src/test-db.js

# Seed demo data (jika ada)
node src/seeders/seedDemoData.js
```

### Best Practices

- Jangan hardcode environment variables, selalu gunakan .env file
- Backup DATABASE_URL dan JWT secrets dengan aman
- Pastikan AI_SERVICE_URL accessible dari server
- Monitor response time AI service, set timeout jika perlu
- Gunakan query filters (category, date, startDate, endDate) untuk optimize database queries
- Archive produk bukan delete untuk menjaga historical data

---

## Lisensi

ISC
