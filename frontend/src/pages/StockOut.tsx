import { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useBusinessContext } from "@/context";
import { TrendingDown, Trash2, X } from "lucide-react";
import { Button } from "@/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function StockOut() {
  const { products, stockOuts, addStockOut, deleteStockOut } = useBusinessContext();
  const { toast } = useToast();

  const [showStockOutForm, setShowStockOutForm] = useState(false);
  const [filterProductDaily, setFilterProductDaily] = useState<string>("");

  // Catat Stok Keluar Form State
  const [stockOutForm, setStockOutForm] = useState({
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

  // Filter stock outs for today (based on createdAt - when submitted)
  const dailyStockOuts = useMemo(() => {
    const { startDate, endDate } = getTodayRange();

    let filtered = (stockOuts || []).filter((item) => {
      const createdAtDate = new Date(item.createdAt);
      return createdAtDate >= startDate && createdAtDate <= endDate;
    });

    if (filterProductDaily) {
      filtered = filtered.filter((item) => item.productId === filterProductDaily);
    }

    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [stockOuts, filterProductDaily]);


  const totalStockOut = dailyStockOuts.reduce((sum, item) => sum + item.quantity, 0) || 0;

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

  const selectedProduct = products.find((p) => p.id === stockOutForm.productId);

  const handleSelectProduct = (productId: string) => {
    setStockOutForm({ ...stockOutForm, productId });
    setSearchQuery("");
    setShowDropdown(false);
  };

  const handleClearProduct = () => {
    setStockOutForm({ ...stockOutForm, productId: "" });
    setSearchQuery("");
    setShowDropdown(false);
  };

  // Handle Catat Stok Keluar Submit
  const handleStockOutSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!stockOutForm.productId) {
      toast({
        title: "Error",
        description: "Pilih produk terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    if (stockOutForm.quantity <= 0) {
      toast({
        title: "Error",
        description: "Jumlah keluar harus lebih dari 0",
        variant: "destructive",
      });
      return;
    }

    const product = products.find((p) => p.id === stockOutForm.productId);
    if (!product) {
      toast({
        title: "Error",
        description: "Produk tidak ditemukan",
        variant: "destructive",
      });
      return;
    }

    if (product.stock < stockOutForm.quantity) {
      toast({
        title: "Error",
        description: `Stok ${product.name} tidak mencukupi. Stok tersedia: ${product.stock} unit`,
        variant: "destructive",
      });
      return;
    }

    addStockOut({
      productId: stockOutForm.productId,
      productName: product.name,
      quantity: stockOutForm.quantity,
      date: new Date(stockOutForm.date),
      notes: stockOutForm.notes || undefined,
    });

    toast({
      title: "Berhasil",
      description: `${stockOutForm.quantity} unit ${product.name} berhasil dicatat`,
    });

    // Reset form
    setStockOutForm({
      productId: "",
      quantity: 0,
      date: new Date().toISOString().split("T")[0],
      notes: "",
    });
    setShowStockOutForm(false);
  };

  const handleDeleteStockOut = (id: string) => {
    if (window.confirm("Yakin ingin menghapus catatan ini?")) {
      deleteStockOut(id);
      toast({
        title: "Berhasil",
        description: "Catatan stok keluar berhasil dihapus",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="section-shell p-4 sm:p-5 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Catat Stok Keluar</h1>
            <p className="text-sm text-slate-600 mt-2">
              Catat setiap barang yang keluar dari gudang Anda
            </p>
          </div>
          <Button
            onClick={() => setShowStockOutForm(!showStockOutForm)}
            className="bg-red-600 text-white px-6 py-3 hover:bg-red-700 font-bold flex items-center gap-2 rounded-lg transition shadow-sm"
            disabled={products.length === 0}
          >
            <TrendingDown size={18} /> Catat Stok Keluar
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

        {/* Catat Stok Keluar Form */}
        {showStockOutForm && (
          <div className="section-shell bg-gradient-to-b from-red-50 to-white p-5">
            <h2 className="text-lg font-bold mb-4 text-red-900">Catat Stok Keluar</h2>

            {products.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">
                  Belum ada produk. Tambahkan produk baru terlebih dahulu.
                </p>
              </div>
            ) : (
              <form onSubmit={handleStockOutSubmit} className="space-y-4">
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
                            setStockOutForm({ ...stockOutForm, productId: "" });
                          }
                        }}
                        onFocus={() => setShowDropdown(true)}
                        className="flex-1 border border-red-300 bg-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300"
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
                      <div className="absolute top-full left-0 right-0 bg-white border border-red-300 border-t-0 rounded-b-lg max-h-40 overflow-y-auto z-10 shadow-sm">
                        {filteredProducts.length > 0 ? (
                          filteredProducts.map((product) => (
                            <button
                              key={product.id}
                              type="button"
                              onClick={() => handleSelectProduct(product.id)}
                              className="w-full text-left px-3 py-2 hover:bg-red-50 border-b border-slate-200 text-sm"
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
                    const selectedProduct = products.find(p => p.id === stockOutForm.productId);
                    return (
                      <label className="block text-sm font-bold mb-2">
                        Jumlah Keluar {selectedProduct && <span className="text-gray-600">({selectedProduct.unit})</span>} <span className="text-red-600">*</span>
                      </label>
                    );
                  })()}
                  <input
                    type="number"
                    value={stockOutForm.quantity}
                    onChange={(e) =>
                      setStockOutForm({
                        ...stockOutForm,
                        quantity: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full border border-red-300 bg-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300"
                    placeholder="0"
                    min="0"
                    max={selectedProduct?.stock || 0}
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-bold mb-2">
                    Tanggal <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="date"
                    value={stockOutForm.date}
                    onChange={(e) =>
                      setStockOutForm({ ...stockOutForm, date: e.target.value })
                    }
                    className="w-full border border-red-300 bg-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300"
                  />
                </div>

                {/* Notes / Reason */}
                <div>
                  <label className="block text-sm font-bold mb-2">
                    Alasan / Catatan (Opsional)
                  </label>
                  <textarea
                    value={stockOutForm.notes}
                    onChange={(e) =>
                      setStockOutForm({ ...stockOutForm, notes: e.target.value })
                    }
                    className="w-full border border-red-300 bg-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300"
                    placeholder="Contoh: Penjualan, rusak, hilang, dll..."
                    rows={2}
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-2 pt-4 border-t border-red-200">
                  <button
                    type="submit"
                    className="flex-1 bg-red-600 text-white px-4 py-2 hover:bg-red-700 font-bold rounded-lg transition"
                  >
                    Simpan
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowStockOutForm(false)}
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
          <div className="section-shell bg-gradient-to-r from-red-50 to-white p-4">
            <p className="text-sm font-semibold text-gray-900">
              Total Stok Keluar: <span className="text-red-600">{totalStockOut} unit</span>
            </p>
          </div>
        )}

        {/* Daily History Section */}
        {products.length > 0 && (
          <section className="section-shell p-4 sm:p-5 space-y-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Riwayat Harian Stok Keluar</h2>
              <p className="text-sm text-gray-600">Daftar stok keluar hari ini (terbaru di atas)</p>
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
            {dailyStockOuts.length === 0 ? (
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
                      {dailyStockOuts.map((item) => {
                        const product = products.find(p => p.id === item.productId);
                        return (
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
                              {item.productName} {product && <span className="text-gray-600 text-xs">({product.unit})</span>}
                            </td>
                            <td className="py-3 px-4 text-sm text-center text-red-600 font-bold">
                              -{item.quantity}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600">
                              {item.notes || "-"}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <button
                                onClick={() => handleDeleteStockOut(item.id)}
                                className="inline-flex items-center gap-1 border border-red-300 text-red-600 px-2 py-1 hover:bg-red-50 font-bold text-xs rounded-lg transition"
                              >
                                <Trash2 size={12} /> Hapus
                              </button>
                            </td>
                          </tr>
                        );
                      })}
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
