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
} from "lucide-react";

interface Message {
  id: number;
  sender: "user" | "assistant";
  text: string;
}

export default function Assistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "assistant",
      text: "Halo 👋 Saya Asisten AI SiDoku. Saya bisa membantu analisis stok, penjualan, keuntungan, dan memberikan insight bisnis secara cepat.",
    },
  ]);

  const [input, setInput] = useState("");

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
      isFirstRender.current = false;
      return;
    }

    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      sender: "user",
      text: input,
    };

    const assistantResponse: Message = {
      id: Date.now() + 1,
      sender: "assistant",
      text: "Berdasarkan data bisnis Anda, penjualan terlihat stabil minggu ini. Produk kategori minuman menjadi yang paling laku, sementara beberapa stok mulai menipis dan perlu segera restock.",
    };

    setMessages((prev) => [
      ...prev,
      userMessage,
      assistantResponse,
    ]);

    setInput("");
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
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full px-4 md:px-6 py-6 gap-6">
        {/* SIDEBAR */}
        <aside className="lg:w-80 space-y-5">
          {/* INTRO */}
          <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center mb-4">
              <Bot className="text-blue-600" size={28} />
            </div>

            <h2 className="text-2xl font-extrabold text-slate-900 leading-tight">
              Tanya Apa Saja Tentang Bisnis Kamu
            </h2>

            <p className="text-sm text-slate-600 mt-3 leading-relaxed">
              Dapatkan insight cepat mengenai stok, penjualan,
              keuntungan, hingga rekomendasi bisnis otomatis.
            </p>
          </div>

          {/* QUICK QUESTIONS */}
          <div className="rounded-3xl bg-white border border-slate-200 p-5 shadow-sm">
            <p className="text-sm font-bold text-slate-900 mb-4">
              Contoh Pertanyaan
            </p>

            <div className="space-y-3">
              <button
                onClick={() =>
                  setInput("Produk apa yang paling laku minggu ini?")
                }
                className="w-full text-left rounded-2xl border border-slate-200 p-3 hover:bg-slate-50 transition"
              >
                <div className="flex items-start gap-3">
                  <TrendingUp
                    size={18}
                    className="text-blue-500 mt-0.5"
                  />

                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Penjualan Terbaik
                    </p>

                    <p className="text-xs text-slate-500 mt-1">
                      “Produk apa yang paling laku minggu ini?”
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() =>
                  setInput("Stok mana yang harus segera restock?")
                }
                className="w-full text-left rounded-2xl border border-slate-200 p-3 hover:bg-slate-50 transition"
              >
                <div className="flex items-start gap-3">
                  <Package
                    size={18}
                    className="text-emerald-500 mt-0.5"
                  />

                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Kelola Stok
                    </p>

                    <p className="text-xs text-slate-500 mt-1">
                      “Stok mana yang harus segera restock?”
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() =>
                  setInput("Berapa estimasi keuntungan bulan ini?")
                }
                className="w-full text-left rounded-2xl border border-slate-200 p-3 hover:bg-slate-50 transition"
              >
                <div className="flex items-start gap-3">
                  <Wallet
                    size={18}
                    className="text-orange-500 mt-0.5"
                  />

                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Analisis Keuntungan
                    </p>

                    <p className="text-xs text-slate-500 mt-1">
                      “Berapa estimasi keuntungan bulan ini?”
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </aside>

        {/* CHAT AREA */}
        <section className="flex-1 flex flex-col rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden min-h-[700px]">
          {/* CHAT HEADER */}
          <div className="border-b border-slate-200 px-5 py-4 bg-slate-50">
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
          <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 space-y-5 bg-gradient-to-b from-slate-50 to-white">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                {message.sender === "assistant" ? (
                  <div className="flex gap-3 max-w-[90%] md:max-w-[75%]">
                    <div className="w-10 h-10 rounded-2xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Bot
                        size={18}
                        className="text-blue-600"
                      />
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
                      <p className="text-sm md:text-[15px] text-slate-700 leading-relaxed">
                        {message.text}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="max-w-[85%] md:max-w-[70%] bg-gradient-to-r from-blue-600 to-sky-500 text-white rounded-2xl rounded-br-md px-4 py-3 shadow-lg">
                    <p className="text-sm md:text-[15px] leading-relaxed">
                      {message.text}
                    </p>
                  </div>
                )}
              </div>
            ))}

            <div ref={messagesEndRef} />
          </div>

          {/* INPUT */}
          <div className="border-t border-slate-200 bg-white p-4 md:p-5">
            <div className="flex items-end gap-3">
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
                  placeholder="Tulis pertanyaan Anda..."
                  rows={2}
                  className="w-full resize-none rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition"
                />
              </div>

              <button
                onClick={handleSendMessage}
                className="h-[52px] px-5 rounded-2xl bg-gradient-to-r from-blue-600 to-sky-500 text-white font-semibold shadow-lg hover:scale-[1.02] hover:shadow-xl transition flex items-center gap-2"
              >
                <SendHorizonal size={18} />

                <span className="hidden sm:inline">
                  Kirim
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
  );
}