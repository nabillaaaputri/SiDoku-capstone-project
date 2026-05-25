# -*- coding: utf-8 -*-
"""
routes/insights.py
POST /insights — Rule-based product status analysis.
Uses GRU 7-day demand prediction vs current stock.
Returns one of four statuses: critical | normal | increasing | overstock
"""

from typing import List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from services import forecasting

router = APIRouter(prefix="/insights", tags=["insights"])


# ── Shared schemas (reused in recommend.py) ────────────────────────────────

class StokKeluarRow(BaseModel):
    tanggal_keluar: str
    jumlah: int


class StokMasukRow(BaseModel):
    tanggal_masuk: str
    jumlah: int


class ProductInsightInput(BaseModel):
    product_name: str
    stok: int
    harga_jual: float
    stok_keluar: List[StokKeluarRow]
    stok_masuk: Optional[List[StokMasukRow]] = []


class InsightsRequest(BaseModel):
    products: List[ProductInsightInput]


class ProductInsightResult(BaseModel):
    product_name: str
    stok: int
    predicted_demand_7d: float
    status: str   # "critical" | "normal" | "increasing" | "overstock"


class InsightsResponse(BaseModel):
    insights: List[ProductInsightResult]


# ── Route ──────────────────────────────────────────────────────────────────

@router.post("", response_model=InsightsResponse)
def insights(body: InsightsRequest):
    """
    Analyse stock status for a list of products.

    For each product:
    1. Run GRU model to predict total demand for the next 7 days.
    2. Compare predicted demand against current `stok`.
    3. Classify into one of four statuses:
       - **critical**   — stock < 30% of 7-day demand
       - **overstock**  — stock >= 200% of 7-day demand
       - **increasing** — demand trending up >15% vs historical avg
       - **normal**     — everything else
    """
    if not forecasting.is_loaded():
        raise HTTPException(status_code=503, detail="Forecasting model is not ready.")

    results = []
    for product in body.products:
        keluar = [r.model_dump() for r in product.stok_keluar]
        masuk  = [r.model_dump() for r in product.stok_masuk]

        try:
            preds = forecasting.predict_sales(
                product_name=product.product_name,
                stok_keluar=keluar,
                stok_masuk=masuk,
                harga_jual=product.harga_jual,
                days_ahead=7,
            )
            demand_7d = sum(p["predicted_qty"] for p in preds)
            avg_past  = forecasting.get_avg_past_demand(keluar)
            status    = forecasting.get_status(product.stok, demand_7d, avg_past)

        except Exception as e:
            # If a product fails, report it as normal and log the error
            import logging
            logging.getLogger(__name__).warning(
                "insights: failed for product '%s': %s", product.product_name, e
            )
            demand_7d = 0.0
            status = "normal"

        results.append(
            ProductInsightResult(
                product_name=product.product_name,
                stok=product.stok,
                predicted_demand_7d=round(demand_7d, 2),
                status=status,
            )
        )

    return InsightsResponse(insights=results)
