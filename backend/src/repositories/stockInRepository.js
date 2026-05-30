import { query } from '../config/database.js';

export const getAllStockIns = async ({
  userId,
  startDate,
  endDate,
  productId,
}) => {
  let queryText = 'SELECT * FROM stock_ins';
  const values = [];
  const conditions = [];

  if (userId) {
    values.push(userId);
    conditions.push(`user_id = $${values.length}`);
  }

  if (startDate && endDate) {
    values.push(startDate, endDate);
    conditions.push(`date BETWEEN $${values.length - 1} AND $${values.length}`);
  }

  if (productId) {
    values.push(productId);
    conditions.push(`product_id = $${values.length}`);
  }

  if (conditions.length > 0) {
    queryText += ` WHERE ${conditions.join(' AND ')}`;
  }

  queryText += ' ORDER BY date DESC, time DESC, created_at DESC';

  const result = await query(queryText, values);
  return result.rows;
};

export const addStockIn = async ({
  id,
  userId,
  productId,
  productName,
  quantity,
  unit,
  date,
  time,
  note,
  currentStock,
}) => {
  const result = await query(
    `INSERT INTO stock_ins (
      id,
      user_id,
      product_id,
      product_name,
      quantity,
      unit,
      date,
      time,
      note,
      current_stock
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *`,
    [
      id,
      userId,
      productId,
      productName,
      quantity,
      unit,
      date,
      time,
      note,
      currentStock,
    ],
  );

  return result.rows[0];
};

export const getStockInById = async (id, userId) => {
  const result = await query(
    `SELECT * FROM stock_ins
     WHERE id = $1 AND user_id = $2`,
    [id, userId],
  );

  return result.rows[0];
};

export const deleteStockInById = async (id, userId) => {
  const result = await query(
    `DELETE FROM stock_ins
     WHERE id = $1 AND user_id = $2
     RETURNING *`,
    [id, userId],
  );

  return result.rows[0];
};