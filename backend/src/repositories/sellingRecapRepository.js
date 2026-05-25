import { query } from '../config/database.js';

export const getProducts = async (userId) => {
  const result = await query(
    `SELECT *
     FROM products
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId],
  );

  return result.rows;
};

export const getStockInsByDate = async (userId, date) => {
  const result = await query(
    `SELECT *
     FROM stock_ins
     WHERE user_id = $1
     AND date = $2`,
    [userId, date],
  );

  return result.rows;
};

export const getStockOutsByDate = async (userId, date) => {
  const result = await query(
    `SELECT *
     FROM stock_outs
     WHERE user_id = $1
     AND date = $2`,
    [userId, date],
  );

  return result.rows;
};

export const getExpensesByDate = async (userId, date) => {
  const result = await query(
    `SELECT *
     FROM expenses
     WHERE user_id = $1
     AND date = $2`,
    [userId, date],
  );

  return result.rows;
};