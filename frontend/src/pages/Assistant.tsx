import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Bot,
  SendHorizonal,
  Sparkles,
  TrendingUp,
  Package,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import { askAiChatbot, getAiChatbotErrorMessage } from "@/services";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  error?: string;
}

const CHAT_STORAGE_KEY = "sidoku_ai_chat_messages";

const DEFAULT_MESSAGES: Message[] = [
  {
    id: "1",
    role: "assistant",
    content:
      "Halo 👋 Saya Asisten AI SiDoku. Saya bisa bantu cek penjualan, stok, keuntungan, dan insight bisnis dengan cepat.",
    timestamp: Date.now(),
  },
];

const loadStoredMessages = (): Message[] => {
  if (typeof window === "undefined") {
    return DEFAULT_MESSAGES;
  }

  try {
    const rawMessages = window.localStorage.getItem(CHAT_STORAGE_KEY);

    if (!rawMessages) {
      return DEFAULT_MESSAGES;
    }

    const parsedMessages = JSON.parse(rawMessages) as Message[];

    if (!Array.isArray(parsedMessages) || parsedMessages.length === 0) {
      return DEFAULT_MESSAGES;
    }

    return parsedMessages.filter(
      (message): message is Message =>
        typeof message?.id === "string" &&
        (message.role === "user" || message.role === "assistant") &&
        typeof message.content === "string" &&
        typeof message.timestamp === "number",
    );
  } catch {
    return DEFAULT_MESSAGES;
  }
};

export default function Assistant() {
  const [messages, setMessages] = useState<Message[]>(() => loadStoredMessages());

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    try {
      window.localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // Ignore storage write failures so chat still works normally.
    }
  }, [messages]);

  const generateMessageId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const resetChat = () => {
    try {
      window.localStorage.removeItem(CHAT_STORAGE_KEY);
    } catch {
      // Ignore storage removal errors.
    }

    setMessages(DEFAULT_MESSAGES);
    setInput("");
    setError(null);
    setIsLoading(false);
  };

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
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-5 py-4 md:py-5 space-y-4 md:space-y-5">
        {/* AI INTRO CARD */}
        <div className="rounded-[24px] border border-blue-100 bg-[linear-gradient(135deg,_rgba(239,246,255,0.88),_rgba(255,255,255,0.96))] shadow-sm px-4 py-4 md:px-5 md:py-4.5">
          <div className="flex items-start gap-3.5">
            <div className="h-11 w-11 shrink-0 rounded-2xl bg-[linear-gradient(135deg,_#1d4ed8,_#38bdf8)] text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Sparkles size={24} />
            </div>
            <div className="min-w-0 flex-1 space-y-1.5">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-700">AI Assistant</p>
                <h2 className="mt-1 text-base md:text-lg font-black text-slate-900">Halo! Saya Asisten AI SiDoku</h2>
                <p className="mt-1 text-sm text-slate-600 leading-relaxed max-w-3xl">
                  Fokus ke percakapan bisnis. Tanya apa saja soal stok, rekap penjualan, atau insight usaha Anda.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 font-medium shadow-sm">
                  <Sparkles size={12} />
                  Solusi cepat
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 font-medium shadow-sm">
                  <Bot size={12} />
                  Bahasa Indonesia
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 lg:items-start">
          {/* SIDEBAR */}
          <aside className="lg:w-[260px] xl:w-[280px] space-y-3.5 lg:sticky lg:top-24">
          <div className="rounded-2xl bg-white border border-slate-200 p-3.5 shadow-sm">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 flex items-center justify-center mb-2.5">
              <Bot className="text-blue-600" size={28} />
            </div>

            <h2 className="text-lg font-extrabold text-slate-900 leading-tight">
              Tanya Apa Saja Tentang Bisnis Kamu
            </h2>

            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Chat singkat untuk cek stok, penjualan, dan insight bisnis tanpa banyak klik.
            </p>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 p-3.5 shadow-sm">
            <div className="flex items-center justify-between gap-2 mb-3">
              <p className="text-sm font-bold text-slate-900">Quick Actions</p>
              <button
                onClick={resetChat}
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition"
                type="button"
                aria-label="Bersihkan chat"
              >
                <RotateCcw size={12} />
                Bersihkan
              </button>
            </div>

            <div className="space-y-2">
              <button
                onClick={() =>
                  setInput("Produk apa yang paling laku?")
                }
                className="w-full text-left rounded-2xl border border-slate-200 p-2.5 hover:bg-slate-50 transition"
              >
                <div className="flex items-start gap-3">
                  <TrendingUp
                    size={18}
                    className="text-blue-500 mt-0.5"
                  />

                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Produk Paling Laku
                    </p>

                    <p className="text-xs text-slate-500 mt-1">
                      Lihat produk yang paling laku sekarang
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() =>
                  setInput("Rekomendasi restock apa yang saya butuh?")
                }
                className="w-full text-left rounded-2xl border border-slate-200 p-2.5 hover:bg-slate-50 transition"
              >
                <div className="flex items-start gap-3">
                  <Package
                    size={18}
                    className="text-emerald-500 mt-0.5"
                  />

                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Rekomendasi Restock
                    </p>

                    <p className="text-xs text-slate-500 mt-1">
                      Cek barang yang perlu diisi ulang
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() =>
                  setInput("Bisa prediksi penjualan minggu depan?")
                }
                className="w-full text-left rounded-2xl border border-slate-200 p-2.5 hover:bg-slate-50 transition"
              >
                <div className="flex items-start gap-3">
                  <Sparkles
                    size={18}
                    className="text-orange-500 mt-0.5"
                  />

                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Prediksi Penjualan
                    </p>

                    <p className="text-xs text-slate-500 mt-1">
                      Lihat perkiraan penjualan ke depan
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>
          </aside>

          {/* CHAT AREA */}
          <section className="flex-1 flex flex-col rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden min-h-[680px] lg:min-h-[760px]">
          {/* CHAT HEADER */}
          <div className="border-b border-slate-200 px-4 py-3 bg-slate-50/80 backdrop-blur">
            <div className="flex items-center justify-between gap-3">
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

              <button
                onClick={resetChat}
                type="button"
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm hover:bg-slate-50 hover:text-slate-800 transition"
                aria-label="Reset chat"
              >
                <RotateCcw size={13} />
                Reset Chat
              </button>
            </div>
          </div>

          {/* MESSAGES */}
          <div className="flex-1 overflow-y-auto px-3.5 sm:px-4 md:px-5 py-4 md:py-5 space-y-3.5 bg-gradient-to-b from-slate-50/70 to-white">
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