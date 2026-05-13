import { nanoid } from 'nanoid';
import expenses from '../data/expenses.js';

const getCategoryLabel = (category) => {
  const labels = {
    restock: 'Restock Barang',
    operational: 'Biaya Operasional',
    others: 'Lainnya',
  };

  return labels[category] || 'Lainnya';
};

const createExpenseSummary = (records) => {
  const totalExpense = records.reduce((total, expense) => total + expense.amount, 0);

  const categoryTotals = {
    restock: 0,
    operational: 0,
    others: 0,
  };

  records.forEach((expense) => {
    if (categoryTotals[expense.category] !== undefined) {
      categoryTotals[expense.category] += expense.amount;
    } else {
      categoryTotals.others += expense.amount;
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

export const getExpenses = (req, res) => {
  try {
    const { category, date } = req.query;

    let filteredExpenses = expenses;

    if (category) {
      filteredExpenses = filteredExpenses.filter(
        (expense) => expense.category === category,
      );
    }

    if (date) {
      filteredExpenses = filteredExpenses.filter(
        (expense) => expense.date === date,
      );
    }

    return res.status(200).json({
      status: 'success',
      message: filteredExpenses.length > 0
        ? 'Expenses retrieved successfully'
        : 'No expenses found',
      data: {
        summary: createExpenseSummary(filteredExpenses),
        records: filteredExpenses,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server.',
    });
  }
};

export const addExpense = (req, res) => {
  try {
    const {
      expenseName,
      category,
      amount,
      date,
      description,
    } = req.body;

    if (!expenseName || !category || !amount || !date) {
      return res.status(400).json({
        status: 'fail',
        message: 'Input pengeluaran tidak valid.',
      });
    }

    const newExpense = {
      id: nanoid(),
      date,
      expenseName,
      category,
      categoryLabel: getCategoryLabel(category),
      amount: Number(amount),
      description: description || '-',
    };

    expenses.push(newExpense);

    return res.status(201).json({
      status: 'success',
      message: 'Expense created successfully',
      data: newExpense,
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server.',
    });
  }
};

export const deleteExpenseById = (req, res) => {
  try {
    const { expenseId } = req.params;

    const expenseIndex = expenses.findIndex(
      (expense) => expense.id === expenseId,
    );

    if (expenseIndex === -1) {
      return res.status(404).json({
        status: 'fail',
        message: 'Data pengeluaran tidak ditemukan.',
      });
    }

    const deletedExpense = expenses.splice(expenseIndex, 1)[0];

    return res.status(200).json({
      status: 'success',
      message: 'Expense deleted successfully',
      data: {
        id: deletedExpense.id,
        expenseName: deletedExpense.expenseName,
        amount: deletedExpense.amount,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server.',
    });
  }
};