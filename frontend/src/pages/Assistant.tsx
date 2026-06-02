import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  Bot,
  Package,
  RotateCcw,
  SendHorizonal,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { askAiChatbot, getAiChatbotErrorMessage } from "@/services";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  error?: string;
}

type AssistantBlock =
  | { type: "paragraph"; text: string }
  | { type: "bullet"; items: string[] }
  | { type: "numbered"; items: string[] };

const QUICK_QUESTIONS = [
  "Produk paling laris",
  "Stok hampir habis",
  "Rekomendasi restock",
  "Ringkasan penjualan",
  "Cek keuntungan",
];

// Fungsi pembuat laci penyimpanan unik berdasarkan potongan authToken user
const getStorageKey = (userKey: string) => `sidoku_ai_chat_${userKey}`;

const DEFAULT_MESSAGES: Message[] = [
  {
    id: "1",
    role: "assistant",
    content: "Halo! Saya Asisten AI SiDoku 👋",
    timestamp: Date.now(),
  },
];

const MARKDOWN_BOLD_PATTERN = /\*\*(.+?)\*\*/g;

const normalizeAssistantText = (content: string) => content.replace(/\r\n/g, "\n").trim();

const parseAssistantBlocks = (content: string): AssistantBlock[] => {
  const normalizedContent = normalizeAssistantText(content);

  if (!normalizedContent) {
    return [];
  }

  const lines = normalizedContent.split("\n");
  const blocks: AssistantBlock[] = [];
  let paragraphLines: string[] = [];
  let listType: "bullet" | "numbered" | null = null;
  let listItems: string[] = [];

  const flushParagraph = () => {
    if (paragraphLines.length === 0) return;

    blocks.push({
      type: "paragraph",
      text: paragraphLines.join("\n"),
    });
    paragraphLines = [];
  };

  const flushList = () => {
    if (listType && listItems.length > 0) {
      blocks.push({
        type: listType,
        items: listItems,
      });
    }

    listType = null;
    listItems = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }

    const bulletMatch = trimmed.match(/^[-*•]\s+(.*)$/);
    const numberedMatch = trimmed.match(/^\d+[.)]\s+(.*)$/);

    if (bulletMatch || numberedMatch) {
      flushParagraph();

      const nextType: "bullet" | "numbered" = bulletMatch ? "bullet" : "numbered";
      const nextItem = (bulletMatch || numberedMatch)?.[1]?.trim() || "";

      if (listType && listType !== nextType) {
        flushList();
      }

      listType = nextType;
      listItems.push(nextItem);
      continue;
    }

    flushList();
    paragraphLines.push(trimmed);
  }

  flushParagraph();
  flushList();

  return blocks;
};

const renderInlineMarkdown = (text: string): ReactNode[] => {
  const fragments: ReactNode[] = [];
  let lastIndex = 0;

  text.replace(MARKDOWN_BOLD_PATTERN, (match, boldText, offset) => {
    if (offset > lastIndex) {
      const rawText = text.slice(lastIndex, offset);
      const rawSegments = rawText.split("\n");

      rawSegments.forEach((segment, segmentIndex) => {
        if (segmentIndex > 0) {
          fragments.push(<br key={`br-${lastIndex}-${segmentIndex}`} />);
        }

        if (segment) {
          fragments.push(segment);
        }
      });
    }

    fragments.push(
      <strong key={`bold-${offset}`} className="font-semibold text-slate-900">
        {boldText}
      </strong>,
    );

    lastIndex = offset + match.length;
    return match;
  });

  if (lastIndex < text.length) {
    const tailText = text.slice(lastIndex);
    tailText.split("\n").forEach((segment, segmentIndex) => {
      if (segmentIndex > 0) {
        fragments.push(<br key={`tail-br-${lastIndex}-${segmentIndex}`} />);
      }

      if (segment) {
        fragments.push(segment);
      }
    });
  }

  return fragments;
};

