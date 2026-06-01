# SiDoku AI Service

Folder ini merupakan folder utama dari AI-Service yang digunakan pada aplikasi siDoku, terdapat dua AI dengan model utama adalah forecasting menggunakan GRU dan chatbot sebagai asisten berbasis API LLM dari Groq dengan model llama

---

## Daftar Isi

- [Struktur Folder](#struktur-folder)
- [Setup Lokal](#setup-lokal)
- [Environment Variables](#environment-variables)
- [Dokumentasi API](#dokumentasi-api)
- [Chatbot Actions](#chatbot-actions)
- [Alur Data dari Database](#alur-data-dari-database)
- [Status Produk](#status-produk)
- [Deployment ke Railway](#deployment-ke-railway)
- [Catatan Penting untuk Backend](#catatan-penting-untuk-backend)

## Struktur Folder

```
ai-service/
├── chatbot/
│   ├── __init__.py            # Package marker
│   ├── chatbot.py             # Engine chatbot menggunakan Groq API (llama-3.3-70b-versatile)
│   └── test_chatbot.py        # Unit tests (pytest, tanpa network call)
├── models/
│   ├── sales_forecasting_store1.keras  # Model GRU hasil training
│   ├── scaler.joblib                   # MinMaxScaler
│   ├── feature_cols.joblib             # Urutan 26 fitur model
│   ├── features_to_scale.joblib        # Fitur yang perlu di-scale
│   └── product_map.joblib              # Mapping produk → embedding ID
├── routes/
│   ├── chat.py             # Endpoint POST /chat
│   ├── predict.py          # Endpoint POST /predict
│   ├── insights.py         # Endpoint POST /insights
│   └── recommend.py        # Endpoint POST /recommend
├── services/
│   └── forecasting.py      # Loader model + feature engineering + inferensi
├── main.py                 # FastAPI app entry point
├── requirements.txt
├── Procfile                # Untuk Railway deployment
└── .env.example
```

---

## Setup Lokal

### 1. Buat Virtual Environment

```bash
py -3.12 -m venv .venv

# Windows
.venv\Scripts\activate

# Linux / Mac
source .venv/bin/activate
```

### 2. Install Dependensi

```bash
pip install -r requirements.txt
```

> Catatan: `tensorflow-cpu` lumayan berat (200MB). Untuk pengembangan lokal tanpa prediksi, endpoint `/predict`, `/insights`, `/recommend` akan mengembalikan **503** (model tidak tersedia), tetapi `/chat` tetap berfungsi normal.

### 3. Buat File `.env`

```bash
cp .env.example .env
```

> Catatan: Edit sesuai konfigurasi lokal, pastikan menambahkan `GROQ_API_KEY`.

### 4. Jalankan Server

```bash
python main.py
```

atau

```bash
uvicorn main:app --reload --port 8000
```

---

## Environment Variables

Salin `.env.example` menjadi `.env` dan sesuaikan:

| Variable                | Default                 | Keterangan                                        |
| ----------------------- | ----------------------- | ------------------------------------------------- |
| `FASTAPI_ENV`           | `development`           | Set `production` untuk Railway                    |
| `API_PORT`              | `8000`                  | Port lokal (Railway menggunakan `$PORT` otomatis) |
| `GROQ_API_KEY`          | _(kosong)_              | Kunci API Groq untuk Chatbot LLM                  |
| `BACKEND_URL`           | `http://localhost:3001` | URL Express.js backend (untuk CORS)               |
| `FRONTEND_URL`          | `http://localhost:5173` | URL frontend (untuk CORS)                         |
| `RAILWAY_PUBLIC_DOMAIN` | _(kosong)_              | Diisi otomatis oleh Railway                       |
| `LOG_LEVEL`             | `INFO`                  | Level logging (`DEBUG`, `INFO`, `WARNING`)        |

---

## Dokumentasi API

Seluruh dokumentasi endpoint lengkap dengan request body, response schema, dan contoh tersedia di endpoint:

**`/docs`** (Swagger UI)

**`/redoc`** (ReDoc)

Swagger UI otomatis di-generate oleh FastAPI dari kode endpoint yang ada.

---

## Chatbot Actions & Alur NLG

Endpoint `POST /chat` menggunakan **Groq API** (model `llama-3.3-70b-versatile`) untuk **dua tujuan utama**:
1. **Tahap 1 (Intent Routing):** Menganalisis pertanyaan awal untuk menentukan `action` dan mengekstrak `params` jika diperlukan.
2. **Tahap 2 (Natural Language Generation/NLG):** Merangkai kalimat jawaban natural setelah diberikan *raw data* dari backend.

### Alur Umum 2 Tahap

```
Frontend kirim pesan
    → Express POST /chat ke AI Service (Tahap 1: hanya teks)
    → AI Service membalas { action: "fetch_xxx" }
    → Express query data mentah dari Database / Model ML
    → Express POST /chat kembali (Tahap 2: mengirim JSON berisi question + data)
    → AI Service merangkai jawaban ramah dari data
    → Express kirim jawaban akhir AI ke Frontend
```

### Tabel Semua Action Tahap 1

| `action`                           | Yang Harus Dilakukan Backend                                                                                          |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `""` (string kosong)               | AI Service sudah menjawab (misal: sapaan/luar konteks). Langsung kembalikan `response`.                               |
| `fetch_business_summary`           | Ambil ringkasan performa gabungan (penjualan, laba/rugi, produk terlaris) dari DB                                     |
| `fetch_daily_sales`                | Query total penjualan hari ini dari tabel `Stok_Keluar` (`tanggal_keluar = CURRENT_DATE`)                             |
| `fetch_best_selling`               | Query produk dengan penjualan tertinggi (terlaris) dari DB (misal dalam 7 hari terakhir)                              |
| `fetch_expenses`                   | Query total pengeluaran dari tabel `Pengeluaran`                                                                      |
| `fetch_profit_loss`                | Hitung laba = total pemasukan − total pengeluaran dari DB                                                             |
| `fetch_inventory`                  | Query semua produk beserta stok terkini dari tabel `Produk`                                                           |
| `predict_inventory_depletion`      | Ambil semua produk + histori stok → `POST /insights`                                                                  |
| `predict_future_sales`             | Ambil produk + histori stok → `POST /predict`. LLM mengekstrak `params.product_name` dan `params.days_ahead` (maks 14 hari) |
| `generate_strategy_recommendation` | Ambil semua produk + histori + ringkasan bisnis → `POST /recommend`                                                   |

### Contoh Implementasi di Express.js

```js
// POST /api/chat
// TAHAP 1: Ambil Action + Params
const aiRes = await axios.post(`${AI_URL}/chat`, { message: req.body.message });
const { response, action, tag, params = {} } = aiRes.data;

// Jika action kosong, ini hanya sapaan santai atau di luar konteks
if (!action) {
  return res.json({ answer: response });
}

let data = null;

// Eksekusi data berdasarkan action
switch (action) {
  case "fetch_business_summary":
    data = await getBusinessSummaryFromDB(req.user.id);
    break;
  case "fetch_daily_sales":
    data = await getDailySalesFromDB(req.user.id);
    break;
  case "predict_future_sales":
    // Gunakan params.product_name dan params.days_ahead (sudah di-cap 14 hari oleh backend)
    data = await predictSalesForProduct(req.user.id, params.product_name, params.days_ahead ?? 7);
    break;
  // ... tangani action lainnya
}

// TAHAP 2: Generate Jawaban Natural dari Data
// Tambahkan _scenario:2 agar LLM tidak salah mengidentifikasi sebagai Skenario 1
const finalPrompt = JSON.stringify({ _scenario: 2, question: req.body.message, data });
const finalAiRes = await axios.post(`${AI_URL}/chat`, { message: finalPrompt });

res.json({ answer: finalAiRes.data.response });
```

---

## Alur Data dari Database

AI Service menerima **raw rows langsung dari tabel DB** — tidak perlu preprocessing di backend. Semua feature engineering dilakukan di dalam AI Service.

### Mapping Tabel DB → Field Request API

| Tabel DB      | Field DB         | Field di Request AI            |
| ------------- | ---------------- | ------------------------------ |
| `Produk`      | `nama_produk`    | `product_name`                 |
| `Produk`      | `stok`           | `stok`                         |
| `Produk`      | `harga_jual`     | `harga_jual`                   |
| `Stok_Keluar` | `tanggal_keluar` | `stok_keluar[].tanggal_keluar` |
| `Stok_Keluar` | `jumlah`         | `stok_keluar[].jumlah`         |
| `Stok_Masuk`  | `tanggal_masuk`  | `stok_masuk[].tanggal_masuk`   |
| `Stok_Masuk`  | `jumlah`         | `stok_masuk[].jumlah`          |

### Contoh Query SQL di Express.js

```js
// Ambil data untuk /predict atau /insights
const produk = await db.query(
  "SELECT nama_produk, stok, harga_jual FROM Produk WHERE produk_id = $1",
  [produkId],
);

const keluar = await db.query(
  `SELECT to_char(tanggal_keluar, 'YYYY-MM-DD') AS tanggal_keluar, jumlah
   FROM Stok_Keluar
   WHERE produk_id = $1 AND tanggal_keluar >= NOW() - INTERVAL '60 days'
   ORDER BY tanggal_keluar ASC`,
  [produkId],
);

const masuk = await db.query(
  `SELECT to_char(tanggal_masuk, 'YYYY-MM-DD') AS tanggal_masuk, jumlah
   FROM Stok_Masuk
   WHERE produk_id = $1 AND tanggal_masuk >= NOW() - INTERVAL '60 days'
   ORDER BY tanggal_masuk ASC`,
  [produkId],
);

// Kirim ke AI Service
await axios.post(`${AI_URL}/predict`, {
  product_name: produk.rows[0].nama_produk,
  stok: produk.rows[0].stok,
  harga_jual: produk.rows[0].harga_jual,
  stok_keluar: keluar.rows,
  stok_masuk: masuk.rows,
  days_ahead: 7,
});
```

---

## Status Produk

Status dihitung otomatis oleh AI Service berdasarkan prediksi demand 7 hari vs stok saat ini.

| Status       | Kondisi                         | Arti                                |
| ------------ | ------------------------------- | ----------------------------------- |
| `critical`   | `stok < demand_7d × 0.3`        | Stok sangat menipis, segera reorder |
| `overstock`  | `stok ≥ demand_7d × 2.0`        | Stok berlebihan                     |
| `increasing` | `demand_7d > avg_demand × 1.15` | Permintaan sedang meningkat         |
| `normal`     | Selain kondisi di atas          | Stok dalam kondisi aman             |

Status dievaluasi secara **berurutan** (prioritas dari atas ke bawah). Satu produk hanya mendapat satu status.

---

## Deployment ke Railway

### 1. Pastikan File Ini Ada

- `Procfile` — berisi perintah start server
- `requirements.txt` — daftar dependensi Python

### 2. Deploy

Railway akan otomatis mendeteksi `Procfile` dan menjalankan:

```
uvicorn main:app --host 0.0.0.0 --port $PORT
```

### 3. Set Environment Variables di Railway Dashboard

| Variable       | Nilai                       |
| -------------- | --------------------------- |
| `BACKEND_URL`  | URL Railway Express.js      |
| `FRONTEND_URL` | URL Railway/Vercel frontend |
| `LOG_LEVEL`    | `INFO`                      |

> `PORT` dan `RAILWAY_PUBLIC_DOMAIN` diisi **otomatis** oleh Railway — tidak perlu diisi manual.

### 4. Set AI_SERVICE_URL di Backend Express

Di environment variables Express.js, tambahkan:

```
AI_SERVICE_URL= (https://example.up.railway.app)
```

---

## Catatan Penting untuk Backend

1. **Minimal 28 data `stok_keluar`** untuk hasil prediksi yang akurat. Jika kurang, model tetap berjalan tapi padding dengan nol — akurasi menurun. Disarankan kirim data 60 hari terakhir.

2. **Tanggal wajib format `YYYY-MM-DD`**. Contoh: `"2025-01-15"`.

3. **`/chat` tidak bergantung pada model** — endpoint ini selalu aktif meski tensorflow tidak ter-load. Endpoint `/predict`, `/insights`, `/recommend` membutuhkan model dan akan return `503` jika model gagal load.

4. **Jangan cache respons prediksi terlalu lama** — prediksi penjualan sebaiknya di-refresh minimal 1x sehari karena data `stok_keluar` terus berubah.

5. **`predict_future_sales` dibatasi maksimal 14 hari** (`days_ahead` ≤ 14) — model GRU menggunakan sliding window autoregressive dengan `WINDOW_SIZE = 28`. Setiap langkah ke depan menggunakan prediksi sebelumnya sebagai input, sehingga error berakumulasi. Batas 14 hari menjaga ~50% window tetap berisi data historis nyata.
.


