import { nanoid } from 'nanoid';
import response from '../utils/response.js';
import { NotFoundError } from '../exceptions/index.js';
import * as expenseRepository from '../repositories/expenseRepository.js';

const getCurrentTime = () => {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Jakarta',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date());
};

const formatDate = (date) => {
  if (!date) return date;

  if (typeof date === 'string') {
    return date.split('T')[0];
  }

  return date.toISOString().split('T')[0];
};

const formatTime = (time) => {
  if (!time) return null;

  if (typeof time === 'string') {
    return time.slice(0, 5);
  }

  return time;
};

const getCategoryLabel = (category) => {
  const labels = {
    restock: 'Restock Barang',
    operational: 'Biaya Operasional',
    others: 'Lainnya',
  };

  return labels[category] || 'Lainnya';
};

const mapExpenseResponse = (expense) => ({
  id: expense.id,
  date: formatDate(expense.date),
  time: formatTime(expense.time),
  expenseName: expense.expense_name,
  category: expense.category,
  categoryLabel: expense.category_label,
  amount: expense.amount,
  description: expense.description,
});

const createExpenseSummary = (records) => {
  const totalExpense = records.reduce(
    (total, expense) => total + Number(expense.amount),
    0,
  );

  const categoryTotals = {
    restock: 0,
    operational: 0,
    others: 0,
  };

  records.forEach((expense) => {
    if (categoryTotals[expense.category] !== undefined) {
      categoryTotals[expense.category] += Number(expense.amount);
    } else {
      categoryTotals.others += Number(expense.amount);
    }
  });

  const calculatePercentage = (total) => {
    if (totalExpense === 0) {
      return 0;
    }

    return Number(((total / totalExpense) * 100).toFixed(2));
  };

  return {
    totalExpense,
    totalCount: records.length,
    categories: {
      restock: {
        total: categoryTotals.restock,
        percentage: calculatePercentage(categoryTotals.restock),
      },
      operational: {
        total: categoryTotals.operational,
        percentage: calculatePercentage(categoryTotals.operational),
      },
      others: {
        total: categoryTotals.others,
        percentage: calculatePercentage(categoryTotals.others),
      },
    },
  };
};

export const getExpenses = async (req, res, next) => {
  try {
    const { category, date } = req.query;
    const userId = req.user.id;

    const expenses = await expenseRepository.getAllExpenses({
      userId,
      category,
      date,
    });

    const mappedExpenses = expenses.map(mapExpenseResponse);

    return response(
      res,
      200,
      mappedExpenses.length > 0
        ? 'Expenses retrieved successfully'
        : 'No expenses found',
      {
        summary: createExpenseSummary(mappedExpenses),
        records: mappedExpenses,
      },
    );
  } catch (error) {
    return next(error);
  }
};

export const addExpense = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const {
      expenseName,
      category,
      amount,
      date,
      time,
      description,
    } = req.body;

    const newExpense = await expenseRepository.addExpense({
      id: nanoid(),
      userId,
      expenseName,
      category,
      categoryLabel: getCategoryLabel(category),
      amount: Number(amount),
      date,
      time: time || getCurrentTime(),
      description: description || '-',
    });

    return response(
      res,
      201,
      'Expense created successfully',
      mapExpenseResponse(newExpense),
    );
  } catch (error) {
    return next(error);
  }
};

export const deleteExpenseById = async (req, res, next) => {
  try {
    const { expenseId } = req.params;
    const userId = req.user.id;

    const expense = await expenseRepository.getExpenseById(expenseId, userId);

    if (!expense) {
      return next(new NotFoundError('Data pengeluaran tidak ditemukan.'));
    }

    const deletedExpense = await expenseRepository.deleteExpenseById(
      expenseId,
      userId,
    );

    return response(res, 200, 'Expense deleted successfully', {
      id: deletedExpense.id,
      expenseName: deletedExpense.expense_name,
      amount: deletedExpense.amount,
    });
  } catch (error) {
    return next(error);
  }
};