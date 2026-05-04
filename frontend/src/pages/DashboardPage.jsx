import React from 'react'
import DashboardLayout from '../components/Common/DashboardLayout'
import Card from '../components/UI/Card'
import { formatCurrency, formatPercentage } from '../utils/formatters'

const demoSummary = {
  totalIncome: 2400000,
  totalExpense: 840000,
  profit: 1560000,
  revenue: 2400000,
  lowStockItems: [
    { id: 1, name: 'Gula', currentStock: 5 },
    { id: 2, name: 'Susu', currentStock: 3 },
    { id: 3, name: 'Kertas Struk', currentStock: 8 },
  ],
}

const demoTrends = [
  { label: 'Senin', income: 2400, expense: 760 },
  { label: 'Selasa', income: 2620, expense: 680 },
  { label: 'Rabu', income: 1980, expense: 720 },
  { label: 'Kamis', income: 2740, expense: 840 },
  { label: 'Jumat', income: 2280, expense: 760 },
  { label: 'Sabtu', income: 3160, expense: 920 },
  { label: 'Minggu', income: 2480, expense: 820 },
]

const insightItems = [
  {
    title: 'Penjualan Stabil',
    detail: 'Penjualan bulan ini sama seperti bulan lalu. Pertahankan konsistensinya!',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    iconBg: 'bg-blue-500/10 text-blue-600',
    icon: 'ℹ',
  },
  {
    title: 'Biaya Terkontrol',
    detail: 'Biaya operasional bulan ini lebih hemat dari bulan lalu. Bagus!',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    iconBg: 'bg-emerald-500/10 text-emerald-600',
    icon: '↗',
  },
  {
    title: 'Apa yang bisa kamu lakukan?',
    detail: 'Mulai input data penjualan dan pengeluaran untuk melihat saran untuk kamu.',
    bg: 'bg-amber-50',
    border: 'border-amber-100',
    iconBg: 'bg-amber-500/10 text-amber-700',
    icon: '•',
  },
]

const compactCurrency = (value) => {
  const juta = value / 1000000
  return `${juta.toFixed(1).replace('.', ',')}jt`
}

