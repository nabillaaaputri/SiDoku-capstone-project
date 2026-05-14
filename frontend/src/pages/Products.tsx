import { useState } from "react";
import { Edit2, Trash2, Plus, RotateCcw } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useBusinessContext } from "@/context";
import { useToast } from "@/hooks/use-toast";
import EditProductModal from "@/components/EditProductModal";
import ArchiveConfirmDialog from "@/components/ArchiveConfirmDialog";
import { Product } from "@/types";
import { Button } from "@/ui/button";

export default function Products() {
  const { products, addProduct, updateProduct, archiveProduct, restoreProduct } = useBusinessContext();
  const { toast } = useToast();

  // Filter active (non-archived) products
  const activeProducts = products.filter((p) => p.archived !== true);
  const archivedProducts = products.filter((p) => p.archived === true);

  const [showAddProductForm, setShowAddProductForm] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"active" | "archived">("active");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [archiveProductId, setArchiveProductId] = useState<string | null>(null);

  const [addProductForm, setAddProductForm] = useState({
    name: "",
    costPrice: 0,
    sellPrice: 0,
    stock: 0,
    minimumStock: 10,
    category: "Barang",
    unit: "pcs",
  });

  // Handle Tambah Produk Baru Submit
  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!addProductForm.name.trim()) {
      toast({
        title: "Error",
        description: "Nama produk harus diisi",
        variant: "destructive",
      });
      return;
    }

    if (addProductForm.sellPrice < addProductForm.costPrice) {
      toast({
        title: "Error",
        description: "Harga jual harus lebih besar atau sama dengan harga beli",
        variant: "destructive",
      });
      return;
    }

    const productName = addProductForm.name;
    await addProduct({
      name: addProductForm.name,
      costPrice: addProductForm.costPrice,
      sellPrice: addProductForm.sellPrice,
      stock: addProductForm.stock,
      minimumStock: addProductForm.minimumStock,
      category: addProductForm.category,
      unit: addProductForm.unit,
      archived: false,
    });

    toast({
      title: "Berhasil",
      description: `Produk ${productName} berhasil ditambahkan`,
    });

    // Reset form
    setAddProductForm({
      name: "",
      costPrice: 0,
      sellPrice: 0,
      stock: 0,
      minimumStock: 10,
      category: "Barang",
      unit: "pcs",
    });
    setShowAddProductForm(false);
    setCategoryFilter(null);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
  };

  const handleSaveEdit = async (updatedData: Partial<Product>) => {
    if (editingProduct) {
      if (!updatedData.name?.trim()) {
        toast({
          title: "Error",
          description: "Nama produk harus diisi",
          variant: "destructive",
        });
        return;
      }

      if (updatedData.sellPrice && updatedData.costPrice && updatedData.sellPrice < updatedData.costPrice) {
        toast({
          title: "Error",
          description: "Harga jual harus lebih besar atau sama dengan harga beli",
          variant: "destructive",
        });
        return;
      }

      await updateProduct(editingProduct.id, updatedData);
      toast({
        title: "Berhasil",
        description: "Produk berhasil diperbarui",
      });
      setEditingProduct(null);
    }
  };

  const handleArchiveProduct = (productId: string) => {
    setArchiveProductId(productId);
  };

  const handleConfirmArchive = async () => {
    if (archiveProductId) {
      const product = products.find((p) => p.id === archiveProductId);
      await archiveProduct(archiveProductId);
      toast({
        title: "Berhasil",
        description: `Produk ${product?.name} berhasil diarsipkan`,
      });
    }
    setArchiveProductId(null);
  };

  const handleRestoreProduct = async (productId: string) => {
    const product = products.find((p) => p.id === productId);
    await restoreProduct(productId);
    toast({
      title: "Berhasil",
      description: `Produk ${product?.name} berhasil dipulihkan`,
    });
  };

  const getStockStatus = (stock: number, minimumStock: number) => {
    if (stock === 0) return { label: "Habis", color: "bg-red-100 text-red-700" };
    if (stock <= minimumStock) return { label: "Menipis", color: "bg-yellow-100 text-yellow-700" };
    return { label: "Aman", color: "bg-green-100 text-green-700" };
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="section-shell p-4 sm:p-5">
          <h1 className="text-3xl font-bold text-slate-900">Daftar Barang</h1>
          <p className="text-sm text-slate-600 mt-2">
            Kelola semua produk usaha Anda di sini.
          </p>
        </div>

        {/* Action Button */}
        <Button
          onClick={() => setShowAddProductForm(!showAddProductForm)}
          className="bg-blue-600 text-white px-6 py-3 hover:bg-blue-700 font-bold flex items-center justify-center gap-2 rounded-lg transition w-full sm:w-auto shadow-sm"
        >
          <Plus size={18} /> Tambah Produk Baru
        </Button>

        {/* Tambah Produk Baru Form */}
        {showAddProductForm && (
          <div className="section-shell bg-gradient-to-b from-blue-50 to-white p-5">
            <h2 className="text-lg font-bold mb-4 text-blue-900">Tambah Produk Baru</h2>

            <form onSubmit={handleAddProductSubmit} className="space-y-4">
              {/* Product Name */}
              <div>
                <label className="block text-sm font-bold mb-2">
                  Nama Produk <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={addProductForm.name}
                  onChange={(e) =>
                    setAddProductForm({ ...addProductForm, name: e.target.value })
                  }
                  className="w-full border border-blue-300 bg-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="Contoh: Minyak Kelapa 1L"
                />
              </div>

              {/* Cost Price */}
              <div>
                <label className="block text-sm font-bold mb-2">
                  Harga Modal (Rp) <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  value={addProductForm.costPrice}
                  onChange={(e) =>
                    setAddProductForm({
                      ...addProductForm,
                      costPrice: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full border border-blue-300 bg-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="0"
                  min="0"
                />
              </div>

              {/* Sell Price */}
              <div>
                <label className="block text-sm font-bold mb-2">
                  Harga Jual (Rp) <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  value={addProductForm.sellPrice}
                  onChange={(e) =>
                    setAddProductForm({
                      ...addProductForm,
                      sellPrice: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full border border-blue-300 bg-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="0"
                  min="0"
                />
              </div>

              {/* Minimum Stock */}
              <div>
                <label className="block text-sm font-bold mb-2">
                  Stok Minimum <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  value={addProductForm.minimumStock}
                  onChange={(e) =>
                    setAddProductForm({
                      ...addProductForm,
                      minimumStock: parseInt(e.target.value) || 10,
                    })
                  }
                  className="w-full border border-blue-300 bg-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="10"
                  min="1"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-bold mb-2">
                  Kategori <span className="text-red-600">*</span>
                </label>
                <select
                  value={addProductForm.category}
                  onChange={(e) =>
                    setAddProductForm({
                      ...addProductForm,
                      category: e.target.value,
                    })
                  }
                  className="w-full border border-blue-300 bg-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  <option value="Makanan">Makanan</option>
                  <option value="Minuman">Minuman</option>
                  <option value="Barang">Barang</option>
                  <option value="Bahan Baku">Bahan Baku</option>
                  <option value="Peralatan">Peralatan</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              {/* Unit */}
              <div>
                <label className="block text-sm font-bold mb-2">
                  Satuan <span className="text-red-600">*</span>
                </label>
                <select
                  value={addProductForm.unit}
                  onChange={(e) =>
                    setAddProductForm({
                      ...addProductForm,
                      unit: e.target.value,
                    })
                  }
                  className="w-full border border-blue-300 bg-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
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

              {/* Initial Stock */}
              <div>
                <label className="block text-sm font-bold mb-2">
                  Stok Awal (Opsional)
                </label>
                <input
                  type="number"
                  value={addProductForm.stock}
                  onChange={(e) =>
                    setAddProductForm({
                      ...addProductForm,
                      stock: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full border border-blue-300 bg-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="0"
                  min="0"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-2 pt-4 border-t border-blue-200">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 font-bold rounded-lg transition"
                >
                  Tambah Produk
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddProductForm(false)}
                  className="flex-1 border border-slate-300 text-slate-700 px-4 py-2 hover:bg-slate-100 font-bold rounded-lg transition"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Stock Summary */}
        {activeProducts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="section-shell bg-gradient-to-br from-blue-50 to-white p-3">
              <p className="text-xs font-bold text-blue-700 mb-2">TOTAL PRODUK</p>
              <p className="text-3xl font-bold text-blue-600">{activeProducts.length}</p>
            </div>
            <div className="section-shell bg-gradient-to-br from-yellow-50 to-white p-3">
              <p className="text-xs font-bold text-yellow-700 mb-2">STOK MENIPIS</p>
              <p className="text-3xl font-bold text-yellow-600">
                {activeProducts.filter(p => p.stock <= p.minimumStock && p.stock > 0).length}
              </p>
            </div>
            <div className="section-shell bg-gradient-to-br from-red-50 to-white p-3">
              <p className="text-xs font-bold text-red-700 mb-2">STOK HABIS</p>
              <p className="text-3xl font-bold text-red-600">
                {activeProducts.filter(p => p.stock === 0).length}
              </p>
            </div>
          </div>
        )}

        {/* View Mode Tabs */}
        <div className="section-shell p-2 inline-flex gap-2 mb-2">
          <button
            onClick={() => {
              setViewMode("active");
              setCategoryFilter(null);
            }}
            className={`px-4 py-2 font-bold rounded-lg transition ${
              viewMode === "active"
                ? "bg-blue-600 text-white"
                : "text-gray-700 hover:bg-slate-100"
            }`}
          >
            Produk Aktif ({activeProducts.length})
          </button>
          <button
            onClick={() => {
              setViewMode("archived");
              setCategoryFilter(null);
            }}
            className={`px-4 py-2 font-bold rounded-lg transition ${
              viewMode === "archived"
                ? "bg-red-600 text-white"
                : "text-gray-700 hover:bg-slate-100"
            }`}
          >
            Produk Arsip ({archivedProducts.length})
          </button>
        </div>

        {/* Products List */}
        <div className="section-shell p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
            <h2 className="text-lg font-bold pb-2 flex-1 text-slate-900">
              {viewMode === "active"
                ? `Daftar Barang (${categoryFilter ? activeProducts.filter(p => p.category === categoryFilter).length : activeProducts.length})`
                : `Produk Arsip (${archivedProducts.length})`
              }
            </h2>
            {viewMode === "active" && (
              <select
                value={categoryFilter || ""}
                onChange={(e) => setCategoryFilter(e.target.value || null)}
                className="border border-slate-300 px-3 py-2 rounded-lg text-sm font-semibold bg-white"
              >
                <option value="">Semua Kategori</option>
                <option value="Makanan">Makanan</option>
                <option value="Minuman">Minuman</option>
                <option value="Barang">Barang</option>
                <option value="Bahan Baku">Bahan Baku</option>
                <option value="Peralatan">Peralatan</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            )}
          </div>

          {(viewMode === "active" ? activeProducts.length === 0 : archivedProducts.length === 0) ? (
            <div className="text-center py-12">
              <p className="text-gray-600">
                {viewMode === "active"
                  ? "Belum ada produk. Mulai dengan membuat produk baru."
                  : "Tidak ada produk yang diarsipkan."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80">
                    <th className="text-left py-2 px-2 font-bold text-sm">
                      Nama Produk
                    </th>
                    <th className="text-left py-2 px-2 font-bold text-sm">
                      Kategori
                    </th>
                    <th className="text-left py-2 px-2 font-bold text-sm">
                      Satuan
                    </th>
                    <th className="text-right py-2 px-2 font-bold text-sm">
                      Harga Beli
                    </th>
                    <th className="text-right py-2 px-2 font-bold text-sm">
                      Harga Jual
                    </th>
                    <th className="text-right py-2 px-2 font-bold text-sm">
                      Margin
                    </th>
                    <th className="text-center py-2 px-2 font-bold text-sm">
                      Stok
                    </th>
                    <th className="text-center py-2 px-2 font-bold text-sm">
                      Status
                    </th>
                    <th className="text-center py-2 px-2 font-bold text-sm">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(viewMode === "active"
                    ? activeProducts.filter(p => !categoryFilter || p.category === categoryFilter)
                    : archivedProducts
                  ).map((product) => {
                    const margin =
                      ((product.sellPrice - product.costPrice) /
                        product.costPrice) *
                      100;
                    const statusInfo = getStockStatus(product.stock, product.minimumStock);

                    return (
                      <tr
                        key={product.id}
                        className="border-b border-gray-200 hover:bg-gray-50"
                      >
                        <td className="py-2 px-2 text-sm font-medium">
                          {product.name}
                        </td>
                        <td className="py-2 px-2 text-sm">
                          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-semibold">
                            {product.category}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-sm font-semibold text-gray-700">
                          {product.unit}
                        </td>
                        <td className="py-2 px-2 text-sm text-right">
                          Rp {product.costPrice.toLocaleString("id-ID")}
                        </td>
                        <td className="py-2 px-2 text-sm text-right">
                          Rp {product.sellPrice.toLocaleString("id-ID")}
                        </td>
                        <td className="py-2 px-2 text-sm text-right font-bold">
                          {margin.toFixed(1)}%
                        </td>
                        <td className="py-2 px-2 text-sm text-center font-bold">
                          {product.stock}
                        </td>
                        <td className="py-2 px-2 text-center">
                          <span
                            className={`text-xs font-bold px-2 py-1 rounded ${statusInfo.color}`}
                          >
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-center">
                          <div className="flex items-center justify-center gap-3">
                            {viewMode === "active" ? (
                              <>
                                <button
                                  onClick={() => handleEditProduct(product)}
                                  className="flex items-center gap-1 px-2 py-1 hover:bg-blue-100 rounded transition text-blue-600 hover:text-blue-700 text-xs font-semibold"
                                >
                                  <Edit2 size={14} />
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleArchiveProduct(product.id)}
                                  className="flex items-center gap-1 px-2 py-1 hover:bg-red-100 rounded transition text-red-600 hover:text-red-700 text-xs font-semibold"
                                >
                                  <Trash2 size={14} />
                                  Arsipkan
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => handleRestoreProduct(product.id)}
                                className="flex items-center gap-1 px-2 py-1 hover:bg-green-100 rounded transition text-green-600 hover:text-green-700 text-xs font-semibold"
                              >
                                <RotateCcw size={14} />
                                Pulihkan
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* Edit Product Modal */}
      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          isOpen={!!editingProduct}
          onClose={() => setEditingProduct(null)}
          onSave={handleSaveEdit}
        />
      )}

      {/* Archive Confirmation Dialog */}
      {archiveProductId && (
        <ArchiveConfirmDialog
          productName={products.find((p) => p.id === archiveProductId)?.name || ""}
          isOpen={!!archiveProductId}
          onConfirm={handleConfirmArchive}
          onCancel={() => setArchiveProductId(null)}
        />
      )}
    </DashboardLayout>
  );
}
