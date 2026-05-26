import Layout from "@/components/layout/Layout";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/ui/button";
import { ArrowRight, Eye, EyeOff, Sparkles } from "lucide-react";
import { authService } from "@/services/auth.service";

type AlertState = {
  title: string;
  description: string;
  tone: "success" | "error";
} | null;

export default function Register() {
  const navigate = useNavigate();
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [alertState, setAlertState] = useState<AlertState>(null);

  useEffect(() => {
    if (!alertState) {
      return;
    }

    const timer = window.setTimeout(() => {
      setAlertState(null);
    }, 2500);

    return () => window.clearTimeout(timer);
  }, [alertState]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password || !confirmPassword || !businessName) {
      return;
    }

    if (password !== confirmPassword) {
      setAlertState({
        title: "Registrasi gagal",
        description: "Password dan konfirmasi password tidak sama.",
        tone: "error",
      });
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

      setAlertState({
        title: "Registrasi berhasil!",
        description: "Silakan login untuk melanjutkan.",
        tone: "success",
      });

      setTimeout(() => {
        navigate("/login");
      }, 900);
    } catch (error) {
      console.error("Register gagal:", error);
      setAlertState({
        title: "Registrasi gagal",
        description: "Silakan coba lagi.",
        tone: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout showSkip={false}>
      <div className="relative overflow-hidden min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-10">
        {alertState && (
          <div className="fixed left-1/2 top-4 z-[60] w-[min(92vw,450px)] -translate-x-1/2">
            <div
              role="alert"
              className={`rounded-2xl border px-4 py-3.5 shadow-[0_18px_40px_rgba(15,23,42,0.16)] backdrop-blur-xl ${alertState.tone === "success" ? "border-emerald-200 bg-emerald-50/95 text-emerald-900" : "border-rose-200 bg-rose-50/95 text-rose-900"}`}
            >
              <p className="text-sm font-semibold leading-5">{alertState.title}</p>
              <p className="mt-0.5 text-sm leading-5">{alertState.description}</p>
            </div>
          </div>
        )}
        
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

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-slate-300 bg-white px-4 py-3 pr-11 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-400 transition"
                  placeholder="Buat kata sandi"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-800"
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                Konfirmasi Kata Sandi
              </label>

              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border border-slate-300 bg-white px-4 py-3 pr-11 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-400 transition"
                  placeholder="Konfirmasi kata sandi"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((current) => !current)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-800"
                  aria-label={showConfirmPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
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