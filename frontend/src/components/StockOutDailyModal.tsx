import { useState } from "react";
import { useBusinessContext } from "@/context";
import { Button } from "@/ui/button";
import { AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StockOutDailyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface StockOutItem {
  productId: string;
  quantity: number;
}

export default function StockOutDailyModal({
  isOpen,
  onClose,
}: StockOutDailyModalProps) {
  const { products, addStockOut } = useBusinessContext();
  const { toast } = useToast();
  const [selectedProductId, setSelectedProductId] = useState("");
  const [stockOutItems, setStockOutItems] = useState<StockOutItem[]>([]);

  const addProductToList = () => {
    if (!selectedProductId) {
      toast({
        title: "Error",
        description: "Pilih produk terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    // Check if product already in list
    if (stockOutItems.find((item) => item.productId === selectedProductId)) {
      toast({
        title: "Error",
        description: "Produk ini sudah ditambahkan",
        variant: "destructive",
      });
      return;
    }

    setStockOutItems([
      ...stockOutItems,
      { productId: selectedProductId, quantity: 0 },
    ]);
    setSelectedProductId("");
  };

  const updateItemQuantity = (productId: string, quantity: number) => {
    setStockOutItems(
      stockOutItems.map((item) =>
        item.productId === productId
          ? { ...item, quantity: Math.max(0, quantity) }
          : item
      )
    );
  };

  const removeItem = (productId: string) => {
    setStockOutItems(
      stockOutItems.filter((item) => item.productId !== productId)
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const itemsToRemove = stockOutItems.filter((item) => item.quantity > 0);

    if (itemsToRemove.length === 0) {
      toast({
        title: "Error",
        description: "Masukkan minimal satu produk dengan jumlah keluar",
        variant: "destructive",
      });
      return;
    }

    // Validate stock availability
    let hasError = false;
    for (const item of itemsToRemove) {
      const product = products.find((p) => p.id === item.productId);
      if (!product || product.stock < item.quantity) {
        toast({
          title: "Error",
          description: `Stok ${product?.name} tidak mencukupi. Stok tersedia: ${product?.stock}`,
          variant: "destructive",
        });
        hasError = true;
        break;
      }
    }

    if (hasError) return;

    // Add all stock outs
    for (const item of itemsToRemove) {
      const product = products.find((p) => p.id === item.productId);
      if (product) {
        addStockOut({
          productId: item.productId,
          productName: product.name,
          quantity: item.quantity,
          date: new Date(),
        });
      }
    }

    toast({
      title: "Berhasil",
      description: `Rekap stok keluar hari ini berhasil disimpan (${itemsToRemove.length} produk)`,
    });

    setStockOutItems([]);
    setSelectedProductId("");
    onClose();
  };

  const handleClose = () => {
    setStockOutItems([]);
    setSelectedProductId("");
    onClose();
  };

  if (!isOpen) return null;

  const totalItemsWithQuantity = stockOutItems.filter(
    (item) => item.quantity > 0
  ).length;

  const availableProducts = products.filter(
    (p) => !stockOutItems.find((item) => item.productId === p.id)
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white border-4 border-black p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold">Stok Keluar Harian</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          {new Date().toLocaleDateString("id-ID", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>

        {products.length === 0 ? (
          <div className="space-y-4">
            <p className="text-gray-600 text-center py-8">
              Belum ada produk. Tambahkan produk terlebih dahulu.
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
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Product Selection Dropdown */}
            <div className="space-y-2">
              <label className="block text-sm font-bold">Pilih Produk</label>
              <div className="flex gap-2">
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="flex-1 border-2 border-black px-3 py-2 text-sm"
                >
                  <option value="">-- Pilih Produk --</option>
                  {availableProducts.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} (Stok: {product.stock})
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  onClick={addProductToList}
                  className="border-2 border-black bg-black text-white px-4 py-2 hover:bg-gray-800 font-bold text-sm"
                >
                  Tambah
                </Button>
              </div>
            </div>

            {/* Selected Products List */}
            {stockOutItems.length > 0 && (
              <div className="border-2 border-black p-3 space-y-3">
                <p className="text-sm font-bold">Produk Terpilih:</p>
                {stockOutItems.map((item) => {
                  const product = products.find((p) => p.id === item.productId);
                  return (
                    <div
                      key={item.productId}
                      className="border-2 border-gray-300 p-2 rounded space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-sm">{product?.name}</p>
                        <button
                          type="button"
                          onClick={() => removeItem(item.productId)}
                          className="text-red-600 hover:text-red-700 font-bold text-sm"
                        >
                          Hapus
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600 w-20">
                          Stok: {product?.stock}
                        </span>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            updateItemQuantity(
                              item.productId,
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="flex-1 border-2 border-gray-300 px-2 py-1 text-center text-sm"
                          placeholder="0"
                          min="0"
                          max={product?.stock}
                        />
                        <span className="text-xs text-gray-600 w-12">unit</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Summary */}
            {totalItemsWithQuantity > 0 && (
              <div className="border-2 border-blue-500 bg-blue-50 p-3 flex gap-3">
                <AlertCircle size={20} className="text-blue-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-blue-700">
                    {totalItemsWithQuantity} produk akan dikurangi stoknya hari
                    ini
                  </p>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-2 pt-4 border-t-2 border-gray-200">
              <Button
                type="submit"
                className="flex-1 border-2 border-black bg-black text-white px-4 py-2 hover:bg-gray-800 font-bold"
              >
                Simpan Rekap Hari Ini
              </Button>
              <Button
                type="button"
                onClick={handleClose}
                variant="outline"
                className="flex-1 border-2 border-black px-4 py-2 hover:bg-gray-100 font-bold"
              >
                Batal
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
