import { ReactNode, useState } from "react";
import Sidebar from "./Sidebar";
import { Menu } from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
}

/**
 * DashboardLayout Component
 * Wraps dashboard pages with sidebar navigation
 * Handles mobile sidebar toggle
 */
export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Desktop and Mobile Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header with Menu Button */}
        <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-slate-600 hover:text-slate-900 transition"
            aria-label="Toggle sidebar"
          >
            <Menu size={24} />
          </button>
          <span className="ml-3 font-semibold text-slate-900">SiDoku</span>
        </div>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-3 sm:p-4 md:p-6 max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
