# -*- coding: utf-8 -*-
"""
routes/recommend.py
POST /recommend — Stock reorder recommendations.
Same input as /insights. Returns reorder quantity per product.
reorder_qty = max(0, predicted_demand_7d - current_stock)
"""

from typing import List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from services import forecasting

router = APIRouter(prefix="/recommend", tags=["recommend"])


# ── Schemas ────────────────────────────────────────────────────────────────

class StokKeluarRow(BaseModel):
    tanggal_keluar: str
    jumlah: int


class StokMasukRow(BaseModel):
    tanggal_masuk: str
    jumlah: int


class ProductRecommendInput(BaseModel):
    product_name: str
    stok: int
    harga_jual: float
    stok_keluar: List[StokKeluarRow]
    stok_masuk: Optional[List[StokMasukRow]] = []


class RecommendRequest(BaseModel):
    products: List[ProductRecommendInput]


class RecommendationItem(BaseModel):
    product_name: str
    current_stock: int
    predicted_demand_7d: float
    reorder_qty: int
    status: str   # "critical" | "normal" | "increasing" | "overstock"


class RecommendResponse(BaseModel):
    recommendations: List[RecommendationItem]


# ── Route ──────────────────────────────────────────────────────────────────

@router.post("", response_model=RecommendResponse)
def recommend(body: RecommendRequest):
    """
    Generate stock reorder recommendations for a list of products.

    For each product:
    1. Predict 7-day demand using the GRU model.
    2. Compute `reorder_qty = max(0, predicted_demand_7d - current_stock)`.
    3. Assign status (critical / normal / increasing / overstock).

    Products with status `normal` or `overstock` are still included
    but will have `reorder_qty: 0`.
    """
    if not forecasting.is_loaded():
        raise HTTPException(status_code=503, detail="Forecasting model is not ready.")

    recommendations = []
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
            demand_7d   = sum(p["predicted_qty"] for p in preds)
            avg_past    = forecasting.get_avg_past_demand(keluar)
            status      = forecasting.get_status(product.stok, demand_7d, avg_past)
            reorder_qty = max(0, int(round(demand_7d - product.stok)))

        except Exception as e:
            import logging
            logging.getLogger(__name__).warning(
                "recommend: failed for product '%s': %s", product.product_name, e
            )
            demand_7d   = 0.0
            status      = "normal"
            reorder_qty = 0

        recommendations.append(
            RecommendationItem(
                product_name=product.product_name,
                current_stock=product.stok,
                predicted_demand_7d=round(demand_7d, 2),
                reorder_qty=reorder_qty,
                status=status,
            )
        )

    return RecommendResponse(recommendations=recommendations)
