import Layout from "@/components/layout/Layout";
import { Link } from "react-router-dom";
import { Button } from "@/ui/button";
import { ArrowRight, Sparkles, Wallet, Box, BarChart3, Bot } from "lucide-react";

export default function Introduction() {
  return (
    <Layout showSkip={false}>
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(125,211,252,0.25),transparent_42%),radial-gradient(circle_at_80%_10%,rgba(34,197,94,0.2),transparent_38%)]" />
        <div className="relative max-w-5xl mx-auto px-4 py-10 md:py-14 min-h-[calc(100vh-80px)]">
          <div className="space-y-8 md:space-y-10">
            <section className="rounded-2xl border border-slate-200 bg-white/90 backdrop-blur px-5 py-7 md:px-8 md:py-9 shadow-[0_10px_40px_-30px_rgba(15,23,42,0.65)]">
              <div className="flex items-center justify-center gap-2 text-emerald-700 mb-3">
                <Sparkles className="w-4 h-4" />
                <p className="text-xs md:text-sm font-semibold tracking-wide uppercase">Panduan Kilat</p>
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold leading-tight text-center text-slate-900">
                Cara Pakai SiDoku dalam 1 Menit
              </h1>
              <p className="text-center text-slate-600 mt-3 md:mt-4 text-sm md:text-base">
                Ikuti 4 langkah sederhana untuk mencatat operasional harian dan melihat ringkasan bisnis secara otomatis.
              </p>
            </section>

            <section className="space-y-4 md:space-y-5">
              <div className="grid gap-4 md:gap-5">
                <div className="relative flex gap-4 md:gap-5">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-11 h-11 md:w-12 md:h-12 rounded-xl bg-slate-900 text-white font-bold text-lg">1</div>
                  </div>
                  <div className="flex-1 rounded-2xl border border-slate-200 bg-white p-4 md:p-5 shadow-sm">
                    <h3 className="font-bold text-base md:text-lg text-slate-900 mb-1">Isi Stok Pagi</h3>
                    <p className="text-sm text-slate-600">Catat berapa stok barang di awal hari.</p>
                  </div>
                </div>

                <div className="relative flex gap-4 md:gap-5">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-11 h-11 md:w-12 md:h-12 rounded-xl bg-slate-900 text-white font-bold text-lg">2</div>
                  </div>
                  <div className="flex-1 rounded-2xl border border-slate-200 bg-white p-4 md:p-5 shadow-sm">
                    <h3 className="font-bold text-base md:text-lg text-slate-900 mb-1">
                      Catat Uang Keluar <span className="text-xs text-slate-500">(Opsional)</span>
                    </h3>
                    <p className="text-sm text-slate-600">Input biaya-biaya yang Anda keluarkan.</p>
                  </div>
                </div>

                <div className="relative flex gap-4 md:gap-5">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-11 h-11 md:w-12 md:h-12 rounded-xl bg-slate-900 text-white font-bold text-lg">3</div>
                  </div>
                  <div className="flex-1 rounded-2xl border border-slate-200 bg-white p-4 md:p-5 shadow-sm">
                    <h3 className="font-bold text-base md:text-lg text-slate-900 mb-1">Isi Stok Malam + Uang Masuk</h3>
                    <p className="text-sm text-slate-600">Catat stok akhir hari dan total penjualan.</p>
                  </div>
                </div>

                <div className="relative flex gap-4 md:gap-5">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-11 h-11 md:w-12 md:h-12 rounded-xl bg-slate-900 text-white font-bold text-lg">4</div>
                  </div>
                  <div className="flex-1 rounded-2xl border border-slate-200 bg-white p-4 md:p-5 shadow-sm">
                    <h3 className="font-bold text-base md:text-lg text-slate-900 mb-1">Cek Ringkasan Otomatis</h3>
                    <p className="text-sm text-slate-600">Lihat laporan harian dan keuntungan Anda.</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 md:p-7 shadow-[0_18px_40px_-35px_rgba(15,23,42,0.7)]">
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-5 md:mb-6">Fitur Utama SiDoku</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-sky-50 to-white p-4 md:p-5">
                  <div className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-sky-100 text-sky-700 mb-3">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-base md:text-lg mb-1 text-slate-900">Dashboard Ringkas</h3>
                  <p className="text-sm text-slate-600">Lihat ringkasan bisnis dalam satu tampilan.</p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-emerald-50 to-white p-4 md:p-5">
                  <div className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 mb-3">
                    <Box className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-base md:text-lg mb-1 text-slate-900">Manajemen Stok</h3>
                  <p className="text-sm text-slate-600">Kelola stok barang dengan mudah dan cepat.</p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-4 md:p-5">
                  <div className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-amber-100 text-amber-700 mb-3">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-base md:text-lg mb-1 text-slate-900">Rekap Penjualan</h3>
                  <p className="text-sm text-slate-600">Pantau penjualan dan keuntungan harian Anda.</p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-violet-50 to-white p-4 md:p-5">
                  <div className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-violet-100 text-violet-700 mb-3">
                    <Bot className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-base md:text-lg mb-1 text-slate-900">Asisten AI</h3>
                  <p className="text-sm text-slate-600">Dapatkan bantuan kapan saja Anda membutuhkan.</p>
                </div>
              </div>
            </section>

            <section className="flex flex-col md:flex-row gap-3 md:gap-4 pt-1">
              <Link to="/register" className="w-full">
                <Button className="w-full bg-slate-900 text-white px-6 py-3.5 md:py-4 font-bold hover:bg-slate-800 rounded-xl text-base inline-flex items-center gap-2">
                  Lanjut Daftar <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/login" className="w-full">
                <Button variant="outline" className="w-full border-slate-300 text-slate-700 px-6 py-3.5 md:py-4 font-bold hover:border-slate-500 hover:bg-slate-50 rounded-xl text-base">
                  Sudah Punya Akun? Login
                </Button>
              </Link>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
}
