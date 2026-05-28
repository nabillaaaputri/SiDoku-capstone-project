import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Bot,
  SendHorizonal,
  Sparkles,
  TrendingUp,
  Package,
  Wallet,
  AlertCircle,
} from "lucide-react";
import { askAiChatbot, getAiChatbotErrorMessage } from "@/services";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  error?: string;
}

export default function Assistant() {
  const STORAGE_KEY = "sidoku_ai_chat_messages";

  const DEFAULT_MESSAGES: Message[] = [
    {
      id: "1",
      role: "assistant",
      content:
        "Halo 👋 Saya Asisten AI SiDoku. Saya bisa membantu analisis stok, penjualan, keuntungan, dan memberikan insight bisnis secara cepat.",
      timestamp: Date.now(),
    },
  ];

  const [messages, setMessages] = useState<Message[]>(DEFAULT_MESSAGES);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // FIX AUTO SCROLL
  const isFirstRender = useRef(true);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  useEffect(() => {
    if (isFirstRender.current) {
      // load stored messages on first render
      isFirstRender.current = false;
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Message[];
          if (Array.isArray(parsed) && parsed.length) {
            setMessages(parsed);
          }
        }
      } catch (e) {
        // ignore parse errors
      }
      return;
    }

    scrollToBottom();
  }, [messages]);

  // persist messages
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {
      // ignore
    }
  }, [messages]);

  const generateMessageId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: generateMessageId(),
      role: "user",
      content: input.trim(),
      timestamp: Date.now(),
    };

    // Add user message dan loading placeholder
    setMessages((prev) => [
      ...prev,
      userMessage,
      {
        id: `loading-${Date.now()}`,
        role: "assistant",
        content: "Sedang memproses...",
        timestamp: Date.now(),
      },
    ]);

    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      // Call backend AI service
      const result = await askAiChatbot(input.trim());
      
      // Remove loading message dan add real response
      setMessages((prev) => {
        const filtered = prev.filter((m) => !m.id.startsWith("loading-"));
        return [
          ...filtered,
          {
            id: generateMessageId(),
            role: "assistant",
            content: result.answer,
            timestamp: Date.now(),
          },
        ];
      });
    } catch (error) {
      // Show error message
      const errorMessage = getAiChatbotErrorMessage(error);

      setError(errorMessage);

      setMessages((prev) => {
        const filtered = prev.filter((m) => !m.id.startsWith("loading-"));
        return [
          ...filtered,
          {
            id: generateMessageId(),
            role: "assistant",
            content: errorMessage,
            timestamp: Date.now(),
            error: errorMessage,
          },
        ];
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetChat = () => {
    setMessages(DEFAULT_MESSAGES);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      // ignore
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-sky-100 flex flex-col">
      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-blue-600 transition"
            >
              <ArrowLeft size={18} />
              Kembali
            </Link>

            <div className="hidden md:block w-px h-6 bg-slate-300" />

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-sky-400 flex items-center justify-center text-white shadow-lg">
                <Bot size={22} />
              </div>

              <div>
                <h1 className="text-lg md:text-xl font-extrabold text-slate-900">
                  Asisten AI SiDoku
                </h1>

                <p className="text-xs md:text-sm text-slate-500">
                  Analisis bisnis otomatis & insight usaha
                </p>
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-2 rounded-full text-xs font-semibold">
            <Sparkles size={14} />
            AI Active
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <div className="flex-1 max-w-6xl mx-auto w-full px-4 md:px-5 py-4 md:py-5 space-y-4 md:space-y-5">
        {/* AI INTRO CARD */}
        <div className="rounded-[28px] border border-blue-100 bg-[linear-gradient(135deg,_rgba(239,246,255,0.95),_rgba(255,255,255,0.95))] shadow-sm p-4 md:p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-3.5 max-w-3xl">
              <div className="h-12 w-12 shrink-0 rounded-2xl bg-[linear-gradient(135deg,_#1d4ed8,_#38bdf8)] text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Sparkles size={26} />
              </div>
              <div className="space-y-2.5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-700">AI Assistant</p>
                  <h2 className="mt-1 text-lg md:text-xl font-black text-slate-900">Halo! Saya Asisten AI SiDoku 👋</h2>
                  <p className="mt-1.5 text-sm md:text-[15px] text-slate-600 leading-relaxed max-w-2xl">
                    Saya membantu Anda memahami kondisi usaha berdasarkan data yang dicatat di aplikasi.
                  </p>
                </div>

                <div className="grid gap-2 md:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 shadow-sm">
                    Saya bisa membantu:
                    <ul className="mt-1.5 space-y-1 text-sm text-slate-600">
                      <li>• Menjelaskan ringkasan usaha</li>
                      <li>• Memberikan insight pengeluaran</li>
                      <li>• Mengecek stok yang hampir habis</li>
                      <li>• Memberikan saran pencatatan usaha sederhana</li>
                    </ul>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 shadow-sm">
                    Contoh pertanyaan:
                    <ul className="mt-1.5 space-y-1 text-sm text-slate-600">
                      <li>• Pengeluaran saya paling besar di mana?</li>
                      <li>• Produk apa yang stoknya hampir habis?</li>
                      <li>• Bagaimana kondisi usaha saya minggu ini?</li>
                      <li>• Apa yang perlu saya perhatikan hari ini?</li>
                    </ul>
                  </div>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">
                  AI memberikan saran berdasarkan data yang tersedia di aplikasi, jadi hasilnya dapat berbeda sesuai kelengkapan data.
                </p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-2 rounded-full border border-blue-100 bg-white px-3 py-2 text-xs font-semibold text-blue-700 shadow-sm">
              <Bot size={14} />
              Siap membantu
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-5 lg:h-[calc(100vh-240px)]">
          {/* SIDEBAR */}
          <aside className="lg:w-[320px] space-y-4 lg:sticky lg:top-24 lg:self-start">
            {/* INTRO */}
            <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center">
                  <Bot className="text-blue-600" size={22} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-900">Tentang Asisten AI</p>
                  <p className="text-xs text-slate-500 mt-1">Asisten ini membantu membaca data bisnis dengan cepat dan memberi saran yang mudah dipahami.</p>
                </div>
              </div>
            </div>

            {/* QUICK MENU */}
            <div className="rounded-2xl bg-white border border-slate-200 p-3 shadow-sm">
              <p className="text-sm font-bold text-slate-900 mb-3">Menu Pintar</p>

              <div className="grid gap-3">
                <button onClick={() => setInput("Produk paling laris apa")} className="flex items-center gap-3 text-left rounded-xl border border-slate-100 p-3 hover:bg-slate-50 transition">
                  <TrendingUp size={18} className="text-blue-500" />
                  <div>
                    <p className="text-sm font-semibold">Produk Paling Laku</p>
                    <p className="text-xs text-slate-500">Cek produk paling laku</p>
                  </div>
                </button>

                <button onClick={() => setInput("Ringkasan usaha saya") } className="flex items-center gap-3 text-left rounded-xl border border-slate-100 p-3 hover:bg-slate-50 transition">
                  <Sparkles size={18} className="text-emerald-500" />
                  <div>
                    <p className="text-sm font-semibold">Ringkasan Usaha</p>
                    <p className="text-xs text-slate-500">Ringkasan transaksi dan kinerja</p>
                  </div>
                </button>

                <button onClick={() => setInput("Rekomendasi restock apa yang saya butuhkan?") } className="flex items-center gap-3 text-left rounded-xl border border-slate-100 p-3 hover:bg-slate-50 transition">
                  <Package size={18} className="text-amber-500" />
                  <div>
                    <p className="text-sm font-semibold">Rekomendasi Restock</p>
                    <p className="text-xs text-slate-500">Saran restock otomatis</p>
                  </div>
                </button>

                <button onClick={() => setInput("Bisa prediksi penjualan minggu depan?") } className="flex items-center gap-3 text-left rounded-xl border border-slate-100 p-3 hover:bg-slate-50 transition">
                  <TrendingUp size={18} className="text-blue-500" />
                  <div>
                    <p className="text-sm font-semibold">Prediksi Penjualan</p>
                    <p className="text-xs text-slate-500">Perkiraan penjualan mendatang</p>
                  </div>
                </button>

                <button onClick={() => setInput("Produk apa yang stoknya menipis?") } className="flex items-center gap-3 text-left rounded-xl border border-slate-100 p-3 hover:bg-slate-50 transition">
                  <Package size={18} className="text-red-500" />
                  <div>
                    <p className="text-sm font-semibold">Cek Stok Menipis</p>
                    <p className="text-xs text-slate-500">Lihat produk mendekati habis</p>
                  </div>
                </button>
              </div>
            </div>
          </aside>

          {/* CHAT AREA */}
          <section className="flex-1 flex flex-col rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden min-h-[620px] lg:h-full">
          {/* CHAT HEADER */}
          <div className="border-b border-slate-200 px-4 py-3.5 bg-slate-50">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-sky-400 flex items-center justify-center text-white">
                  <Bot size={22} />
                </div>

                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
              </div>

              <div>
                <h3 className="font-bold text-slate-900">
                  AI Assistant
                </h3>

                <p className="text-xs text-slate-500">
                  Online • Membantu bisnis Anda
                </p>
              </div>
            </div>
          </div>

          {/* MESSAGES */}
          <div className="flex-1 overflow-y-auto px-4 md:px-5 py-5 space-y-4 bg-gradient-to-b from-slate-50 to-white">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                {message.role === "assistant" ? (
                  <div className="flex gap-3 max-w-[90%] md:max-w-[75%]">
                    <div className="w-10 h-10 rounded-2xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Bot
                        size={18}
                        className="text-blue-600"
                      />
                    </div>

                    <div className={`rounded-2xl rounded-tl-md px-3.5 py-2.5 shadow-sm ${
                      message.error
                        ? "bg-red-50 border border-red-200"
                        : message.content === "Sedang memproses..."
                          ? "bg-slate-100 border border-slate-200"
                          : "bg-white border border-slate-200"
                    }`}>
                      {message.content === "Sedang memproses..." ? (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
                        </div>
                      ) : message.error ? (
                        <div className="flex items-start gap-2">
                          <AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
                          <p className="text-sm md:text-[15px] text-red-700 leading-relaxed">
                            {message.content}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm md:text-[15px] text-slate-700 leading-relaxed">
                          {message.content}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="max-w-[85%] md:max-w-[70%] bg-gradient-to-r from-blue-600 to-sky-500 text-white rounded-2xl rounded-br-md px-3.5 py-2.5 shadow-lg">
                    <p className="text-sm md:text-[15px] leading-relaxed">
                      {message.content}
                    </p>
                  </div>
                )}
              </div>
            ))}

            <div ref={messagesEndRef} />
          </div>

          {/* INPUT */}
          <div className="border-t border-slate-200 bg-white p-3.5 md:p-4">
            <div className="flex items-end gap-2.5">
              <div className="flex-1">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" &&
                      !e.shiftKey
                    ) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  disabled={isLoading}
                  placeholder="Tulis pertanyaan Anda..."
                  rows={2}
                  className="w-full resize-none rounded-2xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <button
                onClick={handleSendMessage}
                disabled={isLoading || !input.trim()}
                className="h-11 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-sky-500 text-white font-semibold shadow-lg hover:scale-[1.02] hover:shadow-xl transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <SendHorizonal size={18} />

                <span className="hidden sm:inline">
                  {isLoading ? "Mengirim..." : "Kirim"}
                </span>
              </button>
            </div>

            <p className="text-xs text-slate-400 mt-3 text-center">
              AI dapat membuat kesalahan. Pastikan cek kembali data penting.
            </p>
          </div>
          </section>
        </div>
      </div>
    </div>
  );
}
