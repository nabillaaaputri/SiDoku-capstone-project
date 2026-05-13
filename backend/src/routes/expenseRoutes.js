import express from 'express';
import {
  getExpenses,
  addExpense,
  deleteExpenseById,
} from '../controllers/expenseController.js';

const expenseRouter = express.Router();

expenseRouter.get('/', getExpenses);
expenseRouter.post('/', addExpense);
expenseRouter.delete('/:expenseId', deleteExpenseById);

export default expenseRouter;