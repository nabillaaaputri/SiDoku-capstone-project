# SiDoku Frontend

Frontend aplikasi SiDoku (Sistem Data Operasional dan Keuangan Usaha) yang dibangun menggunakan React, TypeScript, dan Vite.

## Fitur

- Landing Page
- Autentikasi (Login & Register)
- Dashboard Analitik
- Manajemen Produk
- Stok Masuk
- Stok Keluar
- Pengeluaran
- Rekap Penjualan
- Forecasting Penjualan
- Chatbot AI

## Teknologi

- React
- TypeScript
- Vite
- Tailwind CSS
- Axios
- React Router

## Instalasi

Clone repository:

```bash
git clone <repository-url>
cd frontend
```

Install dependencies:

```bash
npm install
```

## Konfigurasi Environment

Buat file `.env`:

```env
PING_MESSAGE="ping pong"
VITE_API_URL=https://sidoku.up.railway.app/v1
VITE_AUTH_API_URL=https://sidoku.up.railway.app/v1
```

## Menjalankan Project

Development:

```bash
npm run dev
```

Build production:

```bash
npm run build
```

Preview build:

```bash
npm run preview
```

## Struktur Folder

```text
src/
├── components/
├── contexts/
├── hooks/
├── pages/
├── services/
├── utils/
└── App.tsx
```

## Deployment

Frontend dideploy menggunakan Vercel:

https://sidoku.vercel.app

## Tim Pengembang

Capstone Project – SiDoku
