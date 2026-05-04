import React from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

// Auth
import ProtectedRoute from './components/Auth/ProtectedRoute'

// Pages
import IntroPage from './pages/IntroPage'
import CaraPakaiPage from './pages/CaraPakaiPage'
import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProductsPage from './pages/ProductsPage'
import StockInPage from './pages/StockInPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLIC */}
        <Route path="/" element={<IntroPage />} />
        <Route path="/cara-pakai" element={<CaraPakaiPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* PROTECTED */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <ProductsPage />
            </ProtectedRoute>
          }
        />

        {/* ✅ TAMBAHAN STOK MASUK */}
        <Route
          path="/stock-in"
          element={
            <ProtectedRoute>
              <StockInPage />
            </ProtectedRoute>
          }
        />

        {/* REDIRECT */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App