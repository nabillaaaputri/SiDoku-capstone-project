# -*- coding: utf-8 -*-
"""
routes/predict.py
POST /predict — GRU-based sales forecasting.
Accepts raw DB rows from Express, performs feature engineering, runs model.
"""

from typing import List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from services import forecasting

router = APIRouter(prefix="/predict", tags=["predict"])


# ── Request / Response schemas ─────────────────────────────────────────────

class StokKeluarRow(BaseModel):
    tanggal_keluar: str   # "YYYY-MM-DD"
    jumlah: int


class StokMasukRow(BaseModel):
    tanggal_masuk: str    # "YYYY-MM-DD"
    jumlah: int


class PredictRequest(BaseModel):
    product_name: str
    stok: int
    harga_jual: float
    stok_keluar: List[StokKeluarRow]
    stok_masuk: Optional[List[StokMasukRow]] = []
    days_ahead: Optional[int] = 7
    today: Optional[str] = None


class PredictionPoint(BaseModel):
    date: str
    predicted_qty: float


class PredictResponse(BaseModel):
    product_name: str
    predictions: List[PredictionPoint]


# ── Route ──────────────────────────────────────────────────────────────────

@router.post("", response_model=PredictResponse)
def predict(body: PredictRequest):
    """
    Predict daily sales quantity for the next `days_ahead` days.

    Express sends raw rows directly from the `Stok_Keluar` and `Stok_Masuk`
    tables. The AI service builds all 26 model features internally.

    Minimum 28 records in `stok_keluar` required.
    """
    if not forecasting.is_loaded():
        raise HTTPException(status_code=503, detail="Forecasting model is not ready.")

    if len(body.stok_keluar) < 1:
        raise HTTPException(
            status_code=422,
            detail="stok_keluar must contain at least 1 record (28+ recommended)."
        )

    try:
        predictions = forecasting.predict_sales(
            product_name=body.product_name,
            stok_keluar=[r.model_dump() for r in body.stok_keluar],
            stok_masuk=[r.model_dump() for r in body.stok_masuk],
            harga_jual=body.harga_jual,
            days_ahead=body.days_ahead,
            today=body.today,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return PredictResponse(
        product_name=body.product_name,
        predictions=[PredictionPoint(**p) for p in predictions],
    )
