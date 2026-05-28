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

- AI analytics dan chatbot tergantung pada `AI_SERVICE_URL`.
- `AI_SERVICE_URL` harus diarahkan ke layanan AI yang mendukung endpoint dan payload yang disyaratkan oleh `src/services/aiService.js`.
- Endpoint `/v1/products` mendukung archive dan restore produk.
- Konsistensi data sangat penting: gunakan `productId` yang valid untuk stok masuk, stok keluar, dan AI forecast.

---

## Lisensi

ISC
