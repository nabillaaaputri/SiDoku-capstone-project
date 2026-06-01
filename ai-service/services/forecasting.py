# -*- coding: utf-8 -*-
"""
services/forecasting.py
GRU model loader + feature engineering pipeline.

Feature engineering MUST match the training notebook exactly.
Any divergence (different names, order, or computation) causes wrong predictions.
"""

import gc
import logging
from pathlib import Path
from typing import List, Optional
from datetime import datetime, timedelta

import numpy as np
import pandas as pd
import joblib

logger = logging.getLogger(__name__)

_MODELS_DIR = Path(__file__).parent.parent / "models"

# ──────────────────────────────────────────────
# Ambil dari notebook collab
# ──────────────────────────────────────────────
KNOWN_FEATURE_COLS = [
    'SalesQuantity',
    'sin_day',  'cos_day',
    'sin_month','cos_month',
    'sin_week', 'cos_week',
    'is_weekend',
    'lag_1', 'lag_2', 'lag_3', 'lag_7', 'lag_14', 'lag_21', 'lag_28',
    'rolling_mean_3', 'rolling_mean_7', 'rolling_mean_14',
    'rolling_min_7',  'rolling_max_7',
    'is_peak_season', 'is_low_season', 'is_peak_weekday',
    'price_norm', 'price_change_norm',
    'quarter',
]  # 26 features

# ──────────────────────────────────────────────
# Singleton state — loaded once at startup
# ──────────────────────────────────────────────
_model = None
_scaler = None
_feature_cols: List[str] = []
_features_to_scale: List[str] = []
_product_map: dict = {}
_infer_fn = None  # tf.function-compiled model call — set in load_model()

WINDOW_SIZE = 28  # model expects exactly 28 timesteps


def load_model():
    """Load all model artefacts from disk. Call once at startup."""
    global _model, _scaler, _feature_cols, _features_to_scale, _product_map, _infer_fn

    try:
        import tensorflow as tf
        from tensorflow import keras

        _model = keras.models.load_model(_MODELS_DIR / "sales_forecasting_store1.keras")
        _scaler = joblib.load(_MODELS_DIR / "scaler.joblib")
        _feature_cols = list(joblib.load(_MODELS_DIR / "feature_cols.joblib"))

        # Validate against known list
        if set(_feature_cols) != set(KNOWN_FEATURE_COLS):
            logger.warning(
                "feature_cols.joblib differs from KNOWN_FEATURE_COLS. "
                "diff=%s", set(_feature_cols).symmetric_difference(KNOWN_FEATURE_COLS)
            )
        _features_to_scale = list(joblib.load(_MODELS_DIR / "features_to_scale.joblib"))
        _product_map = joblib.load(_MODELS_DIR / "product_map.joblib")

        # Compile model call once so TF doesn't retrace on every request.
        # reduce_retracing=True prevents graph cache from growing indefinitely.
        @tf.function(reduce_retracing=True)
        def _compiled_infer(x_seq, x_prod):
            return _model([x_seq, x_prod], training=False)

        _infer_fn = _compiled_infer

        logger.info(
            "Forecasting model loaded. features=%d, scalable=%d, products=%d",
            len(_feature_cols), len(_features_to_scale), len(_product_map),
        )
        return True

    except Exception as e:
        # Fallback: use known feature list so service can still attempt inference
        logger.warning("Using KNOWN_FEATURE_COLS as fallback: %s", e)
        if not _feature_cols:
            _feature_cols = KNOWN_FEATURE_COLS.copy()
        return True
    except RuntimeError:
        logger.error("Failed to load forecasting model.", exc_info=True)
        return False


def is_loaded() -> bool:
    return _model is not None


# ──────────────────────────────────────────────
# Step 1 — Build raw daily time series from DB rows
# ──────────────────────────────────────────────

