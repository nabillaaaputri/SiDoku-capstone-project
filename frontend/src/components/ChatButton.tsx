import { MessageCircle, X } from "lucide-react";

interface ChatButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

export default function ChatButton({ isOpen, onClick }: ChatButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`fixed bottom-[calc(env(safe-area-inset-bottom)+1rem)] right-3 sm:bottom-6 sm:right-6 rounded-full bg-black text-white shadow-lg hover:bg-gray-800 transition flex items-center justify-center z-40 border-2 border-black ${
        isOpen ? "w-12 h-12 sm:w-14 sm:h-14" : "px-3.5 h-12 sm:px-4 sm:h-14 gap-2"
      }`}
      aria-label={isOpen ? "Close chat" : "Open chat"}
    >
      {isOpen ? (
        <X size={20} className="sm:h-6 sm:w-6" />
      ) : (
        <>
          <MessageCircle size={20} className="sm:h-6 sm:w-6" />
          <span className="hidden sm:inline text-sm font-bold">Tanya</span>
        </>
      )}
    </button>
  );
}
