import products from '../data/product.js';
import stockIns from '../data/stockIns.js';
import stockOuts from '../data/stockOuts.js';
import expenses from '../data/expenses.js';

const isValidDateFormat = (date) => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  return dateRegex.test(date);
};

export const getSellingRecap = (req, res) => {
  try {
    const { date } = req.query;

    if (date && !isValidDateFormat(date)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Format tanggal tidak valid.',
      });
    }

    const selectedDate = date || new Date().toISOString().split('T')[0];

    const filteredStockIns = stockIns.filter(
      (stockIn) => stockIn.date === selectedDate,
    );

    const filteredStockOuts = stockOuts.filter(
      (stockOut) => stockOut.date === selectedDate,
    );

    const filteredExpenses = expenses.filter(
      (expense) => expense.date === selectedDate,
    );

    const totalExpense = filteredExpenses.reduce(
      (total, expense) => total + expense.amount,
      0,
    );

    const recapProducts = products.map((product) => {
      const productStockIns = filteredStockIns.filter(
        (stockIn) => stockIn.productId === product.id,
      );

      const productStockOuts = filteredStockOuts.filter(
        (stockOut) => stockOut.productId === product.id,
      );

      const stockIn = productStockIns.reduce(
        (total, item) => total + item.quantity,
        0,
      );

      const sold = productStockOuts.reduce(
        (total, item) => total + item.quantity,
        0,
      );

      const hpp = sold * product.purchasePrice;
      const salesValue = sold * product.sellingPrice;
      const profit = salesValue - hpp;

      return {
        productId: product.id,
        productName: product.productName,
        initialStock: product.initialStock,
        stockIn,
        finalStock: product.stock,
        sold,
        hpp,
        salesValue,
        profit,
      };
    });

    const totalIncome = recapProducts.reduce(
      (total, product) => total + product.salesValue,
      0,
    );

    const totalHpp = recapProducts.reduce(
      (total, product) => total + product.hpp,
      0,
    );

    const totalProfit = totalIncome - totalHpp - totalExpense;

    return res.status(200).json({
      status: 'success',
      message: recapProducts.length > 0
        ? 'Selling recap retrieved successfully'
        : 'No selling recap data found',
      data: {
        date: selectedDate,
        summary: {
          totalIncome,
          totalHpp,
          totalProfit,
          totalExpense,
        },
        products: recapProducts,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server.',
    });
  }
};

// Rekap penjualan dihitung dari:
// products    -> data produk, harga beli, harga jual, stok akhir
// stockIns    -> jumlah stok masuk berdasarkan tanggal
// stockOuts   -> jumlah produk terjual/stok keluar berdasarkan tanggal
// expenses    -> total pengeluaran berdasarkan tanggal