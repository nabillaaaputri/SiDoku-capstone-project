import { MessageCircle, X } from "lucide-react";

interface ChatButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

export default function ChatButton({ isOpen, onClick }: ChatButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`fixed bottom-6 right-6 rounded-full bg-black text-white shadow-lg hover:bg-gray-800 transition flex items-center justify-center z-40 border-2 border-black ${
        isOpen ? "w-14 h-14" : "px-4 h-14 gap-2"
      }`}
      aria-label={isOpen ? "Close chat" : "Open chat"}
    >
      {isOpen ? (
        <X size={24} />
      ) : (
        <>
          <MessageCircle size={24} />
          <span className="hidden sm:inline text-sm font-bold">Tanya</span>
        </>
      )}
    </button>
  );
}
