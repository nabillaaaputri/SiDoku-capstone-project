import { ReactNode } from "react";
import { Link } from "react-router-dom";
import logoImage from "/logo.png";

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
            <Link to="/" className="flex items-center gap-2 min-w-0">
              <div className="h-9 w-9 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center overflow-hidden ring-1 ring-blue-100/80 shrink-0">
                <img src={logoImage} alt="SiDoku" className="h-5 w-5 object-contain" />
              </div>
              <div className="min-w-0 leading-tight">
                <p className="text-base font-extrabold tracking-tight text-slate-900">SiDoku</p>
                <p className="text-[11px] text-slate-500">Sistem Data Operasional dan Keuangan Usaha</p>
              </div>
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
