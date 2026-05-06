import { useState, useEffect } from "react";
import { Send, X } from "lucide-react";

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

export default function ChatPanel({ isOpen, onClose }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Halo! Saya adalah asisten AI SiDoku. Ada yang bisa saya bantu?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      const userMessage: Message = {
        id: Date.now().toString(),
        text: input,
        sender: "user",
        timestamp: new Date(),
      };

      setMessages([...messages, userMessage]);

      // Simulate bot response
      setTimeout(() => {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: "Terima kasih atas pertanyaannya. Bagaimana saya bisa membantu Anda lebih lanjut?",
          sender: "bot",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);
      }, 500);

      setInput("");
    }
  };

  // Mobile: Bottom Sheet (75vh)
  if (isMobile) {
    return (
      <>
        {/* Overlay */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
        )}

        {/* Bottom Sheet - Full Screen */}
        <div
          className={`fixed inset-0 bg-white border-t-2 border-black shadow-2xl transition-transform duration-300 z-50 flex flex-col rounded-t-2xl ${
            isOpen ? "translate-y-0" : "translate-y-full"
          }`}
        >
          {/* Header */}
          <div className="border-b-2 border-black p-4 bg-gray-50 flex items-center justify-between flex-shrink-0 rounded-t-2xl">
            <div>
              <h3 className="text-lg font-bold">Tanya Asisten</h3>
              <p className="text-xs text-gray-600">Siap membantu bisnis Anda</p>
            </div>
            <button
              onClick={onClose}
              className="border-2 border-black bg-white p-1 hover:bg-gray-100 transition"
              aria-label="Close chat"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded border-2 text-sm ${
                    msg.sender === "user"
                      ? "bg-black text-white border-black"
                      : "bg-gray-100 text-black border-gray-300"
                  }`}
                >
                  <p>{msg.text}</p>
                  <p className="text-xs mt-1 opacity-70">
                    {msg.timestamp.toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Input Form */}
          <form
            onSubmit={handleSendMessage}
            className="border-t-2 border-black p-4 bg-white flex-shrink-0 rounded-b-2xl"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tulis pesan..."
                className="flex-1 border-2 border-black px-3 py-2 text-sm focus:outline-none"
              />
              <button
                type="submit"
                className="border-2 border-black bg-black text-white p-2 hover:bg-gray-800 transition"
                aria-label="Send message"
              >
                <Send size={18} />
              </button>
            </div>
          </form>
        </div>
      </>
    );
  }

  // Desktop: Right Sidebar (full height)
  return (
    <div
      className={`fixed right-0 top-0 h-screen w-full max-w-sm bg-white border-l-2 border-black shadow-lg transition-transform duration-300 z-50 flex flex-col ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {/* Header */}
      <div className="border-b-2 border-black p-4 bg-gray-50 flex items-center justify-between flex-shrink-0">
        <div>
          <h3 className="text-lg font-bold">Tanya Asisten</h3>
          <p className="text-xs text-gray-600">Siap membantu bisnis Anda</p>
        </div>
        <button
          onClick={onClose}
          className="border-2 border-black bg-white p-1 hover:bg-gray-100 transition"
          aria-label="Close chat"
        >
          <X size={20} />
        </button>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded border-2 text-sm ${
                msg.sender === "user"
                  ? "bg-black text-white border-black"
                  : "bg-gray-100 text-black border-gray-300"
              }`}
            >
              <p>{msg.text}</p>
              <p className="text-xs mt-1 opacity-70">
                {msg.timestamp.toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={handleSendMessage}
        className="border-t-2 border-black p-4 bg-white flex-shrink-0"
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tulis pesan..."
            className="flex-1 border-2 border-black px-3 py-2 text-sm focus:outline-none"
          />
          <button
            type="submit"
            className="border-2 border-black bg-black text-white p-2 hover:bg-gray-800 transition"
            aria-label="Send message"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}
