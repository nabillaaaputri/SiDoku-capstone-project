import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Clock3, MoreVertical, Package, Plus, Trash2, TrendingUp } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useBusinessContext } from "@/context";
import { useToast } from "@/hooks/use-toast";
import { formatJakartaDate, formatJakartaTime, getJakartaDateInputValue } from "@/lib/timezone";
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

const getLocalDateString = () => {
  return getJakartaDateInputValue();
};

export default function StockIn() {
  const { products, stockIns, addStockIn, deleteStockIn } = useBusinessContext();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [isStockInModalOpen, setIsStockInModalOpen] = useState(false);
  const [isNoProductDialogOpen, setIsNoProductDialogOpen] = useState(false);
  const [historyProductQuery, setHistoryProductQuery] = useState("");
  const [historySelectedProductId, setHistorySelectedProductId] = useState<string>("");
  const [showHistoryProductDropdown, setShowHistoryProductDropdown] = useState(false);
  const [historyDateFilter, setHistoryDateFilter] = useState(getLocalDateString());
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalProductComboboxRef = useRef<HTMLDivElement | null>(null);
  const historyProductComboboxRef = useRef<HTMLDivElement | null>(null);
  const quickActionHandledRef = useRef(false);
  const activeProducts = useMemo(() => products.filter((product) => product.archived !== true), [products]);
  const [stockInForm, setStockInForm] = useState({
    productId: "",
    quantity: 0,
    date: getLocalDateString(),
    notes: "",
  });

  useEffect(() => {
    setIsNoProductDialogOpen(activeProducts.length === 0);
  }, [activeProducts.length]);

  const todayStockIns = useMemo(() => {
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    return (stockIns || [])
      .filter((item) => {
        const itemDate = new Date(item.date);
        return itemDate >= startDate && itemDate <= endDate;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [stockIns]);

  const filteredHistoryStockIns = useMemo(() => {
    const query = historyProductQuery.trim().toLowerCase();
    const startDate = new Date(historyDateFilter);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(historyDateFilter);
    endDate.setHours(23, 59, 59, 999);

    return (stockIns || [])
      .filter((item) => {
        const itemDate = new Date(item.date);
        const matchesDate = itemDate >= startDate && itemDate <= endDate;
        const matchesSearch = !query || item.productName.toLowerCase().includes(query);
        const matchesProduct = !historySelectedProductId || item.productId === historySelectedProductId;

        return matchesDate && matchesSearch && matchesProduct;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [historyDateFilter, historyProductQuery, historySelectedProductId, stockIns]);

  const totalStockInToday = todayStockIns.reduce((sum, item) => sum + item.quantity, 0);
  const totalTransactionsToday = todayStockIns.length;
  const latestProductToday = todayStockIns[0]?.productName || "-";

  const selectedProduct = activeProducts.find((p) => p.id === stockInForm.productId);
  const filteredProducts = useMemo(() => {
    const query = productSearchQuery.trim().toLowerCase();

    if (!query) {
      return activeProducts;
    }

    return activeProducts.filter((product) => product.name.toLowerCase().includes(query));
  }, [activeProducts, productSearchQuery]);

  const selectedHistoryProduct = activeProducts.find((p) => p.id === historySelectedProductId);
  const filteredHistoryProducts = useMemo(() => {
    const query = historyProductQuery.trim().toLowerCase();

    if (!query) {
      return activeProducts;
    }

    return activeProducts.filter((product) => product.name.toLowerCase().includes(query));
  }, [activeProducts, historyProductQuery]);

  const handleSelectProduct = (productId: string) => {
    const product = activeProducts.find((item) => item.id === productId);

    if (!product) {
      toast({
        title: "Produk tidak tersedia",
        description: "Produk yang diarsipkan tidak bisa dipilih untuk stok masuk.",
        variant: "destructive",
      });
      return;
    }

    setStockInForm({ ...stockInForm, productId });
    setProductSearchQuery(product?.name || "");
    setShowProductDropdown(false);
  };

  const handleClearProduct = () => {
    setStockInForm({ ...stockInForm, productId: "" });
    setProductSearchQuery("");
    setShowProductDropdown(false);
  };

  const handleSelectHistoryProduct = (productId: string) => {
    const product = activeProducts.find((item) => item.id === productId);

    if (!product) {
      toast({
        title: "Produk tidak tersedia",
        description: "Produk yang diarsipkan tidak bisa dipilih untuk filter riwayat.",
        variant: "destructive",
      });
      return;
    }

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

  useEffect(() => {
    if (quickActionHandledRef.current) {
      return;
    }

    const quickActionProductId = (location.state as { quickActionProductId?: string } | null)?.quickActionProductId;

    if (!quickActionProductId || activeProducts.length === 0) {
      return;
    }

    const product = activeProducts.find((item) => item.id === quickActionProductId);

    if (!product) {
      return;
    }

    quickActionHandledRef.current = true;
    setStockInForm((current) => ({
      ...current,
      productId: product.id,
    }));
    setProductSearchQuery(product.name);
    setIsStockInModalOpen(true);
    navigate("/stok-masuk", { replace: true, state: null });
  }, [activeProducts, location.state, navigate]);

  const handleStockInSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
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

      const product = activeProducts.find((p) => p.id === stockInForm.productId);
      if (!product) {
        toast({
          title: "Produk tidak tersedia",
          description: "Produk ini sudah diarsipkan dan tidak bisa digunakan untuk stok masuk.",
          variant: "destructive",
        });
        return;
      }

      await addStockIn({
        productId: stockInForm.productId,
        productName: product.name,
        quantity: stockInForm.quantity,
        date: stockInForm.date,
        notes: stockInForm.notes || undefined,
      });

      toast({
        title: "Berhasil",
        description: `${stockInForm.quantity} unit ${product.name} berhasil dicatat`,
      });

      setStockInForm({
        productId: "",
        quantity: 0,
        date: getLocalDateString(),
        notes: "",
      });
      setProductSearchQuery("");
      setShowProductDropdown(false);
      setIsStockInModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
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
            onClick={() => handleDeleteStockIn(id)}
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
                Stok Masuk
              </h1>
              <p className="max-w-2xl text-sm text-slate-600">
                Catat barang masuk dari supplier dengan tampilan yang lebih rapi dan mudah dipakai.
              </p>
            </div>

            <Button
              onClick={() => {
                if (activeProducts.length === 0) {
                  setIsNoProductDialogOpen(true);
                  return;
                }

                setIsStockInModalOpen(true);
              }}
              className="h-11 w-full rounded-xl bg-blue-600 px-4 text-white shadow-sm hover:bg-blue-700 sm:w-auto"
            >
              <Plus size={18} />
              Catat Stok Masuk
            </Button>
          </div>
        </section>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="section-shell border-blue-100 bg-gradient-to-br from-blue-50 to-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Stok Masuk Hari Ini</p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{totalStockInToday}</p>
              </div>
              <div className="rounded-2xl bg-blue-600/10 p-3 text-blue-700">
                <TrendingUp size={22} />
              </div>
            </div>
          </div>

          <div className="section-shell border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Transaksi</p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{totalTransactionsToday}</p>
              </div>
              <div className="rounded-2xl bg-emerald-600/10 p-3 text-emerald-700">
                <Package size={22} />
              </div>
            </div>
          </div>

          <div className="section-shell border-slate-100 bg-gradient-to-br from-slate-50 to-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-600">Produk Terakhir</p>
                <p className="mt-2 text-lg font-bold tracking-tight text-slate-900">{latestProductToday}</p>
              </div>
              <div className="rounded-2xl bg-slate-900/5 p-3 text-slate-700">
                <Clock3 size={22} />
              </div>
            </div>
          </div>
        </div>

        {products.length > 0 && (
          <section className="section-shell p-4 sm:p-5 space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Riwayat Stok Masuk</h2>
                <p className="text-sm text-slate-600">Cari dan filter catatan stok masuk dengan lebih mudah.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,3fr)_minmax(0,1fr)] md:items-start">
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

            </div>

            {filteredHistoryStockIns.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-6 py-10 text-center">
                <p className="text-sm text-slate-600">Belum ada riwayat stok masuk untuk filter yang dipilih.</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                {/* Desktop / tablet table */}
                <div className="hidden md:block overflow-x-auto">
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
                      {filteredHistoryStockIns.map((item) => (
                        <tr key={item.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/60">
                          <td className="px-5 py-4 align-top text-sm text-slate-600">
                            <div className="space-y-1">
                              <p className="font-semibold text-slate-900">{formatJakartaDate(item.createdAt)}</p>
                              <p className="text-xs text-slate-500">{formatJakartaTime(item.createdAt)}</p>
                            </div>
                          </td>
                          <td className="px-5 py-4 align-top">
                            <p className="font-semibold text-slate-900">{item.productName}</p>
                          </td>
                          <td className="px-5 py-4 align-top text-center text-sm font-semibold text-blue-600">+{item.quantity}</td>
                          <td className="px-5 py-4 align-top text-sm text-slate-500">{item.notes || "-"}</td>
                          <td className="px-5 py-4 align-top text-center">{renderHistoryActionMenu(item.id)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile: stacked cards */}
                <div className="md:hidden space-y-2 p-3">
                  {filteredHistoryStockIns.map((item) => (
                    <div key={item.id} className="rounded-xl border border-slate-100 bg-white p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900">{item.productName}</p>
                          <p className="text-xs text-slate-500">{formatJakartaDate(item.createdAt)} • {formatJakartaTime(item.createdAt)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-blue-600">+{item.quantity}</p>
                          <div className="mt-1">{renderHistoryActionMenu(item.id)}</div>
                        </div>
                      </div>
                      {item.notes && <p className="mt-2 text-sm text-slate-500">{item.notes}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}
      </div>

      <Dialog
        open={isStockInModalOpen}
        onOpenChange={(open) => {
          setIsStockInModalOpen(open);
          if (!open) {
            setShowProductDropdown(false);
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Catat Stok Masuk</DialogTitle>
            <DialogDescription>
              Isi data stok masuk secara singkat agar stok bisa langsung diperbarui.
            </DialogDescription>
          </DialogHeader>

          {isSubmitting && (
            <div className="flex items-center gap-2 rounded-xl border border-sky-100 bg-sky-50 px-3 py-2 text-sm text-sky-700">
              <div className="h-3 w-3 animate-pulse rounded-full bg-sky-500" />
              Memperbarui riwayat stok masuk...
            </div>
          )}

          {activeProducts.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-6 py-6 text-center text-sm text-slate-600">
              Silakan tambahkan produk terlebih dahulu sebelum mencatat stok masuk atau stok keluar.
            </div>
          ) : (
            <form onSubmit={handleStockInSubmit} className="space-y-4">
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
                      if (stockInForm.productId) {
                        setStockInForm({ ...stockInForm, productId: "" });
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
                  Jumlah Masuk {selectedProduct && <span className="text-slate-500">({selectedProduct.unit})</span>} <span className="text-red-600">*</span>
                </label>
                <Input
                  type="number"
                  value={stockInForm.quantity || ""}
                  onChange={(e) =>
                    setStockInForm({
                      ...stockInForm,
                      quantity: parseInt(e.target.value, 10) || 0,
                    })
                  }
                  className="h-11 rounded-xl"
                  placeholder="0"
                  min="0"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Tanggal <span className="text-red-600">*</span>
                </label>
                <Input
                  type="date"
                  value={stockInForm.date}
                  onChange={(e) =>
                    setStockInForm({ ...stockInForm, date: e.target.value })
                  }
                  className="h-11 rounded-xl"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Catatan</label>
                <Textarea
                  value={stockInForm.notes}
                  onChange={(e) =>
                    setStockInForm({ ...stockInForm, notes: e.target.value })
                  }
                  className="min-h-[96px] rounded-xl"
                  placeholder="Contoh: Pengiriman dari supplier"
                />
              </div>

              <DialogFooter className="gap-2 pt-2 sm:gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsStockInModalOpen(false)}
                  className="h-11 rounded-xl"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  className="h-11 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
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
