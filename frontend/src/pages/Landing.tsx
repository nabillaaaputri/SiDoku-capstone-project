import Layout from "@/components/layout/Layout";
import { Link } from "react-router-dom";
import { Button } from "@/ui/button";

export default function Landing() {
  return (
    <Layout showSkip={false}>
      <div className="max-w-4xl mx-auto px-4 py-12 md:py-16 min-h-[calc(100vh-80px)] flex flex-col justify-center">
        <div className="space-y-8 md:space-y-10 text-center">
          {/* Hero Section */}
          <section className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Atur Keuangan dan Stok Usaha Tanpa Ribet
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
              SiDoku membantu warung dan UMKM mencatat uang masuk, uang keluar, dan stok harian dengan cara sederhana.
            </p>
          </section>

          {/* CTA Section */}
          <section className="flex flex-col items-center gap-4 pt-4">
            <Link to="/intro" className="w-full sm:w-auto">
              <Button className="w-full bg-blue-500 text-white px-8 py-3 md:py-4 font-semibold hover:bg-blue-600 rounded-lg transition text-base shadow-sm">
                Mulai Sekarang
              </Button>
            </Link>
            <Link
              to="/login"
              className="text-sm text-slate-600 hover:text-slate-900 transition font-medium"
            >
              Sudah punya akun? Login
            </Link>
          </section>
        </div>
      </div>
    </Layout>
  );
}
