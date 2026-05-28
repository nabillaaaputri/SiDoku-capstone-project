import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/ui/button";
import logoImage from "/logo.png";
import { 
  Menu, X, Sparkles, LayoutDashboard, 
  CheckCircle2, PlusCircle, ClipboardList,
  AlertCircle, TrendingDown, Clock,
  TrendingUp
} from "lucide-react";

const TEAM = [
  { name: "Nabilla Putri Nuraini", initials: "NPN" },
  { name: "Shafira Auliana Salsabila", initials: "SAS" },
  { name: "Nayla Poetri Kurnia", initials: "NPK" },
  { name: "Hikmal Arya Dwitama", initials: "HAD" },
  { name: "Yolanda Wulandari", initials: "YW" },
  { name: "Bella Azhar Kautsar", initials: "BAK" },
];

export default function Landing() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 overflow-x-hidden">
      {/* 1. NAVBAR */}
      <div className="fixed top-0 inset-x-0 z-50 flex justify-center pt-4 px-4 pointer-events-none">
        <header className={`pointer-events-auto transition-all duration-300 rounded-full border w-full max-w-4xl ${
          scrolled ? 'bg-[#EAF2FB]/90 backdrop-blur-sm border-slate-200/70 shadow-[0_10px_24px_rgba(15,23,42,0.08)]' 
          : 'bg-[#EAF2FB]/90 backdrop-blur-sm border-slate-200/70 shadow-[0_8px_20px_rgba(15,23,42,0.06)]'
        }`}>
          <div className="flex justify-between items-center h-14 px-4 sm:px-6">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <div className="w-8 h-8 rounded-2xl bg-white text-slate-900 border border-white/80 flex items-center justify-center p-1.5 shadow-sm">
                  <img src={logoImage} alt="SiDoku Logo" className="w-5 h-5 object-contain" />
                </div>
                SiDoku
              </Link>
            </div>

            <nav className="hidden md:flex items-center space-x-1">
              {['Beranda', 'Cara Kerja', 'Fitur'].map((item) => (
                <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} className="px-4 py-2 text-[13px] font-bold text-slate-600 hover:text-slate-900 transition-colors">
                  {item}
                </a>
              ))}
            </nav>

            <div className="hidden md:flex items-center space-x-3">
              <Link to="/login" className="px-3 py-2 text-[13px] font-bold text-slate-600 hover:text-slate-900">
                Masuk
              </Link>
              <Link to="/register">
                <Button size="sm" className="bg-[#0f172a] hover:bg-slate-800 text-white rounded-full px-5 h-9 text-[13px] font-bold">
                  Coba SiDoku
                </Button>
              </Link>
            </div>

            <div className="flex items-center md:hidden">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-600 p-2">
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </header>

        {isMobileMenuOpen && (
          <div className="absolute top-20 inset-x-4 md:hidden bg-white border border-slate-200 shadow-lg rounded-2xl p-4 flex flex-col gap-1 pointer-events-auto">
            {['Beranda', 'Cara Kerja', 'Fitur'].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 text-sm font-bold text-slate-700">
                {item}
              </a>
            ))}
            <div className="h-px bg-slate-100 my-2"></div>
            <Link to="/login" className="w-full text-center py-3 text-sm font-bold text-slate-700 border border-slate-200 rounded-xl">Masuk</Link>
            <Link to="/register" className="w-full text-center py-3 text-sm font-bold text-white bg-[#0f172a] rounded-xl mt-2">Coba SiDoku</Link>
          </div>
        )}
      </div>

      <main>
        {/* 2. HERO SECTION */}
        <section id="beranda" className="pt-28 pb-8 md:pt-34 md:pb-10 px-4 sm:px-6 max-w-[1100px] mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 z-10 text-center md:text-left">
              <div className="space-y-4">
                <h1 className="text-3xl md:text-4xl lg:text-[42px] font-black text-slate-900 leading-[1.2] tracking-tight">
                  Kelola Stok dan Keuangan Usaha <span className="text-blue-600">Tanpa Ribet</span>
                </h1>
                <p className="text-sm text-slate-600 max-w-md mx-auto md:mx-0 leading-relaxed font-medium">
                  SiDoku membantu pemilik usaha mencatat stok, pemasukan, pengeluaran, dan memahami kondisi usaha dalam satu dashboard sederhana.
                </p>
              </div>
              
              <div className="flex justify-center md:justify-start">
                <Link to="/register">
                  <Button className="w-full sm:w-auto bg-[#0f172a] hover:bg-slate-800 text-white rounded-xl px-8 py-6 text-sm font-bold shadow-md">
                    Coba SiDoku
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
                {[
                  {text: "Mudah digunakan"},
                  {text: "Cocok untuk UMKM"},
                  {text: "Insight otomatis"}
                ].map((badge, i) => (
                  <div key={i} className="flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-slate-100/50 px-2.5 py-1.5 rounded-full border border-slate-100/80">
                    <CheckCircle2 className="h-3.5 w-3.5 text-blue-500" /> {badge.text}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 md:mt-0 relative flex justify-center">
              <div className="w-full max-w-lg rounded-3xl border border-blue-100 bg-white shadow-[0_18px_44px_rgba(2,32,71,0.14)] overflow-hidden">
                 <div className="h-11 px-4 border-b border-blue-100 bg-[linear-gradient(90deg,_#0f172a,_#0c4a6e)] flex items-center gap-3">
                   <div className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-900 shadow-sm">
                     <img src={logoImage} alt="SiDoku" className="w-4 h-4 object-contain" />
                   </div>
                   <div className="ml-1 text-[10px] font-bold text-white/90">Dashboard SiDoku</div>
                 </div>

                 <div className="grid grid-cols-12 gap-2.5 p-3.5 bg-[linear-gradient(180deg,_#f8fbff,_#eef6ff)]">
                   <div className="col-span-4 rounded-2xl border border-blue-100 bg-white p-3 shadow-[0_8px_20px_rgba(14,116,144,0.08)]">
                     <p className="text-[10px] font-bold text-slate-500">Uang Masuk</p>
                     <p className="text-base sm:text-lg font-black text-slate-900 mt-1">Rp3.250.000</p>
                     <p className="text-[10px] font-bold text-blue-600 mt-2">+14% dari minggu lalu</p>
                   </div>
                   <div className="col-span-4 rounded-2xl border border-blue-100 bg-white p-3 shadow-[0_8px_20px_rgba(14,116,144,0.08)]">
                     <p className="text-[10px] font-bold text-slate-500">Uang Keluar</p>
                     <p className="text-base sm:text-lg font-black text-slate-900 mt-1">Rp1.120.000</p>
                     <p className="text-[10px] font-bold text-cyan-600 mt-2">Bahan baku & operasional</p>
                   </div>
                   <div className="col-span-4 rounded-2xl border border-blue-100 bg-white p-3 shadow-[0_8px_20px_rgba(14,116,144,0.08)]">
                     <p className="text-[10px] font-bold text-slate-500">Produk Hampir Habis</p>
                     <p className="text-base sm:text-lg font-black text-slate-900 mt-1">6 Produk</p>
                     <p className="text-[10px] font-bold text-orange-500 mt-2">Prioritas restock</p>
                   </div>

                   <div className="col-span-8 rounded-2xl border border-blue-100 bg-white p-3 shadow-[0_8px_20px_rgba(14,116,144,0.08)]">
                     <div className="flex items-center justify-between mb-2">
                       <p className="text-[10px] font-bold text-slate-500">Tren Keuangan 7 Hari</p>
                       <span className="text-[10px] font-bold text-blue-600">Stabil naik</span>
                     </div>
                     <svg viewBox="0 0 240 70" className="w-full h-[68px]">
                       <path
                         fill="none"
                         stroke="#3b82f6"
                         strokeWidth="3"
                         strokeLinecap="round"
                         strokeLinejoin="round"
                         d="M0 58 C20 54, 25 48, 38 49 C55 51, 62 56, 78 53 C95 50, 102 42, 118 40 C135 38, 144 44, 158 39 C176 33, 186 25, 202 27 C218 29, 228 22, 240 20"
                       />
                       <path
                         fill="none"
                         stroke="#f97316"
                         strokeWidth="3"
                         strokeLinecap="round"
                         strokeLinejoin="round"
                         d="M0 62 C18 61, 24 60, 38 60 C55 60, 62 56, 78 56 C94 56, 102 54, 118 54 C136 54, 144 53, 160 52 C176 51, 186 49, 202 48 C219 47, 228 45, 240 44"
                       />
                     </svg>
                     <div className="mt-1 flex items-center gap-3 text-[10px] font-bold text-slate-500">
                       <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span>Uang Masuk</span>
                       <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500"></span>Uang Keluar</span>
                     </div>
                   </div>

                   <div className="col-span-4 rounded-2xl border border-cyan-200 bg-[linear-gradient(170deg,_#ecfeff,_#dbeafe)] p-3 shadow-[0_8px_20px_rgba(34,211,238,0.14)]">
                     <p className="text-[10px] font-bold text-sky-800 mb-1">Insight AI</p>
                     <p className="text-[10px] text-slate-700 font-semibold leading-relaxed">
                       Prediksi akhir pekan: permintaan minyak goreng dan telur naik. Tambah stok 10-15%.
                     </p>
                   </div>
                 </div>
               </div>
            </div>
          </div>
        </section>

        {/* 3. MASALAH SECTION */}
        <section className="py-12 bg-white border-t border-slate-100">
          <div className="max-w-[1100px] mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-10">
               <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Masih Catat Usaha Secara Manual?</h2>
               <p className="text-[13px] font-medium text-slate-500 mt-2">Mayoritas UMKM masih menggunakan sistem manual yang rentan kesalahan dan tidak terukur.</p>
               <p className="text-[13px] font-medium text-slate-500 mt-2">Catatan manual sering bikin stok terlewat, pengeluaran lupa dicatat, dan keputusan bisnis jadi hanya tebakan.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
               <div className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-red-200 hover:shadow-[0_12px_32px_rgba(220,38,38,0.1)] transition-all group">
                  <div className="w-14 h-14 rounded-xl bg-red-50 border border-red-100 text-red-600 flex items-center justify-center mb-4 group-hover:bg-red-100 transition-colors">
                     <Clock size={24}/>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mb-2">Stok Sering Lupa</h4>
                  <p className="text-[13px] text-slate-600 font-medium leading-relaxed">Barang habis tanpa disadari, berakibat hilangnya potensi penjualan harian dan kehilangan kepercayaan pelanggan.</p>
               </div>
               <div className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-orange-200 hover:shadow-[0_12px_32px_rgba(234,88,12,0.1)] transition-all group">
                  <div className="w-14 h-14 rounded-xl bg-orange-50 border border-orange-100 text-orange-600 flex items-center justify-center mb-4 group-hover:bg-orange-100 transition-colors">
                     <TrendingDown size={24}/>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mb-2">Pengeluaran Tak Tercatat</h4>
                  <p className="text-[13px] text-slate-600 font-medium leading-relaxed">Uang modal sering tercampur dengan uang pribadi, sehingga keuntungan bersih tidak terlihat dan sulit dianalisis.</p>
               </div>
               <div className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-amber-200 hover:shadow-[0_12px_32px_rgba(217,119,6,0.1)] transition-all group">
                  <div className="w-14 h-14 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center mb-4 group-hover:bg-amber-100 transition-colors">
                     <AlertCircle size={24}/>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mb-2">Sulit Tahu Kondisi Usaha</h4>
                  <p className="text-[13px] text-slate-600 font-medium leading-relaxed">Tidak ada data real-time untuk menganalisis produk paling laris, tren penjualan, atau keputusan bisnis strategis.</p>
               </div>
            </div>
          </div>
        </section>

        {/* 5. HOW IT WORKS (moved directly under Problem) */}
        <section id="cara-kerja" className="py-9 bg-white border-t border-slate-100">
          <div className="max-w-[1100px] mx-auto px-4 sm:px-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Mulai dalam 4 Langkah Mudah</h2>
              <p className="text-[13px] font-medium text-slate-500 mt-2">Proses setup yang cepat, tanpa ribet, tanpa perlu training khusus.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: PlusCircle, title: "Tambah Produk", desc: "Input daftar barang dagangan Anda" },
                { icon: ClipboardList, title: "Catat Aktivitas", desc: "Catat stok masuk, keluar, pemasukan" },
                { icon: LayoutDashboard, title: "Lihat Ringkasan", desc: "Pantau kondisi usaha otomatis" },
                { icon: Sparkles, title: "Tanya Asisten AI", desc: "Dapatkan insight dan rekomendasi" }
              ].map((step, i) => (
                <div key={i} className="bg-white p-5 rounded-2xl shadow-[0_10px_24px_rgba(2,32,71,0.08)] border border-slate-200 group hover:border-blue-200 hover:shadow-[0_12px_32px_rgba(2,32,71,0.12)] transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                      <step.icon size={18} />
                    </div>
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-black text-[12px] flex items-center justify-center shadow-sm">
                      {i + 1}
                    </div>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mb-1.5">{step.title}</h3>
                  <p className="text-[12px] text-slate-600 font-medium leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. FEATURES + AI SECTION */}
        <section id="fitur" className="py-12 bg-[linear-gradient(180deg,_#f4f9ff,_#ffffff)] border-t border-blue-100">
          <div className="max-w-[1100px] mx-auto px-4 sm:px-6">
            <div className="text-center mb-7">
               <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Semua yang Dibutuhkan dalam Satu Tempat</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6 items-stretch">
              <div className="flex flex-col gap-3">
                {[
                  { icon: PlusCircle, title: "Manajemen Stok", desc: "Catat stok masuk, keluar, dan pantau barang yang hampir habis secara realtime." },
                  { icon: ClipboardList, title: "Rekap Keuangan", desc: "Otomatis hitung pemasukan, pengeluaran, dan margin keuntungan setiap hari." },
                  { icon: Sparkles, title: "Insight Otomatis", desc: "Dapatkan analisis otomatis tentang produk paling laris dan tren penjualan." },
                  { icon: LayoutDashboard, title: "Catatan Harian", desc: "Catat aktivitas usaha harian dengan label dan kategori yang terorganisir rapi." }
                ].map((feature, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-blue-100 p-4 shadow-[0_10px_24px_rgba(2,32,71,0.06)] hover:border-blue-200 transition-colors w-full">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center flex-shrink-0">
                        <feature.icon size={18} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-900 text-sm mb-0.5">{feature.title}</h4>
                        <p className="text-[12px] text-slate-600 font-medium leading-snug">{feature.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-3xl border border-blue-100 p-4 md:p-5 shadow-[0_14px_30px_rgba(2,32,71,0.08)] flex items-stretch">
                <div className="w-full bg-[linear-gradient(180deg,_#f8fbff,_#eef6ff)] rounded-2xl border border-blue-100 p-4 shadow-sm h-full flex flex-col justify-between">
                  <div>
                    <div className="inline-flex w-fit items-center gap-1.5 rounded-full bg-blue-100 px-2.5 py-1 text-[10px] font-bold text-blue-700 mb-3 border border-blue-200/70">
                      <Sparkles size={11} /> Asisten AI
                    </div>
                    <h4 className="font-black text-slate-900 text-lg tracking-tight mb-3">Tanya Data Usaha, Langsung Dapat Jawaban</h4>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="self-end bg-[#0f172a] text-white px-3.5 py-2 rounded-2xl text-[12px] font-medium max-w-[80%]">Produk mana yang perlu restock?</div>

                    <div className="flex items-start gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center shrink-0 border border-cyan-200">
                        <Sparkles size={11} />
                      </div>
                      <div className="bg-white border border-blue-100 px-3.5 py-2 rounded-2xl text-[12px] font-medium text-slate-700 max-w-[85%]">
                        Minyak goreng dan telur. Keduanya habis lebih cepat minggu ini.
                      </div>
                    </div>

                    <div className="self-end bg-[#0f172a] text-white px-3.5 py-2 rounded-2xl text-[12px] font-medium max-w-[70%]">Berapa stok yang harus aku beli?</div>
                    <div className="flex items-start gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center shrink-0 border border-cyan-200">
                        <Sparkles size={11} />
                      </div>
                      <div className="bg-white border border-blue-100 px-3.5 py-2 rounded-2xl text-[12px] font-medium text-slate-700 max-w-[85%]">
                        Tambah 30% dari usual. Minyak goreng 50L, telur 10 rak. Budget rp 3.2jt.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        

        {/* 6. CTA SECTION */}
        <section className="py-10 bg-[linear-gradient(180deg,_#ffffff,_#f0f7ff)] border-t border-blue-100">
          <div className="max-w-[800px] mx-auto px-4 sm:px-6">
            <div className="bg-[linear-gradient(140deg,_#0f172a,_#1e3a8a,_#0369a1)] rounded-[28px] p-7 md:p-9 text-center border border-blue-800/40 shadow-[0_18px_44px_rgba(15,23,42,0.28)]">
               <h2 className="text-2xl md:text-3xl font-black text-white mb-3 tracking-tight">Semua Catatan Usaha dalam Satu Tempat</h2>
               <p className="text-[13px] font-semibold text-blue-100 mb-5">Mulai catat stok, pemasukan, pengeluaran, dan pantau kondisi usaha dalam satu tempat.</p>
               <Link to="/register">
                 <Button className="bg-white text-[#0f172a] hover:bg-sky-50 rounded-xl px-8 py-6 text-sm font-black shadow-lg border border-white/70 transition-transform hover:-translate-y-0.5">
                   Mulai Gunakan SiDoku
                 </Button>
               </Link>
            </div>
          </div>
        </section>

        {/* 7. OUR TEAM */}
        <section className="py-5 bg-white border-t border-slate-100">
          <div className="max-w-[1100px] mx-auto px-4 sm:px-6 text-center">
            <div className="mb-2.5">
              <h3 className="text-sm md:text-base font-semibold text-slate-900 tracking-tight">Dibangun oleh Tim SiDoku</h3>
              <p className="mt-1 text-[10px] font-medium text-slate-500">Enam orang yang mengerjakan produk ini bersama.</p>
            </div>
            <div className="mx-auto flex max-w-4xl flex-wrap justify-center gap-1.5 sm:gap-2">
              {TEAM.map((member, i) => (
                <div key={i} className="inline-flex max-w-[160px] items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-left shadow-sm transition hover:border-blue-200 hover:bg-blue-50/50">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-[10px] font-black text-white">
                    {member.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[11px] font-semibold text-slate-900 leading-tight">{member.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* 8. FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-8">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-3 items-center gap-5">
           <div className="text-center md:text-left">
             <div className="flex items-center justify-center md:justify-start gap-2 text-slate-900 font-black text-sm">
             <div className="w-5 h-5 rounded-md flex items-center justify-center p-1 bg-white border border-slate-200 shadow-sm">
               <img src={logoImage} className="w-3 h-3 object-contain" alt="SiDoku"/>
             </div>
             SiDoku
             </div>
             <p className="text-[11px] font-semibold text-slate-500 mt-2">SiDoku membantu UMKM mencatat usaha dengan lebih rapi dan mudah.</p>
           </div>

           <div className="flex justify-center gap-5 text-[11px] font-bold text-slate-600">
              <a href="#beranda" className="hover:text-slate-900">Beranda</a>
              <a href="#cara-kerja" className="hover:text-slate-900">Cara Kerja</a>
              <a href="#fitur" className="hover:text-slate-900">Fitur</a>
           </div>

           <p className="text-[10px] font-semibold text-slate-500 text-center md:text-right">
              &copy; {new Date().getFullYear()} SiDoku. Hak Cipta Dilindungi.
           </p>
        </div>
      </footer>
    </div>
  );
 
}
