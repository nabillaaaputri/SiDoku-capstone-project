import { ReactNode } from "react";
import { Link } from "react-router-dom";

interface LayoutProps {
  children: ReactNode;
  showNav?: boolean;
  showSkip?: boolean;
  skipPath?: string;
}

export default function Layout({ children, showNav = true, showSkip = false, skipPath = "/dashboard" }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/60 via-slate-50 to-slate-100 flex flex-col">
      {showNav && (
        <header className="border-b border-slate-200 bg-white/90 backdrop-blur sticky top-0 z-50 shadow-[0_1px_0_0_rgba(148,163,184,0.12)]">
          <nav className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="text-xl font-extrabold text-blue-600 tracking-tight">
              SiDoku
            </Link>
            {showSkip && (
              <Link
                to={skipPath}
                className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium transition text-sm"
              >
                Lewati
              </Link>
            )}
          </nav>
        </header>
      )}
      <main className="flex-1">{children}</main>
    </div>
  );
}
