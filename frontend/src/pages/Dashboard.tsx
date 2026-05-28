import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Bot,
  Menu,
  X,
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
  if (typeof window === "undefined") return DEFAULT_MESSAGES;
  try {
    const rawMessages = window.localStorage.getItem(CHAT_STORAGE_KEY);
    if (!rawMessages) return DEFAULT_MESSAGES;
    const parsedMessages = JSON.parse(rawMessages) as Message[];
    if (!Array.isArray(parsedMessages) || parsedMessages.length === 0) return DEFAULT_MESSAGES;
    const validMessages = parsedMessages.filter(
      (message): message is Message =>
        typeof message?.id === "string" &&
        (message.role === "user" || message.role === "assistant") &&
        typeof message.content === "string" &&
        typeof message.timestamp === "number"
    );
    return validMessages.length > 0 ? validMessages : DEFAULT_MESSAGES;
  } catch {
    window.localStorage.removeItem(CHAT_STORAGE_KEY);
    return DEFAULT_MESSAGES;
  }
};

export default function Assistant() {
  const [messages, setMessages] = useState<Message[]>(() => loadStoredMessages());
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isConversationFresh = messages.length <= 1;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    try {
      window.localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // ignore
    }
  }, [messages]);

  const generateMessageId = () =>
    `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const resetChat = () => {
    try {
      window.localStorage.removeItem(CHAT_STORAGE_KEY);
    } catch {
      // ignore
    }
    setMessages(DEFAULT_MESSAGES);
    setInput("");
    setError(null);
    setIsLoading(false);
    setIsMobileSidebarOpen(false);
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const currentInput = input.trim();

    const userMessage: Message = {
      id: generateMessageId(),
      role: "user",
      content: currentInput,
      timestamp: Date.now(),
    };

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
      const result = await askAiChatbot(currentInput);
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
    <div className="min-h-screen flex flex-col bg-[radial-gradient(circle_at_top,_rgba(219,234,254,0.9),_rgba(248,250,252,1)_40%,_rgba(239,246,255,1)_100%)] text-slate-900">
      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-white/70 bg-white/75 shadow-[0_8px_30px_rgba(15,23,42,0.05)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 rounded-full px-2.5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-blue-600"
            >
              <ArrowLeft size={18} />
              Kembali
            </Link>
            <div className="hidden h-6 w-px bg-slate-200 md:block" />
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-sky-400 text-white shadow-[0_12px_24px_rgba(37,99,235,0.28)]">
                <Bot size={22} />
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-lg font-extrabold text-slate-900 md:text-xl">
                  Asisten AI SiDoku
                </h1>
                <p className="truncate text-xs text-slate-500 md:text-sm">
                  Analisis bisnis otomatis & insight usaha
                </p>
              </div>
            </div>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 shadow-sm md:flex">
            <Sparkles size={14} />
            AI Active
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="mx-auto flex flex-1 min-h-0 w-full max-w-7xl flex-col gap-4 px-4 py-4 md:px-6 md:py-6">
        {/* GREETING BANNER */}
        <div className="rounded-[24px] border border-white/80 bg-white/85 px-4 py-4 shadow-[0_18px_45px_rgba(15,23,42,0.06)] backdrop-blur">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold leading-tight text-slate-900">
                Halo! Saya Asisten AI SiDoku 👋
              </p>
              <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-600">
                Tanya apa saja tentang stok, penjualan, restock, keuntungan, atau prediksi bisnis Anda.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen((prev) => !prev)}
              className="inline-flex items-center justify-center gap-2 self-start rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 lg:hidden"
            >
              {isMobileSidebarOpen ? <X size={14} /> : <Menu size={14} />}
              {isMobileSidebarOpen ? "Tutup Menu Pintar" : "Buka Menu Pintar"}
            </button>
          </div>
        </div>

        {isMobileSidebarOpen && (
          <div className="grid gap-3 lg:hidden">
            <div className="rounded-[24px] border border-slate-200 bg-white/95 p-4 shadow-[0_14px_34px_rgba(15,23,42,0.06)]">
              <p className="text-sm font-bold text-slate-900">Tentang Asisten AI</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                Asisten ini membantu membaca data bisnis dengan cepat dan memberi saran yang mudah dipahami.
              </p>
              <div className="mt-3 rounded-2xl border border-sky-100 bg-sky-50/80 px-3 py-2.5">
                <p className="text-xs font-semibold text-sky-700">Tips</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-slate-600">
                  Semakin spesifik pertanyaan Anda, semakin tepat jawaban yang diberikan.
                </p>
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-white/95 p-4 shadow-[0_14px_34px_rgba(15,23,42,0.06)]">
              <div className="mb-3 space-y-1">
                <p className="text-sm font-bold text-slate-900">Menu Pintar</p>
                <p className="text-xs leading-relaxed text-slate-500">
                  Pilih menu di bawah atau tulis pertanyaan sendiri.
                </p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <button
                  onClick={() => setInput("Produk apa yang paling laku?")}
                  className="group w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50/70 hover:shadow-md"
                >
                  <div className="flex items-center gap-2.5">
                    <TrendingUp size={18} className="text-blue-500 transition-transform group-hover:scale-105" />
                    <p className="text-sm font-semibold text-slate-800">Produk Paling Laku</p>
                  </div>
                </button>
                <button
                  onClick={() => setInput("Beri ringkasan usaha saya.")}
                  className="group w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-sky-200 hover:bg-sky-50/70 hover:shadow-md"
                >
                  <div className="flex items-center gap-2.5">
                    <Sparkles size={18} className="text-sky-500 transition-transform group-hover:scale-105" />
                    <p className="text-sm font-semibold text-slate-800">Ringkasan Usaha</p>
                  </div>
                </button>
                <button
                  onClick={() => setInput("Rekomendasi restock apa yang saya butuh?")}
                  className="group w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50/70 hover:shadow-md"
                >
                  <div className="flex items-center gap-2.5">
                    <Package size={18} className="text-emerald-500 transition-transform group-hover:scale-105" />
                    <p className="text-sm font-semibold text-slate-800">Rekomendasi Restock</p>
                  </div>
                </button>
                <button
                  onClick={() => setInput("Bisa prediksi penjualan minggu depan?")}
                  className="group w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-orange-200 hover:bg-orange-50/70 hover:shadow-md"
                >
                  <div className="flex items-center gap-2.5">
                    <Sparkles size={18} className="text-orange-500 transition-transform group-hover:scale-105" />
                    <p className="text-sm font-semibold text-slate-800">Prediksi Penjualan</p>
                  </div>
                </button>
                <button
                  onClick={() => setInput("Cek stok menipis.")}
                  className="group w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-amber-200 hover:bg-amber-50/70 hover:shadow-md sm:col-span-2"
                >
                  <div className="flex items-center gap-2.5">
                    <AlertCircle size={18} className="text-amber-500 transition-transform group-hover:scale-105" />
                    <p className="text-sm font-semibold text-slate-800">Cek Stok Menipis</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* GRID */}
        <div className="grid flex-1 min-h-0 grid-cols-1 gap-4 lg:grid-cols-[300px_minmax(0,1fr)] lg:items-stretch">

          {/* SIDEBAR */}
          <aside className="hidden lg:sticky lg:top-24 lg:flex lg:self-start lg:flex-col lg:gap-4">
            {/* About card */}
            <div className="rounded-[24px] border border-slate-200 bg-white/95 p-4 shadow-[0_14px_34px_rgba(15,23,42,0.06)]">
              <p className="text-sm font-bold text-slate-900">Tentang Asisten AI</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                Asisten ini membantu membaca data bisnis dengan cepat dan memberi saran yang mudah dipahami.
              </p>
              <div className="mt-3 rounded-2xl border border-sky-100 bg-sky-50/80 px-3 py-2.5">
                <p className="text-xs font-semibold text-sky-700">Tips</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-slate-600">
                  Semakin spesifik pertanyaan Anda, semakin tepat jawaban yang diberikan.
                </p>
              </div>
            </div>

            {/* Menu Pintar card */}
            <div className="rounded-[24px] border border-slate-200 bg-white/95 p-4 shadow-[0_14px_34px_rgba(15,23,42,0.06)]">
              <div className="mb-3 space-y-1">
                <p className="text-sm font-bold text-slate-900">Menu Pintar</p>
                <p className="text-xs leading-relaxed text-slate-500">
                  Pilih menu di bawah atau tulis pertanyaan sendiri.
                </p>
              </div>
              <div className="space-y-2">
                <button
                  onClick={() => setInput("Produk apa yang paling laku?")}
                  className="group w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50/70 hover:shadow-md"
                >
                  <div className="flex items-center gap-2.5">
                    <TrendingUp size={18} className="text-blue-500 transition-transform group-hover:scale-105" />
                    <p className="text-sm font-semibold text-slate-800">Produk Paling Laku</p>
                  </div>
                </button>
                <button
                  onClick={() => setInput("Beri ringkasan usaha saya.")}
                  className="group w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-sky-200 hover:bg-sky-50/70 hover:shadow-md"
                >
                  <div className="flex items-center gap-2.5">
                    <Sparkles size={18} className="text-sky-500 transition-transform group-hover:scale-105" />
                    <p className="text-sm font-semibold text-slate-800">Ringkasan Usaha</p>
                  </div>
                </button>
                <button
                  onClick={() => setInput("Rekomendasi restock apa yang saya butuh?")}
                  className="group w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50/70 hover:shadow-md"
                >
                  <div className="flex items-center gap-2.5">
                    <Package size={18} className="text-emerald-500 transition-transform group-hover:scale-105" />
                    <p className="text-sm font-semibold text-slate-800">Rekomendasi Restock</p>
                  </div>
                </button>
                <button
                  onClick={() => setInput("Bisa prediksi penjualan minggu depan?")}
                  className="group w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-orange-200 hover:bg-orange-50/70 hover:shadow-md"
                >
                  <div className="flex items-center gap-2.5">
                    <Sparkles size={18} className="text-orange-500 transition-transform group-hover:scale-105" />
                    <p className="text-sm font-semibold text-slate-800">Prediksi Penjualan</p>
                  </div>
                </button>
                <button
                  onClick={() => setInput("Cek stok menipis.")}
                  className="group w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-amber-200 hover:bg-amber-50/70 hover:shadow-md"
                >
                  <div className="flex items-center gap-2.5">
                    <AlertCircle size={18} className="text-amber-500 transition-transform group-hover:scale-105" />
                    <p className="text-sm font-semibold text-slate-800">Cek Stok Menipis</p>
                  </div>
                </button>
              </div>
            </div>
          </aside>

          {/* CHAT SECTION */}
          <section className="flex min-h-0 flex-col overflow-hidden rounded-[30px] border border-white/80 bg-white/90 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur">
            {/* CHAT HEADER */}
            <div className="shrink-0 border-b border-slate-200/80 bg-white/80 px-4 py-3.5 backdrop-blur-xl">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="relative">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-sky-400 text-white shadow-[0_12px_24px_rgba(37,99,235,0.22)]">
                      <Bot size={22} />
                    </div>
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate font-bold text-slate-900">Asisten AI SiDoku</h3>
                    <p className="truncate text-xs text-slate-500">Siap membantu • Jawaban singkat dan praktis</p>
                  </div>
                </div>
                <button
                  onClick={resetChat}
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800"
                >
                  <RotateCcw size={13} />
                  Reset Chat
                </button>
              </div>
            </div>

            {/* MESSAGES */}
            <div className="flex-1 min-h-0 overflow-y-auto bg-[linear-gradient(180deg,rgba(248,250,252,0.85)_0%,rgba(255,255,255,1)_55%,rgba(239,246,255,0.45)_100%)] px-3.5 py-4 space-y-3.5 sm:px-4 md:px-5">
              {isConversationFresh && (
                <div className="w-fit max-w-full rounded-2xl border border-blue-100 bg-white/90 px-3 py-2 text-xs text-slate-600 shadow-sm">
                  Coba tanyakan: produk paling laku, restock, atau prediksi penjualan.
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.role === "assistant" ? (
                    <div className="max-w-[92%] md:max-w-[78%] lg:max-w-[66%]">
                      <div
                        className={`rounded-[22px] rounded-tl-md px-4 py-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                          message.error
                            ? "border border-red-200 bg-red-50"
                            : message.content === "Sedang memproses..."
                            ? "border border-slate-200 bg-slate-100"
                            : "border border-slate-200 bg-white/95"
                        }`}
                      >
                        {message.content === "Sedang memproses..." ? (
                          <div className="flex items-center gap-2.5">
                            <div className="h-2.5 w-2.5 animate-bounce rounded-full bg-blue-500" />
                            <div className="h-2.5 w-2.5 animate-bounce rounded-full bg-blue-500" style={{ animationDelay: "0.15s" }} />
                            <div className="h-2.5 w-2.5 animate-bounce rounded-full bg-blue-500" style={{ animationDelay: "0.3s" }} />
                          </div>
                        ) : message.error ? (
                          <div className="flex items-start gap-2">
                            <AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm md:text-[15px] text-red-700 leading-relaxed">{message.content}</p>
                          </div>
                        ) : (
                          <p className="text-sm md:text-[15px] text-slate-700 leading-relaxed">{message.content}</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="max-w-[88%] rounded-[22px] rounded-br-md bg-gradient-to-r from-blue-600 to-sky-500 px-4 py-3 text-white shadow-[0_16px_32px_rgba(37,99,235,0.24)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_38px_rgba(37,99,235,0.28)] md:max-w-[72%] lg:max-w-[60%]">
                      <p className="text-sm md:text-[15px] leading-relaxed">{message.content}</p>
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* INPUT */}
            <div className="shrink-0 border-t border-slate-200/80 bg-white/95 p-3.5 md:p-4">
              <div className="flex items-end gap-2.5">
                <div className="flex-1">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    disabled={isLoading}
                    placeholder="Tulis pertanyaan Anda..."
                    rows={1}
                    className="w-full min-h-[56px] resize-none rounded-[20px] border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-700 shadow-sm transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={isLoading || !input.trim()}
                  className="inline-flex h-[56px] items-center justify-center gap-1.5 rounded-[20px] bg-gradient-to-r from-blue-600 to-sky-500 px-5 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(37,99,235,0.24)] transition-all hover:-translate-y-0.5 hover:shadow-[0_20px_36px_rgba(37,99,235,0.28)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  <SendHorizonal size={15} />
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
      </main>
    </div>
  );
}