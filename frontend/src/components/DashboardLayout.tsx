import { ReactNode, useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { LogOut, Settings, Menu, MessageCircle, ChevronDown, Store } from "lucide-react";
import { authService } from "@/services/auth.service";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const profileMenuRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const displayName = "Nabilla";
  const storeName = "Toko Saya";

  // HANDLE LOGOUT
  const handleLogout = () => {
    authService.logout();
    navigate("/login");
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

    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.14),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.10),_transparent_26%),linear-gradient(180deg,_#f8fbff_0%,_#f5f8fc_48%,_#eef4fb_100%)] flex flex-col text-slate-900">
      
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl shadow-[0_8px_24px_rgba(15,23,42,0.035)] overflow-visible">
        <nav className="w-full px-3 sm:px-4 lg:px-6 py-3 flex items-center justify-between gap-3 sm:gap-4">

          {/* Left */}
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0 min-w-0">

            {/* Hamburger Menu */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:hidden inline-flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-blue-200 hover:text-blue-700 hover:bg-blue-50"
              aria-label="Toggle sidebar"
            >
              <Menu size={18} />
              <span className="text-xs sm:text-sm font-semibold">Menu</span>
            </button>

            <Link to="/dashboard" className="flex items-center gap-3 min-w-0">
              <div className="h-10 w-10 rounded-2xl bg-[linear-gradient(135deg,_#1d4ed8,_#38bdf8)] text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
                <span className="text-base font-black tracking-tight">S</span>
              </div>
              <div className="hidden sm:block min-w-0">
                <p className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 leading-none">SiDoku</p>
                <p className="text-xs text-slate-500 mt-1">Sistem Data Operasional dan Keuangan Usaha</p>
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
                <div className="h-9 w-9 rounded-full bg-[linear-gradient(135deg,_#1d4ed8,_#60a5fa)] flex items-center justify-center text-white shadow-inner shadow-blue-500/30">
                  <span className="text-sm font-black tracking-wide">NB</span>
                </div>
                <div className="hidden lg:block text-left leading-tight min-w-0">
                  <p className="font-semibold text-slate-900 truncate">{displayName}</p>
                  <p className="text-xs text-slate-500 truncate flex items-center gap-1"><Store size={12} />{storeName}</p>
                </div>
                <ChevronDown size={15} className="text-slate-400 hidden sm:block" />
              </button>

              {/* Dropdown */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-3 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.12)] z-50 pointer-events-auto">
                  <div className="px-4 py-4 bg-gradient-to-br from-blue-50 to-white border-b border-slate-100">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">Akun Aktif</p>
                    <p className="mt-1 font-bold text-slate-900">{displayName}</p>
                    <p className="text-sm text-slate-500 flex items-center gap-1"><Store size={13} /> {storeName}</p>
                  </div>

                  {/* Edit Profile */}
                  <Link
                    to="/account"
                    className="flex items-center gap-3 px-4 py-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    <Settings size={16} className="text-blue-600" />
                    Edit Profil
                  </Link>

                  {/* Logout */}
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

      {/* Main Content */}
      <div className="flex flex-1 w-full overflow-x-hidden">

        {/* Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Content */}
        <main className="flex-1 w-full px-3 py-4 sm:p-4 md:p-6 overflow-x-hidden">
          <div className="mx-auto w-full max-w-[1220px] space-y-4 sm:space-y-5">
            {children}
          </div>
        </main>
      </div>

      {/* Floating AI Button */}
      <Link
        to="/ai-assistant"
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-12 sm:w-14 h-12 sm:h-14 bg-[linear-gradient(135deg,_#1d4ed8,_#38bdf8)] text-white rounded-full flex items-center justify-center hover:brightness-105 transition shadow-[0_18px_36px_rgba(37,99,235,0.28)] z-30"
        aria-label="Open AI Assistant"
      >
        <MessageCircle size={24} />
      </Link>
    </div>
  );
}