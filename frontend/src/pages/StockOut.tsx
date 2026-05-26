import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Clock3, MoreVertical, Package, Plus, Trash2, TrendingDown } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useBusinessContext } from "@/context";
import { useToast } from "@/hooks/use-toast";
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
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu";
import { Input } from "@/ui/input";
import { Textarea } from "@/ui/textarea";
import { useNavigate } from "react-router-dom";

const getLocalDateString = () => {
  const date = new Date();
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .split("T")[0];
};

export default function StockOut() {
  const { products, stockOuts, addStockOut, deleteStockOut } = useBusinessContext();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [isStockOutModalOpen, setIsStockOutModalOpen] = useState(false);
  const [isNoProductDialogOpen, setIsNoProductDialogOpen] = useState(false);
  const [historyProductQuery, setHistoryProductQuery] = useState("");
  const [historySelectedProductId, setHistorySelectedProductId] = useState<string>("");
  const [showHistoryProductDropdown, setShowHistoryProductDropdown] = useState(false);
  const [historyDateFilter, setHistoryDateFilter] = useState(getLocalDateString());
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const modalProductComboboxRef = useRef<HTMLDivElement | null>(null);
  const historyProductComboboxRef = useRef<HTMLDivElement | null>(null);
  const [stockOutForm, setStockOutForm] = useState({
    productId: "",
    quantity: 0,
    date: getLocalDateString(),
    notes: "",
  });

  useEffect(() => {
    setIsNoProductDialogOpen(products.length === 0);
  }, [products.length]);

  const todayStockOuts = useMemo(() => {
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    return (stockOuts || [])
      .filter((item) => {
        const itemDate = new Date(item.date);
        return itemDate >= startDate && itemDate <= endDate;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [stockOuts]);

  const filteredHistoryStockOuts = useMemo(() => {
    const query = historyProductQuery.trim().toLowerCase();
    const startDate = new Date(historyDateFilter);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(historyDateFilter);
    endDate.setHours(23, 59, 59, 999);

    return (stockOuts || [])
      .filter((item) => {
        const itemDate = new Date(item.date);
        const matchesDate = itemDate >= startDate && itemDate <= endDate;
        const matchesSearch = !query || item.productName.toLowerCase().includes(query);
        const matchesProduct = !historySelectedProductId || item.productId === historySelectedProductId;

        return matchesDate && matchesSearch && matchesProduct;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [historyDateFilter, historyProductQuery, historySelectedProductId, stockOuts]);

  const totalStockOutToday = todayStockOuts.reduce((sum, item) => sum + item.quantity, 0);
  const totalTransactionsToday = todayStockOuts.length;
  const latestProductToday = todayStockOuts[0]?.productName || "-";

  const selectedProduct = products.find((p) => p.id === stockOutForm.productId);
  const filteredProducts = useMemo(() => {
    const query = productSearchQuery.trim().toLowerCase();

    if (!query) {
      return products;
    }

    return products.filter((product) => product.name.toLowerCase().includes(query));
  }, [productSearchQuery, products]);

  const selectedHistoryProduct = products.find((p) => p.id === historySelectedProductId);
  const filteredHistoryProducts = useMemo(() => {
    const query = historyProductQuery.trim().toLowerCase();

    if (!query) {
      return products;
    }

    return products.filter((product) => product.name.toLowerCase().includes(query));
  }, [historyProductQuery, products]);

  const handleSelectProduct = (productId: string) => {
    const product = products.find((item) => item.id === productId);

    setStockOutForm({ ...stockOutForm, productId });
    setProductSearchQuery(product?.name || "");
    setShowProductDropdown(false);
  };

  const handleClearProduct = () => {
    setStockOutForm({ ...stockOutForm, productId: "" });
    setProductSearchQuery("");
    setShowProductDropdown(false);
  };

  const handleSelectHistoryProduct = (productId: string) => {
    const product = products.find((item) => item.id === productId);

    setHistorySelectedProductId(productId);
    setHistoryProductQuery(product?.name || "");
    setShowHistoryProductDropdown(false);
  };

  const handleClearHistoryProduct = () => {
    setHistorySelectedProductId("");
    setHistoryProductQuery("");
    setShowHistoryProductDropdown(false);
  };

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const targetNode = event.target as Node;

      if (
        showProductDropdown &&
        modalProductComboboxRef.current &&
        !modalProductComboboxRef.current.contains(targetNode)
      ) {
        setShowProductDropdown(false);
      }

      if (
        showHistoryProductDropdown &&
        historyProductComboboxRef.current &&
        !historyProductComboboxRef.current.contains(targetNode)
      ) {
        setShowHistoryProductDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [showHistoryProductDropdown, showProductDropdown]);

  const resetHistoryFilters = () => {
    setHistoryProductQuery("");
    setHistorySelectedProductId("");
    setShowHistoryProductDropdown(false);
    setHistoryDateFilter(getLocalDateString());
  };

  const handleStockOutSubmit = (e: FormEvent<HTMLFormElement>) => {
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

    setStockOutForm({
      productId: "",
      quantity: 0,
      date: getLocalDateString(),
      notes: "",
    });
    setProductSearchQuery("");
    setShowProductDropdown(false);
    setIsStockOutModalOpen(false);
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

  const renderHistoryActionMenu = (id: string) => {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-900">
            <MoreVertical size={18} />
            <span className="sr-only">Aksi</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-36">
          <DropdownMenuItem
            onClick={() => handleDeleteStockOut(id)}
            className="text-red-600 focus:text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Hapus
          </DropdownMenuItem>
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
                Stok Keluar
              </h1>
              <p className="max-w-2xl text-sm text-slate-600">
                Catat barang keluar dari gudang dengan lebih mudah.
              </p>
            </div>

            <Button
              onClick={() => {
                if (products.length === 0) {
                  setIsNoProductDialogOpen(true);
                  return;
                }

                setIsStockOutModalOpen(true);
              }}
              className="h-11 w-full rounded-xl bg-red-600 px-4 text-white shadow-sm hover:bg-red-700 sm:w-auto"
            >
              <Plus size={18} />
              Catat Stok Keluar
            </Button>
          </div>
        </section>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="section-shell border-red-100 bg-gradient-to-br from-red-50 to-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Stok Keluar Hari Ini</p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{totalStockOutToday}</p>
              </div>
              <div className="rounded-2xl bg-red-600/10 p-3 text-red-700">
                <TrendingDown size={22} />
              </div>
            </div>
          </div>

          <div className="section-shell border-slate-100 bg-gradient-to-br from-slate-50 to-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Transaksi</p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{totalTransactionsToday}</p>
              </div>
              <div className="rounded-2xl bg-slate-100 p-3 text-slate-600">
                <Package size={22} />
              </div>
            </div>
          </div>

          <div className="section-shell border-slate-100 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-600">Produk Terakhir</p>
                <p className="mt-2 text-lg font-bold tracking-tight text-slate-900">{latestProductToday}</p>
              </div>
              <div className="rounded-2xl bg-slate-100 p-3 text-slate-600">
                <Clock3 size={22} />
              </div>
            </div>
          </div>
        </div>

        {products.length > 0 && (
          <section className="section-shell p-4 sm:p-5 space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Riwayat Stok Keluar</h2>
                <p className="text-sm text-slate-600">Cari dan filter catatan stok keluar dengan lebih mudah.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_160px_160px] lg:grid-cols-[minmax(0,1fr)_180px_180px] gap-4">
              <div ref={historyProductComboboxRef} className="relative">
                <Input
                  value={selectedHistoryProduct ? selectedHistoryProduct.name : historyProductQuery}
                  onChange={(e) => {
                    const value = e.target.value;
                    setHistoryProductQuery(value);
                    setShowHistoryProductDropdown(true);
                    if (historySelectedProductId) {
                      setHistorySelectedProductId("");
                    }
                  }}
                  onFocus={() => setShowHistoryProductDropdown(true)}
                  placeholder="Cari atau pilih produk..."
                  className="h-11 w-full rounded-xl pr-10"
                />

                {(selectedHistoryProduct || historyProductQuery) && (
                  <button
                    type="button"
                    onClick={handleClearHistoryProduct}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                  >
                    ×
                  </button>
                )}

                {showHistoryProductDropdown && (
                  <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg">
                    {filteredHistoryProducts.length > 0 ? (
                      filteredHistoryProducts.map((product) => (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => handleSelectHistoryProduct(product.id)}
                          className="flex w-full flex-col items-start border-b border-slate-100 px-3 py-2 text-left text-sm transition last:border-b-0 hover:bg-slate-50"
                        >
                          <span className="font-semibold text-slate-900">{product.name}</span>
                          <span className="text-xs text-slate-500">
                            {product.category} · {product.unit}
                          </span>
                        </button>
                      ))
                    ) : historyProductQuery ? (
                      <div className="px-3 py-3 text-sm text-slate-500">Produk tidak ditemukan</div>
                    ) : null}
                  </div>
                )}
              </div>

              <Input
                type="date"
                value={historyDateFilter}
                onChange={(e) => setHistoryDateFilter(e.target.value)}
                className="h-11 w-full rounded-xl"
              />

              <Button
                variant="outline"
                onClick={resetHistoryFilters}
                className="h-11 rounded-xl w-full"
              >
                Reset Filter
              </Button>
            </div>

            {filteredHistoryStockOuts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-6 py-10 text-center">
                <p className="text-sm text-slate-600">Belum ada riwayat stok keluar untuk filter yang dipilih.</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse bg-white">
                    <thead>
                      <tr className="border-b border-slate-200 bg-white text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                        <th className="px-5 py-4">Tanggal & Jam</th>
                        <th className="px-5 py-4">Produk</th>
                        <th className="px-5 py-4 text-center">Jumlah</th>
                        <th className="px-5 py-4">Catatan</th>
                        <th className="px-5 py-4 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredHistoryStockOuts.map((item) => (
                        <tr key={item.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/60">
                          <td className="px-5 py-4 align-top text-sm text-slate-600">
                            <div className="space-y-1">
                              <p className="font-semibold text-slate-900">
                                {new Date(item.createdAt).toLocaleDateString("id-ID", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                })}
                              </p>
                              <p className="text-xs text-slate-500">
                                {new Date(item.createdAt).toLocaleTimeString("id-ID", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          </td>
                          <td className="px-5 py-4 align-top">
                            <p className="font-semibold text-slate-900">{item.productName}</p>
                          </td>
                          <td className="px-5 py-4 align-top text-center text-sm font-semibold text-red-600">
                            -{item.quantity}
                          </td>
                          <td className="px-5 py-4 align-top text-sm text-slate-500">
                            {item.notes || "-"}
                          </td>
                          <td className="px-5 py-4 align-top text-center">
                            {renderHistoryActionMenu(item.id)}
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

      <Dialog
        open={isStockOutModalOpen}
        onOpenChange={(open) => {
          setIsStockOutModalOpen(open);
          if (!open) {
            setShowProductDropdown(false);
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Catat Stok Keluar</DialogTitle>
            <DialogDescription>
              Isi data stok keluar secara singkat agar stok gudang langsung diperbarui.
            </DialogDescription>
          </DialogHeader>

          {products.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-6 py-6 text-center text-sm text-slate-600">
              Silakan tambahkan produk terlebih dahulu sebelum mencatat stok masuk atau stok keluar.
            </div>
          ) : (
            <form onSubmit={handleStockOutSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Produk <span className="text-red-600">*</span>
                </label>
                <div ref={modalProductComboboxRef} className="relative">
                  <Input
                    value={selectedProduct ? selectedProduct.name : productSearchQuery}
                    onChange={(e) => {
                      const value = e.target.value;
                      setProductSearchQuery(value);
                      setShowProductDropdown(true);
                      if (stockOutForm.productId) {
                        setStockOutForm({ ...stockOutForm, productId: "" });
                      }
                    }}
                    onFocus={() => setShowProductDropdown(true)}
                    placeholder="Cari produk..."
                    className="h-11 rounded-xl pr-10"
                  />

                  {selectedProduct && (
                    <button
                      type="button"
                      onClick={handleClearProduct}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                    >
                      ×
                    </button>
                  )}

                  {showProductDropdown && (
                    <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg">
                      {filteredProducts.length > 0 ? (
                        filteredProducts.map((product) => (
                          <button
                            key={product.id}
                            type="button"
                            onClick={() => handleSelectProduct(product.id)}
                            className="flex w-full flex-col items-start border-b border-slate-100 px-3 py-2 text-left text-sm transition last:border-b-0 hover:bg-slate-50"
                          >
                            <span className="font-semibold text-slate-900">{product.name}</span>
                            <span className="text-xs text-slate-500">
                              Stok tersedia: {product.stock} {product.unit} · {product.category}
                            </span>
                          </button>
                        ))
                      ) : productSearchQuery ? (
                        <div className="px-3 py-3 text-sm text-slate-500">
                          Produk tidak ditemukan
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Jumlah Keluar {selectedProduct && <span className="text-slate-500">({selectedProduct.unit})</span>} <span className="text-red-600">*</span>
                </label>
                <Input
                  type="number"
                  value={stockOutForm.quantity || ""}
                  onChange={(e) =>
                    setStockOutForm({
                      ...stockOutForm,
                      quantity: parseInt(e.target.value, 10) || 0,
                    })
                  }
                  className="h-11 rounded-xl"
                  placeholder="0"
                  min="0"
                  max={selectedProduct?.stock || undefined}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Tanggal <span className="text-red-600">*</span>
                </label>
                <Input
                  type="date"
                  value={stockOutForm.date}
                  onChange={(e) =>
                    setStockOutForm({ ...stockOutForm, date: e.target.value })
                  }
                  className="h-11 rounded-xl"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Catatan</label>
                <Textarea
                  value={stockOutForm.notes}
                  onChange={(e) =>
                    setStockOutForm({ ...stockOutForm, notes: e.target.value })
                  }
                  className="min-h-[96px] rounded-xl"
                  placeholder="Contoh: Barang terjual, rusak, dll."
                />
              </div>

              <DialogFooter className="gap-2 pt-2 sm:gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsStockOutModalOpen(false)}
                  className="h-11 rounded-xl"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  className="h-11 rounded-xl bg-red-600 text-white hover:bg-red-700"
                >
                  Simpan
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isNoProductDialogOpen} onOpenChange={setIsNoProductDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Belum ada produk</DialogTitle>
            <DialogDescription>
              Silakan tambahkan produk terlebih dahulu sebelum mencatat stok masuk atau stok keluar.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsNoProductDialogOpen(false)}
              className="rounded-xl"
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={() => {
                setIsNoProductDialogOpen(false);
                navigate("/products");
              }}
              className="rounded-xl bg-blue-600 text-white hover:bg-blue-700"
            >
              Tambah Produk
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
