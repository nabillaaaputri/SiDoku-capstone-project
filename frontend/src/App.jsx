import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { TooltipProvider } from "@/ui/tooltip";
import { Toaster } from "@/ui/toaster";
import { Toaster as Sonner } from "@/ui/sonner";
import { BusinessProvider } from "@/context";
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
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/stok-masuk" element={<StockIn />} />
              <Route path="/stok-keluar" element={<StockOut />} />
              <Route path="/stock-in" element={<Navigate to="/stok-masuk" replace />} />
              <Route path="/stock-out" element={<Navigate to="/stok-keluar" replace />} />
              <Route path="/rekap-penjualan" element={<SalesRecap />} />
              <Route path="/sales-recap" element={<Navigate to="/rekap-penjualan" replace />} />
              <Route path="/expenses" element={<Expenses />} />
              <Route path="/products" element={<Products />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/ai-assistant" element={<Assistant />} />
              <Route path="/account" element={<Account />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </BusinessProvider>
  );
}
