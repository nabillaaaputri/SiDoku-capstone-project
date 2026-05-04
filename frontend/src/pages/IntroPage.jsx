import React from 'react'
import Navbar from '../components/Navbar'
import Button from '../components/Button'

export default function IntroPage() {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <Navbar />

      <main>
        <section className="relative overflow-hidden bg-white py-8 sm:py-12 lg:py-16">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_center,rgba(20,184,166,0.10),transparent_34%),radial-gradient(circle_at_bottom_center,rgba(34,197,94,0.06),transparent_28%)]" />
          <div className="relative mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl text-center">
              <p className="inline-flex rounded-full border border-primary-200 bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-700 shadow-sm">
                Apa itu SiDoku
              </p>
              <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl">
                Atur usaha harian dengan lebih rapi, cepat, dan mudah dipahami.
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-neutral-600 sm:text-xl">
                SiDoku membantu UMKM mencatat stok, transaksi, dan ringkasan usaha dalam satu alur yang sederhana.
              </p>

              <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <Button to="/cara-pakai" className="min-w-44 shadow-md">
                  Mulai Sekarang
                </Button>
                <Button to="/login" variant="outline" className="min-w-52 shadow-sm">
                  Sudah punya akun? Login
                </Button>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {[
                  ['Stok', 'Pencatatan harian yang rapi'],
                  ['Rekap', 'Ringkasan hasil usaha cepat'],
                  ['AI Assistant', 'Bantuan saat dibutuhkan'],
                ].map(([title, description]) => (
                  <div key={title} className="rounded-2xl border border-neutral-200 bg-white p-4 text-left shadow-sm">
                    <div className="inline-flex rounded-xl bg-primary-50 px-3 py-2 text-sm font-semibold text-primary-700">
                      {title}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-neutral-600">{description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}