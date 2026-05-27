# Integrasi Chatbot Frontend ke Backend AI Service

## 📋 Ringkasan Implementasi

Chatbot frontend SiDoku sudah berhasil diintegrasikan ke backend AI service dengan fitur lengkap:
- ✅ User mengirim pertanyaan
- ✅ Frontend POST ke backend endpoint AI
- ✅ Backend response ditampilkan sebagai jawaban chatbot
- ✅ Loading state saat AI sedang memproses
- ✅ Error handling jika AI/backend gagal
- ✅ UI responsif dengan animasi loading

---

## 🔗 Alur Integrasi

```
Frontend (React)
    ↓ User kirim pesan
    ↓
[Assistant.tsx] → Tampilkan user message
    ↓
[askAiChatbot()] → POST /v1/ai-chatbot/ask
    ↓
apiClient (axios) → dengan auth token
    ↓
Backend Express API
    ↓
[aiChatbotController.js] → Validasi payload
    ↓
[Python AI Service]
    ↓
Backend return: { status: "success", data: { answer: "..." } }
    ↓
Frontend → Tampilkan jawaban di chat
    ↓
Loading state hilang, message visible ✅
```

---

## 📁 File yang Diubah

### 1. **src/pages/Assistant.tsx** (MAIN CHANGES)
File chat page yang menampilkan interface chatbot lengkap.

**Perubahan:**
- Tambah state `isLoading` untuk tracking proses
- Tambah state `error` untuk error messages
- Update `handleSendMessage()` menjadi async function
- Implementasi loading placeholder dengan animasi
- Implementasi error display dengan styling khusus
- Disable input/button saat loading
- Gunakan `askAiChatbot()` dari service
- Update struktur message dari `id: number, sender, text` → `id: string, role, content, timestamp`

**Key Features:**
```tsx
// Kirim pesan ke AI
const result = await askAiChatbot(input.trim());

// Handle response
setMessages((prev) => [...prev, {
  id: generateMessageId(),
  role: "assistant",
  content: result.answer,
  timestamp: Date.now(),
}]);

// Handle error dengan error message handler
catch (error) {
  const errorMessage = getAiChatbotErrorMessage(error);
  // Display error bubble...
}
```

---

### 2. **src/services/aiChatbot.service.ts** (EXISTING)
Service yang menangani komunikasi dengan backend AI.

**Struktur:**
```typescript
export const askAiChatbot = async (question: string): Promise<AiChatbotAnswer>
// Return: { question, answer, action, tag, data }

export const getAiChatbotErrorMessage = (error: unknown): string
// Return error message yang user-friendly
```

**Endpoint yang Digunakan:**
- POST `/v1/ai-chatbot/ask`
- Base URL: `https://sidoku.up.railway.app/v1`
- Auth: Memerlukan Bearer token (dari localStorage)
- Request body: `{ question: string }`
- Response: `{ status: "success", data: { answer: string } }`

---

### 3. **src/services/api.ts** (EXISTING)
Axios client dengan base URL dan auth interceptor.

**Config:**
- Base URL auto-add `/v1` prefix
- Auto-inject auth token dari localStorage
- Handle 401 unauthorized
- Retry logic (optional)

---

## 🎯 Endpoint Backend

### POST `/v1/ai-chatbot/ask`

**Request:**
```json
{
  "question": "Stok saya menipis, apa saran?"
}
```

**Response (Success):**
```json
{
  "status": "success",
  "data": {
    "question": "Stok saya menipis, apa saran?",
    "answer": "Sebaiknya lakukan restock produk A, B, dan C yang stoknya tinggal sedikit.",
    "action": "RESTOCK",
    "tag": "inventory",
    "data": null
  }
}
```

**Response (Error):**
```json
{
  "status": "error",
  "message": "Pertanyaan tidak boleh kosong."
}
```

---

## 🎨 UI Features

### 1. **User Message**
- Aligned ke kanan
- Gradient background (blue to sky)
- White text
- Rounded corners dengan distinctive corner

### 2. **Assistant Message**
- Aligned ke kiri
- White background dengan blue icon
- Slate text
- Max width control untuk readability

### 3. **Loading State**
```
User Message ✓ Sent
Assistant: [Loading animation with 3 bouncing dots]
```
- 3 animasi dot yang bounce
- Auto-replace dengan real response saat ready

