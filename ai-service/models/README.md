# Models

Folder ini berisi model GRU time series forecasting dan semua artifacts yang 
dibutuhkan untuk inference di FastAPI.
---

## Files

| File | Keterangan |
|------|------------|
| `sales_forecasting_store1.keras` | Model GRU hasil training (TensorFlow/Keras) |
| `scaler.joblib` | MinMaxScaler yang sudah di-fit dari data training |
| `feature_cols.joblib` | List urutan fitur input model — urutan WAJIB sama |
| `features_to_scale.joblib` | List fitur yang perlu di-transform oleh scaler |
| `product_map.joblib` | Dict mapping nama produk ke integer ID untuk embedding |

---

## Spesifikasi Model

| Parameter | Nilai |
|-----------|-------|
| Arsitektur | GRU + Product Embedding |
| Window size | 28 hari |
| Input seq shape | `(1, 28, 26)` — batch=1, window=28, fitur=26 |
| Input product shape | `(1,)` — integer ID produk |
| Output | `(1, 1)` — nilai scaled, perlu inverse transform |
| Scaler | MinMaxScaler |
| Target transform | log1p sebelum scaling, expm1 setelah inverse |

---

## Notes
1. **Urutan `feature_cols` tidak boleh berubah** — urutan fitur sudah
   baked in ke dalam model. Load dari `feature_cols.joblib`, jangan manual.

2. **Scaler tidak boleh di-fit ulang** — gunakan `scaler.joblib` yang
   sudah di-fit dari data training. Kalau di-fit ulang dari data baru,
   skala akan berbeda.

3. **Output model perlu dua tahap inverse transform:**
   - `scaler.inverse_transform()` → balik dari scaled space ke log space
   - `np.expm1()` → balik dari log space ke satuan unit asli

4. **Window 28 hari adalah minimum input** — data historisnya jangan
   kurang dari 28 hari, nanri saat inference eror.
