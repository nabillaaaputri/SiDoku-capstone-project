import { Product } from "@/types";
import { X } from "lucide-react";
import { useState, useEffect } from "react";

const CATEGORY_OPTIONS = ["Makanan", "Minuman", "Bahan Baku", "Peralatan", "Lainnya"];

interface EditProductModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedProduct: Partial<Product>) => void;
}

export default function EditProductModal({
  product,
  isOpen,
  onClose,
  onSave,
}: EditProductModalProps) {
  const [formData, setFormData] = useState({
    name: product.name,
    category: product.category,
    unit: product.unit,
    costPrice: product.costPrice,
    sellPrice: product.sellPrice,
    minimumStock: String(product.minimumStock),
  });
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    setFormData({
      name: product.name,
      category: product.category,
      unit: product.unit,
      costPrice: product.costPrice,
      sellPrice: product.sellPrice,
      minimumStock: String(product.minimumStock),
    });
    setValidationError("");
  }, [product, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const minimumStock = Number(formData.minimumStock);
    if (!formData.minimumStock.trim() || Number.isNaN(minimumStock) || minimumStock < 1) {
      setValidationError("Stok minimum harus diisi dengan angka minimal 1.");
      return;
    }

    setValidationError("");
    onSave({
      name: formData.name,
      category: formData.category,
      unit: formData.unit,
      costPrice: formData.costPrice,
      sellPrice: formData.sellPrice,
      minimumStock,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Edit Produk</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Nama Produk <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="h-11 w-full rounded-xl border border-slate-300 px-3 text-sm text-slate-700 outline-none transition focus:border-blue-500"
              placeholder="Nama produk"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Kategori <span className="text-red-600">*</span>
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-500"
              required
            >
              <option value="">Pilih kategori</option>
              {CATEGORY_OPTIONS.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Satuan <span className="text-red-600">*</span>
            </label>
            <select
              value={formData.unit}
              onChange={(e) =>
                setFormData({ ...formData, unit: e.target.value })
              }
              className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-500"
              required
            >
              <option value="pcs">pcs</option>
              <option value="kg">kg</option>
              <option value="gram">gram</option>
              <option value="ml">ml</option>
              <option value="liter">liter</option>
              <option value="botol">botol</option>
              <option value="pack">pack</option>
              <option value="dus">dus</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Harga Beli (Rp) <span className="text-red-600">*</span>
            </label>
            <input
              type="number"
              value={formData.costPrice}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  costPrice: parseFloat(e.target.value) || 0,
                })
              }
              className="h-11 w-full rounded-xl border border-slate-300 px-3 text-sm text-slate-700 outline-none transition focus:border-blue-500"
              placeholder="0"
              min="0"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Harga Jual (Rp) <span className="text-red-600">*</span>
            </label>
            <input
              type="number"
              value={formData.sellPrice}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  sellPrice: parseFloat(e.target.value) || 0,
                })
              }
              className="h-11 w-full rounded-xl border border-slate-300 px-3 text-sm text-slate-700 outline-none transition focus:border-blue-500"
              placeholder="0"
              min="0"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Stok Minimum <span className="text-red-600">*</span>
            </label>
            <input
              type="number"
              value={formData.minimumStock}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  minimumStock: e.target.value,
                })
              }
              className="h-11 w-full rounded-xl border border-slate-300 px-3 text-sm text-slate-700 outline-none transition focus:border-blue-500"
              placeholder="0"
              min="1"
              required
            />
          </div>

          {validationError && (
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              {validationError}
            </div>
          )}

          <div className="flex gap-3 border-t border-slate-200 pt-4">
            <button
              type="submit"
              className="flex-1 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Simpan Perubahan
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-300 px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
