import Layout from "@/components/layout/Layout";
import { Link } from "react-router-dom";
import { Button } from "@/ui/button";

export default function Welcome() {
  return (
    <Layout showSkip={false}>
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12 min-h-[calc(100vh-80px)] flex flex-col justify-center">
        <div className="space-y-6 md:space-y-8">
          {/* Hero Section */}
          <section className="space-y-4 text-center">
            <h1 className="text-3xl md:text-4xl font-bold leading-tight">
              Cara Pakai SiDoku dalam 1 Menit
            </h1>
          </section>

          {/* Steps Section */}
          <section className="space-y-4 md:space-y-6">
            <div className="space-y-4 md:space-y-6">
              {/* Step 1 */}
              <div className="flex gap-4 md:gap-6">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full bg-black text-white font-bold text-xl md:text-2xl">
                    1
                  </div>
                </div>
                <div className="flex-1 border-2 border-gray-300 bg-white p-4 md:p-6 rounded-lg">
                  <h3 className="font-bold text-base md:text-lg mb-2">Isi Stok Pagi</h3>
                  <p className="text-sm text-gray-700">Catat berapa stok barang di awal hari.</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4 md:gap-6">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full bg-black text-white font-bold text-xl md:text-2xl">
                    2
                  </div>
                </div>
                <div className="flex-1 border-2 border-gray-300 bg-white p-4 md:p-6 rounded-lg">
                  <h3 className="font-bold text-base md:text-lg mb-2">Catat Uang Keluar <span className="text-xs text-gray-500">(Opsional)</span></h3>
                  <p className="text-sm text-gray-700">Input biaya-biaya yang Anda keluarkan.</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4 md:gap-6">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full bg-black text-white font-bold text-xl md:text-2xl">
                    3
                  </div>
                </div>
                <div className="flex-1 border-2 border-gray-300 bg-white p-4 md:p-6 rounded-lg">
                  <h3 className="font-bold text-base md:text-lg mb-2">Isi Stok Malam + Uang Masuk</h3>
                  <p className="text-sm text-gray-700">Catat stok akhir hari dan total penjualan.</p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex gap-4 md:gap-6">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full bg-black text-white font-bold text-xl md:text-2xl">
                    4
                  </div>
                </div>
                <div className="flex-1 border-2 border-gray-300 bg-white p-4 md:p-6 rounded-lg">
                  <h3 className="font-bold text-base md:text-lg mb-2">Cek Ringkasan Otomatis</h3>
                  <p className="text-sm text-gray-700">Lihat laporan harian dan keuntungan Anda.</p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Buttons */}
          <section className="flex flex-col gap-3 pt-6 md:pt-8">
            <Link to="/dashboard" className="w-full">
              <Button
                className="w-full border-2 border-black bg-black text-white px-8 py-3 md:py-4 font-bold hover:bg-gray-800 rounded transition text-base"
              >
                Lanjut ke Dashboard
              </Button>
            </Link>
            <button
              className="w-full text-center text-gray-600 text-sm font-medium py-2 hover:text-black transition"
            >
              Lewati Panduan
            </button>
          </section>
        </div>
      </div>
    </Layout>
  );
}
