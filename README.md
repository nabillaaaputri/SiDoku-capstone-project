# SiDoku - Sistem Data Operasional dan Keuangan Usaha

## 📖 Deskripsi Proyek

SiDoku (Sistem Data Operasional dan Keuangan Usaha) merupakan aplikasi berbasis web yang dirancang untuk membantu pelaku Usaha Mikro, Kecil, dan Menengah (UMKM) dalam mengelola operasional bisnis secara lebih terstruktur, efisien, dan berbasis data.

Aplikasi ini dikembangkan sebagai Capstone Project Coding Camp 2026 dengan tujuan membantu pemilik usaha melakukan pencatatan produk, pengelolaan stok, pencatatan pengeluaran, pemantauan kondisi keuangan, serta memperoleh bantuan melalui teknologi Artificial Intelligence (AI).

Melalui SiDoku, pelaku usaha dapat mengelola aktivitas operasional harian dalam satu platform terintegrasi sehingga proses pencatatan menjadi lebih mudah, akurat, dan terdokumentasi dengan baik.

---

## 🎯 Latar Belakang

Banyak pelaku UMKM masih melakukan pencatatan stok dan keuangan secara manual menggunakan buku catatan atau spreadsheet sederhana. Kondisi ini sering menyebabkan berbagai permasalahan seperti:

* Kesulitan mengetahui kondisi stok secara real-time.
* Pencatatan transaksi yang tidak konsisten.
* Sulit menghitung keuntungan dan pengeluaran usaha.
* Tidak memiliki data yang cukup untuk mendukung pengambilan keputusan bisnis.
* Rendahnya pemanfaatan teknologi digital dalam operasional usaha.

SiDoku hadir sebagai solusi digital yang membantu pelaku usaha mengelola data operasional dan keuangan secara lebih efektif melalui sistem yang sederhana dan mudah digunakan.

---

## ✨ Fitur Utama

### 🔐 Autentikasi Pengguna

* Registrasi akun.
* Login dan logout.
* Manajemen profil pengguna.

### 📦 Manajemen Produk

* Menambahkan produk baru.
* Mengubah data produk.
* Menghapus produk.
* Pengelompokan produk berdasarkan kategori.

### 📥 Stok Masuk

* Pencatatan barang masuk.
* Riwayat stok masuk.
* Pembaruan stok otomatis.

### 📤 Stok Keluar

* Pencatatan barang keluar.
* Riwayat stok keluar.
* Pengurangan stok otomatis.

### 💰 Pengelolaan Pengeluaran

* Pencatatan pengeluaran usaha.
* Riwayat pengeluaran.
* Rekap biaya operasional.

### 📊 Ringkasan Keuangan

* Total pemasukan.
* Total pengeluaran.
* Ringkasan kondisi keuangan usaha.
* Informasi performa bisnis secara umum.

### 🤖 AI Assistant

* Chatbot berbasis OpenAI API.
* Membantu pengguna memahami fitur aplikasi.
* Menjawab pertanyaan seputar pengelolaan usaha.
* Memberikan informasi dan bantuan secara interaktif.

### 📈 Forecasting dan Rekomendasi Restock

* Prediksi kebutuhan stok berdasarkan data historis.
* Rekomendasi jumlah restock produk.
* Membantu pengguna mengantisipasi kekurangan stok.

---

## 🏗️ Arsitektur Sistem

SiDoku terdiri dari beberapa komponen utama:

### Frontend

Aplikasi utama yang digunakan pengguna untuk mengakses seluruh fitur SiDoku.

### Backend API

Mengelola logika bisnis, autentikasi, manajemen data produk, stok, dan keuangan.

### Database

Menyimpan seluruh data pengguna, produk, stok, transaksi, dan pengeluaran.

### AI Service

Menyediakan layanan chatbot dan forecasting yang digunakan oleh aplikasi utama.

### Data Science Dashboard

Dashboard analitik berbasis Streamlit yang digunakan oleh tim Data Science untuk eksplorasi data, visualisasi penjualan, analisis produk, dan evaluasi model. Dashboard ini tidak digunakan langsung oleh pengguna akhir.

---

## 🛠️ Teknologi yang Digunakan

### Frontend

* React
* TypeScript
* Tailwind CSS
* Axios

### Backend

* Node.js
* Express.js

### Database

* Supabase PostgreSQL

### Artificial Intelligence

* Python
* OpenAI API

### Data Science

* Pandas
* NumPy
* Scikit-Learn
* Statsmodels
* Plotly
* Streamlit

### Deployment

* Vercel (Frontend)
* Railway (Backend & AI Service)
* Streamlit Cloud (Dashboard Data Science)

---

## 🚀 Cara Menggunakan Aplikasi

### 1. Registrasi Akun

* Buka halaman SiDoku.
* Pilih menu **Daftar**.
* Isi data yang diperlukan.
* Login menggunakan akun yang telah dibuat.

### 2. Mengelola Produk

* Masuk ke menu Produk.
* Tambahkan produk baru.
* Tentukan kategori, harga, dan stok produk.

### 3. Mencatat Stok Masuk

* Buka menu Stok Masuk.
* Pilih produk.
* Masukkan jumlah barang yang masuk.
* Sistem akan memperbarui stok secara otomatis.

### 4. Mencatat Stok Keluar

* Buka menu Stok Keluar.
* Pilih produk.
* Masukkan jumlah barang yang keluar.
* Sistem akan mengurangi stok secara otomatis.

### 5. Mencatat Pengeluaran

* Buka menu Pengeluaran.
* Isi informasi pengeluaran.
* Data akan tersimpan pada sistem.

### 6. Melihat Ringkasan Keuangan

* Buka Dashboard.
* Lihat informasi pemasukan, pengeluaran, dan kondisi usaha secara keseluruhan.

### 7. Menggunakan AI Assistant

* Buka halaman Asisten SiDoku.
* Ketik pertanyaan pada kolom chat.
* AI akan memberikan respons sesuai konteks pertanyaan pengguna.

### 8. Melihat Rekomendasi Restock

* Buka Dashboard.
* Sistem akan menampilkan rekomendasi restock berdasarkan hasil forecasting.

---

## 📂 Struktur Repository

```text
SiDoku-capstone-project
│
├── frontend/          # Frontend React
├── backend/           # Backend Express
├── ai-service/        # AI Service dan Forecasting
├── data-science/      # Dashboard dan analisis data
├── docs/              # Dokumentasi proyek
└── README.md
```

---

## ⚙️ Instalasi Lokal

### Clone Repository

```bash
git clone https://github.com/nabillaaaputri/SiDoku-capstone-project.git
cd SiDoku-capstone-project
```

### Menjalankan Frontend

```bash
cd frontend
npm install
npm run dev
```

### Menjalankan Backend

```bash
cd backend
npm install
npm run dev
```

### Menjalankan AI Service

```bash
cd ai-service
pip install -r requirements.txt
python app.py
```

### Menjalankan Dashboard Data Science

```bash
cd data-science
pip install -r requirements.txt
streamlit run dashboard/dashboard.py
```

## 👥 Tim Pengembang

Capstone Project Coding Camp 2026

* Project Manager
* Front-End Developer
* Back-End Developer
* AI Engineer
* Data Science

---

## 📄 Lisensi

Proyek ini dikembangkan untuk kebutuhan pembelajaran dan Capstone Project Coding Camp 2026.

