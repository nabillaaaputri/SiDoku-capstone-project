import { useMemo, useState, type FormEvent } from "react";
import {
  AlertTriangle,
  Archive,
  CircleX,
  Filter,
  MoreVertical,
  Package,
  PencilLine,
  Plus,
  RotateCcw,
  Search,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useBusinessContext } from "@/context";
import { useToast } from "@/hooks/use-toast";
import EditProductModal from "@/components/EditProductModal";
import ArchiveConfirmDialog from "@/components/ArchiveConfirmDialog";
import { Product } from "@/types";
import { Button } from "@/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu";
import { Input } from "@/ui/input";

const UNIT_OPTIONS = ["pcs", "kg", "gram", "ml", "liter", "botol", "pack", "dus"];
const CATEGORY_OPTIONS = ["Makanan", "Minuman", "Barang", "Bahan Baku", "Peralatan", "Lainnya"];

type ViewMode = "active" | "archived";
type StockFilter = "all" | "aman" | "menipis" | "habis";

const currencyFormatter = new Intl.NumberFormat("id-ID");

function formatCurrency(value: number) {
  return `Rp ${currencyFormatter.format(value)}`;
}

function formatMargin(value: number) {
  return `${currencyFormatter.format(Math.round(value))}%`;
}

function getProfit(product: Product) {
  return product.sellPrice - product.costPrice;
}

function getMargin(product: Product) {
  if (typeof product.margin === "number") {
    return product.margin;
  }

  if (product.costPrice <= 0) {
    return 0;
  }

  return ((product.sellPrice - product.costPrice) / product.costPrice) * 100;
}

function getStockStatus(stock: number, minimumStock: number) {
  if (stock === 0) {
    return {
      key: "habis" as const,
      label: "Habis",
      className: "bg-red-50 text-red-700 ring-red-200",
    };
  }

  if (stock <= minimumStock) {
    return {
      key: "menipis" as const,
      label: "Menipis",
      className: "bg-amber-50 text-amber-700 ring-amber-200",
    };
  }

  return {
    key: "aman" as const,
    label: "Aman",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  };
}

