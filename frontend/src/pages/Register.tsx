import Layout from "@/components/layout/Layout";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/ui/button";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { authService } from "@/services/auth.service";

export default function Register() {
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password || !confirmPassword || !businessName) {
      return;
    }

    if (password !== confirmPassword) {
      alert("Password dan konfirmasi password tidak sama.");
      return;
    }

    setLoading(true);

    try {
      await authService.register({
        email,
        password,
        storeName: businessName,
        confirmPassword,
      });

      setIsSubmitted(true);
    } catch (error) {
      console.error("Register gagal:", error);
      alert(authService.getErrorMessage(error, "Gagal mendaftar. Coba lagi."));
    } finally {
      setLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <Layout showSkip={false}>
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4">
          <div className="w-full max-w-md rounded-3xl border border-emerald-200 bg-white p-8 text-center shadow-[0_20px_45px_-35px_rgba(16,185,129,0.7)]">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mx-auto mb-5">
              <CheckCircle2 className="w-9 h-9 text-emerald-600" />
            </div>

            <h1 className="text-3xl font-extrabold text-slate-900 mb-3">
              Akun Berhasil Dibuat
            </h1>

            <p className="text-slate-600 mb-6">
              Silakan login untuk masuk ke aplikasi SiDoku.
            </p>

            <Link to="/login">
              <Button className="w-full bg-slate-900 text-white py-3 font-bold hover:bg-slate-800 rounded-xl transition inline-flex items-center justify-center gap-2">
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
      <div className="relative overflow-hidden min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-10">
        
        {/* Background Blur */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.12),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.12),transparent_40%)]" />

        {/* Register Card */}
        <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_20px_45px_-35px_rgba(15,23,42,0.7)]">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 mb-5">
            <Sparkles className="w-3.5 h-3.5" />
            Mulai Lebih Tertata
          </div>

          {/* Title */}
          <h1 className="text-4xl font-extrabold text-slate-900 leading-tight">
            Buat Akun SiDoku
          </h1>

          <p className="text-sm text-slate-600 mt-3 mb-8">
            Siapkan akun Anda dalam hitungan detik dan langsung mulai pencatatan bisnis.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Nama Usaha */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                Nama Usaha
              </label>

              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full border border-slate-300 bg-white px-4 py-3 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-400 transition"
                placeholder="Masukkan nama usaha Anda"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-slate-300 bg-white px-4 py-3 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-400 transition"
                placeholder="Masukkan email Anda"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                Kata Sandi
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-slate-300 bg-white px-4 py-3 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-400 transition"
                placeholder="Buat kata sandi"
                required
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                Konfirmasi Kata Sandi
              </label>

              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-slate-300 bg-white px-4 py-3 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-400 transition"
                placeholder="Konfirmasi kata sandi"
                required
              />
            </div>

            {/* Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white py-3 font-bold hover:bg-slate-800 rounded-xl transition inline-flex items-center justify-center gap-2"
            >
              {loading ? "Loading..." : "Daftar"}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-7 text-center text-sm">
            <p className="text-slate-600">
              Sudah punya akun?
            </p>

            <Link
              to="/login"
              className="text-slate-900 font-bold hover:underline mt-1.5 inline-block"
            >
              Masuk di sini
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}