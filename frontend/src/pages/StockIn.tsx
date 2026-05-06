import { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useBusinessContext } from "@/context";
import { TrendingUp, Trash2, Plus, X } from "lucide-react";
import { Button } from "@/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function StockIn() {
  const { products, stockIns, addStockIn, deleteStockIn } = useBusinessContext();
  const { toast } = useToast();

  const [showStockInForm, setShowStockInForm] = useState(false);
  const [filterProductDaily, setFilterProductDaily] = useState<string>("");

  // Catat Stok Masuk Form State
  const [stockInForm, setStockInForm] = useState({
    productId: "",
    quantity: 0,
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);


  // Get today's date range (based on createdAt)
  const getTodayRange = () => {
    const now = new Date();
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    return { startDate, endDate: now };
  };

  // Filter stock ins for today (based on createdAt - when submitted)
  const dailyStockIns = useMemo(() => {
    const { startDate, endDate } = getTodayRange();

    let filtered = (stockIns || []).filter((item) => {
      const createdAtDate = new Date(item.createdAt);
      return createdAtDate >= startDate && createdAtDate <= endDate;
    });

    if (filterProductDaily) {
      filtered = filtered.filter((item) => item.productId === filterProductDaily);
    }

    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [stockIns, filterProductDaily]);


  const totalStockIn = dailyStockIns.reduce((sum, item) => sum + item.quantity, 0);

  // Filter products based on search (show all when focused, filter when typing)
  const filteredProducts = useMemo(() => {
    if (searchQuery) {
      return products
        .filter((p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 10);
    }
    // Show all products when focused but not typing
    return products.slice(0, 10);
  }, [searchQuery, products]);

  const selectedProduct = products.find((p) => p.id === stockInForm.productId);

  const handleSelectProduct = (productId: string) => {
    setStockInForm({ ...stockInForm, productId });
    setSearchQuery("");
    setShowDropdown(false);
  };

  const handleClearProduct = () => {
    setStockInForm({ ...stockInForm, productId: "" });
    setSearchQuery("");
    setShowDropdown(false);
  };

  // Handle Catat Stok Masuk Submit
  const handleStockInSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!stockInForm.productId) {
      toast({
        title: "Error",
        description: "Pilih produk terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    if (stockInForm.quantity <= 0) {
      toast({
        title: "Error",
        description: "Jumlah masuk harus lebih dari 0",
        variant: "destructive",
      });
      return;
    }

    const product = products.find((p) => p.id === stockInForm.productId);
    if (!product) {
      toast({
        title: "Error",
        description: "Produk tidak ditemukan",
        variant: "destructive",
      });
      return;
    }

    addStockIn({
      productId: stockInForm.productId,
      productName: product.name,
      quantity: stockInForm.quantity,
      date: new Date(stockInForm.date),
      notes: stockInForm.notes || undefined,
    });

    toast({
      title: "Berhasil",
      description: `${stockInForm.quantity} unit ${product.name} berhasil dicatat`,
    });

    // Reset form
    setStockInForm({
      productId: "",
      quantity: 0,
      date: new Date().toISOString().split("T")[0],
      notes: "",
    });
    setShowStockInForm(false);
  };


  const handleDeleteStockIn = (id: string) => {
    if (window.confirm("Yakin ingin menghapus catatan ini?")) {
      deleteStockIn(id);
      toast({
        title: "Berhasil",
        description: "Catatan stok masuk berhasil dihapus",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="section-shell p-4 sm:p-5 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Stok Masuk</h1>
            <p className="text-sm text-slate-600 mt-2">
              Catat stok masuk dari supplier di sini
            </p>
          </div>
          <Button
            onClick={() => setShowStockInForm(!showStockInForm)}
            className="bg-green-600 text-white px-6 py-3 hover:bg-green-700 font-bold flex items-center gap-2 rounded-lg transition shadow-sm"
            disabled={products.length === 0}
          >
            <TrendingUp size={18} /> Catat Stok Masuk
          </Button>
        </div>

        {/* Empty State for No Products */}
        {products.length === 0 && (
          <div className="section-shell bg-yellow-50 p-6">
            <p className="text-gray-700 text-center mb-4">
              Belum ada produk. Produk harus ditambahkan di Daftar Produk terlebih
              dahulu.
            </p>
            <div className="flex justify-center">
              <a
                href="/products"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition text-sm"
              >
                Tambah Produk
              </a>
            </div>
          </div>
        )}

        {/* Catat Stok Masuk Form */}
        {showStockInForm && (
          <div className="section-shell bg-gradient-to-b from-green-50 to-white p-5">
            <h2 className="text-lg font-bold mb-4 text-green-900">Catat Stok Masuk</h2>

            {products.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">
                  Belum ada produk. Tambahkan produk baru terlebih dahulu.
                </p>
              </div>
            ) : (
              <form onSubmit={handleStockInSubmit} className="space-y-4">
                {/* Product Selection - Searchable */}
                <div>
                  <label className="block text-sm font-bold mb-2">
                    Produk <span className="text-red-600">*</span>
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
                            setStockInForm({ ...stockInForm, productId: "" });
                          }
                        }}
                        onFocus={() => setShowDropdown(true)}
                        className="flex-1 border border-green-300 bg-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300"
                      />
                      {selectedProduct && (
                        <button
                          type="button"
                          onClick={handleClearProduct}
                          className="absolute right-2 text-gray-400 hover:text-gray-600"
                        >
                          <X size={18} />
                        </button>
                      )}
                    </div>
                    {showDropdown && (
                      <div className="absolute top-full left-0 right-0 bg-white border border-green-300 border-t-0 rounded-b-lg max-h-40 overflow-y-auto z-10 shadow-sm">
                        {filteredProducts.length > 0 ? (
                          filteredProducts.map((product) => (
                            <button
                              key={product.id}
                              type="button"
                              onClick={() => handleSelectProduct(product.id)}
                              className="w-full text-left px-3 py-2 hover:bg-green-50 border-b border-slate-200 text-sm"
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

                {/* Quantity */}
                <div>
                  {(() => {
                    const selectedProduct = products.find(p => p.id === stockInForm.productId);
                    return (
                      <label className="block text-sm font-bold mb-2">
                        Jumlah Masuk {selectedProduct && <span className="text-gray-600">({selectedProduct.unit})</span>} <span className="text-red-600">*</span>
                      </label>
                    );
                  })()}
                  <input
                    type="number"
                    value={stockInForm.quantity}
                    onChange={(e) =>
                      setStockInForm({
                        ...stockInForm,
                        quantity: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full border border-green-300 bg-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300"
                    placeholder="0"
                    min="0"
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-bold mb-2">
                    Tanggal <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="date"
                    value={stockInForm.date}
                    onChange={(e) =>
                      setStockInForm({ ...stockInForm, date: e.target.value })
                    }
                    className="w-full border border-green-300 bg-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-bold mb-2">
                    Catatan (Opsional)
                  </label>
                  <textarea
                    value={stockInForm.notes}
                    onChange={(e) =>
                      setStockInForm({ ...stockInForm, notes: e.target.value })
                    }
                    className="w-full border border-green-300 bg-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300"
                    placeholder="Contoh: Pengiriman dari supplier..."
                    rows={2}
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-2 pt-4 border-t border-green-200">
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 text-white px-4 py-2 hover:bg-green-700 font-bold rounded-lg transition"
                  >
                    Simpan
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowStockInForm(false)}
                    className="flex-1 border border-slate-300 text-slate-700 px-4 py-2 hover:bg-slate-100 font-bold rounded-lg transition"
                  >
                    Batal
                  </button>
                </div>
              </form>
            )}
          </div>
        )}


        {/* Summary */}
        {products.length > 0 && (
          <div className="section-shell bg-gradient-to-r from-green-50 to-white p-4">
            <p className="text-sm font-semibold text-gray-900">
              Total Stok Masuk: <span className="text-green-600">{totalStockIn} unit</span>
            </p>
          </div>
        )}

        {/* Daily History Section */}
        {products.length > 0 && (
          <section className="section-shell p-4 sm:p-5 space-y-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Riwayat Harian Stok Masuk</h2>
              <p className="text-sm text-gray-600">Daftar stok masuk hari ini (terbaru di atas)</p>
            </div>

            {/* Product Filter for Daily */}
            <select
              value={filterProductDaily}
              onChange={(e) => setFilterProductDaily(e.target.value)}
              className="border border-slate-300 px-3 py-2 rounded-lg text-sm max-w-xs bg-white"
            >
              <option value="">Semua Produk</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>

            {/* Daily History Table */}
            {dailyStockIns.length === 0 ? (
              <div className="border-2 border-gray-300 bg-gray-50 rounded-lg p-8 text-center">
                <p className="text-gray-600 text-sm">Belum ada riwayat stok harian.</p>
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50/90 border-b border-slate-200">
                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-700">
                          Tanggal & Jam
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-700">
                          Produk
                        </th>
                        <th className="text-center py-3 px-4 text-xs font-bold text-gray-700">
                          Jumlah
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-700">
                          Catatan
                        </th>
                        <th className="text-center py-3 px-4 text-xs font-bold text-gray-700">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {dailyStockIns.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50 transition">
                          <td className="py-3 px-4 text-sm text-gray-900">
                            <div>
                              {new Date(item.createdAt).toLocaleDateString("id-ID", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              })}
                            </div>
                            <span className="text-gray-600 text-xs">
                              {new Date(item.createdAt).toLocaleTimeString("id-ID", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm font-semibold text-gray-900">
                            {item.productName}
                          </td>
                          <td className="py-3 px-4 text-sm text-center text-green-600 font-bold">
                            +{item.quantity}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {item.notes || "-"}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => handleDeleteStockIn(item.id)}
                              className="inline-flex items-center gap-1 border border-red-300 text-red-600 px-2 py-1 hover:bg-red-50 font-bold text-xs rounded-lg transition"
                            >
                              <Trash2 size={12} /> Hapus
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        )}

      </div>
    </DashboardLayout>
  );
}
