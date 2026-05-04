import React, { useMemo, useState } from 'react'
import DashboardLayout from '../components/Common/DashboardLayout'
import Card from '../components/UI/Card'
import Button from '../components/UI/Button'

const initialForm = {
  name: '',
  costPrice: '',
  salePrice: '',
  minimumStock: 10,
  unit: 'pcs',
  category: 'Barang',
  openingStock: 0,
}

const categoryOptions = ['Barang', 'Makanan', 'Minuman', 'Bahan Baku', 'Peralatan', 'Lainnya']
const unitOptions = ['pcs', 'kg', 'gram', 'ml', 'liter', 'botol', 'pack', 'dus']

const ProductsPage = () => {
  const [showForm, setShowForm] = useState(false)
  const [activeTab, setActiveTab] = useState('active')
  const [selectedCategory, setSelectedCategory] = useState('Semua Kategori')
  const [products, setProducts] = useState([])
  const [form, setForm] = useState(initialForm)

  const activeProducts = products.filter((product) => product.status === 'active')
  const archivedProducts = products.filter((product) => product.status === 'archived')

  const visibleProducts = useMemo(() => {
    const source = activeTab === 'active' ? activeProducts : archivedProducts

    if (selectedCategory === 'Semua Kategori') {
      return source
    }

    return source.filter((product) => product.category === selectedCategory)
  }, [activeTab, activeProducts, archivedProducts, selectedCategory])

  const handleFormChange = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!form.name.trim()) {
      return
    }

    const newProduct = {
      id: crypto.randomUUID(),
      name: form.name.trim(),
      costPrice: Number(form.costPrice || 0),
      salePrice: Number(form.salePrice || 0),
      minimumStock: Number(form.minimumStock || 0),
      unit: form.unit,
      category: form.category,
      openingStock: Number(form.openingStock || 0),
      status: 'active',
    }

    setProducts((current) => [newProduct, ...current])
    setForm(initialForm)
    setShowForm(false)
    setActiveTab('active')
    setSelectedCategory('Semua Kategori')
  }

  const updateStatus = (productId, status) => {
    setProducts((current) =>
      current.map((product) =>
        product.id === productId ? { ...product, status } : product
      )
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <section className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-[2.1rem]">Daftar Barang</h1>
              <p className="mt-2 text-sm text-neutral-600 sm:text-base">Kelola semua produk usaha Anda di sini.</p>
            </div>

            <Button
              className="w-fit min-w-[230px] shadow-sm"
              size="md"
              onClick={() => setShowForm((value) => !value)}
            >
              + Tambah Produk Baru
            </Button>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('active')}
              className={`rounded-xl px-5 py-3 text-sm font-semibold transition ${
                activeTab === 'active'
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              Produk Aktif ({activeProducts.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('archived')}
              className={`rounded-xl px-5 py-3 text-sm font-semibold transition ${
                activeTab === 'archived'
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              Produk Arsip ({archivedProducts.length})
            </button>
          </div>
        </section>

        <section className="space-y-6">
          {showForm && (
            <Card className="overflow-hidden p-0 shadow-sm">
              <div className="border-b border-neutral-200 px-6 py-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-neutral-900">Tambah Produk Baru</h2>
                    <p className="mt-1 text-sm text-neutral-500">Form input produk untuk menambah stok dan harga barang.</p>
                  </div>
                  <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">
                    Siap diisi
                  </span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 p-6">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-neutral-800">Nama Produk</label>
                  <input
                    type="text"
                    placeholder="Contoh: Minyak Kelapa 1L"
                    value={form.name}
                    onChange={(event) => handleFormChange('name', event.target.value)}
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-100"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-neutral-800">Harga Modal (Rp)</label>
                    <input
                      type="number"
                      value={form.costPrice}
                      onChange={(event) => handleFormChange('costPrice', event.target.value)}
                      className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-neutral-900 outline-none transition focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-100"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-neutral-800">Harga Jual (Rp)</label>
                    <input
                      type="number"
                      value={form.salePrice}
                      onChange={(event) => handleFormChange('salePrice', event.target.value)}
                      className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-neutral-900 outline-none transition focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-100"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-neutral-800">Stok Minimum</label>
                    <input
                      type="number"
                      value={form.minimumStock}
                      onChange={(event) => handleFormChange('minimumStock', event.target.value)}
                      className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-neutral-900 outline-none transition focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-100"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-neutral-800">Satuan</label>
                    <select
                      value={form.unit}
                      onChange={(event) => handleFormChange('unit', event.target.value)}
                      className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-neutral-900 outline-none transition focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-100"
                    >
                      {unitOptions.map((unit) => (
                        <option key={unit}>{unit}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-neutral-800">Kategori</label>
                    <select
                      value={form.category}
                      onChange={(event) => handleFormChange('category', event.target.value)}
                      className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-neutral-900 outline-none transition focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-100"
                    >
                      {categoryOptions.map((category) => (
                        <option key={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-neutral-800">Stok Awal (Opsional)</label>
                    <input
                      type="number"
                      value={form.openingStock}
                      onChange={(event) => handleFormChange('openingStock', event.target.value)}
                      className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-neutral-900 outline-none transition focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-100"
                    />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Button type="submit" className="w-full">Tambah Produk</Button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="w-full rounded-lg border border-neutral-300 bg-neutral-100 px-4 py-3 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-200"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </Card>
          )}

          <Card className="shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-neutral-900">Daftar Barang ({visibleProducts.length})</h2>
                <p className="mt-1 text-sm text-neutral-500">
                  {activeTab === 'active'
                    ? 'Belum ada produk yang aktif ditampilkan.'
                    : 'Belum ada produk yang diarsipkan.'}
                </p>
              </div>

              <select
                value={selectedCategory}
                onChange={(event) => setSelectedCategory(event.target.value)}
                className="rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              >
                <option>Semua Kategori</option>
                {categoryOptions.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </div>

            <div className="mt-6 space-y-3">
              {visibleProducts.length > 0 ? (
                visibleProducts.map((product) => (
                  <div key={product.id} className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-base font-semibold text-neutral-900">{product.name}</p>
                          <span className="rounded-full bg-primary-50 px-2.5 py-1 text-[11px] font-semibold text-primary-700">
                            {product.category}
                          </span>
                          <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-semibold text-neutral-600">
                            {product.unit}
                          </span>
                        </div>
                        <p className="text-sm text-neutral-600">
                          Modal {product.costPrice.toLocaleString('id-ID')} · Jual {product.salePrice.toLocaleString('id-ID')} · Stok minimum {product.minimumStock}
                        </p>
                        <p className="text-xs text-neutral-500">Stok awal: {product.openingStock}</p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {product.status === 'active' ? (
                          <button
                            type="button"
                            onClick={() => updateStatus(product.id, 'archived')}
                            className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-100"
                          >
                            Arsipkan
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => updateStatus(product.id, 'active')}
                            className="rounded-lg border border-primary-500 bg-white px-4 py-2 text-sm font-semibold text-primary-700 transition hover:bg-primary-50"
                          >
                            Aktifkan
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-6 py-10 text-center">
                  <p className="text-sm font-semibold text-neutral-700">Daftar barang masih kosong</p>
                  <p className="mt-1 text-sm text-neutral-500">Tambahkan produk baru untuk mulai mengelola stok usaha.</p>
                </div>
              )}
            </div>
          </Card>
        </section>
      </div>
    </DashboardLayout>
  )
}

export default ProductsPage
