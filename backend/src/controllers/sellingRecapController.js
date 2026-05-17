import response from '../utils/response.js';
import { InvariantError } from '../exceptions/index.js';
import * as sellingRecapRepository from '../repositories/sellingRecapRepository.js';

const isValidDateFormat = (date) => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  return dateRegex.test(date);
};

export const getSellingRecap = async (req, res, next) => {
  try {
    const { date } = req.query;

    if (date && !isValidDateFormat(date)) {
      return next(new InvariantError('Format tanggal tidak valid.'));
    }

    const selectedDate = date || new Date().toISOString().split('T')[0];

    const products = await sellingRecapRepository.getProducts();
    const filteredStockIns = await sellingRecapRepository.getStockInsByDate(selectedDate);
    const filteredStockOuts = await sellingRecapRepository.getStockOutsByDate(selectedDate);
    const filteredExpenses = await sellingRecapRepository.getExpensesByDate(selectedDate);

    const totalExpense = filteredExpenses.reduce(
      (total, expense) => total + expense.amount,
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
        (total, item) => total + item.quantity,
        0,
      );

      const sold = productStockOuts.reduce(
        (total, item) => total + item.quantity,
        0,
      );

      const hpp = sold * product.purchase_price;
      const salesValue = sold * product.selling_price;
      const profit = salesValue - hpp;

      return {
        productId: product.id,
        productName: product.product_name,
        initialStock: product.stock - stockIn + sold,
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
          totalProfit,
          totalExpense,
        },
        products: recapProducts,
      },
    );
  } catch (error) {
    return next(error);
  }
};