const DashboardPage = () => {
  const totalIncome = demoSummary.totalIncome
  const totalExpense = demoSummary.totalExpense
  const totalNet = demoSummary.profit
  const roi = `${formatPercentage(totalNet / demoSummary.revenue)}`
  const lowStockItems = demoSummary.lowStockItems
  const chartWidth = 620
  const chartHeight = 250
  const yMax = 3400

  const incomePath = demoTrends
    .map((item, index) => {
      const x = index * (chartWidth / (demoTrends.length - 1))
      const y = chartHeight - (item.income / yMax) * chartHeight
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
    })
    .join(' ')

  const expensePath = demoTrends
    .map((item, index) => {
      const x = index * (chartWidth / (demoTrends.length - 1))
      const y = chartHeight - (item.expense / yMax) * chartHeight
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
    })
    .join(' ')

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <section className="flex flex-col gap-5 border-b border-neutral-200 pb-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-[2.1rem]">
                Ringkasan Usaha Hari Ini
              </h1>
              <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                Data Contoh
              </span>
            </div>
            <p className="mt-2 text-sm text-neutral-600 sm:text-base">
              Lihat kondisi toko kamu dalam sekali lihat.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 self-start pt-1">
            <button className="rounded-md border border-primary-500 bg-white px-4 py-2 text-sm font-semibold text-primary-600 transition hover:bg-primary-50">
              ↑ Restock
            </button>
            <button className="rounded-md border border-violet-500 bg-white px-4 py-2 text-sm font-semibold text-violet-600 transition hover:bg-violet-50">
              ↓ Stok Keluar
            </button>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-neutral-900">Ringkasan Keuangan</h2>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <div className="border-l-4 border-emerald-500 pl-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-500">Uang Masuk</p>
              <p className="mt-2 text-2xl font-bold text-emerald-500">{formatCurrency(totalIncome)}</p>
              <p className="mt-1 text-xs text-neutral-500">dari penjualan</p>
            </div>

            <div className="border-l-4 border-orange-500 pl-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-500">Uang Keluar</p>
              <p className="mt-2 text-2xl font-bold text-orange-500">{formatCurrency(totalExpense)}</p>
              <p className="mt-1 text-xs text-neutral-500">biaya operasional</p>
            </div>

            <div className="border-l-4 border-blue-500 pl-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-500">Keuntungan</p>
              <p className="mt-2 text-2xl font-bold text-blue-600">{formatCurrency(totalNet)}</p>
              <p className="mt-1 text-xs text-neutral-500">uang masuk - keluar</p>
            </div>

            <div className="border-l-4 border-violet-500 pl-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-500">ROI</p>
              <p className="mt-2 text-2xl font-bold text-violet-600">{roi}</p>
              <p className="mt-1 text-xs text-neutral-500">return on investment</p>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-neutral-900">Insight Singkat</h2>
          <div className="space-y-3">
            {insightItems.map((item) => (
              <div key={item.title} className={`rounded-sm border ${item.border} ${item.bg} px-4 py-3`}>
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 flex h-7 w-7 items-center justify-center rounded-md ${item.iconBg} text-sm font-semibold`}>
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-900">{item.title}</p>
                    <p className="mt-1 text-xs text-neutral-600">{item.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-neutral-900">Produk Hampir Habis ({lowStockItems.length})</h2>
          <div className="rounded-sm border border-neutral-200 bg-white px-4 py-3">
            {lowStockItems.length > 0 ? (
              <div className="space-y-3">
                {lowStockItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-sm border border-neutral-200 bg-neutral-50 px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">{item.name}</p>
                      <p className="text-xs text-neutral-500">Sisa stok</p>
                    </div>
                    <div className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-orange-600 shadow-sm">
                      {item.currentStock} unit
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-5 text-center text-sm text-neutral-500">Tidak ada produk yang menipis.</div>
            )}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-neutral-900">Tren 7 Hari Terakhir</h2>
          <div className="border-2 border-neutral-900 bg-white">
            <div className="border-b border-neutral-900 px-5 py-4">
              <div className="flex items-center gap-3 text-sm font-semibold text-neutral-900">
                <span className="flex h-7 w-7 items-center justify-center rounded-sm bg-emerald-50 text-emerald-600">📊</span>
                <span>Tren 7 Hari</span>
              </div>
              <div className="mt-4 flex items-center gap-4 text-xs font-semibold text-neutral-800">
                <div className="flex items-center gap-2"><span className="h-1.5 w-3 rounded-full bg-emerald-500" /> Uang Masuk</div>
                <div className="flex items-center gap-2"><span className="h-1.5 w-3 rounded-full bg-orange-500" /> Uang Keluar</div>
              </div>
            </div>

            <div className="px-5 py-5">
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="h-[280px] w-full overflow-visible">
                <defs>
                  <linearGradient id="incomeGlow" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="expenseGlow" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {[0, 800, 1600, 2400, 3200].map((value) => {
                  const y = chartHeight - (value / yMax) * chartHeight
                  return (
                    <g key={value}>
                      <line x1="0" x2={chartWidth} y1={y} y2={y} stroke="#e5e7eb" strokeDasharray={value === 0 ? '0' : '5 5'} />
                      <text x="0" y={y - 6} fontSize="11" fill="#111827" fontWeight="600">
                        Rp {value.toLocaleString('id-ID')}
                      </text>
                    </g>
                  )
                })}

                <path d={incomePath} fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <path d={`${incomePath} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`} fill="url(#incomeGlow)" opacity="0.4" />
                <path d={expensePath} fill="none" stroke="#f97316" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <path d={`${expensePath} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`} fill="url(#expenseGlow)" opacity="0.28" />

                {demoTrends.map((item, index) => {
                  const x = index * (chartWidth / (demoTrends.length - 1))
                  const incomeY = chartHeight - (item.income / yMax) * chartHeight
                  const expenseY = chartHeight - (item.expense / yMax) * chartHeight

                  return (
                    <g key={item.label}>
                      <circle cx={x} cy={incomeY} r="4.5" fill="#16a34a" stroke="#fff" strokeWidth="2" />
                      <circle cx={x} cy={expenseY} r="4.5" fill="#f97316" stroke="#fff" strokeWidth="2" />
                      <text x={x} y={chartHeight + 18} textAnchor="middle" fontSize="11" fill="#111827" fontWeight="600">
                        {item.label}
                      </text>
                    </g>
                  )
                })}
              </svg>
            </div>

            <div className="grid grid-cols-2 gap-2 border-t border-neutral-300 p-4">
              <div className="rounded-sm border border-emerald-500 bg-emerald-50 px-4 py-4 text-center">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">Total Masuk</div>
                <div className="mt-1 text-sm font-bold text-emerald-600">{compactCurrency(15980000)}</div>
              </div>
              <div className="rounded-sm border border-orange-500 bg-orange-50 px-4 py-4 text-center">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">Total Keluar</div>
                <div className="mt-1 text-sm font-bold text-orange-600">5rb</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  )
}

export default DashboardPage
