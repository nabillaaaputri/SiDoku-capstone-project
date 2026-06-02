# SiDoku Frontend

Frontend aplikasi **SiDoku (Sistem Data Operasional dan Keuangan Usaha)** yang dibangun menggunakan React, TypeScript, dan Vite untuk membantu pelaku UMKM dalam mengelola operasional bisnis, pencatatan keuangan, dan analisis usaha berbasis AI.

## Deployment

🌐 Live Application:

https://sidoku.vercel.app/

## Fitur Utama

### Dashboard

* Ringkasan keuangan
* Insight bisnis berbasis AI
* Produk hampir habis
* Tren penjualan 7 hari terakhir
* Prediksi penjualan 7 hari ke depan
* Performa keuangan

### Manajemen Produk

* Tambah produk
* Edit produk
* Arsip produk
* Monitoring stok minimum

### Manajemen Stok

* Stok masuk
* Stok keluar
* Riwayat pergerakan stok

### Pengeluaran

* Pencatatan biaya operasional
* Riwayat pengeluaran

### Rekap Penjualan

* Riwayat transaksi penjualan
* Ringkasan omzet

### Artificial Intelligence

* Forecasting penjualan menggunakan model GRU
* Insight bisnis otomatis
* Chatbot Asisten SiDoku

## Teknologi yang Digunakan

* React
* TypeScript
* Vite
* React Router DOM
* Axios
* Tailwind CSS
* Recharts
* Lucide React

## Instalasi

Clone repository:

```bash
git clone https://github.com/nabillaaaputri/SiDoku-capstone-project.git
```

Masuk ke folder frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

## Environment Variables

Buat file `.env` pada root frontend:

```env
PING_MESSAGE="ping pong"
VITE_API_URL=https://sidoku.up.railway.app/v1
VITE_AUTH_API_URL=https://sidoku.up.railway.app/v1
```

## Menjalankan Project

Development mode:

```bash
npm run dev
```

Build production:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

## Struktur Folder

```text
src/
├── assets/
├── components/
├── contexts/
├── hooks/
├── pages/
├── services/
├── utils/
├── App.tsx
└── main.tsx
```
