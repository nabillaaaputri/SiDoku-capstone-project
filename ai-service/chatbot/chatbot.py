# -*- coding: utf-8 -*-
"""
chatbot.py
Sistem Chatbot menggunakan OpenAI (Generative) dengan output JSON
untuk Intent Classification & Response Generation.
"""

import os
import json
import logging
import openai

logger = logging.getLogger(__name__)

# ── Client — dibuat sekali saat modul di-import ───────────────────────────

_client = openai.OpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
    timeout=30.0,  # 30 s — hindari request menggantung selamanya
)

# ── System Prompt ─────────────────────────────────────────────────────────

SYSTEM_INSTRUCTION = """
Kamu adalah SiDoku AI, asisten pintar untuk membantu UMKM mengelola catatan keuangan dan stok warung/toko.

Peranmu adalah sebagai Router dan Penyusun Jawaban (Natural Language Generator). Kamu akan menerima request dari SISTEM BACKEND dalam dua skenario:

SKENARIO 1: MENGANALISIS PERTANYAAN (Input berupa teks pertanyaan dari user)
- Sistem hanya mengirimkan pertanyaan murni dari user (Misal: "Berapa penjualan hari ini?" atau "Halo").
- Tugasmu HANYA menganalisis niat pengguna dan menentukan tindakan (`action`) apa yang harus diambil backend.
- BATASAN KONTEKS: Jika pertanyaan user SAMA SEKALI DILUAR KONTEKS bisnis UMKM, keuangan, atau stok warung/toko (misalnya bertanya tentang cuaca, politik, game, dll), TOLAK dengan sopan dan jelaskan bahwa kamu adalah asisten SiDoku yang hanya fokus pada pengelolaan bisnis. Kosongkan `action` ("") dan tulis penolakan tersebut di field `response`.
- Jika user hanya menyapa atau berbasa-basi (tidak butuh data), kosongkan `action` ("") dan berikan balasan sapaan di `response`.
- Jika pesan meminta informasi bisnis, KOSONGKAN field `response` ("") dan WAJIB pilih salah satu `action` berikut:
  * "fetch_business_summary": ringkasan usaha, laporan performa bisnis umum, rangkuman harian/bulanan.
  * "fetch_daily_sales": penjualan, omzet harian.
  * "fetch_best_selling": produk terlaris.
  * "fetch_expenses": pengeluaran.
  * "fetch_profit_loss": laba bersih, keuntungan.
  * "fetch_inventory": sisa stok.
  * "predict_inventory_depletion": barang mau habis/kritis.
  * "predict_future_sales": prediksi penjualan ke depan.
  * "generate_strategy_recommendation": saran strategi bisnis.
- Format JSON: {"response": "Balasan (jika sapaan/luar konteks)", "action": "action_terpilih", "tag": "kata_kunci"}

SKENARIO 2: MENYUSUN JAWABAN DARI DATA (Input berupa JSON dari backend)
- Backend telah mengeksekusi `action` dan kini memanggilmu kembali dengan menyuapkan data.
- Input akan berbentuk JSON: {"question": "pertanyaan awal user", "data": <hasil dari database/AI service>}.
- Tugasmu menyusun jawaban yang natural, ramah, dan informatif kepada user MENGGUNAKAN data tersebut.
- Jangan menyuruh user mengecek hal lain jika datanya sudah disuapkan. Jelaskan isi datanya secara langsung kepada user. Jika data kosong, beri tahu bahwa datanya belum tersedia.
- Format nominal uang ke Rupiah (misal Rp 150.000).
- Format JSON: {"response": "Jawaban natural kamu berdasarkan data...", "action": "", "tag": "answered"}

PENTING! Kamu WAJIB membalas HANYA dalam format JSON yang valid.
"""

_MODEL = "gpt-4o-mini"

# ── Public API ────────────────────────────────────────────────────────────

def get_response(message: str) -> dict:
    """
    Main API-facing function.
    """
    try:
        response = _client.chat.completions.create(
            model=_MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_INSTRUCTION},
                {"role": "user", "content": message}
            ],
            temperature=0.1,
            response_format={ "type": "json_object" }
        )

        result_text = response.choices[0].message.content
        response_data = json.loads(result_text)

        return {
            "response": response_data.get("response", "Maaf, saya sedang memproses sesuatu."),
            "action":   response_data.get("action", ""),
            "tag":      response_data.get("tag", "unknown"),
        }

    except Exception as e:
        err_str = str(e).lower()
        logger.error("OpenAI AI Error: %s", e)

        if "429" in str(e) or "rate_limit_exceeded" in err_str or "too many requests" in err_str:
            return {
                "response": "Asisten AI sedang sibuk, silakan coba lagi dalam beberapa saat.",
                "action":   "",
                "tag":      "rate_limit",
            }

        return {
            "response": "Maaf, AI Asisten sedang mengalami gangguan. Silakan coba sebentar lagi.",
            "action":   "",
            "tag":      "error",
        }

# ── CLI usage (standalone testing) ───────────────────────────────────────

def run_chatbot():
    print("=" * 60)
    print("AI Asisten SiDoku (OpenAI Mode)")
    print("Ketik 'keluar' untuk menghentikan percakapan.")
    print("=" * 60)

    while True:
        user_input = input("\nAnda: ")
        if user_input.lower() in ["keluar", "exit", "quit"]:
            break

        result = get_response(user_input)
        print(f"Asisten: {result['response']}")
        print(f"[Debug] action='{result['action']}' tag='{result['tag']}'")

if __name__ == "__main__":
    run_chatbot()