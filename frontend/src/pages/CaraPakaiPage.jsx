import React from 'react'
import Navbar from '../components/Navbar'
import Button from '../components/Button'
import Card from '../components/Card'

const steps = [
  {
    title: 'Isi stok pagi',
    description: 'Mulai hari dengan mencatat persediaan awal yang tersedia.',
  },
  {
    title: 'Catat uang keluar',
    description: 'Tambahkan biaya operasional agar arus kas lebih jelas.',
  },
  {
    title: 'Isi stok malam dan uang masuk',
    description: 'Rekam stok akhir dan pemasukan dari transaksi hari itu.',
  },
  {
    title: 'Cek ringkasan otomatis',
    description: 'Lihat hasil harian yang dirangkum secara rapi dan mudah dibaca.',
  },
]

const features = [
  {
    title: 'Dashboard',
    description: 'Ringkasan usaha yang langsung terlihat dari satu tampilan utama.',
  },
  {
    title: 'Stok',
    description: 'Pencatatan stok harian yang sederhana untuk kebutuhan operasional.',
  },
  {
    title: 'Rekap',
    description: 'Laporan pemasukan dan pengeluaran untuk memantau hasil usaha.',
  },
  {
    title: 'AI Assistant',
    description: 'Bantuan cepat untuk memahami data dan langkah berikutnya.',
  },
]

export default function CaraPakaiPage() {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <Navbar />

      <main>
        <section className="relative overflow-hidden bg-neutral-50 py-10 sm:py-12 lg:py-16">
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="inline-flex rounded-full border border-primary-200 bg-white px-4 py-2 text-sm font-semibold text-primary-700 shadow-sm">
                Page 2 - Guide & Features
              </p>
              <h1 className="mt-2 text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl">
                Cara Pakai SiDoku dalam 1 Menit
              </h1>
              <p className="mt-2 text-lg leading-8 text-neutral-600">
                Halaman ini merangkum langkah penggunaan, fitur utama, dan ajakan untuk mulai memakai SiDoku.
              </p>
            </div>

            <div id="cara-pakai" className="mt-10 grid gap-4 lg:grid-cols-2">
              {steps.map((step, index) => (
                <Card key={step.title} className="p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-600 text-lg font-bold text-white shadow-sm">
                      {index + 1}
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-neutral-900">
                        {step.title}{' '}
                        {index === 1 ? <span className="text-sm font-normal text-neutral-500">(Opsional)</span> : null}
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-neutral-600">{step.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div id="fitur" className="mt-14">
              <div className="max-w-3xl">
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent-600">
                  Fitur Utama
                </p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
                  Fitur inti untuk UMKM
                </h2>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {features.map((feature) => (
                  <Card key={feature.title} className="p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="mb-4 inline-flex rounded-xl bg-primary-50 px-3 py-2 text-sm font-semibold text-primary-700">
                      {feature.title}
                    </div>
                    <p className="text-sm leading-6 text-neutral-600">{feature.description}</p>
                  </Card>
                ))}
              </div>
            </div>

            <div className="mt-14 rounded-[28px] border border-primary-200 bg-primary-50 p-7 text-center shadow-sm sm:p-10">
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-primary-900 sm:text-4xl">
                Mulai kelola usaha sekarang
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-lg text-primary-700">
                Daftar dan mulai pakai alur pencatatan yang lebih rapi untuk usaha harian Anda.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Button to="/register" className="sm:min-w-56">
                  Lanjut Daftar
                </Button>
                <Button to="/login" variant="outline" className="sm:min-w-56">
                  Sudah punya akun? Login
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}