### 4. **Error State**
```
User Message ✓ Sent
Assistant: [Error bubble dengan red background]
🔴 Gagal mendapatkan jawaban dari AI. Silakan coba lagi.
```
- Red background untuk warning
- Alert circle icon
- User-friendly error message

### 5. **Input Textarea**
- Disable saat loading
- Show "Mengirim..." text di button saat loading
- Button disabled jika input kosong
- Support Enter to send (Shift+Enter untuk newline)

---

## 🔐 Authentication

**Token Management:**
- Token diambil dari `localStorage` (key: `authToken`)
- Auto-injected di setiap request header: `Authorization: Bearer {token}`
- Jika 401 error, token di-clear

**Tanpa Auth:**
Endpoint akan return 401 Unauthorized

---

## ✅ Testing Manual

### 1. **Test Happy Path**
```
1. Buka page "/ai-assistant"
2. Ketik: "Berapa total penjualan saya bulan ini?"
3. Tunggu 2-3 detik
4. Lihat loading animation
5. AI answer muncul di chat ✓
```

### 2. **Test Error Handling**
```
1. Disconnect internet / kill backend
2. Kirim pertanyaan
3. Lihat error bubble dengan red background ✓
```

### 3. **Test UI States**
```
1. Textarea disable saat loading ✓
2. Send button disable saat loading ✓
3. Button text berubah "Mengirim..." ✓
4. Cursor pointer tetap ada (nice UX) ✓
```

---

## 🚀 Cara Menggunakan di Komponen Lain

### Impor di komponen baru:
```typescript
import { askAiChatbot, getAiChatbotErrorMessage } from "@/services";

// Gunakan:
try {
  const result = await askAiChatbot("Pertanyaan saya");
  console.log(result.answer);
} catch (error) {
  const msg = getAiChatbotErrorMessage(error);
  console.error(msg);
}
```

---

## 📊 Struktur Message Interface

```typescript
interface Message {
  id: string;                    // "1234567890-abc123def"
  role: "user" | "assistant";    // Sender type
  content: string;               // Message text
  timestamp: number;             // Date.now()
  error?: string;                // Error message (optional)
}
```

---

## 🔄 Response Parsing

Service auto-parse response dari backend:

**Backend Return:**
```json
{
  "status": "success",
  "data": {
    "question": "...",
    "answer": "AI answer di sini",
    "action": "...",
    "tag": "...",
    "data": {...}
  }
}
```

**Service Return:**
```typescript
{
  question: string;
  answer: string;          // ← Ini yang digunakan di UI
  action?: string;
  tag?: string;
  data?: unknown;
}
```

---

## ⚠️ Error Messages

Service provide smart error message:

1. **Network Error:**
   > "Gagal menghubungi AI service. Cek koneksi internet."

2. **Unauthorized (401):**
   > "Sesi Anda sudah berakhir. Silakan login kembali."

3. **Validation Error:**
   > "Pertanyaan tidak boleh kosong."

4. **Server Error (5xx):**
   > Error message dari server jika ada

5. **Unknown Error:**
   > "Maaf, chatbot AI sedang bermasalah. Coba lagi sebentar lagi."

---

## 🎯 Next Steps (Optional)

Fitur yang bisa ditambah di masa depan:

1. **Chat History Persistence**
   - Save ke localStorage atau DB
   - Load previous conversations

2. **Typing Indicator**
   - "Assistant sedang mengetik..."

3. **Quick Actions**
   - Tombol suggestion yang dapat di-click
   - Copy to clipboard untuk answer

4. **Analytics**
   - Track user questions
   - Monitor AI success rate

5. **Multi-turn Conversation**
   - Context-aware responses
   - Remember previous messages untuk AI

---

## 📝 Notes

- ✅ Semua Enum/Interface sudah match dengan backend
- ✅ Error handling comprehensive
- ✅ Loading state jelas terlihat
- ✅ UI responsive mobile & desktop
- ✅ Accessibility check (aria-label, semantic HTML)
- ✅ TypeScript strict mode compatible

---

**Tanggal Update:** 27 Mei 2026  
**Status:** ✅ READY FOR PRODUCTION
