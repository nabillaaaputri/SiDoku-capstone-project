import { query } from '../config/database.js';

export const getProducts = async () => {
  const result = await query(
    'SELECT * FROM products ORDER BY created_at DESC',
  );

  return result.rows;
};

export const getStockInsByDate = async (date) => {
  const result = await query(
    'SELECT * FROM stock_ins WHERE date = $1',
    [date],
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