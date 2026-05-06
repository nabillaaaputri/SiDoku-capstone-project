import Layout from "@/components/layout/Layout";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/ui/button";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

export default function Register() {
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple mock register - show success message
    if (email && password && confirmPassword && businessName && password === confirmPassword) {
      setIsSubmitted(true);
    }
  };

  if (isSubmitted) {
    return (
      <Layout showSkip={false}>
        <div className="max-w-md mx-auto px-4 py-12 md:py-16 min-h-[calc(100vh-80px)] flex flex-col justify-center">
          <div className="rounded-2xl border border-emerald-200 bg-white p-6 md:p-8 text-center space-y-5 shadow-[0_20px_45px_-35px_rgba(16,185,129,0.7)]">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mx-auto">
              <CheckCircle2 className="w-9 h-9 text-emerald-600" />
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">Akun Berhasil Dibuat</h1>
            <p className="text-slate-600">
              Silakan login untuk masuk ke aplikasi SiDoku.
            </p>
            <Link to="/login" className="block">
              <Button className="w-full bg-slate-900 text-white py-3 font-bold hover:bg-slate-800 rounded-xl transition inline-flex items-center gap-2 justify-center">
                Ke Login
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showSkip={false}>
      <div className="relative overflow-hidden min-h-[calc(100vh-80px)] flex items-center">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_100%_20%,rgba(14,165,233,0.18),transparent_35%),radial-gradient(circle_at_0%_100%,rgba(16,185,129,0.2),transparent_42%)]" />
        <div className="relative max-w-5xl mx-auto px-4 py-10 md:py-16 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-[0_20px_45px_-35px_rgba(15,23,42,0.7)]">
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                Mulai Lebih Tertata
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">Buat Akun SiDoku</h1>
              <p className="text-sm md:text-base text-slate-600 mt-2 mb-6">Siapkan akun Anda dalam hitungan detik dan langsung mulai pencatatan bisnis.</p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-2">Nama Usaha</label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full border border-slate-300 bg-white px-3.5 py-3 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-400 transition"
                    placeholder="Masukkan nama usaha Anda"
                    required
                  />
                </div>

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
                    placeholder="Buat kata sandi"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-2">Konfirmasi Kata Sandi</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full border border-slate-300 bg-white px-3.5 py-3 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-400 transition"
                    placeholder="Konfirmasi kata sandi"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-slate-900 text-white py-3 font-bold hover:bg-slate-800 rounded-xl transition inline-flex items-center justify-center gap-2"
                >
                  Daftar
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </form>

              <div className="mt-6 text-center text-sm">
                <p className="text-slate-600">Sudah punya akun?</p>
                <Link
                  to="/login"
                  className="text-slate-900 font-bold hover:underline mt-1.5 inline-block"
                >
                  Masuk di sini
                </Link>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-sky-50 via-white to-emerald-50 p-6 md:p-8 lg:p-10 flex flex-col justify-center">
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-4">Kenapa Daftar Sekarang?</h2>
              <ul className="space-y-3 text-sm md:text-base text-slate-700">
                <li className="rounded-xl bg-white/80 border border-slate-200 p-3.5">Pantau stok masuk dan keluar dalam satu alur harian.</li>
                <li className="rounded-xl bg-white/80 border border-slate-200 p-3.5">Lihat rekap penjualan tanpa hitung manual.</li>
                <li className="rounded-xl bg-white/80 border border-slate-200 p-3.5">Catat pengeluaran agar margin usaha lebih terkontrol.</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
}
