# Models

Folder ini berisi file model dan preprocessing artifacts untuk inference sales forecasting.

## Files
- `sales_forecasting_store1.keras` → model hasil training
- `scaler.joblib` → scaler MinMax
- `feature_cols.joblib` → daftar fitur input model
- `features_to_scale.joblib` → fitur yang perlu scaling

## Notes
- Model menggunakan TensorFlow/Keras
- Window size: 28
- Input shape: `(1, 28, n_features)`
