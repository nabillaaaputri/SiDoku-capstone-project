import { Product } from "@/types";
import { X } from "lucide-react";
import { useState, useEffect } from "react";

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
  });

  useEffect(() => {
    setFormData({
      name: product.name,
      category: product.category,
      unit: product.unit,
      costPrice: product.costPrice,
      sellPrice: product.sellPrice,
    });
  }, [product, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold">Edit Produk</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Nama Produk */}
          <div>
            <label className="block text-sm font-bold mb-2">
              Nama Produk <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full border-2 border-gray-300 px-3 py-2 rounded focus:outline-none focus:border-blue-600"
              placeholder="Nama produk"
              required
            />
          </div>

          {/* Kategori */}
          <div>
            <label className="block text-sm font-bold mb-2">
              Kategori <span className="text-red-600">*</span>
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full border-2 border-gray-300 px-3 py-2 rounded focus:outline-none focus:border-blue-600"
              required
            >
              <option value="Makanan">Makanan</option>
              <option value="Minuman">Minuman</option>
              <option value="Barang">Barang</option>
              <option value="Bahan Baku">Bahan Baku</option>
              <option value="Peralatan">Peralatan</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>

          {/* Satuan */}
          <div>
            <label className="block text-sm font-bold mb-2">
              Satuan <span className="text-red-600">*</span>
            </label>
            <select
              value={formData.unit}
              onChange={(e) =>
                setFormData({ ...formData, unit: e.target.value })
              }
              className="w-full border-2 border-gray-300 px-3 py-2 rounded focus:outline-none focus:border-blue-600"
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

          {/* Harga Beli */}
          <div>
            <label className="block text-sm font-bold mb-2">
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
              className="w-full border-2 border-gray-300 px-3 py-2 rounded focus:outline-none focus:border-blue-600"
              placeholder="0"
              min="0"
              required
            />
          </div>

          {/* Harga Jual */}
          <div>
            <label className="block text-sm font-bold mb-2">
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
              className="w-full border-2 border-gray-300 px-3 py-2 rounded focus:outline-none focus:border-blue-600"
              placeholder="0"
              min="0"
              required
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-4 border-t border-gray-200">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 font-bold rounded transition"
            >
              Simpan
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border-2 border-gray-400 text-gray-700 px-4 py-2 hover:bg-gray-100 font-bold rounded transition"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
