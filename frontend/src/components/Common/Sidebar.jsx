import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const Sidebar = () => {
  const location = useLocation()

  const navItems = [
  { label: 'Beranda', path: '/dashboard', icon: '⌂' },
  { label: 'Daftar Barang', path: '/products', icon: '⌂' },
  { label: 'Stok Masuk', path: '/stock-in', icon: '↗' }, // ✅ FIX
  { label: 'Stok Keluar', path: '/stock-out', icon: '↘' },
  { label: 'Pengeluaran', path: '/expenses', icon: '$' },
  { label: 'Rekap Penjualan', path: '/reports', icon: '▥' },
]

  return (
    <aside className="w-64 border-r border-neutral-200 bg-white/95 shadow-sm min-h-screen">
      <nav className="sticky top-16 p-5">
        <div className="mb-4 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Menu</p>
        </div>
        <div className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition-colors ${
                location.pathname === item.path
                  ? 'border border-primary-100 bg-primary-50 text-primary-700 font-semibold shadow-sm'
                  : 'text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </aside>
  )
}

export default Sidebar
