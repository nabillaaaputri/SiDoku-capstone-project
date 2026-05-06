import Layout from "@/components/layout/Layout";
import { Link } from "react-router-dom";
import { Button } from "@/ui/button";

export default function OnboardingFinal() {
  return (
    <Layout showSkip={false}>
      <div className="max-w-4xl mx-auto px-4 py-12 min-h-[calc(100vh-120px)] flex flex-col justify-center">
        <div className="space-y-8">
          {/* Final Section */}
          <section className="space-y-6 text-center">
            <div className="border-4 border-black p-12 bg-gray-50">
              <h2 className="text-3xl font-bold mb-4">Siap Mengelola Bisnis Anda?</h2>
              <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                Bergabunglah dengan ribuan pemilik bisnis dan UMKM yang telah
                meningkatkan efisiensi keuangan mereka dengan SiDoku.
              </p>
            </div>
          </section>

          {/* Success Message */}
          <section className="space-y-4 text-center">
            <h3 className="text-xl font-semibold">✨ Anda Siap Memulai!</h3>
            <p className="text-base text-gray-600 max-w-2xl mx-auto">
              Pilih opsi di bawah untuk memulai perjalanan bisnis Anda yang lebih baik.
            </p>
          </section>

          {/* CTA Section */}
          <section className="space-y-4">
            <div className="border-4 border-black p-8 bg-gray-50">
              <p className="mb-6 font-semibold text-center text-lg">Sudah punya akun?</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/login"
                  className="inline-block border-2 border-black bg-white text-black px-8 py-3 font-bold hover:bg-gray-100 text-center"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="inline-block border-2 border-black bg-black text-white px-8 py-3 font-bold hover:bg-gray-800 text-center"
                >
                  Buat Akun Baru
                </Link>
              </div>
            </div>
          </section>

          {/* Navigation Back Button */}
          <div className="flex justify-start pt-8">
            <Link to="/guide">
              <Button 
                variant="outline"
                className="border-2 border-black px-8 py-6 font-bold text-base"
              >
                ← Kembali
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
