# -*- coding: utf-8 -*-
"""
chatbot.py
Sistem Chatbot menggunakan NLTK dan Algoritma Pencocokan Kata Dasar (Set Intersection)
"""

import json
import random
import re
import string
from pathlib import Path
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords

# Unduh dependensi NLTK
nltk.download('punkt', quiet=True)
nltk.download('punkt_tab', quiet=True)
nltk.download('stopwords', quiet=True)

# Resolve paths relative to this file so imports work from any CWD
_BASE_DIR = Path(__file__).parent

# INTENT DATASET
with open(_BASE_DIR / 'chat_data.json', 'r', encoding='utf-8') as f:
    json_data = f.read()

# KAMUS SLANGWORDS
with open(_BASE_DIR / 'slangwords.json', 'r', encoding='utf-8') as f:
    slangwords = json.load(f)

# PIPELINE PREPROCESSING NLTK
def cleaningText(text):
    text = re.sub(r'@[A-Za-z0-9]+', '', text)
    text = re.sub(r'#[A-Za-z0-9]+', '', text)
    text = re.sub(r"http\S+", '', text)
    text = re.sub(r'[0-9]+', '', text)
    text = text.replace('\n', ' ')
    text = text.translate(str.maketrans('', '', string.punctuation))
    text = text.strip(' ')
    return text

def fix_slangwords(text):
    words = text.split()
    fixed_words = [slangwords.get(word.lower(), word) for word in words]
    return ' '.join(fixed_words)

# Pre-build stopword set once at module load (not per-request)
_STOPWORDS = set(stopwords.words('indonesian'))
_STOPWORDS.update(set(stopwords.words('english')))
_STOPWORDS -= {'tidak', 'bukan', 'belum', 'kurang', 'jangan', 'berapa', 'apa', 'bagaimana', 'siapa'}
_STOPWORDS.update(['iya', 'yaa', 'gak', 'nya', 'na', 'sih', 'ku', 'di', 'ga', 'ya', 'gaa', 'loh', 'kah'])

def filteringText(text):
    return [txt for txt in text if txt not in _STOPWORDS]

def full_preprocess(text):
    """Membersihkan teks menjadi sekumpulan kata bermakna (list of words)"""
    text = cleaningText(text)
    text = text.lower()
    text = fix_slangwords(text)
    tokens = word_tokenize(text)
    filtered_tokens = filteringText(tokens)
    return filtered_tokens

# PERSIAPAN DATA PENCOCOKAN (OPTIMASI MEMORI)
intents = json.loads(json_data)
processed_intents = []

# Menerjemahkan seluruh pola di JSON menjadi "himpunan kata bersih" sejak awal
for intent in intents['intents']:
    patterns_words = []
    for pattern in intent['patterns']:
        cleaned_pattern_words = full_preprocess(pattern)
        patterns_words.append(set(cleaned_pattern_words))

    processed_intents.append({
        "tag": intent['tag'],
        "patterns_words": patterns_words
    })

# ALGORITMA PENCOCOKAN KATA (WORD MATCHING)
def predict_intent(sentence):
    """Returns the best matching intent tag, or None if below threshold."""
    user_words = set(full_preprocess(sentence))

    if not user_words:
        return None

    best_intent = None
    max_common = 0
    max_score = 0.0

    for intent in processed_intents:
        for pattern_words in intent['patterns_words']:
            if not pattern_words:
                continue

            common_words = user_words.intersection(pattern_words)
            num_common = len(common_words)
            score = num_common / len(pattern_words)

            # Prioritaskan pola dengan KATA COCOK LEBIH BANYAK (lebih spesifik)
            # Jika jumlah kata cocok sama, pilih yang rasionya lebih besar
            if num_common > max_common or (num_common == max_common and score > max_score):
                max_common = num_common
                max_score = score
                best_intent = intent['tag']

    # Threshold: Minimal 40% kata dari pola dataset terpenuhi oleh input pengguna
    if max_score >= 0.4 and max_common > 0:
        return best_intent
    return None


def get_response(message: str) -> dict:
    """
    Main API-facing function. Returns a dict with:
      - response: str   — chatbot reply text
      - action:   str   — action tag (empty string if none)
      - tag:      str|None — matched intent tag
    """
    tag = predict_intent(message)

    if tag is None:
        return {
            "response": (
                "Maaf, saya belum memahami instruksi tersebut. "
                "Coba sebutkan kata kunci seperti 'omzet', 'pengeluaran', 'prediksi', atau 'stok'."
            ),
            "action": "",
            "tag": None
        }

    for intent in intents['intents']:
        if intent['tag'] == tag:
            return {
                "response": random.choice(intent['responses']),
                "action": intent.get('action', ''),
                "tag": tag
            }

    return {
        "response": "Terjadi kesalahan internal. Silakan coba lagi.",
        "action": "",
        "tag": None
    }


# CLI usage (standalone)
def run_chatbot():
    print("=" * 60)
    print("AI Asisten SiDoku (NLTK Rule-Based Engine) Dimulai!")
    print("Ketik 'keluar' untuk menghentikan percakapan.")
    print("=" * 60)

    while True:
        user_input = input("\nAnda: ")
        result = get_response(user_input)
        print(f"Asisten: {result['response']}")
        if result['tag'] == "perpisahan":
            break


if __name__ == "__main__":
    run_chatbot()