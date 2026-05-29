import { ReactNode, useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { CheckCircle2, LogOut, Settings, Menu, MessageCircle, ChevronDown, Store } from "lucide-react";
import { getPreferredUserName } from "@/services/auth.service";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const profileMenuRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const displayName = getPreferredUserName(user);
  const avatarInitials =
    displayName
      .split(" ")
      .map((part) => part[0])
      .filter(Boolean)
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";
  const hasProfileImage = Boolean(user?.profileImage);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logout berhasil", {
        description: "Anda telah keluar dari akun SiDoku.",
        icon: <CheckCircle2 className="h-4 w-4 text-emerald-600" />,
        duration: 2500,
        className: "border-emerald-200 bg-white text-slate-900 shadow-[0_20px_45px_rgba(16,185,129,0.12)]",
      });
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout gagal", {
        description: "Sesi tidak dapat ditutup saat ini.",
        duration: 2500,
      });
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen overflow-x-clip bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.14),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.10),_transparent_26%),linear-gradient(180deg,_#f8fbff_0%,_#f5f8fc_48%,_#eef4fb_100%)] flex flex-col text-slate-900">

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl shadow-[0_8px_24px_rgba(15,23,42,0.035)] overflow-visible">
        <nav className="w-full px-3 sm:px-4 lg:px-6 py-3 flex items-center justify-between gap-2.5 sm:gap-4">

          {/* Left */}
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0 min-w-0">

            {/* Hamburger — mobile only */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:hidden inline-flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-blue-200 hover:text-blue-700 hover:bg-blue-50"
              aria-label="Toggle sidebar"
            >
              <Menu size={18} />
              <span className="text-xs sm:text-sm font-semibold">Menu</span>
            </button>

            <Link to="/dashboard" className="flex items-center gap-2 min-w-0">
              <div className="h-8 w-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center overflow-hidden ring-1 ring-blue-100/80">
                <img src="/logo.png" alt="SiDoku" className="w-5 h-5 object-contain" />
              </div>
              <div className="hidden sm:block min-w-0 leading-tight">
                <p className="text-sm font-bold tracking-tight text-slate-900">SiDoku</p>
                <p className="text-[11px] text-slate-500">Identitas tim dan dashboard operasional</p>
              </div>
            </Link>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm justify-end min-w-0">
            <div className="relative flex-shrink-0 overflow-visible" ref={profileMenuRef}>
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-white px-2.5 py-2 shadow-sm hover:border-blue-200 hover:shadow-md transition"
              >
                <div className="h-9 w-9 rounded-full bg-[linear-gradient(135deg,_#1d4ed8,_#60a5fa)] flex items-center justify-center text-white shadow-inner shadow-blue-500/30 overflow-hidden">
                  {hasProfileImage ? (
                    <img
                      src={user?.profileImage}
                      alt={displayName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-black tracking-wide">{avatarInitials}</span>
                  )}
                </div>
                <div className="hidden lg:block text-left leading-tight min-w-0">
                  <p className="font-semibold text-slate-900 truncate">{displayName}</p>
                  <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                    <Store size={12} />
                    {user?.email || "Akun aktif"}
                  </p>
                </div>
                <ChevronDown size={15} className="text-slate-400 hidden sm:block" />
              </button>

              {/* Dropdown */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-3 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.12)] z-50 pointer-events-auto">
                  <div className="px-4 py-4 bg-gradient-to-br from-blue-50 to-white border-b border-slate-100">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">Akun Aktif</p>
                    <p className="mt-1 font-bold text-slate-900">{displayName}</p>
                    <p className="text-sm text-slate-500 flex items-center gap-1">
                      <Store size={13} />
                      {user?.email || "Akun aktif"}
                    </p>
                  </div>
                  <Link
                    to="/account"
                    className="flex items-center gap-3 px-4 py-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    <Settings size={16} className="text-blue-600" />
                    Edit Profil
                  </Link>
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full text-left px-4 py-3.5 hover:bg-red-50 text-sm font-semibold flex items-center gap-3 text-red-600 border-t border-slate-100"
                  >
                    <LogOut size={16} />
                    Keluar Akun
                  </button>
                </div>
              )}
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Body: sidebar + konten
          PENTING: tidak boleh ada overflow-hidden di sini,
          supaya sticky pada sidebar bisa bekerja dengan benar */}
      <div className="flex flex-1 w-full">

        {/* Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Konten utama — overflow-x-hidden hanya di sini, bukan di parent */}
        <main className="flex-1 min-w-0 w-full px-3 py-4 pb-24 sm:p-4 sm:pb-24 md:p-6 md:pb-28 overflow-x-clip">
          <div className="w-full space-y-4 sm:space-y-5">
            {children}
          </div>
        </main>
      </div>

      {/* Floating AI Button */}
      <Link
        to="/ai-assistant"
        className="fixed bottom-[calc(env(safe-area-inset-bottom)+5rem)] right-3 sm:bottom-6 sm:right-6 lg:bottom-8 lg:right-8 xl:bottom-10 xl:right-10 w-12 sm:w-14 h-12 sm:h-14 bg-[linear-gradient(135deg,_#1d4ed8,_#38bdf8)] text-white rounded-full flex items-center justify-center hover:brightness-105 transition shadow-[0_18px_36px_rgba(37,99,235,0.28)] z-30"
        aria-label="Open AI Assistant"
      >
        <MessageCircle size={24} />
      </Link>
    </div>
  );
}