import { Archive, X } from "lucide-react";

interface ArchiveConfirmDialogProps {
  productName: string;
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ArchiveConfirmDialog({
  productName,
  isOpen,
  onConfirm,
  onCancel,
}: ArchiveConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-[24px] border border-amber-100 bg-white shadow-[0_28px_60px_rgba(15,23,42,0.22)]">
        <div className="flex items-start justify-between gap-4 border-b border-amber-100 bg-[linear-gradient(180deg,_#fffaf0,_#ffffff)] px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 ring-1 ring-amber-200/70">
              <Archive size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900">Arsipkan produk?</h2>
              <p className="mt-1 text-sm text-slate-600">Produk ini akan disembunyikan dari operasional harian.</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3 px-5 py-4">
          <p className="text-sm leading-6 text-slate-700">
            <strong className="font-semibold text-slate-900">{productName}</strong> akan diarsipkan dan tidak akan muncul di pencatatan harian, dropdown stok, atau kartu statistik aktif.
          </p>
          <p className="text-sm leading-6 text-slate-500">
            Data rekap penjualan lama tetap aman. Produk ini bisa dipulihkan kapan saja dari daftar arsip.
          </p>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row">
          <button
            onClick={onCancel}
            className="h-11 flex-1 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="h-11 flex-1 rounded-2xl bg-amber-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-700"
          >
            Arsipkan Produk
          </button>
        </div>
      </div>
    </div>
  );
}
