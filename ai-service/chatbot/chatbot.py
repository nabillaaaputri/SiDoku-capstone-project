# -*- coding: utf-8 -*-
"""
chatbot.py
Sistem Chatbot menggunakan Groq (Generative llama) dengan output JSON
untuk Intent Classification & Response Generation.
"""

import os
import json
import logging
import groq

logger = logging.getLogger(__name__)

# ── Client — dibuat sekali saat modul di-import ───────────────────────────

_client = groq.Groq(
    api_key=os.getenv("GROQ_API_KEY"),
    timeout=30.0,  # 30 s — hindari request menggantung selamanya
)

# ── System Prompt ─────────────────────────────────────────────────────────

SYSTEM_INSTRUCTION = """
Kamu adalah SiDoku AI, asisten pintar untuk membantu UMKM mengelola catatan keuangan dan stok warung/toko.

Peranmu adalah sebagai Router dan Penyusun Jawaban (Natural Language Generator). Kamu akan menerima request dari SISTEM BACKEND dalam dua skenario yang HARUS dibedakan:

━━━ CARA MEMBEDAKAN SKENARIO ━━━
- Jika input adalah TEKS BIASA (kalimat, pertanyaan, sapaan) → masuk SKENARIO 1.
- Jika input adalah JSON object yang memiliki field `"_scenario": 2` → masuk SKENARIO 2.

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
  * "predict_future_sales": prediksi penjualan ke depan. Untuk action ini, ekstrak juga:
      - `params.product_name` (string): nama produk yang disebutkan user. Kosongkan ("") jika tidak disebutkan.
      - `params.days_ahead` (integer): jumlah hari prediksi. Konversi dari ucapan user (contoh: "1 minggu"=7, "2 minggu"=14). BATAS MAKSIMUM adalah 14 hari — jika user meminta lebih dari 14 hari (misal "1 bulan", "30 hari"), TETAP isi dengan 14 dan beri tahu user di field `response` bahwa prediksi dibatasi 14 hari untuk menjaga akurasi. Default 7 jika tidak disebutkan.
  * "generate_strategy_recommendation": saran strategi bisnis.
- Format JSON: {"response": "Balasan (jika sapaan/luar konteks, atau peringatan batasan prediksi)", "action": "action_terpilih", "tag": "kata_kunci", "params": {}}
- Untuk action selain `predict_future_sales`, field `params` WAJIB diisi dengan objek kosong `{}`.

SKENARIO 2: MENYUSUN JAWABAN DARI DATA (Input berupa JSON dari backend)
- Input SELALU berupa JSON object dengan field `"_scenario": 2`, `"question"`, dan `"data"`.
- Tugasmu menyusun jawaban yang natural, ramah, dan informatif kepada user MENGGUNAKAN data yang ada di field `"data"`.
- WAJIB isi field `response` dengan jawaban lengkap. Jangan biarkan kosong.
- Jangan menyuruh user mengecek hal lain jika datanya sudah disuapkan. Jelaskan isi datanya secara langsung kepada user. Jika data kosong atau list kosong, beri tahu bahwa datanya belum tersedia.
- Format nominal uang ke Rupiah (misal Rp 150.000).
- FORMAT TEKS dalam field `response`: Gunakan karakter newline `\n` untuk baris baru. Jika jawaban mengandung beberapa item/poin yang sejajar (misal: daftar produk, daftar saran, daftar prediksi), WAJIB gunakan format list:
  * Daftar tanpa urutan → gunakan bullet `•` di awal tiap item, dipisah `\n`.
  * Daftar berurutan / langkah-langkah → gunakan angka `1.` `2.` `3.` dst, dipisah `\n`.
  * Jangan gabungkan semua poin menjadi satu paragraf jika lebih dari 2 item.
- Format JSON: {"response": "Jawaban natural kamu berdasarkan data...", "action": "", "tag": "answered", "params": {}}

PENTING! Kamu WAJIB membalas HANYA dalam format JSON yang valid.
"""

_MODEL = "llama-3.3-70b-versatile"

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
            temperature=0.2,
            response_format={ "type": "json_object" }
        )

        result_text = response.choices[0].message.content
        response_data = json.loads(result_text)

        return {
            "response": response_data.get("response", "Maaf, saya sedang memproses sesuatu."),
            "action":   response_data.get("action", ""),
            "tag":      response_data.get("tag", "unknown"),
            "params":   response_data.get("params", {}),
        }

    except Exception as e:
        err_str = str(e).lower()
        logger.error("OpenAI AI Error: %s", e)

        if "429" in str(e) or "rate_limit_exceeded" in err_str or "too many requests" in err_str:
            return {
                "response": "Asisten AI sedang sibuk, silakan coba lagi dalam beberapa saat.",
                "action":   "",
                "tag":      "rate_limit",
                "params":   {},
            }

        return {
            "response": "Maaf, AI Asisten sedang mengalami gangguan. Silakan coba sebentar lagi.",
            "action":   "",
            "tag":      "error",
            "params":   {},
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