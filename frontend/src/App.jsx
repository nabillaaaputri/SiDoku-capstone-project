import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { TooltipProvider } from "@/ui/tooltip";
import { Toaster } from "@/ui/toaster";
import { Toaster as Sonner } from "@/ui/sonner";
import { BusinessProvider } from "@/context";
import Landing from "./pages/Landing";
import Introduction from "./pages/Introduction";
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
              <Route path="/intro" element={<Introduction />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/stok-masuk" element={<StockIn />} />
              <Route path="/stok-keluar" element={<StockOut />} />
              <Route path="/stock-in" element={<StockIn />} />
              <Route path="/stock-out" element={<StockOut />} />
              <Route path="/rekap-penjualan" element={<SalesRecap />} />
              <Route path="/sales-recap" element={<SalesRecap />} />
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
