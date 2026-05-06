import Layout from "@/components/layout/Layout";
import { Link } from "react-router-dom";
import { Button } from "@/ui/button";

export default function Guide() {
  return (
    <Layout showSkip={true} skipPath="/onboarding-final">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="space-y-12">
          {/* Title Section */}
          <section className="space-y-4">
            <h1 className="text-4xl font-bold">Mengapa Memilih SiDoku?</h1>
          </section>

          {/* Benefits Section */}
          <section className="space-y-6">
            <div className="border-4 border-black p-8 bg-gray-50">
              <h2 className="text-2xl font-bold mb-6">Manfaat SiDoku untuk Bisnis Anda</h2>

              <div className="space-y-4">
                <div className="border-l-4 border-black pl-4">
                  <p className="font-bold text-lg">💰 Kontrol Keuangan yang Lebih Baik</p>
                  <p className="text-base text-gray-700">Ketahui dengan pasti berapa pendapatan dan pengeluaran bisnis Anda setiap harinya</p>
                </div>

                <div className="border-l-4 border-black pl-4">
                  <p className="font-bold text-lg">📊 Laporan Realtime</p>
                  <p className="text-base text-gray-700">Dapatkan laporan keuntungan dan kerugian yang terupdate secara otomatis tanpa perlu kalkulasi manual</p>
                </div>

                <div className="border-l-4 border-black pl-4">
                  <p className="font-bold text-lg">⏱️ Hemat Waktu</p>
                  <p className="text-base text-gray-700">Tidak perlu lagi mencatat di buku atau spreadsheet yang rumit, semua otomatis tercatat di aplikasi</p>
                </div>

                <div className="border-l-4 border-black pl-4">
                  <p className="font-bold text-lg">📱 Akses Dimana Saja</p>
                  <p className="text-base text-gray-700">Akses data bisnis Anda kapan saja dan dimana saja melalui perangkat apapun</p>
                </div>

                <div className="border-l-4 border-black pl-4">
                  <p className="font-bold text-lg">🤖 AI Assistant</p>
                  <p className="text-base text-gray-700">Dapatkan saran dan analisis cerdas dari asisten AI untuk mengembangkan bisnis Anda</p>
                </div>
              </div>
            </div>
          </section>

          {/* Why Choose Section */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">Cocok Untuk Siapa?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border-2 border-black p-4">
                <p className="font-bold mb-2">✓ Pemilik Toko</p>
                <p className="text-sm text-gray-700">Kelola stok barang dan catat rekap penjualan harian</p>
              </div>
              <div className="border-2 border-black p-4">
                <p className="font-bold mb-2">✓ UMKM & Bisnis Kecil</p>
                <p className="text-sm text-gray-700">Profesionalkan sistem keuangan dan operasional bisnis Anda</p>
              </div>
              <div className="border-2 border-black p-4">
                <p className="font-bold mb-2">✓ Pedagang Online</p>
                <p className="text-sm text-gray-700">Pantau penjualan dari berbagai platform dalam satu dashboard</p>
              </div>
              <div className="border-2 border-black p-4">
                <p className="font-bold mb-2">✓ Bisnis Jasa</p>
                <p className="text-sm text-gray-700">Catat biaya operasional dan pendapatan dengan terstruktur</p>
              </div>
            </div>
          </section>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-8">
            <Link to="/welcome">
              <Button
                variant="outline"
                className="border-2 border-black px-8 py-6 font-bold text-base"
              >
                ← Kembali
              </Button>
            </Link>
            <Link to="/onboarding-final">
              <Button
                className="border-2 border-black bg-black text-white px-8 py-6 font-bold hover:bg-gray-800 text-base"
              >
                Selanjutnya →
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
