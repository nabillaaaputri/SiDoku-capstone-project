import response from '../utils/response.js';
import { InvariantError } from '../exceptions/index.js';
import * as sellingRecapRepository from '../repositories/sellingRecapRepository.js';

const isValidDateFormat = (date) => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  return dateRegex.test(date);
};

const calculateGrossMargin = (profit, income) => {
  const numericIncome = Number(income);

  if (numericIncome === 0) {
    return 0;
  }

  return Number(((Number(profit) / numericIncome) * 100).toFixed(2));
};

const calculateNetMargin = (profit, income) => {
  const numericIncome = Number(income);

  if (numericIncome === 0) {
    return 0;
  }

  return Number(((Number(profit) / numericIncome) * 100).toFixed(2));
};

export const getSellingRecap = async (req, res, next) => {
  try {
    const { date } = req.query;
    const userId = req.user.id;

    if (date && !isValidDateFormat(date)) {
      return next(new InvariantError('Format tanggal tidak valid.'));
    }

    const selectedDate = date || new Date().toISOString().split('T')[0];

    const products = await sellingRecapRepository.getProducts(userId);
    const filteredStockIns = await sellingRecapRepository.getStockInsByDate(
      userId,
      selectedDate,
    );
    const filteredStockOuts = await sellingRecapRepository.getStockOutsByDate(
      userId,
      selectedDate,
    );
    const filteredExpenses = await sellingRecapRepository.getExpensesByDate(
      userId,
      selectedDate,
    );

    const totalExpense = filteredExpenses.reduce(
      (total, expense) => total + Number(expense.amount),
      0,
    );

    const recapProducts = products.map((product) => {
      const productStockIns = filteredStockIns.filter(
        (stockIn) => stockIn.product_id === product.id,
      );

      const productStockOuts = filteredStockOuts.filter(
        (stockOut) => stockOut.product_id === product.id,
      );

      const stockIn = productStockIns.reduce(
        (total, item) => total + Number(item.quantity),
        0,
      );

      const sold = productStockOuts.reduce(
        (total, item) => total + Number(item.quantity),
        0,
      );

      const hpp = sold * Number(product.purchase_price);
      const salesValue = sold * Number(product.selling_price);
      const profit = salesValue - hpp;
      const grossMargin = calculateGrossMargin(profit, salesValue);

      return {
        productId: product.id,
        productName: product.product_name,
        initialStock: Number(product.stock) - stockIn + sold,
        stockIn,
        finalStock: Number(product.stock),
        sold,
        hpp,
        salesValue,
        profit,
        grossMargin,
      };
    });

    const totalIncome = recapProducts.reduce(
      (total, product) => total + Number(product.salesValue),
      0,
    );

    const totalHpp = recapProducts.reduce(
      (total, product) => total + Number(product.hpp),
      0,
    );

    const grossProfit = totalIncome - totalHpp;
    const totalProfit = totalIncome - totalHpp - totalExpense;
    const grossMargin = calculateGrossMargin(grossProfit, totalIncome);
    const netMargin = calculateNetMargin(totalProfit, totalIncome);

    return response(
      res,
      200,
      recapProducts.length > 0
        ? 'Selling recap retrieved successfully'
        : 'No selling recap data found',
      {
        date: selectedDate,
        summary: {
          totalIncome,
          totalHpp,
          grossProfit,
          totalExpense,
          totalProfit,
          grossMargin,
          netMargin,
        },
        products: recapProducts,
      },
    );
  } catch (error) {
    return next(error);
  }
};