def _build_daily_series(
    stok_keluar: List[dict],
    stok_masuk: List[dict],
    harga_jual: float,
    today: Optional[str] = None,
) -> pd.DataFrame:
    """
    Convert raw Stok_Keluar / Stok_Masuk DB rows into a daily time-series DataFrame.

    stok_keluar: [{ "tanggal_keluar": "YYYY-MM-DD", "jumlah": int }, ...]
    stok_masuk:  [{ "tanggal_masuk":  "YYYY-MM-DD", "jumlah": int }, ...]
    """
    if not stok_keluar:
        raise ValueError("stok_keluar cannot be empty.")

    # Sales (qty out per day)
    df_out = pd.DataFrame(stok_keluar)
    df_out["tanggal"] = pd.to_datetime(df_out["tanggal_keluar"])
    df_out = df_out.groupby("tanggal")["jumlah"].sum().reset_index()
    df_out.rename(columns={"jumlah": "qty"}, inplace=True)

    # Determine max date (use today if provided, else default to current Jakarta date)
    min_date = df_out["tanggal"].min()
    if today:
        try:
            max_date = pd.to_datetime(today)
            if max_date < min_date:
                max_date = df_out["tanggal"].max()
        except Exception:
            max_date = df_out["tanggal"].max()
    else:
        try:
            from datetime import timezone
            jakarta_tz = timezone(timedelta(hours=7))
            current_local = datetime.now(jakarta_tz).strftime("%Y-%m-%d")
            max_date = pd.to_datetime(current_local)
            if max_date < min_date:
                max_date = df_out["tanggal"].max()
        except Exception:
            max_date = df_out["tanggal"].max()

    # Full date range — fill missing days with 0 sales
    full_range = pd.DataFrame({
        "tanggal": pd.date_range(min_date, max_date, freq="D")
    })
    df = full_range.merge(df_out, on="tanggal", how="left")
    df["qty"] = df["qty"].fillna(0)

    # Price (constant per product from Produk table)
    df["price"] = float(harga_jual)

    df.sort_values("tanggal", inplace=True)
    df.reset_index(drop=True, inplace=True)
    return df


# ──────────────────────────────────────────────
# Step 2 — Feature engineering (exact match with training notebook)
# ──────────────────────────────────────────────

