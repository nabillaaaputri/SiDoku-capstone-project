import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";

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
      text: "Halo! Saya Asisten AI SiDoku. Siap membantu Anda dengan pertanyaan seputar keuangan, stok, dan ringkasan usaha. Apa yang bisa saya bantu?",
    },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (input.trim()) {
      const userMessage: Message = {
        id: messages.length + 1,
        sender: "user",
        text: input,
      };

      const assistantResponse: Message = {
        id: messages.length + 2,
        sender: "assistant",
        text: "Berdasarkan data bisnis Anda, berikut adalah insight dan rekomendasi yang bisa membantu meningkatkan penjualan dan manajemen stok Anda.",
      };

      setMessages([...messages, userMessage, assistantResponse]);
      setInput("");
    }
  };

  return (
    <div className="min-h-screen md:min-h-[100vh] bg-white flex flex-col md:flex-row">
      {/* ========== DESKTOP SIDEBAR / INTRO PANEL ========== */}
      <div className="hidden md:flex md:w-80 md:flex-col md:border-r-2 md:border-black md:bg-gray-50 md:p-8 md:justify-between">
        <div>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-sm border-2 border-black px-3 py-2 font-bold hover:bg-gray-200 transition mb-8"
          >
            ← Kembali
          </Link>

          <div className="space-y-3">
            <h1 className="text-3xl font-bold">Asisten AI</h1>
            <p className="text-lg font-bold text-gray-700">Siap membantu bisnis Anda</p>
            <p className="text-sm text-gray-600">
              Tanya soal keuangan, stok, dan ringkasan usaha kamu. Saya akan membantu memberikan insight untuk bisnis yang lebih baik.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-bold text-gray-500">TIPS BERTANYA:</p>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• "Berapa keuntungan hari ini?"</li>
            <li>• "Produk apa yang paling laku?"</li>
            <li>• "Gimana cara kelola stok?"</li>
          </ul>
        </div>
      </div>

      {/* ========== MOBILE HEADER ========== */}
      <div className="md:hidden sticky top-0 z-40 border-b-2 border-black bg-white">
        <div className="p-4 flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Asisten AI</h1>
            <p className="text-xs text-gray-600">Siap membantu bisnis Anda</p>
          </div>
          <Link to="/dashboard" className="p-2 hover:bg-gray-100 rounded transition">
            <X size={24} />
          </Link>
        </div>
      </div>

      {/* ========== CHAT AREA ========== */}
      <div className="flex-1 flex flex-col md:p-0">
        {/* Desktop Info Banner */}
        <div className="hidden md:block border-b-2 border-gray-200 bg-gray-50 p-6">
          <p className="text-sm text-gray-700">
            Tanya soal keuangan, stok, dan ringkasan usaha kamu.
          </p>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-white">
          {messages.map((message) => (
            <div key={message.id}>
              {message.sender === "user" ? (
                <div className="flex justify-end">
                  <div className="bg-black text-white p-3 md:p-4 rounded-lg max-w-xs md:max-w-sm">
                    <p className="text-sm md:text-base">{message.text}</p>
                  </div>
                </div>
              ) : (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-900 p-3 md:p-4 rounded-lg max-w-xs md:max-w-sm border border-gray-300">
                    <p className="text-sm md:text-base">{message.text}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area - Pinned Bottom */}
        <div className="border-t-2 border-black bg-white p-4 md:p-6 space-y-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            className="w-full border-2 border-gray-300 p-3 md:p-4 font-sans text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-black focus:border-black rounded resize-none"
            placeholder="Tulis pertanyaan Anda di sini... (Enter untuk kirim)"
            rows={3}
          />
          <button
            onClick={handleSendMessage}
            className="w-full border-2 border-black bg-black text-white px-4 py-3 md:py-4 font-bold hover:bg-gray-800 rounded transition text-sm md:text-base"
          >
            Tanya Asisten
          </button>
        </div>
      </div>
    </div>
  );
}
