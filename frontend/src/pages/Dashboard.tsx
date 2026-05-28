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
  if (typeof window === "undefined") return DEFAULT_MESSAGES;

  try {
    const rawMessages = window.localStorage.getItem(CHAT_STORAGE_KEY);
    if (!rawMessages) return DEFAULT_MESSAGES;

    const parsedMessages = JSON.parse(rawMessages) as Message[];

    if (!Array.isArray(parsedMessages) || parsedMessages.length === 0) {
      return DEFAULT_MESSAGES;
    }

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
  const [messages, setMessages] = useState<Message[]>(() =>
    loadStoredMessages()
  );
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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
      // ignore localStorage error
    }
  }, [messages]);

  const generateMessageId = () =>
    `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const resetChat = () => {
    try {
      window.localStorage.removeItem(CHAT_STORAGE_KEY);
    } catch {
      // ignore localStorage error
    }

    setMessages(DEFAULT_MESSAGES);
    setInput("");
    setError(null);
    setIsLoading(false);
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

      {/* MAIN */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-5 py-3 md:py-4 flex flex-col">
        {/* GREETING BANNER */}
        <div className="mb-3 rounded-2xl border border-blue-100 bg-white/90 px-4 py-3 shadow-sm">
          <p className="text-sm font-bold text-slate-900 leading-tight">
            Halo! Saya Asisten AI SiDoku 👋
          </p>
          <p className="mt-0.5 text-xs text-slate-600 leading-relaxed">
            Tanya apa saja tentang stok, penjualan, restock, keuntungan, atau
            prediksi bisnis Anda.
          </p>
        </div>

        {/* GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-3 flex-1">

          {/* SIDEBAR */}
          <aside className="hidden lg:flex flex-col gap-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
              <p className="text-sm font-bold text-slate-900">
                Tentang Asisten AI
              </p>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Asisten ini membantu membaca data bisnis dengan cepat dan
                memberi saran yang mudah dipahami.
              </p>
              <div className="mt-3 rounded-xl bg-sky-50/70 border border-sky-100 px-3 py-2">
                <p className="text-xs font-semibold text-sky-700">Tips</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-slate-600">
                  Semakin spesifik pertanyaan Anda, semakin tepat jawaban yang
                  diberikan.
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-white border border-slate-200 p-3 shadow-sm">
              <div className="mb-3 space-y-1">
                <p className="text-sm font-bold text-slate-900">Menu Pintar</p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Pilih menu di bawah atau tulis pertanyaan sendiri.
                </p>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => setInput("Produk apa yang paling laku?")}
                  className="w-full text-left rounded-2xl border border-slate-200 px-3 py-2.5 hover:bg-slate-50 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <TrendingUp size={18} className="text-blue-500" />
                    <p className="text-sm font-semibold text-slate-800">
                      Produk Paling Laku
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => setInput("Beri ringkasan usaha saya.")}
                  className="w-full text-left rounded-2xl border border-slate-200 px-3 py-2.5 hover:bg-slate-50 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <Sparkles size={18} className="text-sky-500" />
                    <p className="text-sm font-semibold text-slate-800">
                      Ringkasan Usaha
                    </p>
                  </div>
                </button>

                <button
                  onClick={() =>
                    setInput("Rekomendasi restock apa yang saya butuh?")
                  }
                  className="w-full text-left rounded-2xl border border-slate-200 px-3 py-2.5 hover:bg-slate-50 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <Package size={18} className="text-emerald-500" />
                    <p className="text-sm font-semibold text-slate-800">
                      Rekomendasi Restock
                    </p>
                  </div>
                </button>

                <button
                  onClick={() =>
                    setInput("Bisa prediksi penjualan minggu depan?")
                  }
                  className="w-full text-left rounded-2xl border border-slate-200 px-3 py-2.5 hover:bg-slate-50 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <Sparkles size={18} className="text-orange-500" />
                    <p className="text-sm font-semibold text-slate-800">
                      Prediksi Penjualan
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => setInput("Cek stok menipis.")}
                  className="w-full text-left rounded-2xl border border-slate-200 px-3 py-2.5 hover:bg-slate-50 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <AlertCircle size={18} className="text-amber-500" />
                    <p className="text-sm font-semibold text-slate-800">
                      Cek Stok Menipis
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </aside>

          {/* CHAT AREA */}
          <section className="flex flex-col rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden h-[calc(100vh-200px)] min-h-[500px]">
            {/* CHAT HEADER */}
            <div className="border-b border-slate-200 px-4 py-3 bg-slate-50/80 backdrop-blur shrink-0">
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
                      Asisten AI SiDoku
                    </h3>
                    <p className="text-xs text-slate-500">
                      Siap membantu • Jawaban singkat dan praktis
                    </p>
                  </div>
                </div>

                <button
                  onClick={resetChat}
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm hover:bg-slate-50 hover:text-slate-800 transition"
                >
                  <RotateCcw size={13} />
                  Reset Chat
                </button>
              </div>
            </div>

            {/* MESSAGES */}
            <div className="flex-1 overflow-y-auto px-3.5 sm:px-4 md:px-5 py-3 space-y-3 bg-gradient-to-b from-slate-50/70 to-white">
              {isConversationFresh && (
                <div className="rounded-2xl border border-blue-100 bg-white/90 px-3 py-2 text-xs text-slate-600 shadow-sm w-fit max-w-full">
                  Coba tanyakan: produk paling laku, restock, atau prediksi
                  penjualan.
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.role === "assistant" ? (
                    <div className="max-w-[90%] md:max-w-[75%]">
                      <div
                        className={`rounded-2xl rounded-tl-md px-3.5 py-2.5 shadow-sm ${
                          message.error
                            ? "bg-red-50 border border-red-200"
                            : message.content === "Sedang memproses..."
                            ? "bg-slate-100 border border-slate-200"
                            : "bg-white border border-slate-200"
                        }`}
                      >
                        {message.content === "Sedang memproses..." ? (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                            <div
                              className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            />
                            <div
                              className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                              style={{ animationDelay: "0.4s" }}
                            />
                          </div>
                        ) : message.error ? (
                          <div className="flex items-start gap-2">
                            <AlertCircle
                              size={16}
                              className="text-red-600 flex-shrink-0 mt-0.5"
                            />
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
            <div className="border-t border-slate-200 bg-white p-3 md:p-3.5 shrink-0">
              <div className="flex items-stretch gap-2.5">
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
                    rows={2}
                    className="w-full h-[52px] resize-none rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <button
                  onClick={handleSendMessage}
                  disabled={isLoading || !input.trim()}
                  className="h-[52px] px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-sky-500 text-white font-semibold shadow-lg hover:scale-[1.02] hover:shadow-xl transition flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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