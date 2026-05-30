"""
SiDoku AI Service - FastAPI
Endpoints: /chat, /predict, /insights, /recommend
"""

import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO"),
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


# ── Startup / Shutdown ────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Pre-load heavy models so the first request isn't slow."""
    logger.info("Loading forecasting model...")
    from services import forecasting
    ok = forecasting.load_model()
    if ok:
        logger.info("Forecasting model ready.")
    else:
        logger.warning("Forecasting model failed to load — /predict, /insights, /recommend will return 503.")

    logger.info("Loading chatbot data...")
    # Importing chatbot module triggers NLTK downloads + intent pre-processing
    import chatbot.chatbot  # noqa: F401
    logger.info("Chatbot ready.")

    yield  # app runs here

    logger.info("AI Service shutting down.")


# ── App ───────────────────────────────────────────────────────────────────

app = FastAPI(
    title="SiDoku AI Service",
    description=(
        "AI Service untuk SiDoku: klasifikasi transaksi, prediksi penjualan, "
        "analisis stok, dan chatbot asisten bisnis."
    ),
    version="1.0.0",
    lifespan=lifespan,
)


# ── CORS ──────────────────────────────────────────────────────────────────

_allowed_origins = [
    "http://localhost:5173",   # Vite frontend
    "http://localhost:3001",   # Express backend
    "http://localhost:8000",   # AI service (local dev)
    os.getenv("FRONTEND_URL", "http://localhost:5173"),
    os.getenv("BACKEND_URL",  "http://localhost:3001"),
]

# On Railway, also allow the public domain
_railway_domain = os.getenv("RAILWAY_PUBLIC_DOMAIN")
if _railway_domain:
    _allowed_origins.append(f"https://{_railway_domain}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(set(_allowed_origins)),  # deduplicate
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Base routes ───────────────────────────────────────────────────────────

@app.get("/", tags=["health"])
def read_root():
    return {
        "service": "SiDoku AI Service",
        "status": "running",
        "version": "1.0.0",
    }


@app.get("/health", tags=["health"])
def health_check():
    from services import forecasting
    return {
        "status": "healthy",
        "service": "sidoku-ai",
        "model_loaded": forecasting.is_loaded(),
    }


# ── Feature routes ────────────────────────────────────────────────────────

from routes.chat      import router as chat_router
from routes.predict   import router as predict_router
from routes.insights  import router as insights_router
from routes.recommend import router as recommend_router

app.include_router(chat_router)
app.include_router(predict_router)
app.include_router(insights_router)
app.include_router(recommend_router)


# ── Entry point ───────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", os.getenv("API_PORT", 8000)))
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=port,
        reload=os.getenv("FASTAPI_ENV") == "development",
    )
