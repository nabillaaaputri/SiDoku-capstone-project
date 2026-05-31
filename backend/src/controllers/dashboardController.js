import response from '../utils/response.js';
import * as dashboardRepository from '../repositories/dashboardRepository.js';

const getLast7Dates = () => {
  const dates = [];

  for (let i = 6; i >= 0; i -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }

  return dates;
};

const getDayName = (dateString) => {
  const date = new Date(dateString);

  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
  });
};

const calculateNetMargin = (profit, income) => {
  const numericIncome = Number(income);

  if (numericIncome === 0) {
    return 0;
  }

  return Number(((Number(profit) / numericIncome) * 100).toFixed(2));
};

export const getSummary = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const products = await dashboardRepository.getAllProducts(userId);
    const stockOuts = await dashboardRepository.getStockOuts(userId);
    const expenses = await dashboardRepository.getExpenses(userId);

    const totalIncome = stockOuts.reduce((total, stockOut) => {
      const product = products.find((item) => item.id === stockOut.product_id);

      if (!product) {
        return total;
      }

      return total + (Number(stockOut.quantity) * Number(product.selling_price));
    }, 0);

    const totalHpp = stockOuts.reduce((total, stockOut) => {
      const product = products.find((item) => item.id === stockOut.product_id);

      if (!product) {
        return total;
      }

      return total + (Number(stockOut.quantity) * Number(product.purchase_price));
    }, 0);

    const totalExpense = expenses.reduce(
      (total, expense) => total + Number(expense.amount),
      0,
    );

    const profit = totalIncome - totalHpp - totalExpense;
    const netMargin = calculateNetMargin(profit, totalIncome);

    const roi = totalHpp + totalExpense === 0
      ? 0
      : Number(((profit / (totalHpp + totalExpense)) * 100).toFixed(2));

    return response(res, 200, 'Dashboard summary retrieved successfully', {
      income: totalIncome,
      hpp: totalHpp,
      expense: totalExpense,
      profit,
      netMargin,
      roi,
    });
  } catch (error) {
    return next(error);
  }
};

export const getInsights = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const lowStocks = await dashboardRepository.getLowStockProducts(userId);
    const expenses = await dashboardRepository.getExpenses(userId);
    const stockOuts = await dashboardRepository.getStockOuts(userId);

    const totalExpense = expenses.reduce(
      (total, expense) => total + Number(expense.amount),
      0,
    );

    const totalSold = stockOuts.reduce(
      (total, stockOut) => total + Number(stockOut.quantity),
      0,
    );

    const insights = [
      {
        title: totalSold > 0 ? 'Penjualan Mulai Tercatat' : 'Belum Ada Penjualan',
        description: totalSold > 0
          ? `Total stok keluar yang tercatat saat ini adalah ${totalSold} item.`
          : 'Belum ada data stok keluar. Mulai catat stok keluar untuk melihat performa penjualan.',
      },
      {
        title: totalExpense > 0 ? 'Pengeluaran Tercatat' : 'Belum Ada Pengeluaran',
        description: totalExpense > 0
          ? `Total pengeluaran yang tercatat saat ini sebesar Rp${totalExpense}.`
          : 'Belum ada pengeluaran yang tercatat. Catat biaya restok atau operasional agar laporan lebih lengkap.',
      },
      {
        title: lowStocks.length > 0 ? 'Produk Hampir Habis' : 'Stok Produk Aman',
        description: lowStocks.length > 0
          ? `${lowStocks.length} produk stoknya sudah berada di batas minimum.`
          : 'Belum ada produk yang stoknya berada di bawah atau sama dengan minimum stok.',
      },
      {
        title: 'Apa yang bisa kamu lakukan?',
        description: 'Lanjutkan input data produk, stok keluar, dan pengeluaran agar dashboard bisa memberikan ringkasan yang lebih akurat.',
      },
    ];

    return response(
      res,
      200,
      insights.length > 0
        ? 'Dashboard insights retrieved successfully'
        : 'No dashboard insights available',
      insights,
    );
  } catch (error) {
    return next(error);
  }
};

export const getLowStocks = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const lowStocks = await dashboardRepository.getLowStockProducts(userId);

    const mappedLowStocks = lowStocks.map((product) => ({
      id: product.id,
      productName: product.product_name,
      currentStock: product.stock,
      minimumStock: product.minimum_stock,
      unit: product.unit,
      stockNeeded: product.minimum_stock - product.stock,
    }));

    return response(
      res,
      200,
      mappedLowStocks.length > 0
        ? 'Low stock products retrieved successfully'
        : 'No low stock products found',
      mappedLowStocks,
    );
  } catch (error) {
    return next(error);
  }
};

export const getTrends = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const products = await dashboardRepository.getAllProducts(userId);
    const dates = getLast7Dates();

    const items = await Promise.all(
      dates.map(async (date) => {
        const stockOuts = await dashboardRepository.getStockOutsByDate(userId, date);
        const expenses = await dashboardRepository.getExpensesByDate(userId, date);

        const income = stockOuts.reduce((total, stockOut) => {
          const product = products.find((item) => item.id === stockOut.product_id);

          if (!product) {
            return total;
          }

          return total + (Number(stockOut.quantity) * Number(product.selling_price));
        }, 0);

        const hpp = stockOuts.reduce((total, stockOut) => {
          const product = products.find((item) => item.id === stockOut.product_id);

          if (!product) {
            return total;
          }

          return total + (Number(stockOut.quantity) * Number(product.purchase_price));
        }, 0);

        const expense = expenses.reduce(
          (total, item) => total + Number(item.amount),
          0,
        );

        const profit = income - hpp - expense;
        const netMargin = calculateNetMargin(profit, income);

        return {
          date,
          day: getDayName(date),
          income,
          hpp,
          expense,
          profit,
          netMargin,
        };
      }),
    );

    const totalIncome = items.reduce(
      (total, item) => total + Number(item.income),
      0,
    );

    const totalHpp = items.reduce(
      (total, item) => total + Number(item.hpp),
      0,
    );

    const totalExpense = items.reduce(
      (total, item) => total + Number(item.expense),
      0,
    );

    const totalProfit = items.reduce(
      (total, item) => total + Number(item.profit),
      0,
    );

    const totalNetMargin = calculateNetMargin(totalProfit, totalIncome);

    return response(res, 200, 'Dashboard trends retrieved successfully', {
      period: '7 days',
      items,
      totalIncome,
      totalHpp,
      totalExpense,
      totalProfit,
      totalNetMargin,
    });
  } catch (error) {
    return next(error);
  }
};