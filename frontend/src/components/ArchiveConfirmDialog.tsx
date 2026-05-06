import { AlertCircle, X } from "lucide-react";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-yellow-200 bg-yellow-50">
          <div className="flex items-center gap-2">
            <AlertCircle size={24} className="text-yellow-600" />
            <h2 className="text-lg font-bold text-yellow-900">Arsipkan Produk?</h2>
          </div>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-yellow-100 rounded transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          <p className="text-gray-700">
            Produk <strong>{productName}</strong> akan diarsipkan dan tidak akan muncul di pencatatan harian atau dropdown.
          </p>
          <p className="text-sm text-gray-600">
            Data rekap penjualan lama tetap tersimpan, dan Anda dapat memulihkan produk ini kapan saja.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 p-4 border-t border-gray-200">
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-600 text-white px-4 py-2 hover:bg-red-700 font-bold rounded transition"
          >
            Arsipkan
          </button>
          <button
            onClick={onCancel}
            className="flex-1 border-2 border-gray-400 text-gray-700 px-4 py-2 hover:bg-gray-100 font-bold rounded transition"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}