const renderAssistantMessage = (content: string) => {
  const blocks = parseAssistantBlocks(content);

  if (blocks.length === 0) {
    return null;
  }

  return blocks.map((block, blockIndex) => {
    if (block.type === "paragraph") {
      return (
        <p
          key={`paragraph-${blockIndex}`}
          className="whitespace-pre-wrap break-words text-[13px] leading-7 text-slate-700 sm:text-sm md:text-[15px]"
        >
          {renderInlineMarkdown(block.text)}
        </p>
      );
    }

    const ListTag = block.type === "bullet" ? "ul" : "ol";

    return (
      <ListTag
        key={`${block.type}-${blockIndex}`}
        className={`space-y-1.5 pl-5 text-[13px] leading-7 text-slate-700 sm:text-sm md:text-[15px] ${
          block.type === "bullet" ? "list-disc" : "list-decimal"
        }`}
      >
        {block.items.map((item, itemIndex) => (
          <li key={`${block.type}-${blockIndex}-${itemIndex}`} className="break-words">
            {renderInlineMarkdown(item)}
          </li>
        ))}
      </ListTag>
    );
  });
};

export default function Assistant() {
  // 1. Ambil token unik dari user yang aktif saat ini
  const [currentUsername, setCurrentUsername] = useState(() => {
    if (typeof window === "undefined") return "guest";
    try {
      const token = window.localStorage.getItem("authToken"); 
      if (token) {
        return token.substring(token.length - 15).replace(/[^a-zA-Z0-9]/g, "");
      }
    } catch {
      return "guest";
    }
    return "guest";
  });

  const currentKey = getStorageKey(currentUsername);

  // 2. Ambil data dari LocalStorage sejak awal pembuatan state agar langsung sinkron
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window === "undefined" || currentUsername === "guest") return DEFAULT_MESSAGES;
    try {
      const raw = window.localStorage.getItem(getStorageKey(currentUsername));
      if (!raw) return DEFAULT_MESSAGES;

      const parsed = JSON.parse(raw) as Message[];
      if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_MESSAGES;

      const validMessages = parsed.filter(
        (message): message is Message =>
          typeof message?.id === "string" &&
          (message.role === "user" || message.role === "assistant") &&
          typeof message.content === "string" &&
          typeof message.timestamp === "number"
      );

      return validMessages.length > 0 ? validMessages : DEFAULT_MESSAGES;
    } catch {
      return DEFAULT_MESSAGES;
    }
  });

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isConversationFresh = messages.length === 1;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 3. Sinkronisasi data chat secara dinamis saat mount/deteksi akun
  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = window.localStorage.getItem("authToken");
    if (token) {
      const userKey = token.substring(token.length - 15).replace(/[^a-zA-Z0-9]/g, "");
      setCurrentUsername(userKey);
      
      const raw = window.localStorage.getItem(getStorageKey(userKey));
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as Message[];
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed);
            return; 
          }
        } catch {
          // ignore
        }
      }
    } else {
      setCurrentUsername("guest");
    }
    setMessages(DEFAULT_MESSAGES);
  }, []);

  // 4. Menyimpan data otomatis ke laci LocalStorage akun aktif HANYA jika pesan bertambah
  useEffect(() => {
    if (currentUsername === "guest" || messages.length <= 1) return;
    try {
      window.localStorage.setItem(currentKey, JSON.stringify(messages));
    } catch {
      // ignore
    }
  }, [messages, currentKey, currentUsername]);

  const generateMessageId = () =>
    `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const sendMessage = async (rawInput: string) => {
    const currentInput = rawInput.trim();

    if (!currentInput || isLoading) return;

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
        const filtered = prev.filter((message) => !message.id.startsWith("loading-"));
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
        const filtered = prev.filter((message) => !message.id.startsWith("loading-"));
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

  const handleSendMessage = async () => {
    await sendMessage(input);
  };

  const handleQuickQuestion = async (question: string) => {
    setInput(question);
    await sendMessage(question);
  };

  const resetChat = () => {
    setMessages(DEFAULT_MESSAGES);
    try {
      window.localStorage.removeItem(currentKey); 
    } catch {
      // ignore
    }
    setInput("");
    setError(null);
    setIsLoading(false);
  };

  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-[radial-gradient(circle_at_top,_rgba(219,234,254,0.9),_rgba(248,250,252,1)_42%,_rgba(239,246,255,1)_100%)] text-slate-900">
      <header className="sticky top-0 z-40 border-b border-white/70 bg-white/75 shadow-[0_8px_30px_rgba(15,23,42,0.05)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 md:px-6 md:py-3.5">
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
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-sky-400 text-white shadow-[0_12px_24px_rgba(37,99,235,0.28)] md:h-11 md:w-11">
                <Bot size={20} className="md:h-[22px] md:w-[22px]" />
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-base font-extrabold text-slate-900 md:text-xl">
                  Asisten AI SiDoku
                </h1>
                <p className="truncate text-[11px] text-slate-500 md:text-sm">
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

      <main className="mx-auto flex w-full max-w-7xl flex-1 min-h-0 flex-col gap-3 px-3 py-3 sm:px-4 md:px-6 md:py-6">

        <div className="hidden px-1 pt-1 md:block">
          <p className="text-lg font-semibold tracking-tight text-slate-900 md:text-xl">
            Halo! Saya Asisten AI SiDoku 👋
          </p>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-600 md:text-[15px]">
            Saya membantu Anda memahami kondisi usaha berdasarkan data yang dicatat di aplikasi.
          </p>
        </div>

        <div className="grid flex-1 min-h-0 gap-3 md:gap-4 lg:grid-cols-[300px_minmax(0,1fr)] lg:items-stretch">
          <aside className="hidden lg:flex lg:flex-col lg:gap-4 lg:self-start lg:sticky lg:top-24">
            <div className="rounded-[24px] border border-slate-200 bg-white/95 p-4 shadow-[0_14px_34px_rgba(15,23,42,0.06)]">
              <p className="text-sm font-bold text-slate-900">Tentang Asisten AI</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                Asisten ini membantu membaca data bisnis dengan cepat dan memberi saran yang mudah dipahami.
              </p>
            </div>

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
                  onClick={() => setInput("Rekomendasi restock apa yang saya butuhkan?")}
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
                    <TrendingUp size={18} className="text-orange-500 transition-transform group-hover:scale-105" />
                    <p className="text-sm font-semibold text-slate-800">Prediksi Penjualan</p>
                  </div>
                </button>

                <button
                  onClick={() => setInput("Produk apa yang stoknya menipis?")}
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

          <section className="flex min-h-0 flex-col overflow-hidden rounded-[26px] border border-white/80 bg-white/90 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur min-h-[calc(100dvh-12rem)] sm:min-h-[calc(100dvh-13rem)] md:min-h-[calc(100dvh-14rem)] lg:min-h-[calc(100dvh-220px)]">
            <div className="shrink-0 border-b border-slate-200/80 bg-white/80 px-4 py-3 backdrop-blur-xl sm:px-4 sm:py-3.5">
              <div className="flex items-center justify-between gap-2 sm:gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="relative">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-sky-400 text-white shadow-[0_12px_24px_rgba(37,99,235,0.22)] sm:h-11 sm:w-11">
                      <Bot size={20} className="sm:h-[22px] sm:w-[22px]" />
                    </div>
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-bold text-slate-900 sm:text-base">Asisten AI SiDoku</h3>
                    <p className="truncate text-[11px] text-slate-500 sm:text-xs">Online • Membantu bisnis Anda</p>
                  </div>
                </div>

                <button
                  onClick={resetChat}
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800 sm:px-3 sm:text-xs"
                >
                  <RotateCcw size={12} />
                  Reset Chat
                </button>
              </div>
            </div>

            <div className="border-b border-slate-200/70 bg-white/80 px-3 py-3 md:hidden">
              <div className="space-y-2.5">
                <div className="rounded-[18px] border border-slate-200 bg-slate-50/80 px-3 py-3 shadow-sm">
                  <p className="text-[12px] font-bold text-slate-900">Tentang Asisten SiDoku</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-600">
                    Membantu membaca data usaha seperti produk paling laris, stok menipis, rekomendasi restock, dan ringkasan penjualan.
                  </p>
                </div>

                <div className="rounded-[18px] border border-slate-200 bg-slate-50/80 px-3 py-3 shadow-sm">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[12px] font-bold text-slate-900">Menu Pintar</p>
                      <p className="text-[11px] text-slate-500">Tap salah satu untuk mulai.</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {QUICK_QUESTIONS.map((question) => (
                      <button
                        key={question}
                        type="button"
                        onClick={() => void handleQuickQuestion(question)}
                        className="inline-flex h-8 items-center rounded-full border border-blue-100 bg-white px-3 text-[10px] font-semibold text-blue-700 transition hover:border-blue-200 hover:bg-blue-50"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden bg-[linear-gradient(180deg,rgba(248,250,252,0.85)_0%,rgba(255,255,255,1)_56%,rgba(239,246,255,0.45)_100%)] px-3 py-3 space-y-4 sm:px-4 sm:py-4 md:px-5 md:py-5">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  {message.role === "assistant" ? (
                    <div className="max-w-[92%] sm:max-w-[84%] md:max-w-[78%] lg:max-w-[66%]">
                      <div
                        className={`rounded-[22px] rounded-tl-md px-4 py-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:px-4 sm:py-3.5 ${
                          message.error
                            ? "border border-red-200 bg-red-50"
                            : message.content === "Sedang memproses..."
                            ? "border border-slate-200 bg-slate-100"
                            : "border border-slate-200 bg-white/95"
                        }`}
                      >
                        {message.content === "Sedang memproses..." ? (
                          <div className="flex items-start gap-3">
                            <div className="mt-1 flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-2">
                              <div className="h-2.5 w-2.5 animate-bounce rounded-full bg-blue-500" />
                              <div className="h-2.5 w-2.5 animate-bounce rounded-full bg-blue-500" style={{ animationDelay: "0.15s" }} />
                              <div className="h-2.5 w-2.5 animate-bounce rounded-full bg-blue-500" style={{ animationDelay: "0.3s" }} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[13px] font-semibold text-slate-800 sm:text-sm">SiDoku sedang mengetik...</p>
                              <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500 sm:text-xs">
                                Menyiapkan jawaban yang lebih rapi untuk Anda.
                              </p>
                            </div>
                          </div>
                        ) : message.error ? (
                          <div className="flex items-start gap-2.5">
                            <AlertCircle size={16} className="mt-0.5 flex-shrink-0 text-red-600" />
                            <div className="min-w-0 flex-1">
                              <p className="whitespace-pre-wrap break-words text-[13px] leading-7 text-red-700 sm:text-sm md:text-[15px]">
                                {message.content}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3 text-[13px] leading-7 text-slate-700 sm:text-sm md:text-[15px]">
                            {renderAssistantMessage(message.content) ?? (
                              <p className="whitespace-pre-wrap break-words">{message.content}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="max-w-[92%] rounded-[20px] rounded-br-md bg-gradient-to-r from-blue-600 to-sky-500 px-4 py-3 text-white shadow-[0_16px_32px_rgba(37,99,235,0.24)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_38px_rgba(37,99,235,0.28)] sm:max-w-[74%] lg:max-w-[60%] sm:px-4 sm:py-3.5">
                      <p className="whitespace-pre-wrap break-words text-[13px] leading-7 sm:text-sm md:text-[15px]">{message.content}</p>
                    </div>
                  )}
                </div>
              ))}

              <div ref={messagesEndRef} />
            </div>

            <div className="shrink-0 border-t border-slate-200/80 bg-white/95 p-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] md:p-4">
              <div className="flex items-end gap-2">
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
                    className="w-full min-h-[48px] resize-none rounded-[18px] border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm text-slate-700 shadow-sm transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-[52px] sm:px-4 sm:py-3 [overflow-wrap:anywhere]"
                  />
                </div>

                <button
                  onClick={handleSendMessage}
                  disabled={isLoading || !input.trim()}
                  className="inline-flex h-[48px] items-center justify-center gap-1.5 rounded-[18px] bg-gradient-to-r from-blue-600 to-sky-500 px-3 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(37,99,235,0.24)] transition-all hover:-translate-y-0.5 hover:shadow-[0_20px_36px_rgba(37,99,235,0.28)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 sm:h-[52px] sm:px-5"
                >
                  <SendHorizonal size={15} />
                  <span className="hidden sm:inline">{isLoading ? "Mengirim..." : "Kirim"}</span>
                </button>
              </div>

              <p className="mt-3 text-center text-xs text-slate-400">
                AI dapat membuat kesalahan. Pastikan cek kembali data penting.
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}