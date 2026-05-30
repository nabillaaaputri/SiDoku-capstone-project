import { useMemo, useState, type FormEvent } from "react";
import { CircleDollarSign, MoreVertical, Package, Plus, Trash2, Wallet, Zap, MoreHorizontal } from "lucide-react";
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

type ExpenseCategory = "restock" | "operasional" | "lain-lain";

const categoryColors: Record<ExpenseCategory, string> = {
  restock: "bg-blue-100 text-blue-700",
  operasional: "bg-orange-100 text-orange-700",
  "lain-lain": "bg-slate-100 text-slate-700",
};

const categoryLabels: Record<ExpenseCategory, string> = {
  restock: "Restock Barang",
  operasional: "Biaya Operasional",
  "lain-lain": "Lainnya",
};

const getLocalDateString = () => {
  return getJakartaDateInputValue();
};

export default function Expenses() {
  const { expenses, addExpense, deleteExpense } = useBusinessContext();
  const { toast } = useToast();

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [historySearchQuery, setHistorySearchQuery] = useState("");
  const [historyCategoryFilter, setHistoryCategoryFilter] = useState<ExpenseCategory | "all">("all");
  const [historyDateFilter, setHistoryDateFilter] = useState(getLocalDateString());
  
  const [expenseForm, setExpenseForm] = useState({
    name: "",
    amount: 0,
    category: "operasional" as ExpenseCategory,
    date: getLocalDateString(),
    description: "",
  });

  const filteredHistoryExpenses = useMemo(() => {
    const query = historySearchQuery.trim().toLowerCase();
    const startDate = new Date(historyDateFilter);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(historyDateFilter);
    endDate.setHours(23, 59, 59, 999);

    return (expenses || [])
      .filter((item) => {
        const itemDate = new Date(item.date);
        const matchesDate = itemDate >= startDate && itemDate <= endDate;
        const categoryName = categoryLabels[item.category].toLowerCase();
        const matchesSearch = !query || 
          (item.name && item.name.toLowerCase().includes(query)) ||
          ((item as any).expenseName && (item as any).expenseName.toLowerCase().includes(query)) ||
          categoryName.includes(query) ||
          (item.description && item.description.toLowerCase().includes(query)) ||
          ((item as any).note && (item as any).note.toLowerCase().includes(query)) ||
          ((item as any).notes && (item as any).notes.toLowerCase().includes(query));
        const matchesCategory = historyCategoryFilter === "all" || item.category === historyCategoryFilter;

        return matchesDate && matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        const bTime = (b.createdAt ?? b.date).getTime();
        const aTime = (a.createdAt ?? a.date).getTime();
        return bTime - aTime;
      });
  }, [historyDateFilter, historySearchQuery, historyCategoryFilter, expenses]);

  const totalExpenseAll = expenses.reduce((sum, e) => sum + e.amount, 0);
  const restockExpenseAll = expenses.filter(e => e.category === "restock").reduce((sum, e) => sum + e.amount, 0);
  const operasionalExpenseAll = expenses.filter(e => e.category === "operasional").reduce((sum, e) => sum + e.amount, 0);
  const lainnyaExpenseAll = expenses.filter(e => e.category === "lain-lain").reduce((sum, e) => sum + e.amount, 0);

  const percentageText = (value: number) =>
    totalExpenseAll > 0
      ? `${((value / totalExpenseAll) * 100).toFixed(1)}% dari total`
      : "0% dari total";

  const resetHistoryFilters = () => {
    setHistorySearchQuery("");
    setHistoryCategoryFilter("all");
    setHistoryDateFilter(getLocalDateString());
  };

  const handleExpenseSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!expenseForm.name.trim()) {
      toast({
        title: "Error",
        description: "Nama pengeluaran harus diisi",
        variant: "destructive",
      });
      return;
    }

    if (expenseForm.amount <= 0) {
      toast({
        title: "Error",
        description: "Jumlah harus lebih dari 0",
        variant: "destructive",
      });
      return;
    }

    try {
      await addExpense({
        name: expenseForm.name,
        amount: expenseForm.amount,
        category: expenseForm.category,
        date: expenseForm.date,
        description: expenseForm.description,
      });

      toast({
        title: "Berhasil",
        description: "Pengeluaran berhasil dicatat",
      });

      setExpenseForm({
        name: "",
        amount: 0,
        category: "operasional",
        date: getLocalDateString(),
        description: "",
      });
      setIsExpenseModalOpen(false);
    } catch (error: any) {
      console.error("Failed to add expense:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || error.message || "Gagal menyimpan pengeluaran",
        variant: "destructive",
      });
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (window.confirm("Yakin ingin menghapus catatan ini?")) {
      await deleteExpense(id);
      toast({
        title: "Berhasil",
        description: "Catatan pengeluaran berhasil dihapus",
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
            onClick={() => handleDeleteExpense(id)}
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
                Pengeluaran Usaha
              </h1>
              <p className="max-w-2xl text-sm text-slate-600">
                Catat dan pantau biaya operasional usaha Anda.
              </p>
            </div>

            <Button
              onClick={() => setIsExpenseModalOpen(true)}
              className="h-11 w-full rounded-xl bg-slate-900 px-4 text-white shadow-sm hover:bg-slate-800 sm:w-auto"
            >
              <Plus size={18} />
              Catat Pengeluaran
            </Button>
          </div>
        </section>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <div className="section-shell border-slate-200 bg-slate-900 p-4 text-white">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-300">Total Pengeluaran</p>
                <p className="mt-2 text-2xl font-bold tracking-tight">
                  Rp {totalExpenseAll.toLocaleString("id-ID")}
                </p>
              </div>
              <div className="rounded-2xl bg-white/10 p-3 text-white">
                <Wallet size={22} />
              </div>
            </div>
            <p className="mt-4 text-xs text-slate-400">Dari {expenses.length} pengeluaran</p>
          </div>

          <div className="section-shell border-blue-100 bg-gradient-to-br from-blue-50 to-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-600">Restock Barang</p>
                <p className="mt-2 text-2xl font-bold tracking-tight text-blue-700">
                  Rp {restockExpenseAll.toLocaleString("id-ID")}
                </p>
              </div>
              <div className="rounded-2xl bg-blue-600/10 p-3 text-blue-700">
                <Package size={22} />
              </div>
            </div>
            <p className="mt-4 text-xs font-medium text-blue-600/70">{percentageText(restockExpenseAll)}</p>
          </div>

          <div className="section-shell border-orange-100 bg-gradient-to-br from-orange-50 to-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-600">Biaya Operasional</p>
                <p className="mt-2 text-2xl font-bold tracking-tight text-orange-700">
                  Rp {operasionalExpenseAll.toLocaleString("id-ID")}
                </p>
              </div>
              <div className="rounded-2xl bg-orange-600/10 p-3 text-orange-700">
                <Zap size={22} />
              </div>
            </div>
            <p className="mt-4 text-xs font-medium text-orange-600/70">{percentageText(operasionalExpenseAll)}</p>
          </div>

          <div className="section-shell border-slate-100 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-600">Lainnya</p>
                <p className="mt-2 text-2xl font-bold tracking-tight text-slate-700">
                  Rp {lainnyaExpenseAll.toLocaleString("id-ID")}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-100 p-3 text-slate-600">
                <MoreHorizontal size={22} />
              </div>
            </div>
            <p className="mt-4 text-xs font-medium text-slate-500">{percentageText(lainnyaExpenseAll)}</p>
          </div>
        </div>

        <section className="section-shell p-4 sm:p-5 space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Riwayat Pengeluaran</h2>
              <p className="text-sm text-slate-600">Cari dan filter catatan pengeluaran usaha Anda.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_220px_220px_160px] gap-4">
            <div className="relative">
              <Input
                value={historySearchQuery}
                onChange={(e) => setHistorySearchQuery(e.target.value)}
                placeholder="Cari pengeluaran..."
                className="h-11 w-full rounded-xl"
              />
            </div>

            <select
              value={historyCategoryFilter}
              onChange={(e) => setHistoryCategoryFilter(e.target.value as ExpenseCategory | "all")}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-slate-400"
            >
              <option value="all">Semua Kategori</option>
              <option value="restock">Restock Barang</option>
              <option value="operasional">Biaya Operasional</option>
              <option value="lain-lain">Lainnya</option>
            </select>

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

          {filteredHistoryExpenses.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-6 py-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-3">
                <CircleDollarSign size={24} />
              </div>
              <p className="text-sm font-semibold text-slate-900">Tidak ada pengeluaran yang cocok</p>
              <p className="text-sm text-slate-500 mt-1">Coba ubah kata kunci pencarian atau reset filter.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              {/* Desktop / tablet table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full border-collapse bg-white">
                  <thead>
                    <tr className="border-b border-slate-200 bg-white text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      <th className="px-5 py-4">Tanggal & Jam</th>
                      <th className="px-5 py-4">Nama Pengeluaran</th>
                      <th className="px-5 py-4 text-center">Kategori</th>
                      <th className="px-5 py-4 text-right">Jumlah</th>
                      <th className="px-5 py-4">Catatan</th>
                      <th className="px-5 py-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHistoryExpenses.map((expense) => (
                      <tr key={expense.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/60">
                        <td className="px-5 py-4 align-top text-sm text-slate-600">
                          <div className="space-y-1">
                            <p className="font-semibold text-slate-900">{formatJakartaDate(expense.date)}</p>
                            <p className="text-xs text-slate-500">{formatJakartaTime(expense.createdAt ?? expense.date)}</p>
                          </div>
                        </td>
                        <td className="px-5 py-4 align-top">
                          <p className="font-semibold text-slate-900">{expense.name}</p>
                        </td>
                        <td className="px-5 py-4 align-top text-center">
                          <span className={`inline-flex items-center rounded-full px-2 py-1 text-[10px] font-bold tracking-wide uppercase ${categoryColors[expense.category]}`}>
                            {categoryLabels[expense.category]}
                          </span>
                        </td>
                        <td className="px-5 py-4 align-top text-right text-sm font-bold text-slate-900">Rp {expense.amount.toLocaleString("id-ID")}</td>
                        <td className="px-5 py-4 align-top text-sm text-slate-500">{expense.description || "-"}</td>
                        <td className="px-5 py-4 align-top text-center">{renderHistoryActionMenu(expense.id)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile / tablet stacked cards */}
              <div className="lg:hidden space-y-2 p-3">
                {filteredHistoryExpenses.map((expense) => (
                  <div key={expense.id} className="rounded-xl border border-slate-100 bg-white p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900">{expense.name}</p>
                        <p className="text-xs text-slate-500">{formatJakartaDate(expense.date)} • {formatJakartaTime(expense.createdAt ?? expense.date)}</p>
                        <div className="mt-2">
                          <span className={`inline-flex items-center rounded-full px-2 py-1 text-[10px] font-bold tracking-wide uppercase ${categoryColors[expense.category]}`}>{categoryLabels[expense.category]}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-900">Rp {expense.amount.toLocaleString("id-ID")}</p>
                        <div className="mt-1">{renderHistoryActionMenu(expense.id)}</div>
                      </div>
                    </div>
                    {expense.description && <p className="mt-2 text-sm text-slate-500">{expense.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      <Dialog
        open={isExpenseModalOpen}
        onOpenChange={setIsExpenseModalOpen}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Catat Pengeluaran</DialogTitle>
            <DialogDescription>
              Isi data pengeluaran operasional usaha Anda secara rinci.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleExpenseSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Nama Pengeluaran <span className="text-red-600">*</span>
              </label>
              <Input
                value={expenseForm.name}
                onChange={(e) => setExpenseForm({ ...expenseForm, name: e.target.value })}
                placeholder="Contoh: Bayar listrik, beli bahan, dll."
                className="h-11 rounded-xl"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Kategori <span className="text-red-600">*</span>
              </label>
              <select
                value={expenseForm.category}
                onChange={(e) =>
                  setExpenseForm({
                    ...expenseForm,
                    category: e.target.value as ExpenseCategory,
                  })
                }
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-slate-400"
              >
                <option value="restock">Restock Barang</option>
                <option value="operasional">Biaya Operasional</option>
                <option value="lain-lain">Lainnya</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Jumlah (Rp) <span className="text-red-600">*</span>
              </label>
              <Input
                type="number"
                value={expenseForm.amount || ""}
                onChange={(e) =>
                  setExpenseForm({
                    ...expenseForm,
                    amount: parseInt(e.target.value, 10) || 0,
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
                value={expenseForm.date}
                onChange={(e) =>
                  setExpenseForm({ ...expenseForm, date: e.target.value })
                }
                className="h-11 rounded-xl"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Catatan</label>
              <Textarea
                value={expenseForm.description}
                onChange={(e) =>
                  setExpenseForm({ ...expenseForm, description: e.target.value })
                }
                className="min-h-[96px] rounded-xl"
                placeholder="Catatan tambahan (opsional)"
              />
            </div>

            <DialogFooter className="gap-2 pt-2 sm:gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsExpenseModalOpen(false)}
                className="h-11 rounded-xl w-full sm:w-auto"
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="h-11 rounded-xl bg-slate-900 text-white hover:bg-slate-800 w-full sm:w-auto"
              >
                Simpan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
