import { query } from '../config/database.js';

export const getAllStockOuts = async ({
  userId,
  productId,
  date,
}) => {
  let queryText = 'SELECT * FROM stock_outs';
  const values = [];
  const conditions = [];

  if (userId) {
    values.push(userId);
    conditions.push(`user_id = $${values.length}`);
  }

  if (productId) {
    values.push(productId);
    conditions.push(`product_id = $${values.length}`);
  }

  if (date) {
    values.push(date);
    conditions.push(`date = $${values.length}`);
  }

  if (conditions.length > 0) {
    queryText += ` WHERE ${conditions.join(' AND ')}`;
  }

  queryText += ' ORDER BY date DESC, created_at DESC';

  const result = await query(queryText, values);
  return result.rows;
};

export const addStockOut = async ({
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
    `INSERT INTO stock_outs (
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

export const getStockOutById = async (id, userId) => {
  const result = await query(
    `SELECT * FROM stock_outs
     WHERE id = $1 AND user_id = $2`,
    [id, userId],
  );

  return result.rows[0];
};

export const deleteStockOutById = async (id, userId) => {
  const result = await query(
    `DELETE FROM stock_outs
     WHERE id = $1 AND user_id = $2
     RETURNING *`,
    [id, userId],
  );

  return result.rows[0];
};