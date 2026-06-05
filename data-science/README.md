# 📊 SiDoku Capstone Project

![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Pandas](https://img.shields.io/badge/Pandas-150458?style=for-the-badge&logo=pandas)
![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-F7931E?style=for-the-badge&logo=scikit-learn)
![Streamlit](https://img.shields.io/badge/Streamlit-FF4B4B?style=for-the-badge&logo=streamlit&logoColor=white)
![Jupyter](https://img.shields.io/badge/Jupyter-F37626?style=for-the-badge&logo=jupyter&logoColor=white)

---

# 📌 Project Overview

SiDoku (Sistem Data Operasional dan Keuangan Usaha) merupakan project berbasis data science yang dikembangkan untuk membantu pelaku UMKM dalam mengelola dan menganalisis data operasional serta penjualan secara lebih terstruktur dan berbasis data.

Project ini berfokus pada:

* Analisis penjualan retail
* Exploratory Data Analysis (EDA)
* Explanatory Analysis
* Data Preprocessing
* Business Analytics Dashboard
* A/B Testing

Dataset yang digunakan merupakan dataset retail sales sintetis dengan data transaksi penjualan harian periode 2021–2023.

---

# 📄 Comprehensive Technical Report

Sebagai bagian dari Capstone Project Data Science, proyek ini dilengkapi dengan laporan teknis komprehensif yang mendokumentasikan seluruh proses pengembangan solusi secara end-to-end, mulai dari identifikasi permasalahan bisnis hingga penyusunan dashboard analitik dan pengambilan insight bisnis.

Laporan disusun untuk memberikan dokumentasi yang sistematis mengenai proses analisis data, metodologi yang digunakan, hasil evaluasi, serta rekomendasi yang dihasilkan berdasarkan temuan selama proyek berlangsung.

## Report Coverage

Laporan mencakup tahapan berikut:

1. Problem Discovery
2. Business Understanding
3. Data Understanding
4. Data Wrangling
5. Exploratory Data Analysis (EDA)
6. Data Preprocessing
7. Explanatory Analysis
8. Dashboard Development
9. A/B Testing
10. Business Insight & Recommendation
11. Conclusion

## 📄 Technical Report

Laporan teknis komprehensif proyek dapat diakses melalui tautan berikut:

🔗 https://docs.google.com/document/d/1hGr1Wr1lt4lNoxvjh0e4L_x6twEkYWjyuYtqEz-ozRY/edit?usp=sharing

---

# 🎯 Objectives

Project ini bertujuan untuk:

* Memahami pola penjualan harian
* Mengidentifikasi produk dengan performa terbaik
* Menganalisis hubungan harga terhadap penjualan
* Mengevaluasi efektivitas promo terhadap penjualan
* Menemukan insight bisnis berbasis data
* Membantu pengambilan keputusan melalui dashboard interaktif

---

# ❓ Business Understanding

Pada tahap ini dilakukan identifikasi permasalahan bisnis dan penyusunan pertanyaan bisnis yang dapat dijawab melalui proses analisis data.

## Business Questions

1. Bagaimana distribusi penjualan harian pada dataset store selama periode 2021–2023?
2. Produk apa yang memiliki jumlah penjualan tertinggi dan terendah selama periode pengamatan?
3. Bagaimana hubungan antara harga produk dan jumlah penjualan?
4. Apakah terdapat pola penjualan tertentu berdasarkan waktu?
5. Variabel apa yang memiliki korelasi paling kuat terhadap penjualan?
6. Apakah terdapat outlier pada data penjualan?

---

# 📂 Dataset Information

Dataset yang digunakan berasal dari Kaggle:

🔗 https://www.kaggle.com/datasets/dhruvangtalukdar/store-item-demand-forecasting-dataset

## Dataset Features

| Feature | Description |
|----------|------------|
| date | tanggal transaksi |
| item_id | identitas produk |
| sales | jumlah penjualan |
| price | harga produk |
| promo | status promo |
| weekday | hari transaksi |
| month | bulan transaksi |

---

# 🛠️ Workflow Project

Project ini terdiri dari beberapa tahapan utama:

1. Data Wrangling
2. Exploratory Data Analysis (EDA)
3. Explanatory Analysis
4. Feature Engineering
5. Data Preprocessing
6. Dashboard Development
7. A/B Testing

---

# 📁 Project Structure

```bash
data-science/
│
├── dashboard/
│   └── dashboard.py
│
├── data/
│   ├── dataset_store.csv
│   ├── wrangled_data.csv
│   └── preprocessed_dataset.csv
│
├── notebook/
│   ├── 1_data_wrangling.ipynb
│   ├── 2_eda.ipynb
│   ├── 3_preprocessing.ipynb
│   └── 4_a_b_testing.ipynb
│
├── docs/
│   └── Laporan_Komprehensif.pdf
│
└── README.md
```

---

# 📊 Data Wrangling

Pada tahap data wrangling dilakukan proses persiapan data sebelum masuk ke tahap analisis.

## Proses yang Dilakukan

* Gathering Data
* Assessing Data
* Cleaning Data
* Handling Missing Values
* Handling Duplicate Data
* Data Validation

## Output

```bash
wrangled_data.csv
```

---

# 📈 Exploratory Data Analysis (EDA)

## Analisis yang Dilakukan

* Distribusi penjualan
* Analisis produk terlaris
* Analisis produk dengan penjualan terendah
* Analisis korelasi
* Analisis pola penjualan berdasarkan waktu
* Analisis hubungan harga dan penjualan
* Identifikasi outlier

## Visualisasi yang Digunakan

* Histogram
* Line Chart
* Scatter Plot
* Boxplot
* Heatmap

---

# 📉 Explanatory Analysis

Insight utama yang diperoleh:

* Pola penjualan harian
* Produk dengan performa terbaik
* Produk dengan performa terendah
* Hubungan harga terhadap penjualan
* Pengaruh promo terhadap penjualan
* Pola musiman penjualan

---

# ⚙️ Feature Engineering & Preprocessing

Tahap preprocessing dilakukan untuk meningkatkan kualitas data sebelum digunakan dalam analisis lanjutan.

## Proses yang Dilakukan

* Handling Missing Values
* Handling Duplicate Data
* Handling Outlier
* Feature Extraction
* Encoding
* Feature Scaling

### Feature Extraction

Fitur baru yang dibuat:

* year
* month
* day
* day_of_week

## Output

```bash
preprocessed_dataset.csv
```

---

# 📊 Business Analytics Dashboard

Dashboard interaktif dibangun menggunakan Streamlit untuk membantu eksplorasi data penjualan secara visual dan interaktif.

## Dashboard Features

* 📈 Sales Trend Over Time
* 📊 Sales Distribution
* 🏆 Top Selling Products
* 📉 Lowest Selling Products
* 💰 Price vs Sales Analysis
* 🎁 Promo Impact Analysis
* 🗓️ Monthly Sales Pattern
* 🔥 Correlation Heatmap
* ⚠️ Outlier Analysis

## Dashboard Filters

* Date Range
* Promo Status

## Run Dashboard

```bash
streamlit run dashboard.py
```

---

# 🧪 A/B Testing

A/B Testing dilakukan untuk mengevaluasi efektivitas promo terhadap jumlah penjualan.

## Business Question

Apakah promo memberikan pengaruh yang signifikan terhadap jumlah penjualan?

## Hypothesis

### Null Hypothesis (H₀)

Tidak terdapat perbedaan rata-rata penjualan antara transaksi promo dan non-promo.

### Alternative Hypothesis (H₁)

Terdapat perbedaan rata-rata penjualan antara transaksi promo dan non-promo.

## Statistical Method

* Descriptive Analysis
* Normality Test
* Independent Two Sample T-Test
* Significance Level (α = 0.05)

## Result

Hasil pengujian menunjukkan bahwa:

* Kelompok transaksi promo memiliki rata-rata penjualan lebih tinggi dibandingkan kelompok non-promo.
* Nilai p-value berada di bawah tingkat signifikansi 0.05.
* Hipotesis nol (H₀) ditolak.

## Conclusion

Promo terbukti memberikan pengaruh yang signifikan terhadap peningkatan jumlah penjualan sehingga dapat digunakan sebagai strategi pemasaran yang efektif.

---

# 📊 Key Findings

### 1. Sales Trend Analysis

Penjualan menunjukkan pola fluktuatif selama periode pengamatan.

### 2. Product Performance

Beberapa produk memiliki kontribusi penjualan yang jauh lebih tinggi dibandingkan produk lainnya.

### 3. Price and Sales Relationship

Hubungan harga terhadap jumlah penjualan relatif lemah.

### 4. Promo Effectiveness

Promo terbukti memberikan dampak positif terhadap peningkatan penjualan.

### 5. Seasonal Pattern

Terdapat pola musiman pada periode tertentu yang memengaruhi penjualan.

---

# 🚀 Technologies Used

* Python
* Pandas
* NumPy
* Matplotlib
* Seaborn
* Plotly
* Streamlit
* SciPy
* Scikit-Learn
* Jupyter Notebook

---

# 📊 Results

Project menghasilkan:

* Insight bisnis berbasis data
* Workflow preprocessing yang terstruktur
* Visualisasi data penjualan
* Dashboard analitik interaktif menggunakan Streamlit
* Analisis efektivitas promo menggunakan A/B Testing
* Dataset siap digunakan untuk analisis lanjutan

---

# 📚 Documentation

Dokumentasi proyek tersedia melalui:

* README.md
* Technical Report
* Notebook Data Wrangling
* Notebook Exploratory Data Analysis (EDA)
* Notebook Data Preprocessing
* Notebook A/B Testing

Technical Report memuat dokumentasi lengkap proyek mulai dari Problem Discovery hingga Conclusion dan dapat diakses melalui tautan yang telah disediakan pada bagian Comprehensive Technical Report.

---

# 🔮 Future Development

Pengembangan selanjutnya yang direncanakan:

* Machine Learning Modeling untuk prediksi penjualan
* Time Series Forecasting
* Deployment Web Application
* Integrasi Backend dan Frontend
* Sistem rekomendasi strategi promosi

---

# 📌 Conclusion

Project ini berhasil mengimplementasikan proses analisis data end-to-end mulai dari data wrangling, exploratory data analysis, preprocessing, visualisasi interaktif melalui Streamlit Dashboard, hingga pengujian hipotesis menggunakan A/B Testing.

Hasil analisis menunjukkan bahwa promo memberikan pengaruh signifikan terhadap peningkatan penjualan sehingga dapat dijadikan dasar dalam pengambilan keputusan bisnis berbasis data.