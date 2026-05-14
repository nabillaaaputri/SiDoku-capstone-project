import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useBusinessContext } from "@/context";
import { Button } from "@/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus } from "lucide-react";

type ExpenseCategory = "restock" | "operasional" | "lain-lain";

const categoryColors: Record<ExpenseCategory, string> = {
  restock: "bg-blue-100 text-blue-700",
  operasional: "bg-orange-100 text-orange-700",
  "lain-lain": "bg-gray-100 text-gray-700",
};

const categoryLabels: Record<ExpenseCategory, string> = {
  restock: "Restock Barang",
  operasional: "Biaya Operasional",
  "lain-lain": "Lainnya",
};

export default function Expenses() {
  const { expenses, addExpense, deleteExpense, getExpensesByCategory } =
    useBusinessContext();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    amount: 0,
    category: "operasional" as ExpenseCategory,
    date: new Date().toISOString().split("T")[0],
    description: "",
  });

  const [filterCategory, setFilterCategory] = useState<ExpenseCategory | "all">(
    "all"
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Nama pengeluaran harus diisi",
        variant: "destructive",
      });
      return;
    }

    if (formData.amount <= 0) {
      toast({
        title: "Error",
        description: "Jumlah harus lebih dari 0",
        variant: "destructive",
      });
      return;
    }

    await addExpense({
      name: formData.name,
      amount: formData.amount,
      category: formData.category,
      date: new Date(formData.date),
      description: formData.description,
    });

    toast({
      title: "Berhasil",
      description: "Pengeluaran berhasil dicatat",
    });

    setFormData({
      name: "",
      amount: 0,
      category: "operasional",
      date: new Date().toISOString().split("T")[0],
      description: "",
    });
    setIsFormOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Yakin ingin menghapus pengeluaran ini?")) {
      await deleteExpense(id);
      toast({
        title: "Berhasil",
        description: "Pengeluaran berhasil dihapus",
      });
    }
  };

  // Filter expenses
  const filteredExpenses =
    filterCategory === "all"
      ? expenses
      : getExpensesByCategory(filterCategory);

  // Calculate by category
  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
  const restockExpense = getExpensesByCategory("restock").reduce(
    (sum, e) => sum + e.amount,
    0
  );
  const operasionalExpense = getExpensesByCategory("operasional").reduce(
    (sum, e) => sum + e.amount,
    0
  );
  const lainnyaExpense = getExpensesByCategory("lain-lain").reduce(
    (sum, e) => sum + e.amount,
    0
  );

  const percentageText = (value: number) =>
    totalExpense > 0
      ? `${((value / totalExpense) * 100).toFixed(1)}% dari total`
      : "0% dari total";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="section-shell p-4 sm:p-5 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900">Pengeluaran Usaha</h1>
          <Button
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="bg-slate-900 text-white px-4 py-2 hover:bg-slate-800 font-bold flex items-center gap-2 rounded-lg shadow-sm"
          >
            <Plus size={18} /> Catat Pengeluaran
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="section-shell bg-gradient-to-br from-red-50 to-white p-4">
            <p className="text-sm font-bold text-gray-600 mb-2">TOTAL PENGELUARAN</p>
            <p className="text-2xl font-bold text-red-600">
              Rp {totalExpense.toLocaleString("id-ID")}
            </p>
            <p className="text-xs text-red-700 mt-2">Dari {expenses.length} pengeluaran</p>
          </div>

          <div className="section-shell bg-gradient-to-br from-blue-50 to-white p-4">
            <p className="text-sm font-bold text-gray-600 mb-2">RESTOCK</p>
            <p className="text-2xl font-bold text-blue-600">
              Rp {restockExpense.toLocaleString("id-ID")}
            </p>
            <p className="text-xs text-blue-700 mt-2">{percentageText(restockExpense)}</p>
          </div>

          <div className="section-shell bg-gradient-to-br from-orange-50 to-white p-4">
            <p className="text-sm font-bold text-gray-600 mb-2">OPERASIONAL</p>
            <p className="text-2xl font-bold text-orange-600">
              Rp {operasionalExpense.toLocaleString("id-ID")}
            </p>
            <p className="text-xs text-orange-700 mt-2">{percentageText(operasionalExpense)}</p>
          </div>

          <div className="section-shell bg-gradient-to-br from-slate-50 to-white p-4">
            <p className="text-sm font-bold text-gray-600 mb-2">LAINNYA</p>
            <p className="text-2xl font-bold text-gray-600">
              Rp {lainnyaExpense.toLocaleString("id-ID")}
            </p>
            <p className="text-xs text-gray-700 mt-2">{percentageText(lainnyaExpense)}</p>
          </div>
        </div>

        {/* Form */}
        {isFormOpen && (
          <div className="section-shell bg-gradient-to-b from-slate-50 to-white p-5">
            <h2 className="text-xl font-bold mb-4 text-slate-900">Catat Pengeluaran Baru</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">
                  Nama Pengeluaran
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full border border-slate-300 bg-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="Contoh: Beli stok barang"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2">
                    Kategori
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value as ExpenseCategory,
                      })
                    }
                    className="w-full border border-slate-300 bg-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                  >
                    <option value="restock">Restock Barang</option>
                    <option value="operasional">Biaya Operasional</option>
                    <option value="lain-lain">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">Jumlah (Rp)</label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        amount: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full border border-slate-300 bg-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Tanggal</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full border border-slate-300 bg-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">
                  Deskripsi (Opsional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full border border-slate-300 bg-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="Catatan tambahan..."
                  rows={2}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  className="bg-slate-900 text-white px-4 py-2 hover:bg-slate-800 font-bold rounded-lg"
                >
                  Catat Pengeluaran
                </Button>
                <Button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  variant="outline"
                  className="border border-slate-300 px-4 py-2 hover:bg-slate-100 font-bold rounded-lg"
                >
                  Batal
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Filter */}
        <div className="section-shell p-4 bg-slate-50/80">
          <h3 className="text-sm font-bold mb-3">Filter Kategori</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterCategory("all")}
              className={`px-4 py-2 font-bold rounded-lg border transition ${
                filterCategory === "all"
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-300 bg-white text-black hover:bg-slate-100"
              }`}
            >
              Semua
            </button>
            {(["restock", "operasional", "lain-lain"] as ExpenseCategory[]).map(
              (cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-4 py-2 font-bold rounded-lg border transition ${
                    filterCategory === cat
                      ? categoryColors[cat] + " border-current"
                      : "border-slate-300 bg-white text-black hover:bg-slate-100"
                  }`}
                >
                  {categoryLabels[cat]}
                </button>
              )
            )}
          </div>
        </div>

        {/* Expenses List */}
        <div className="section-shell p-5 sm:p-6">
          <h2 className="text-lg font-bold mb-4 border-b border-slate-200 pb-2">
            Riwayat Pengeluaran ({filteredExpenses.length})
          </h2>

          {filteredExpenses.length === 0 ? (
            <p className="text-gray-600 text-center py-8">
              Belum ada pengeluaran. Klik "Catat Pengeluaran" untuk memulai.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/90">
                    <th className="text-left py-2 px-2 font-bold text-sm">Tanggal</th>
                    <th className="text-left py-2 px-2 font-bold text-sm">
                      Nama Pengeluaran
                    </th>
                    <th className="text-center py-2 px-2 font-bold text-sm">
                      Kategori
                    </th>
                    <th className="text-right py-2 px-2 font-bold text-sm">
                      Jumlah
                    </th>
                    <th className="text-left py-2 px-2 font-bold text-sm">
                      Deskripsi
                    </th>
                    <th className="text-center py-2 px-2 font-bold text-sm">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[...filteredExpenses]
                    .reverse()
                    .map((expense) => (
                      <tr
                        key={expense.id}
                        className="border-b border-gray-200 hover:bg-gray-50"
                      >
                        <td className="py-2 px-2 text-sm">
                          {new Date(expense.date).toLocaleDateString("id-ID")}
                        </td>
                        <td className="py-2 px-2 text-sm font-medium">
                          {expense.name}
                        </td>
                        <td className="py-2 px-2 text-center">
                          <span
                            className={`text-xs font-bold px-2 py-1 ${
                              categoryColors[expense.category]
                            }`}
                          >
                            {categoryLabels[expense.category]}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-sm text-right font-bold">
                          Rp {expense.amount.toLocaleString("id-ID")}
                        </td>
                        <td className="py-2 px-2 text-sm text-gray-600">
                          {expense.description || "-"}
                        </td>
                        <td className="py-2 px-2 text-center">
                          <button
                            onClick={() => handleDelete(expense.id)}
                            className="border border-red-300 text-red-600 px-2 py-1 hover:bg-red-50 font-bold text-xs inline-flex items-center gap-1 rounded-lg"
                          >
                            <Trash2 size={14} /> Hapus
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
