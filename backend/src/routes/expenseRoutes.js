import express from 'express';
import {
  getExpenses,
  addExpense,
  deleteExpenseById,
} from '../controllers/expenseController.js';
import authenticateToken from '../middlewares/auth.js';
import validatePayload from '../middlewares/validatePayload.js';
import validateQuery from '../middlewares/validateQuery.js';
import {
  ExpensePayloadSchema,
  ExpenseQuerySchema,
} from '../validators/expenseValidator.js';

const expenseRouter = express.Router();

expenseRouter.get(
  '/',
  authenticateToken,
  validateQuery(ExpenseQuerySchema, 'Query pengeluaran tidak valid.'),
  getExpenses,
);

expenseRouter.post(
  '/',
  authenticateToken,
  validatePayload(ExpensePayloadSchema, 'Input pengeluaran tidak valid.'),
  addExpense,
);

expenseRouter.delete('/:expenseId', authenticateToken, deleteExpenseById);

export default expenseRouter;