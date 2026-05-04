"""
SiDoku AI Service - FastAPI Setup
Untuk: Transaction Classification, Forecasting, dan Business Insights
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="SiDoku AI Service",
    description="AI Service untuk klasifikasi transaksi, prediksi, dan business insights",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Frontend
        "http://localhost:3001",  # Backend
        "http://localhost:8000",  # AI Service
        os.getenv("FRONTEND_URL", "http://localhost:5173"),
        os.getenv("BACKEND_URL", "http://localhost:3001")
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "service": "SiDoku AI Service",
        "status": "running",
        "version": "1.0.0"
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "sidoku-ai"
    }

# TODO: Add routes
# - POST /classify - Klasifikasi transaksi otomatis
# - POST /predict - Prediksi penjualan
# - POST /insights - Generate business insights
# - POST /recommend - Rekomendasi pengisian stok

if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("API_PORT", 8000))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=os.getenv("FASTAPI_ENV") == "development"
    )
