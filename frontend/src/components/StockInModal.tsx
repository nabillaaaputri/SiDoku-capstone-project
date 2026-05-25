import { useState } from "react";
import { useBusinessContext } from "@/context";
import { Button } from "@/ui/button";
import { AlertCircle, X as XIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StockInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function StockInModal({ isOpen, onClose }: StockInModalProps) {
  const { products, addStockIn } = useBusinessContext();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    productId: "",
    quantity: 0,
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  // Filter products based on search (show all when focused, filter when typing)
  const filteredProducts = (() => {
    if (searchQuery) {
      return products
        .filter((p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 10);
    }
    // Show all products when focused but not typing
    return products.slice(0, 10);
  })();

  const selectedProduct = products.find((p) => p.id === formData.productId);

  const handleSelectProduct = (productId: string) => {
    setFormData({ ...formData, productId });
    setSearchQuery("");
    setShowDropdown(false);
  };

  const handleClearProduct = () => {
    setFormData({ ...formData, productId: "" });
    setSearchQuery("");
    setShowDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent, saveAgain: boolean = false) => {
    e.preventDefault();

    if (!formData.productId) {
      toast({
        title: "Error",
        description: "Pilih produk terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    if (formData.quantity <= 0) {
      toast({
        title: "Error",
        description: "Jumlah masuk harus lebih dari 0",
        variant: "destructive",
      });
      return;
    }

    const product = products.find((p) => p.id === formData.productId);
    if (!product) {
      toast({
        title: "Error",
        description: "Produk tidak ditemukan",
        variant: "destructive",
      });
      return;
    }

    await addStockIn({
      productId: formData.productId,
      productName: product.name,
      quantity: formData.quantity,
      date: new Date(formData.date),
      notes: formData.notes || undefined,
    });

    toast({
      title: "Berhasil",
      description: `${formData.quantity} unit ${product.name} berhasil ditambahkan ke stok`,
    });

    if (saveAgain) {
      // Reset form for next entry
      setFormData({
        productId: "",
        quantity: 0,
        date: new Date().toISOString().split("T")[0],
        notes: "",
      });
      setSearchQuery("");
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      productId: "",
      quantity: 0,
      date: new Date().toISOString().split("T")[0],
      notes: "",
    });
    setSearchQuery("");
    setShowDropdown(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white border-4 border-black p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Catat Stok Masuk</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            <XIcon size={24} />
          </button>
        </div>

        {products.length === 0 ? (
          <div className="space-y-4">
            <p className="text-gray-600 text-center py-8">
              Belum ada produk. Tambahkan produk di Daftar Produk terlebih dahulu.
            </p>
            <div className="flex gap-2 pt-4 border-t-2 border-gray-200">
              <Button
                type="button"
                onClick={handleClose}
                className="flex-1 border-2 border-black px-4 py-2 hover:bg-gray-100 font-bold"
              >
                Tutup
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={(e) => void handleSubmit(e, false)} className="space-y-4">
            {/* Product Selection - Searchable */}
            <div className="relative">
              <label className="block text-sm font-bold mb-2">
                Pilih Produk <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <div className="flex items-center">
                  <input
                    type="text"
                    placeholder="Cari produk..."
                    value={selectedProduct ? selectedProduct.name : searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowDropdown(true);
                      if (selectedProduct) {
                        setFormData({ ...formData, productId: "" });
                      }
                    }}
                    onFocus={() => setShowDropdown(true)}
                    className="flex-1 border-2 border-black px-3 py-2"
                  />
                  {selectedProduct && (
                    <button
                      type="button"
                      onClick={handleClearProduct}
                      className="absolute right-2 text-gray-400 hover:text-gray-600"
                    >
                      <XIcon size={18} />
                    </button>
                  )}
                </div>
                {showDropdown && (
                  <div className="absolute top-full left-0 right-0 bg-white border-2 border-black border-t-0 max-h-40 overflow-y-auto z-10">
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map((product) => (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => handleSelectProduct(product.id)}
                          className="w-full text-left px-3 py-2 hover:bg-gray-100 border-b border-gray-200 text-sm"
                        >
                          <span className="font-semibold">{product.name}</span>
                          <span className="text-gray-600 text-xs block">
                            {product.category} - {product.unit}
                          </span>
                        </button>
                      ))
                    ) : searchQuery ? (
                      <div className="px-3 py-2 text-sm text-gray-600 text-center">
                        Produk tidak ditemukan
                      </div>
                    ) : (
                      <div className="px-3 py-2 text-sm text-gray-600 text-center">
                        Tidak ada produk
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Quantity Input */}
            <div>
              <label className="block text-sm font-bold mb-2">
                Jumlah Masuk {selectedProduct && <span className="text-gray-600">({selectedProduct.unit})</span>} <span className="text-red-600">*</span>
              </label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    quantity: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full border-2 border-black px-3 py-2"
                placeholder="0"
                min="0"
              />
            </div>

            {/* Date Input */}
            <div>
              <label className="block text-sm font-bold mb-2">
                Tanggal <span className="text-red-600">*</span>
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="w-full border-2 border-black px-3 py-2"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-bold mb-2">
                Catatan (Opsional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className="w-full border-2 border-black px-3 py-2"
                placeholder="Contoh: Pengiriman dari supplier..."
                rows={2}
              />
            </div>

            {/* Stock Preview */}
            {selectedProduct && formData.quantity > 0 && (
              <div className="border-2 border-green-500 bg-green-50 p-3 flex gap-3">
                <AlertCircle
                  size={20}
                  className="text-green-600 flex-shrink-0"
                />
                <div>
                  <p className="text-sm font-bold text-green-700">
                    Stok {selectedProduct.name} akan berubah dari{" "}
                    <strong>{selectedProduct.stock}</strong> menjadi{" "}
                    <strong>{selectedProduct.stock + formData.quantity}</strong>
                  </p>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex flex-col gap-2 pt-4 border-t-2 border-gray-200">
              <button
                type="submit"
                className="w-full border-2 border-green-600 bg-green-600 text-white px-4 py-2 hover:bg-green-700 font-bold rounded transition"
              >
                Simpan
              </button>
              <button
                type="button"
                onClick={(e) => handleSubmit(e as any, true)}
                className="w-full border-2 border-green-600 text-green-600 px-4 py-2 hover:bg-green-50 font-bold rounded transition"
              >
                Simpan & Tambah Lagi
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="w-full border-2 border-gray-300 text-gray-700 px-4 py-2 hover:bg-gray-100 font-bold rounded transition"
              >
                Batal
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
