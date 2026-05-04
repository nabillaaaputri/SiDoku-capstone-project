import React from 'react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const Header = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-50 text-primary-700 shadow-sm">
            S
          </div>
          <div className="leading-tight">
            <h1 className="text-lg font-bold tracking-tight text-neutral-900">SiDoku</h1>
            <p className="text-xs text-neutral-500">Dashboard usaha</p>
          </div>
        </div>

        {user && (
          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((value) => !value)}
              className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-neutral-700 bg-white text-sm font-semibold text-primary-700 shadow-sm transition hover:bg-neutral-50"
              aria-label="Profil"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
            >
              {user.name?.[0] || 'U'}
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-14 w-56 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-[0_16px_30px_rgba(15,23,42,0.12)]">
                <div className="border-b border-neutral-100 px-4 py-3">
                  <p className="text-sm font-semibold text-neutral-900">{user.name}</p>
                  <p className="text-xs text-neutral-500">{user.business_name || 'SiDoku'}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  <span className="text-base text-neutral-500">⚙</span>
                  Edit Profil
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 border-t border-neutral-100 px-4 py-3 text-left text-sm font-semibold text-red-500 hover:bg-red-50"
                >
                  <span className="text-base">⎋</span>
                  Keluar Akun
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
