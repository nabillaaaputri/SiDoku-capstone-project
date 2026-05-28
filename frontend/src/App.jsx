import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { TooltipProvider } from "@/ui/tooltip";
import { Toaster } from "@/ui/toaster";
import { Toaster as Sonner } from "@/ui/sonner";
import { BusinessProvider } from "@/context";
import { useAuth } from "@/context/AuthContext";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import StockIn from "./pages/StockIn";
import StockOut from "./pages/StockOut";
import Products from "./pages/Products";
import Reports from "./pages/Reports";
import SalesRecap from "./pages/SalesRecap";
import Assistant from "./pages/Assistant";
import Account from "./pages/Account";
import Expenses from "./pages/Expenses";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function LoadingGate() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.12),_transparent_32%),linear-gradient(180deg,_#f8fbff_0%,_#eef4fb_100%)] flex items-center justify-center px-4 text-slate-700">
      <div className="rounded-2xl border border-slate-200 bg-white/95 px-5 py-4 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
        <p className="text-sm font-semibold">Memeriksa sesi login...</p>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingGate />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

function PublicRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingGate />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default function App() {
  return (
    <BusinessProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/stok-masuk" element={<ProtectedRoute><StockIn /></ProtectedRoute>} />
              <Route path="/stok-keluar" element={<ProtectedRoute><StockOut /></ProtectedRoute>} />
              <Route path="/stock-in" element={<ProtectedRoute><Navigate to="/stok-masuk" replace /></ProtectedRoute>} />
              <Route path="/stock-out" element={<ProtectedRoute><Navigate to="/stok-keluar" replace /></ProtectedRoute>} />
              <Route path="/rekap-penjualan" element={<ProtectedRoute><SalesRecap /></ProtectedRoute>} />
              <Route path="/sales-recap" element={<ProtectedRoute><Navigate to="/rekap-penjualan" replace /></ProtectedRoute>} />
              <Route path="/expenses" element={<ProtectedRoute><Expenses /></ProtectedRoute>} />
              <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
              <Route path="/ai-assistant" element={<ProtectedRoute><Assistant /></ProtectedRoute>} />
              <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </BusinessProvider>
  );
}
