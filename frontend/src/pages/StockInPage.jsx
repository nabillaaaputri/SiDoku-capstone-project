import React, { useState } from 'react'
import DashboardLayout from '../components/Common/DashboardLayout'
import Card from '../components/UI/Card'
import Button from '../components/UI/Button'

const StockInPage = () => {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    product: '',
    quantity: 0,
    date: new Date().toISOString().split('T')[0],
    note: '',
  })

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log(form)
    setShowForm(false)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* HEADER */}
        <section className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">
                Stok Masuk
              </h1>
              <p className="text-neutral-600">
                Catat stok masuk dari supplier di sini
              </p>
            </div>

            <Button onClick={() => setShowForm(!showForm)}>
              ↗ Catat Stok Masuk
            </Button>
          </div>
        </section>

        {/* FORM */}
        {showForm && (
          <Card className="border-2 border-green-400 bg-green-50">
            <h2 className="text-lg font-semibold text-green-800 mb-4">
              Catat Stok Masuk
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">

              <div>
                <label className="text-sm font-semibold">
                  Produk *
                </label>
                <input
                  placeholder="Cari produk..."
                  value={form.product}
                  onChange={(e) => handleChange('product', e.target.value)}
                  className="w-full mt-1 rounded-lg border px-4 py-3"
                />
              </div>

              <div>
                <label className="text-sm font-semibold">
                  Jumlah Masuk *
                </label>
                <input
                  type="number"
                  value={form.quantity}
                  onChange={(e) => handleChange('quantity', e.target.value)}
                  className="w-full mt-1 rounded-lg border px-4 py-3"
                />
              </div>

              <div>
                <label className="text-sm font-semibold">
                  Tanggal *
                </label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  className="w-full mt-1 rounded-lg border px-4 py-3"
                />
              </div>

              <div>
                <label className="text-sm font-semibold">
                  Catatan (Opsional)
                </label>
                <textarea
                  placeholder="Contoh: Pengiriman dari supplier..."
                  value={form.note}
                  onChange={(e) => handleChange('note', e.target.value)}
                  className="w-full mt-1 rounded-lg border px-4 py-3"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button type="submit">Simpan</Button>

                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="border rounded-lg"
                >
                  Batal
                </button>
              </div>

            </form>
          </Card>
        )}

        {/* SUMMARY */}
        <Card className="border border-green-300 bg-green-50">
          <p className="text-green-700">
            Total Stok Masuk: <span className="font-semibold">0 unit</span>
          </p>
        </Card>

        {/* RIWAYAT */}
        <section>
          <h2 className="text-lg font-semibold text-neutral-900">
            Riwayat Harian Stok Masuk
          </h2>
          <p className="text-sm text-neutral-500">
            Daftar stok masuk hari ini (terbaru di atas)
          </p>

          <div className="mt-4">
            <select className="border rounded-lg px-3 py-2">
              <option>Semua Produk</option>
            </select>
          </div>

          <div className="mt-4 border rounded-lg py-10 text-center text-neutral-500">
            Belum ada riwayat stok harian.
          </div>
        </section>

      </div>
    </DashboardLayout>
  )
}

export default StockInPage