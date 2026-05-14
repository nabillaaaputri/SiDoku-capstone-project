import { useState, useEffect } from "react";
import {
  SendHorizonal,
  X,
  Bot,
  Sparkles,
} from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatPanel({
  isOpen,
  onClose,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Halo 👋 Saya Asisten AI SiDoku. Saya siap membantu analisis stok, penjualan, dan laporan usaha Anda.",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);

  const [input, setInput] = useState("");
  const [isMobile, setIsMobile] = useState(
    window.innerWidth < 768
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);

    return () =>
      window.removeEventListener(
        "resize",
        handleResize
      );
  }, []);

  const handleSendMessage = (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Saya sedang menganalisis data bisnis Anda. Coba tanyakan soal stok, penjualan, atau keuntungan usaha.",
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [
        ...prev,
        botMessage,
      ]);
    }, 700);

    setInput("");
  };

  // ================= MOBILE =================
  if (isMobile) {
    return (
      <>
        {/* Overlay */}
        <div
          onClick={onClose}
          className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
            isOpen
              ? "opacity-100"
              : "opacity-0 pointer-events-none"
          }`}
        />

        {/* Mobile Bottom Sheet */}
        <div
          className={`fixed inset-x-0 bottom-0 h-[88vh] bg-white z-50 rounded-t-[28px] shadow-2xl transition-transform duration-300 flex flex-col overflow-hidden ${
            isOpen
              ? "translate-y-0"
              : "translate-y-full"
          }`}
        >
          {/* Header */}
          <div className="border-b border-slate-200 bg-white px-[18px] py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Bot size={22} />
              </div>

              <div>
                <h2 className="font-bold text-slate-900">
                  Asisten AI
                </h2>

                <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                  <Sparkles size={12} />
                  Online
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl hover:bg-slate-100 transition flex items-center justify-center"
            >
              <X size={20} />
            </button>
          </div>

          <div className="px-4 pt-3.5">
            <div className="rounded-2xl border border-blue-100 bg-[linear-gradient(135deg,_rgba(239,246,255,0.96),_rgba(255,255,255,0.98))] p-3.5 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[linear-gradient(135deg,_#1d4ed8,_#38bdf8)] text-white flex items-center justify-center shadow-sm">
                  <Sparkles size={18} />
                </div>

                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-700">AI Assistant</p>
                  <h3 className="mt-1 text-sm font-bold text-slate-900">
                    Halo! Saya Asisten AI SiDoku 👋
                  </h3>
                  <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                    Saya membantu Anda memahami kondisi usaha berdasarkan data yang dicatat di aplikasi.
                  </p>
                  <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                    Saya bisa membantu menjelaskan ringkasan usaha, memberi insight pengeluaran, mengecek stok yang hampir habis, dan memberi saran pencatatan usaha sederhana.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Chat */}
          <div className="flex-1 overflow-y-auto px-4 py-4 bg-gradient-to-b from-slate-50 to-blue-50 space-y-3.5">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.sender === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                {msg.sender === "bot" ? (
                  <div className="flex items-start gap-2 max-w-[85%]">
                    <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
                      <Bot size={18} />
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-md px-3.5 py-2.5 shadow-sm">
                      <p className="text-sm text-slate-700 leading-relaxed">
                        {msg.text}
                      </p>

                      <p className="text-[11px] text-slate-400 mt-2">
                        {msg.timestamp.toLocaleTimeString(
                          "id-ID",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-blue-600 text-white rounded-2xl rounded-br-md px-3.5 py-2.5 max-w-[80%] shadow-md">
                    <p className="text-sm leading-relaxed">
                      {msg.text}
                    </p>

                    <p className="text-[11px] text-blue-100 mt-2">
                      {msg.timestamp.toLocaleTimeString(
                        "id-ID",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Input */}
          <form
            onSubmit={handleSendMessage}
            className="border-t border-slate-200 bg-white p-3.5"
          >
            <div className="flex items-center gap-2.5 bg-slate-100 border border-slate-200 rounded-2xl px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500/30 transition">
              <input
                type="text"
                value={input}
                onChange={(e) =>
                  setInput(e.target.value)
                }
                placeholder="Tulis pertanyaan..."
                className="flex-1 bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400"
              />

              <button
                type="submit"
                className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 transition text-white flex items-center justify-center shadow-md shadow-blue-500/30"
              >
                <SendHorizonal size={18} />
              </button>
            </div>
          </form>
        </div>
      </>
    );
  }

  // ================= DESKTOP =================
  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/30 z-40 transition-opacity duration-300 ${
          isOpen
            ? "opacity-100"
            : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Desktop Sidebar */}
      <div
        className={`fixed right-0 top-0 h-screen w-full max-w-[28rem] bg-white z-50 shadow-2xl transition-transform duration-300 flex flex-col overflow-hidden ${
          isOpen
            ? "translate-x-0"
            : "translate-x-full"
        }`}
      >
        {/* Header */}
          <div className="border-b border-slate-200 bg-white px-[18px] py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Bot size={24} />
            </div>

            <div>
              <h2 className="font-bold text-slate-900 text-lg">
                Asisten AI SiDoku
              </h2>

              <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                <Sparkles size={12} />
                Online
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl hover:bg-slate-100 transition flex items-center justify-center"
          >
            <X size={20} />
          </button>
        </div>

          <div className="px-[18px] pt-4">
            <div className="rounded-2xl border border-blue-100 bg-[linear-gradient(135deg,_rgba(239,246,255,0.96),_rgba(255,255,255,0.98))] p-3.5 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[linear-gradient(135deg,_#1d4ed8,_#38bdf8)] text-white flex items-center justify-center shadow-sm">
                  <Sparkles size={18} />
                </div>

                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-700">AI Assistant</p>
                  <h3 className="mt-1 text-sm font-bold text-slate-900">
                    Halo! Saya Asisten AI SiDoku 👋
                  </h3>
                  <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                    Saya membantu Anda memahami kondisi usaha berdasarkan data yang dicatat di aplikasi.
                  </p>
                  <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                    Saya bisa membantu menjelaskan ringkasan usaha, memberi insight pengeluaran, mengecek stok yang hampir habis, dan memberi saran pencatatan usaha sederhana.
                  </p>
                </div>
              </div>
            </div>
          </div>

        {/* Chat Content */}
        <div className="flex-1 overflow-y-auto px-[18px] py-5 bg-gradient-to-b from-slate-50 via-blue-50 to-slate-100 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.sender === "user"
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              {msg.sender === "bot" ? (
                  <div className="flex items-start gap-3 max-w-[85%]">
                  <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
                    <Bot size={18} />
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-md px-3.5 py-2.5 shadow-sm">
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {msg.text}
                    </p>

                    <p className="text-[11px] text-slate-400 mt-2">
                      {msg.timestamp.toLocaleTimeString(
                        "id-ID",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-blue-600 text-white rounded-2xl rounded-br-md px-3.5 py-2.5 max-w-[80%] shadow-md shadow-blue-500/20">
                  <p className="text-sm leading-relaxed">
                    {msg.text}
                  </p>

                  <p className="text-[11px] text-blue-100 mt-2">
                    {msg.timestamp.toLocaleTimeString(
                      "id-ID",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Input */}
        <form
          onSubmit={handleSendMessage}
          className="border-t border-slate-200 bg-white p-3.5"
        >
          <div className="flex items-center gap-2.5 bg-slate-100 border border-slate-200 rounded-2xl px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500/30 transition">
            <input
              type="text"
              value={input}
              onChange={(e) =>
                setInput(e.target.value)
              }
              placeholder="Tulis pertanyaan..."
              className="flex-1 bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400"
            />

            <button
              type="submit"
              className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 transition text-white flex items-center justify-center shadow-md shadow-blue-500/30"
            >
              <SendHorizonal size={18} />
            </button>
          </div>
        </form>
      </div>
    </>
  );
}