def _build_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Build all model features replicating the training notebook exactly.
    Column names and computations must be identical to training.
    The final column selection/ordering is done by feature_cols.joblib
    (or KNOWN_FEATURE_COLS as fallback).
    """
    df = df.copy()

    # Transform qty to log-space using log1p BEFORE calculating any lag or rolling features.
    # During training, the target was sales_log (log1p), and all lags/rolling means
    # were engineered from sales_log, not from raw quantity.
    df["qty_log"] = np.log1p(df["qty"])

    # SalesQuantity — log1p-transformed qty value for each timestep (target feature)
    df["SalesQuantity"] = df["qty_log"]

    # --- Temporal (used to derive cyclical & categorical features) ---
    dow          = df["tanggal"].dt.dayofweek     # 0=Mon … 6=Sun
    month        = df["tanggal"].dt.month
    week_of_year = df["tanggal"].dt.isocalendar().week.astype(int)

    df["is_weekend"] = (dow >= 5).astype(int)
    df["quarter"]    = df["tanggal"].dt.quarter

    # --- Cyclical Encoding ---
    df["sin_day"]   = np.sin(2 * np.pi * dow          / 7)
    df["cos_day"]   = np.cos(2 * np.pi * dow          / 7)
    df["sin_month"] = np.sin(2 * np.pi * month        / 12)
    df["cos_month"] = np.cos(2 * np.pi * month        / 12)
    df["sin_week"]  = np.sin(2 * np.pi * week_of_year / 52)
    df["cos_week"]  = np.cos(2 * np.pi * week_of_year / 52)

    # --- Lag Features (matching training: 1, 2, 3, 7, 14, 21, 28) ---
    for lag in [1, 2, 3, 7, 14, 21, 28]:
        df[f"lag_{lag}"] = df["qty_log"].shift(lag)

    # --- Rolling Mean ---
    for w in [3, 7, 14]:
        df[f"rolling_mean_{w}"] = df["qty_log"].shift(1).rolling(w, min_periods=1).mean()

    # --- Rolling Min & Max ---
    df["rolling_min_7"] = df["qty_log"].shift(1).rolling(7, min_periods=1).min()
    df["rolling_max_7"] = df["qty_log"].shift(1).rolling(7, min_periods=1).max()

    # --- Seasonal features (from EDA findings in training) ---
    df["is_peak_season"]  = month.isin([3, 4, 5]).astype(int)
    df["is_low_season"]   = month.isin([9, 10]).astype(int)
    df["is_peak_weekday"] = dow.isin([1, 2]).astype(int)

    # --- Price features ---
    price = df["price"]
    df["price_norm"]       = (price - price.mean()) / (price.std() + 1e-8)
    price_change           = price.diff().fillna(0)
    df["price_change_norm"]= price_change / (price_change.abs().max() + 1e-8)
    # Note: raw price_change is NOT in feature_cols — only price_change_norm is

    # Fill NaN from lags with 0
    df.fillna(0, inplace=True)
    return df


# ──────────────────────────────────────────────
# Step 3 — Select & scale features for model input
# ──────────────────────────────────────────────

def _prepare_window(feat_df: pd.DataFrame) -> np.ndarray:
    """
    From a feature DataFrame select exactly the columns in feature_cols (in order),
    take the last WINDOW_SIZE rows, and return shape (WINDOW_SIZE, n_features).
    """
    # Pad if we have fewer rows than the window
    if len(feat_df) < WINDOW_SIZE:
        pad_n = WINDOW_SIZE - len(feat_df)
        pad = pd.DataFrame(0.0, index=range(pad_n), columns=feat_df.columns)
        feat_df = pd.concat([pad, feat_df], ignore_index=True)

    window_df = feat_df.iloc[-WINDOW_SIZE:].copy()

    # Ensure all required columns exist (fill missing with 0 and warn)
    for col in _feature_cols:
        if col not in window_df.columns:
            logger.warning("Feature '%s' missing from engineered set — filling with 0", col)
            window_df[col] = 0.0

    return window_df[_feature_cols].values.astype(np.float32)


def _scale_window(window: np.ndarray) -> np.ndarray:
    """Scale the designated feature columns using the fitted scaler."""
    if not _features_to_scale:
        return window

    scale_indices = [_feature_cols.index(c) for c in _features_to_scale if c in _feature_cols]
    if not scale_indices:
        return window

    window = window.copy()
    # Build a (WINDOW_SIZE, n_scalable) matrix, transform, write back
    scalable = window[:, scale_indices]                         # (28, k)
    # scaler expects (n_samples, n_features) — treat each timestep as a sample
    scaled = _scaler.transform(scalable)
    window[:, scale_indices] = scaled
    return window


def _infer(window: np.ndarray, product_name: str) -> float:
    """Run one forward pass: scale → model → inverse-transform → expm1."""
    import tensorflow as tf

    window_scaled = _scale_window(window)

    product_id = _product_map.get(product_name, 0)
    X_seq  = tf.constant(window_scaled[np.newaxis, ...], dtype=tf.float32)  # (1, 28, n_features)
    X_prod = tf.constant([[product_id]], dtype=tf.float32)                   # (1, 1)

    # Use the tf.function-compiled callable to avoid per-request graph retracing,
    # which is the primary cause of unbounded RAM growth in long-running servers.
    raw_pred_tensor = _infer_fn(X_seq, X_prod)
    raw_pred = raw_pred_tensor.numpy()

    # Two-stage inverse transform (matches README):
    #   1. inverse_transform: scaled space → log space
    #   2. expm1: log space → original unit space
    if _features_to_scale:
        try:
            target_idx = _features_to_scale.index("SalesQuantity")
            inv_input = np.zeros((1, len(_features_to_scale)), dtype=np.float32)
            inv_input[0, target_idx] = raw_pred[0, 0]
            inv = _scaler.inverse_transform(inv_input)
            pred_val = inv[0, target_idx]
        except ValueError:
            # Fallback if SalesQuantity is not in features_to_scale
            inv_input = np.zeros((1, len(_features_to_scale)), dtype=np.float32)
            inv_input[0, 0] = raw_pred[0, 0]
            inv = _scaler.inverse_transform(inv_input)
            pred_val = inv[0, 0]
        return float(np.expm1(pred_val))
    else:
        return float(np.expm1(raw_pred[0, 0]))


# ──────────────────────────────────────────────
# Public API
# ──────────────────────────────────────────────

def predict_sales(
    product_name: str,
    stok_keluar: List[dict],
    stok_masuk: List[dict],
    harga_jual: float,
    days_ahead: int = 7,
    today: Optional[str] = None,
) -> List[dict]:
    """
    Predict daily sales quantity for `days_ahead` future days using a sliding window.

    For each future step:
      1. Build features on the current accumulated series.
      2. Take the last WINDOW_SIZE rows as input.
      3. Run inference → get predicted qty.
      4. Append the predicted row to the series for the next step.

    Returns list of { date: str, predicted_qty: float }.
    """
    if not is_loaded():
        raise RuntimeError("Forecasting model is not loaded.")

    # Build base series from raw DB rows
    df = _build_daily_series(stok_keluar, stok_masuk, harga_jual, today)
    last_date = df["tanggal"].max()

    # Pre-allocate future rows to avoid pd.concat inside the loop
    # (each pd.concat creates a new DataFrame copy — O(n²) allocations)
    future_rows: List[dict] = []
    predictions: List[dict] = []

    for i in range(days_ahead):
        # Recompute features on the full (growing) series each step
        if future_rows:
            df = pd.concat(
                [df, pd.DataFrame(future_rows)],
                ignore_index=True,
            )
            future_rows = []

        feat_df = _build_features(df)

        # Prepare (WINDOW_SIZE, n_features) input
        window = _prepare_window(feat_df)

        # Inference
        pred_qty = max(0.0, round(_infer(window, product_name), 2))
        future_date = last_date + timedelta(days=i + 1)

        predictions.append({
            "date": future_date.strftime("%Y-%m-%d"),
            "predicted_qty": pred_qty,
        })

        # Slide: stage the predicted row for the next iteration
        future_rows.append({
            "tanggal": future_date,
            "qty":     pred_qty,
            "price":   float(harga_jual),
        })

    # Explicit cleanup — TF tensors and pandas frames from this request
    del df, feat_df, future_rows
    gc.collect()

    # --- Post-processing Calibration ---
    # The global model was trained on high-volume data, causing it to over-predict 
    # for low-volume products. We calibrate the magnitude to match the product's history.
    if stok_keluar and predictions:
        past_qtys = [float(r.get("jumlah", 0)) for r in stok_keluar]
        max_past = max(past_qtys)
        
        avg_pred = sum(p["predicted_qty"] for p in predictions) / len(predictions)
        
        if max_past == 0:
            # If there's literally 0 sales in the history window, predict 0
            for p in predictions:
                p["predicted_qty"] = 0.0
        else:
            # If the model predicts significantly higher than historical max, scale it down
            # We use max_past * 1.2 to allow for some legitimate growth trends.
            target_avg = max_past * 1.2
            if avg_pred > target_avg:
                scale_factor = target_avg / avg_pred
                for p in predictions:
                    p["predicted_qty"] = round(p["predicted_qty"] * scale_factor, 2)

    return predictions


def get_avg_past_demand(stok_keluar: List[dict]) -> float:
    """Compute mean daily qty over the historical stok_keluar records."""
    if not stok_keluar:
        return 0.0
    return sum(r["jumlah"] for r in stok_keluar) / len(stok_keluar)


def get_status(
    current_stock: int,
    predicted_demand_7d: float,
    avg_past_demand: float,
) -> str:
    """
    Rule-based status classification (evaluated in priority order):
      1. critical   — stok < demand_7d × 0.3
      2. overstock  — stok >= demand_7d × 2.0
      3. increasing — demand_7d > avg_past_demand × 1.15
      4. normal     — everything else
    """
    if predicted_demand_7d <= 0:
        return "normal"

    if current_stock < predicted_demand_7d * 0.3:
        return "critical"
    if current_stock >= predicted_demand_7d * 2.0:
        return "overstock"
    
    # Compare 7-day predicted demand with 7-day historical average
    past_demand_7d = avg_past_demand * 7
    if past_demand_7d > 0 and predicted_demand_7d > past_demand_7d * 1.15:
        return "increasing"
    return "normal"