import React from 'react'
import { Link } from 'react-router-dom'
import Button from '../components/UI/Button'

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-neutral-900 mb-4">404</h1>
        <p className="text-xl text-neutral-600 mb-8">Halaman tidak ditemukan</p>
        <Link to="/">
          <Button variant="solid">Kembali ke Beranda</Button>
        </Link>
      </div>
    </div>
  )
}

export default NotFoundPage
