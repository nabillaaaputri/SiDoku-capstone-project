import { query } from '../config/database.js';

export const getAllProducts = async () => {
  const result = await query(
    'SELECT * FROM products ORDER BY created_at DESC',
  );

  return result.rows;
};

export const getLowStockProducts = async () => {
  const result = await query(
    `SELECT *
     FROM products
     WHERE stock <= minimum_stock
     AND is_archived = false
     ORDER BY stock ASC`,
  );

  return result.rows;
};

export const getStockOuts = async () => {
  const result = await query(
    'SELECT * FROM stock_outs ORDER BY date DESC, created_at DESC',
  );

  return result.rows;
};

export const getExpenses = async () => {
  const result = await query(
    'SELECT * FROM expenses ORDER BY date DESC, created_at DESC',
  );

  return result.rows;
};

export const getStockOutsByDate = async (date) => {
  const result = await query(
    'SELECT * FROM stock_outs WHERE date = $1',
    [date],
  );

  return result.rows;
};

export const getExpensesByDate = async (date) => {
  const result = await query(
    'SELECT * FROM expenses WHERE date = $1',
    [date],
  );

  return result.rows;
};