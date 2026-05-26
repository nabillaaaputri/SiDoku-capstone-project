# -*- coding: utf-8 -*-
"""
services/forecasting.py
GRU model loader + feature engineering pipeline.

Feature engineering MUST match the training notebook exactly.
Any divergence (different names, order, or computation) causes wrong predictions.
"""

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

WINDOW_SIZE = 28  # model expects exactly 28 timesteps


def load_model():
    """Load all model artefacts from disk. Call once at startup."""
    global _model, _scaler, _feature_cols, _features_to_scale, _product_map

    try:
        import tensorflow as tf  # noqa: F401
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

        logger.info(
            "Forecasting model loaded. features=%d, scalable=%d, products=%d",
            len(_feature_cols), len(_features_to_scale), len(_product_map),
        )

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

    # Full date range — fill missing days with 0 sales
    full_range = pd.DataFrame({
        "tanggal": pd.date_range(df_out["tanggal"].min(), df_out["tanggal"].max(), freq="D")
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

    # SalesQuantity — the raw qty value for each timestep.
    # 'SalesQuantity' is the first feature in feature_cols; it's the actual
    # daily sales count that the model also uses as a direct input feature.
    df["SalesQuantity"] = df["qty"]

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
        df[f"lag_{lag}"] = df["qty"].shift(lag)

    # --- Rolling Mean ---
    for w in [3, 7, 14]:
        df[f"rolling_mean_{w}"] = df["qty"].shift(1).rolling(w, min_periods=1).mean()

    # --- Rolling Min & Max ---
    df["rolling_min_7"] = df["qty"].shift(1).rolling(7, min_periods=1).min()
    df["rolling_max_7"] = df["qty"].shift(1).rolling(7, min_periods=1).max()

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
    window_scaled = _scale_window(window)

    product_id = _product_map.get(product_name, 0)
    X_seq  = window_scaled[np.newaxis, ...]              # (1, 28, n_features)
    X_prod = np.array([[product_id]], dtype=np.float32)  # (1, 1)

    raw_pred = _model.predict([X_seq, X_prod], verbose=0)  # (1, 1) — scaled log space

    # Two-stage inverse transform (matches README):
    #   1. inverse_transform: scaled space → log space
    #   2. expm1: log space → original unit space
    scale_indices = [_feature_cols.index(c) for c in _features_to_scale if c in _feature_cols]
    if scale_indices:
        inv_input = np.zeros((1, len(scale_indices)), dtype=np.float32)
        inv_input[0, 0] = raw_pred[0, 0]
        inv = _scaler.inverse_transform(inv_input)
        return float(np.expm1(inv[0, 0]))
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
    df = _build_daily_series(stok_keluar, stok_masuk, harga_jual)
    last_date = df["tanggal"].max()

    predictions = []

    for i in range(days_ahead):
        # Recompute features on the full (growing) series each step
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

        # Slide: append predicted row so next iteration uses it as a lag.
        # SalesQuantity is set in _build_features() from qty, so only qty is needed here.
        new_row = pd.DataFrame({
            "tanggal": [future_date],
            "qty":     [pred_qty],
            "price":   [float(harga_jual)],
        })
        df = pd.concat([df, new_row], ignore_index=True)

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
    if avg_past_demand > 0 and predicted_demand_7d > avg_past_demand * 1.15:
        return "increasing"
    return "normal"
