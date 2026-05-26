import Layout from "@/components/layout/Layout";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/ui/button";
import { ArrowRight, Eye, EyeOff, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    try {
      await login(email, password);

      toast({
        title: "Login berhasil!",
        description: "Selamat datang kembali 👋",
      });

      navigate("/dashboard");
    } catch (error) {
      console.error("Login gagal:", error);

      toast({
        title: "Login gagal",
        description: "Periksa email dan password.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout showSkip={false}>
      <div className="relative overflow-hidden min-h-[calc(100vh-80px)] flex items-center justify-center">
        {/* Background */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_100%_20%,rgba(14,165,233,0.18),transparent_35%),radial-gradient(circle_at_0%_100%,rgba(16,185,129,0.2),transparent_42%)]" />

        <div className="relative w-full max-w-md px-4 py-10">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-[0_20px_45px_-35px_rgba(15,23,42,0.7)]">
            
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              Selamat Datang Kembali
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
              Login SiDoku
            </h1>

            <p className="text-sm md:text-base text-slate-600 mt-2 mb-6">
              Masuk untuk melanjutkan pengelolaan bisnis Anda.
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">
                  Email
                </label>

                <input
                  type="email"
                  placeholder="Masukkan email Anda"
                  className="w-full border border-slate-300 bg-white px-3.5 py-3 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-400 transition"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                    placeholder="Masukkan kata sandi"
                    className="w-full border border-slate-300 bg-white px-3.5 py-3 pr-11 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-400 transition"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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

              {/* Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 text-white py-3 font-bold hover:bg-slate-800 rounded-xl transition inline-flex items-center justify-center gap-2"
              >
                {loading ? "Loading..." : "Masuk"}

                {!loading && <ArrowRight className="w-4 h-4" />}
              </Button>
            </form>

            {/* Footer */}
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
        </div>
      </div>
    </Layout>
  );
}