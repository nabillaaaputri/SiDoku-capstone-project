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

  return (
    <>
      {/* Desktop Sidebar - Collapsible (always visible on desktop) */}
      <aside
        className={`hidden md:flex md:flex-col bg-white border-r border-slate-200 flex-shrink-0 transition-all duration-300 ${
          isCollapsed ? "w-20" : "w-56"
        }`}
      >
        {/* Collapse Toggle Button */}
        <div className="border-b border-slate-200 p-3 flex items-center justify-between">
          {!isCollapsed && <span className="font-semibold text-sm text-slate-700">Menu</span>}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 hover:bg-slate-100 rounded-lg transition ml-auto text-slate-600"
            aria-label="Toggle sidebar"
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Menu Items */}
        <nav className="p-2 space-y-1 flex-1 overflow-y-auto">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                title={isCollapsed ? item.label : undefined}
                className={`flex items-center gap-3 px-3 py-2 rounded transition whitespace-nowrap ${
                  isActive
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <IconComponent size={20} className="flex-shrink-0" />
                {!isCollapsed && <span className="text-sm">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Sidebar (Drawer) - only visible when isOpen is true */}
      {isOpen && (
        <div className="md:hidden fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200 z-40 flex flex-col shadow-xl">
          {/* Close Button */}
          <div className="border-b border-slate-200 p-4 flex items-center justify-between">
            <span className="font-semibold text-lg text-slate-800">Menu</span>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition text-slate-600"
              aria-label="Close sidebar"
            >
              <X size={20} />
            </button>
          </div>

          {/* Menu Items */}
          <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-3 rounded transition ${
                    isActive
                      ? "bg-blue-50 text-blue-700 font-semibold"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <IconComponent size={20} className="flex-shrink-0" />
                  <span className="text-sm">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </>
  );
}
