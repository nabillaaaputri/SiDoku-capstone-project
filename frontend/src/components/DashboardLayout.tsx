import { ReactNode, useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { LogOut, Settings, Menu, MessageCircle } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-b from-blue-50/70 via-slate-50 to-slate-100 flex flex-col">
      
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur sticky top-0 z-50 overflow-visible shadow-[0_1px_0_0_rgba(148,163,184,0.12)]">
        <nav className="w-full px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between gap-2 sm:gap-4">

          {/* Left */}
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">

            {/* Hamburger Menu */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:hidden flex items-center gap-1 px-2 sm:px-3 py-2 border border-slate-300 bg-white hover:bg-slate-100 rounded-lg transition font-semibold text-slate-700"
              aria-label="Toggle sidebar"
            >
              <Menu size={18} />
              <span className="text-xs sm:text-sm">Menu</span>
            </button>

            {/* Logo */}
            <Link
              to="/dashboard"
              className="text-lg sm:text-xl font-extrabold text-blue-600 whitespace-nowrap tracking-tight"
            >
              SiDoku
            </Link>
          </div>

          {/* Right */}
          <div className="flex gap-1 sm:gap-2 text-xs sm:text-sm items-center flex-wrap justify-end">

            {/* Profile Menu */}
            <div
              className="relative flex-shrink-0 overflow-visible"
              ref={profileMenuRef}
            >
              <button
                onClick={() =>
                  setIsProfileMenuOpen(!isProfileMenuOpen)
                }
                className="w-8 sm:w-10 h-8 sm:h-10 border border-slate-300 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition font-bold text-sm sm:text-lg flex-shrink-0"
              >
                👤
              </button>

              {/* Dropdown */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 border border-slate-200 bg-white rounded-xl shadow-lg z-50 pointer-events-auto overflow-hidden">

                  {/* Edit Profile */}
                  <Link
                    to="/account"
                    className="block px-4 py-3 border-b border-slate-200 hover:bg-slate-100 text-sm font-semibold text-slate-700 flex items-center gap-2"
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    <Settings size={16} />
                    Edit Profil
                  </Link>

                  {/* Logout */}
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-slate-100 text-sm font-semibold flex items-center gap-2 text-red-600"
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
          <div className="mx-auto w-full max-w-[1180px] space-y-4">
            {children}
          </div>
        </main>
      </div>

      {/* Floating AI Button */}
      <Link
        to="/ai-assistant"
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-12 sm:w-14 h-12 sm:h-14 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition shadow-lg z-30"
        aria-label="Open AI Assistant"
      >
        <MessageCircle size={24} />
      </Link>
    </div>
  );
}