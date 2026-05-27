# 📊 SiDoku Capstone Project

![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Pandas](https://img.shields.io/badge/Pandas-150458?style=for-the-badge&logo=pandas)
![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-F7931E?style=for-the-badge&logo=scikit-learn)
![Jupyter](https://img.shields.io/badge/Jupyter-F37626?style=for-the-badge&logo=jupyter&logoColor=white)

---

# 📌 Project Overview

SiDoku (Sistem Data Operasional dan Keuangan Usaha) merupakan project berbasis data science yang dikembangkan untuk membantu pelaku UMKM dalam mengelola dan menganalisis data operasional serta penjualan secara lebih terstruktur dan berbasis data.

Project ini berfokus pada:
- analisis penjualan retail
- exploratory data analysis (EDA)
- preprocessing data
- feature engineering
- forecasting penjualan

Dataset yang digunakan merupakan dataset retail sales sintetis dengan data transaksi penjualan harian periode 2021–2023.

---

# 🎯 Objectives

Project ini bertujuan untuk:

- memahami pola penjualan harian
- menganalisis performa produk
- mengidentifikasi pengaruh harga dan promosi terhadap penjualan
- menemukan insight bisnis berbasis data
- mempersiapkan dataset untuk machine learning dan forecasting

---

# ❓ Business Understanding

Pada tahap ini dilakukan identifikasi permasalahan bisnis dan penyusunan pertanyaan bisnis yang dapat dijawab melalui proses analisis data.

## Business Questions

1. Bagaimana distribusi penjualan harian pada dataset store selama periode 2021–2023?

2. Produk apa yang memiliki jumlah penjualan tertinggi dan terendah selama periode 2021–2023?

3. Bagaimana hubungan antara harga produk dan jumlah penjualan?

4. Apakah terdapat pola penjualan tertentu berdasarkan waktu?

5. Variabel apa yang memiliki korelasi paling kuat terhadap penjualan?

6. Apakah terdapat outlier pada data penjualan yang dapat mempengaruhi analisis?

7. Bagaimana distribusi kategori produk pada dataset store?

---

# 📂 Dataset Information

Dataset yang digunakan berasal dari Kaggle:

https://www.kaggle.com/datasets/dhruvangtalukdar/store-item-demand-forecasting-dataset

## Dataset Features

| Feature | Description |
|---|---|
| date | tanggal transaksi |
| item_id | identitas produk |
| sales | jumlah penjualan |
| price | harga produk |
| promo | status promosi |
| weekday | hari transaksi |
| month | bulan transaksi |

---

# 🛠️ Workflow Project

Project ini terdiri dari beberapa tahapan utama:

1. Data Wrangling  
2. Exploratory Data Analysis (EDA)  
3. Data Visualization  
4. Explanatory Analysis  
5. Feature Engineering  
6. Data Preprocessing  
7. Forecasting Preparation  

---

# 📁 Project Structure

```bash
SiDoku-capstone-project/
│
├── data-science/
│   ├── data/
│   │   ├── dataset_store.csv
│   │   ├── wrangled_data.csv
│   │   └── preprocessed_dataset.csv
│   │
│   └── notebook/
│       ├── 1_data_wrangling.ipynb
│       ├── 2_eda.ipynb
│       └── 3_preprocessing.ipynb
│
├── backend/
├── frontend/
└── README.md
```

---

# 📊 Data Wrangling

Pada tahap data wrangling dilakukan proses persiapan data sebelum masuk ke tahap analisis.

## Proses yang Dilakukan

- Gathering Data
- Assessing Data
- Cleaning Data
- Handling Missing Value
- Handling Duplicate Data
- Data Validation

## Output

Dataset hasil wrangling:
```bash
wrangled_data.csv
```

## Notebook

```bash
1_data_wrangling.ipynb
```

---

# 📈 Exploratory Data Analysis (EDA)

Tahap EDA dilakukan untuk memahami pola, distribusi, dan insight dari dataset penjualan.

## Analisis yang Dilakukan

- distribusi penjualan
- analisis produk terlaris
- analisis korelasi
- analisis pola penjualan berdasarkan waktu
- analisis hubungan harga dan penjualan
- identifikasi outlier

## Visualisasi yang Digunakan

- histogram
- line chart
- boxplot
- heatmap
- scatter plot

## Notebook

```bash
2_eda.ipynb
```

---

# 📉 Explanatory Analysis

Explanatory analysis dilakukan untuk membantu menjawab pertanyaan bisnis melalui visualisasi data dan interpretasi insight.

## Insight yang Dihasilkan

- pola penjualan harian
- pengaruh promosi terhadap penjualan
- hubungan harga dengan sales
- pola musiman penjualan
- distribusi produk berdasarkan kategori

---

# ⚙️ Feature Engineering & Preprocessing

Tahap preprocessing dilakukan untuk meningkatkan kualitas data sebelum digunakan pada tahap modeling dan forecasting.

## Proses yang Dilakukan

### 1. Handling Missing Value
Menghapus atau menangani data kosong agar dataset lebih konsisten.

### 2. Handling Duplicate Data
Menghapus data duplikat untuk menghindari bias analisis.

### 3. Handling Outlier
Mengidentifikasi dan menangani outlier menggunakan metode IQR dan RobustScaler.

### 4. Feature Extraction
Membuat fitur baru dari variabel waktu seperti:
- year
- month
- day
- day_of_week

### 5. Feature Transformation
Melakukan log transformation untuk membantu mengurangi skewness pada distribusi data.

### 6. Encoding Feature
Mengubah fitur kategorikal menjadi bentuk numerik agar dapat diproses model machine learning.

### 7. Feature Scaling
Melakukan scaling menggunakan RobustScaler agar distribusi fitur lebih stabil terhadap outlier.

## Output

Dataset hasil preprocessing:
```bash
preprocessed_dataset.csv
```

## Notebook

```bash
3_preprocessing.ipynb
```

---

# 🚀 Technologies Used

Project ini menggunakan beberapa library dan tools berikut:

- Python
- Pandas
- NumPy
- Matplotlib
- Seaborn
- Scikit-Learn
- Jupyter Notebook

---

# 📊 Results

Hasil dari project ini meliputi:

- insight bisnis berbasis data
- workflow preprocessing yang terstruktur
- visualisasi data penjualan
- dataset siap modeling
- feature engineering yang lebih informatif
- preprocessing pipeline yang konsisten

---

# 🔮 Future Development

Pengembangan selanjutnya yang direncanakan:

- machine learning modeling
- time series forecasting
- dashboard interaktif
- deployment web application
- integrasi backend dan frontend

---