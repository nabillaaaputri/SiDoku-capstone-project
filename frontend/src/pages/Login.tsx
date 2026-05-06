import Layout from "@/components/Layout";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/ui/button";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple mock login - just navigate to dashboard
    if (email && password) {
      navigate("/dashboard");
    }
  };

  return (
    <Layout showSkip={false}>
      <div className="relative overflow-hidden min-h-[calc(100vh-80px)] flex items-center">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_20%,rgba(14,165,233,0.2),transparent_36%),radial-gradient(circle_at_100%_0%,rgba(16,185,129,0.18),transparent_40%)]" />
        <div className="relative max-w-5xl mx-auto px-4 py-10 md:py-16 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-[0_20px_45px_-35px_rgba(15,23,42,0.7)]">
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                Selamat Datang Kembali
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">Masuk ke SiDoku</h1>
              <p className="text-sm md:text-base text-slate-600 mt-2 mb-6">Lanjutkan pencatatan dan pantau bisnis Anda hari ini.</p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-slate-300 bg-white px-3.5 py-3 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-400 transition"
                    placeholder="Masukkan email Anda"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-2">Kata Sandi</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-slate-300 bg-white px-3.5 py-3 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-400 transition"
                    placeholder="Masukkan kata sandi Anda"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-slate-900 text-white py-3 font-bold hover:bg-slate-800 rounded-xl transition inline-flex items-center justify-center gap-2"
                >
                  Masuk
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </form>

              <div className="mt-6 text-center text-sm">
                <p className="text-slate-600">Belum punya akun?</p>
                <Link
                  to="/register"
                  className="text-slate-900 font-bold hover:underline mt-1.5 inline-block"
                >
                  Daftar di sini
                </Link>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-sky-50 via-white to-emerald-50 p-6 md:p-8 lg:p-10 flex flex-col justify-center">
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-4">Kelola Bisnis dengan Tenang</h2>
              <p className="text-sm md:text-base text-slate-600 mb-6">
                Semua catatan stok, pengeluaran, dan penjualan tersimpan rapi dalam satu dashboard yang mudah dipahami.
              </p>
              <div className="space-y-3">
                <div className="rounded-xl bg-white/80 border border-slate-200 p-3.5 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Aman untuk operasional harian</p>
                    <p className="text-xs text-slate-600">Masuk cepat, lanjut kerja tanpa ribet.</p>
                  </div>
                </div>
                <div className="rounded-xl bg-white/80 border border-slate-200 p-3.5">
                  <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Tips</p>
                  <p className="text-sm text-slate-700">Gunakan email yang sama saat daftar agar data tetap terhubung.</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
}
