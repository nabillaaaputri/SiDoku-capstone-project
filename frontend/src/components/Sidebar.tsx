import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  X,
  Home,
  Package,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const menuItems = [
  { label: "Beranda", href: "/dashboard", icon: Home },
  { label: "Daftar Barang", href: "/products", icon: Package },
  { label: "Stok Masuk", href: "/stok-masuk", icon: TrendingUp },
  { label: "Stok Keluar", href: "/stok-keluar", icon: TrendingDown },
  { label: "Pengeluaran", href: "/expenses", icon: DollarSign },
  { label: "Rekap Penjualan", href: "/rekap-penjualan", icon: BarChart3 },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const renderMenuItem = (
    item: (typeof menuItems)[number],
    isCompact: boolean,
    onClick?: () => void
  ) => {
    const IconComponent = item.icon;
    const isActive = location.pathname === item.href;

    return (
      <Link
        key={item.href}
        to={item.href}
        title={isCompact ? item.label : undefined}
        onClick={onClick}
        className={`group relative flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-all duration-200 ${isActive
            ? "bg-[linear-gradient(135deg,_rgba(29,78,216,0.12),_rgba(56,189,248,0.10))] text-blue-700 shadow-sm ring-1 ring-blue-100"
            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          } ${isCompact ? "justify-center" : ""}`}
      >
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-xl border transition ${isActive
              ? "border-blue-200 bg-white text-blue-600 shadow-sm"
              : "border-slate-200 bg-slate-50 text-slate-500 group-hover:border-slate-300 group-hover:bg-white"
            }`}
        >
          <IconComponent size={19} className="flex-shrink-0" />
        </span>

        {!isCompact && (
          <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
            <span className="text-sm font-semibold truncate">{item.label}</span>
            {isActive && <span className="h-2 w-2 rounded-full bg-blue-600" />}
          </div>
        )}
      </Link>
    );
  };

  return (
    <>
      {/* Desktop Sidebar - Collapsible (always visible on desktop) */}
      <aside
        className={`hidden md:flex md:flex-col flex-shrink-0 transition-all duration-300 border-r border-slate-200/80 bg-white/90 backdrop-blur-xl shadow-[8px_0_30px_rgba(15,23,42,0.04)] ${isCollapsed ? "w-16" : "w-56"
          }`}
      >
        <div className="border-b border-slate-200/80 px-4 py-4 flex items-center justify-between">
          {!isCollapsed && <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Menu</span>}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm hover:border-blue-200 hover:text-blue-700 transition ${isCollapsed ? 'mx-auto' : ''}`}
            aria-label="Toggle sidebar"
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Menu Items */}
        <nav className="p-2 space-y-1 flex-1 overflow-y-auto">
          {menuItems.map((item) => renderMenuItem(item, isCollapsed))}
        </nav>
      </aside>

      {/* Mobile Sidebar (Drawer) - only visible when isOpen is true */}
      {isOpen && (
        <div className="md:hidden fixed left-0 top-0 h-full w-[78vw] max-w-[288px] bg-white/95 backdrop-blur-xl border-r border-slate-200/80 z-40 flex flex-col shadow-[16px_0_40px_rgba(15,23,42,0.18)]">
          <div className="border-b border-slate-200/80 p-4">
            <div className="rounded-3xl bg-[linear-gradient(135deg,_rgba(29,78,216,0.08),_rgba(56,189,248,0.12))] p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-blue-700">SiDoku</p>
              <p className="mt-1 text-base font-semibold text-slate-900">Business dashboard</p>
              <p className="mt-0.5 text-xs text-slate-500">Menu navigasi cepat</p>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Navigasi</span>
              <button
                onClick={onClose}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm hover:border-blue-200 hover:text-blue-700"
                aria-label="Close sidebar"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="p-3 space-y-1.5 flex-1 overflow-y-auto">
            {menuItems.map((item) => renderMenuItem(item, false, onClose))}
          </nav>
        </div>
      )}
    </>
  );
}
