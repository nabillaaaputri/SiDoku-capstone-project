import React from 'react'
import { Link } from 'react-router-dom'

export default function Sidebar({ open, onClose }) {
  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-neutral-950/40 transition-opacity lg:hidden ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`fixed right-0 top-0 z-50 h-full w-[84vw] max-w-sm border-l border-neutral-200 bg-white p-6 shadow-2xl transition-transform lg:hidden ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between">
          <Link to="/" className="text-lg font-semibold text-neutral-900" onClick={onClose}>
            SiDoku
          </Link>
          <button type="button" className="text-2xl leading-none text-neutral-500" onClick={onClose} aria-label="Tutup menu">
            ×
          </button>
        </div>

        <nav className="mt-8 space-y-2 text-sm font-medium text-neutral-700">
          <Link to="/cara-pakai#fitur" className="block rounded-lg px-4 py-2 hover:bg-neutral-100 transition" onClick={onClose}>
            Fitur
          </Link>
          <Link to="/cara-pakai#cara-pakai" className="block rounded-lg px-4 py-2 hover:bg-neutral-100 transition" onClick={onClose}>
            Cara Pakai
          </Link>
          <Link to="/register" className="block rounded-lg px-4 py-2 hover:bg-neutral-100 transition" onClick={onClose}>
            Daftar
          </Link>
        </nav>

        <div className="mt-8 grid gap-3">
          <Link to="/register" className="rounded-lg bg-primary-600 px-5 py-2.5 text-center text-sm font-semibold text-white hover:bg-primary-700 transition" onClick={onClose}>
            Mulai Sekarang
          </Link>
          <Link to="/login" className="rounded-lg border border-neutral-300 px-5 py-2.5 text-center text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition" onClick={onClose}>
            Login
          </Link>
        </div>
      </aside>
    </>
  )
}