export default function Products() {
  const {
    products,
    addProduct,
    updateProduct,
    archiveProduct,
    restoreProduct,
  } = useBusinessContext();
  const { toast } = useToast();

  const activeProducts = products.filter((p) => p.archived !== true);
  const archivedProducts = products.filter((p) => p.archived === true);

  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<StockFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("active");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [archiveProductId, setArchiveProductId] = useState<string | null>(null);

  const [addProductForm, setAddProductForm] = useState({
    name: "",
    costPrice: 0,
    sellPrice: 0,
    stock: 0,
    minimumStock: 10,
    category: "",
    unit: "pcs",
  });

  const visibleSourceProducts = viewMode === "active" ? activeProducts : archivedProducts;

  const visibleProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return visibleSourceProducts.filter((product) => {
      const matchesSearch = !query || product.name.toLowerCase().includes(query);
      const matchesCategory =
        categoryFilter === "all" || product.category === categoryFilter;
      const stockStatus = getStockStatus(product.stock, product.minimumStock).key;
      const matchesStatus = statusFilter === "all" || stockStatus === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [categoryFilter, searchQuery, statusFilter, visibleSourceProducts]);

  const totalVisibleProducts = activeProducts.length;
  const lowStockCount = activeProducts.filter(
    (product) => product.stock > 0 && product.stock <= product.minimumStock,
  ).length;
  const outOfStockCount = activeProducts.filter((product) => product.stock === 0).length;

  const resetFilters = () => {
    setSearchQuery("");
    setCategoryFilter("all");
    setStatusFilter("all");
  };

  const handleAddProductSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmittingForm(true);

    try {
      if (!addProductForm.name.trim()) {
        toast({
          title: "Error",
          description: "Nama produk harus diisi",
          variant: "destructive",
        });
        setIsSubmittingForm(false);
        return;
      }

      if (addProductForm.costPrice <= 0) {
        toast({
          title: "Error",
          description: "Harga modal harus diisi dan lebih dari 0",
          variant: "destructive",
        });
        setIsSubmittingForm(false);
        return;
      }

      if (addProductForm.sellPrice <= 0) {
        toast({
          title: "Error",
          description: "Harga jual harus diisi dan lebih dari 0",
          variant: "destructive",
        });
        setIsSubmittingForm(false);
        return;
      }

      if (addProductForm.sellPrice < addProductForm.costPrice) {
        toast({
          title: "Error",
          description: "Harga jual harus lebih besar atau sama dengan harga beli",
          variant: "destructive",
        });
        setIsSubmittingForm(false);
        return;
      }

      if (!addProductForm.category.trim()) {
        toast({
          title: "Error",
          description: "Kategori harus diisi",
          variant: "destructive",
        });
        setIsSubmittingForm(false);
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
        category: "",
        unit: "pcs",
      });
      setIsAddProductOpen(false);
    } catch (error: any) {
      console.error("Add product failed:", {
        responseData: error.response?.data,
        responseStatus: error.response?.status,
        message: error.message,
      });
      toast({
        title: "Error",
        description: "Gagal menyimpan produk. Coba lagi.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingForm(false);
    }
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

      if (
        updatedData.sellPrice !== undefined &&
        updatedData.costPrice !== undefined &&
        updatedData.sellPrice < updatedData.costPrice
      ) {
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

  const renderActionMenu = (product: Product) => {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-900">
            <MoreVertical size={18} />
            <span className="sr-only">Aksi</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem onClick={() => handleEditProduct(product)}>
            <PencilLine className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          {viewMode === "active" ? (
            <DropdownMenuItem onClick={() => handleArchiveProduct(product.id)}>
              <Archive className="mr-2 h-4 w-4" />
              Arsipkan
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => handleRestoreProduct(product.id)}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Pulihkan
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-5">
        <section className="section-shell overflow-hidden">
          <div className="flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-[2rem]">
                Produk Usaha
              </h1>
              <p className="max-w-2xl text-sm text-slate-600">
                Kelola inventori usaha Anda dengan lebih mudah.
              </p>
            </div>

            <Button
              onClick={() => setIsAddProductOpen(true)}
              className="h-11 w-full rounded-xl bg-blue-600 px-4 text-white shadow-sm hover:bg-blue-700 sm:w-auto"
            >
              <Plus size={18} />
              Tambah Produk
            </Button>
          </div>
        </section>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="section-shell border-blue-100 bg-gradient-to-br from-blue-50 to-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Produk</p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                  {totalVisibleProducts}
                </p>
              </div>
              <div className="rounded-2xl bg-blue-600/10 p-3 text-blue-700">
                <Package size={22} />
              </div>
            </div>
          </div>

          <div className="section-shell border-amber-100 bg-gradient-to-br from-amber-50 to-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-600">Stok Menipis</p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                  {lowStockCount}
                </p>
              </div>
              <div className="rounded-2xl bg-amber-600/10 p-3 text-amber-700">
                <AlertTriangle size={22} />
              </div>
            </div>
          </div>

          <div className="section-shell border-red-100 bg-gradient-to-br from-red-50 to-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-600">Stok Habis</p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                  {outOfStockCount}
                </p>
              </div>
              <div className="rounded-2xl bg-red-600/10 p-3 text-red-700">
                <CircleX size={22} />
              </div>
            </div>
          </div>
        </div>

        <section className="section-shell p-2">
          <div className="grid grid-cols-2 gap-2 sm:w-fit sm:grid-cols-2">
            <button
              onClick={() => {
                setViewMode("active");
                setStatusFilter("all");
              }}
              className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                viewMode === "active"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              Produk Aktif ({activeProducts.length})
            </button>
            <button
              onClick={() => {
                setViewMode("archived");
                setStatusFilter("all");
              }}
              className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                viewMode === "archived"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              Produk Arsip ({archivedProducts.length})
            </button>
          </div>
        </section>

        <section className="section-shell p-4 sm:p-5">
          <div className="mb-4 flex flex-col gap-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {viewMode === "active" ? "Daftar Barang" : "Produk Arsip"}
                </h2>
                <p className="text-sm text-slate-600">
                  {visibleProducts.length} produk ditemukan
                </p>
              </div>

            </div>

            <div className="grid gap-3 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_180px_140px]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama produk..."
                  className="h-11 rounded-xl pl-10"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-blue-500"
              >
                <option value="all">Semua Kategori</option>
                {CATEGORY_OPTIONS.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StockFilter)}
                className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-blue-500"
              >
                <option value="all">Semua Status</option>
                <option value="aman">Aman</option>
                <option value="menipis">Menipis</option>
                <option value="habis">Habis</option>
              </select>

              <Button variant="outline" onClick={resetFilters} className="h-11 rounded-xl">
                <Filter size={16} />
                Reset Filter
              </Button>
            </div>
          </div>

          {visibleSourceProducts.length === 0 ? (
            <div className="flex min-h-[200px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-6 py-10 text-center">
              <div className="rounded-full bg-blue-600/10 p-4 text-blue-700">
                <Package size={28} />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                Belum ada produk.
              </h3>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
                Tambahkan produk pertama Anda untuk mulai mengelola stok dengan lebih mudah.
              </p>
            </div>
          ) : visibleProducts.length === 0 ? (
            <div className="flex min-h-[200px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-6 py-10 text-center">
              <div className="rounded-full bg-slate-900/5 p-4 text-slate-600">
                <Filter size={28} />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                Tidak ada produk yang cocok.
              </h3>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
                Coba ubah kata kunci pencarian atau reset filter untuk melihat produk lainnya.
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-3 md:hidden">
                {visibleProducts.map((product) => {
                  const statusInfo = getStockStatus(product.stock, product.minimumStock);

                  return (
                    <article
                      key={product.id}
                      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate text-base font-semibold text-slate-900">
                            {product.name}
                          </h3>
                          <p className="mt-1 text-sm text-slate-500">
                            {product.category} · {product.unit}
                          </p>
                        </div>

                        {renderActionMenu(product)}
                      </div>

                      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="rounded-xl bg-slate-50 p-3">
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                            Harga & Untung
                          </p>
                          <p className="mt-2 text-sm text-slate-700">
                            Beli <span className="font-semibold text-slate-900">{formatCurrency(product.costPrice)}</span> → Jual <span className="font-semibold text-slate-900">{formatCurrency(product.sellPrice)}</span>
                          </p>
                          <p className="mt-1 text-sm text-slate-600">
                            Untung <span className="font-semibold text-emerald-700">{formatCurrency(getProfit(product))}</span> • Margin <span className="text-slate-600">{formatMargin(getMargin(product))}</span>
                          </p>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-3">
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                            Stok
                          </p>
                          <p className="mt-2 text-sm font-semibold text-slate-900">
                            {product.stock} {product.unit}
                          </p>
                          <span
                            className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusInfo.className}`}
                          >
                            {statusInfo.label}
                          </span>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="hidden overflow-hidden rounded-2xl border border-slate-200 md:block">
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse bg-white">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        <th className="px-4 py-3">Produk</th>
                            <th className="px-4 py-3">Harga & Untung</th>
                        <th className="px-4 py-3">Stok</th>
                        <th className="px-4 py-3 text-center">Status</th>
                        <th className="px-4 py-3 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleProducts.map((product) => {
                        const statusInfo = getStockStatus(product.stock, product.minimumStock);

                        return (
                          <tr key={product.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/60">
                            <td className="px-4 py-4 align-top">
                              <div className="space-y-1">
                                <p className="font-semibold text-slate-900">{product.name}</p>
                                <p className="text-sm text-slate-500">
                                  {product.category} · {product.unit}
                                </p>
                              </div>
                            </td>
                            <td className="px-4 py-4 align-top text-sm text-slate-600">
                              <div className="space-y-1">
                                <p className="text-sm text-slate-700">
                                  Beli <span className="font-semibold text-slate-900">{formatCurrency(product.costPrice)}</span> → Jual <span className="font-semibold text-slate-900">{formatCurrency(product.sellPrice)}</span>
                                </p>
                                <p className="text-sm text-slate-600">
                                  Untung <span className="font-semibold text-emerald-700">{formatCurrency(getProfit(product))}</span> • Margin <span className="text-slate-600">{formatMargin(getMargin(product))}</span>
                                </p>
                              </div>
                            </td>
                            <td className="px-4 py-4 align-top text-sm text-slate-700">
                              <p className="font-semibold text-slate-900">
                                {product.stock} {product.unit}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                Minimal {product.minimumStock}
                              </p>
                            </td>
                            <td className="px-4 py-4 align-top text-center">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusInfo.className}`}
                              >
                                {statusInfo.label}
                              </span>
                            </td>
                            <td className="px-4 py-4 align-top text-center">
                              {renderActionMenu(product)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </section>
      </div>

      <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Tambah Produk</DialogTitle>
            <DialogDescription>
              Isi data produk secara singkat agar stok bisa langsung dikelola.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddProductSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Nama Produk <span className="text-red-600">*</span>
              </label>
              <Input
                type="text"
                value={addProductForm.name}
                onChange={(e) =>
                  setAddProductForm({ ...addProductForm, name: e.target.value })
                }
                placeholder="Contoh: Minyak Goreng 1L"
                className="h-11 rounded-xl"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Harga Modal (Rp) <span className="text-red-600">*</span>
                </label>
                <Input
                  type="number"
                  min="1"
                  value={addProductForm.costPrice || ""}
                  onChange={(e) => {
                    const val = e.target.value ? parseInt(e.target.value, 10) : 0;
                    setAddProductForm({
                      ...addProductForm,
                      costPrice: val,
                    });
                  }}
                  placeholder="Contoh: 2000"
                  className="h-11 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Harga Jual (Rp) <span className="text-red-600">*</span>
                </label>
                <Input
                  type="number"
                  min="1"
                  value={addProductForm.sellPrice || ""}
                  onChange={(e) => {
                    const val = e.target.value ? parseInt(e.target.value, 10) : 0;
                    setAddProductForm({
                      ...addProductForm,
                      sellPrice: val,
                    });
                  }}
                  placeholder="Contoh: 3500"
                  className="h-11 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Stok Minimum <span className="text-red-600">*</span>
                </label>
                <Input
                  type="number"
                  min="1"
                  value={addProductForm.minimumStock || ""}
                  onChange={(e) => {
                    const val = e.target.value ? parseInt(e.target.value, 10) : 10;
                    setAddProductForm({
                      ...addProductForm,
                      minimumStock: val,
                    });
                  }}
                  placeholder="Contoh: 10"
                  className="h-11 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Stok Awal
                </label>
                <Input
                  type="number"
                  min="0"
                  value={addProductForm.stock || ""}
                  onChange={(e) => {
                    const val = e.target.value ? parseInt(e.target.value, 10) : 0;
                    setAddProductForm({
                      ...addProductForm,
                      stock: val,
                    });
                  }}
                  placeholder="Contoh: 25"
                  className="h-11 rounded-xl"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
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
                  value={addProductForm.unit}
                  onChange={(e) =>
                    setAddProductForm({
                      ...addProductForm,
                      unit: e.target.value,
                    })
                  }
                  className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-500"
                >
                  {UNIT_OPTIONS.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <DialogFooter className="gap-2 pt-2 sm:gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddProductOpen(false)}
                className="h-11 rounded-xl"
              >
                Batal
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmittingForm}
                className="h-11 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmittingForm ? "Menyimpan..." : "Simpan Produk"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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
